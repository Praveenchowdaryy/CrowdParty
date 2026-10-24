import { Socket } from 'socket.io';
import {
  Player,
  RoomSettings,
  RoomSnapshot,
  ChatMessage,
  EmojiReaction,
  GameResultPayload,
  DrawStroke,
} from '@crowdparty/shared';
import { BaseGame } from '../engine/BaseGame';
import { GameFactory } from '../engine/GameFactory';
import { DrawAndGuessGame } from '../engine/games/DrawAndGuessGame';
import { QuizBattleGame } from '../engine/games/QuizBattleGame';
import { HotTakesGame } from '../engine/games/HotTakesGame';
import { ReactionArenaGame } from '../engine/games/ReactionArenaGame';

export class Room {
  public readonly code: string;
  public hostId: string;
  public status: 'LOBBY' | 'IN_GAME' = 'LOBBY';
  public selectedGameId: string = 'draw-and-guess';
  public settings: RoomSettings = {
    maxPlayers: 12,
    isPrivate: false,
    allowLateJoin: true,
  };
  public createdAt: number = Date.now();
  public lastActivity: number = Date.now();

  public players: Map<string, Player> = new Map();
  public playerSockets: Map<string, Socket> = new Map();
  public sessionTokens: Map<string, string> = new Map(); // sessionToken -> playerId
  public chatMessages: ChatMessage[] = [];
  public activeGame: BaseGame | null = null;

  private onRoomEmptyCallback?: (roomCode: string) => void;
  private botNames: string[] = ['PixelBot', 'EchoBot', 'TurboBot', 'ZenithBot', 'SparkyBot'];
  private botAvatars: string[] = ['robot', 'alien', 'fox', 'cat', 'party'];

  constructor(code: string, hostPlayerId: string, onRoomEmpty?: (roomCode: string) => void) {
    this.code = code;
    this.hostId = hostPlayerId;
    this.onRoomEmptyCallback = onRoomEmpty;
  }

  public touch(): void {
    this.lastActivity = Date.now();
  }

  public addPlayer(
    nickname: string,
    avatar: string,
    socket: Socket,
    existingSessionToken?: string
  ): { player: Player; sessionToken: string } {
    this.touch();

    // Check reconnection with valid token
    if (existingSessionToken && this.sessionTokens.has(existingSessionToken)) {
      const existingPlayerId = this.sessionTokens.get(existingSessionToken)!;
      const existingPlayer = this.players.get(existingPlayerId);
      if (existingPlayer) {
        existingPlayer.isOnline = true;
        existingPlayer.lastActive = Date.now();
        this.playerSockets.set(existingPlayerId, socket);

        this.broadcast({
          type: 'room:player_updated',
          payload: existingPlayer,
        });

        this.sendSystemMessage(`🟢 ${existingPlayer.nickname} reconnected to the room.`);
        this.sendRoomSnapshot(socket);
        if (this.activeGame) {
          this.sendGameStateToPlayer(existingPlayerId);
        }

        return { player: existingPlayer, sessionToken: existingSessionToken };
      }
    }

    // Capacity checks
    if (this.players.size >= this.settings.maxPlayers) {
      throw new Error('Room is at full capacity');
    }

    if (this.status === 'IN_GAME' && !this.settings.allowLateJoin) {
      throw new Error('Game already in progress and late joining is disabled');
    }

    const playerId = `p_${Math.random().toString(36).substring(2, 9)}`;
    const sessionToken = `tok_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const isFirstPlayer = this.players.size === 0;

    const newPlayer: Player = {
      id: playerId,
      nickname: nickname.trim().slice(0, 20) || 'Player',
      avatar: avatar || 'cat',
      isHost: isFirstPlayer || playerId === this.hostId,
      isOnline: true,
      isReady: false,
      score: 0,
      lastActive: Date.now(),
    };

    if (newPlayer.isHost) {
      this.hostId = playerId;
    }

    this.players.set(playerId, newPlayer);
    this.playerSockets.set(playerId, socket);
    this.sessionTokens.set(sessionToken, playerId);

    this.broadcast({
      type: 'room:player_joined',
      payload: newPlayer,
    });

    this.sendSystemMessage(`👋 ${newPlayer.nickname} joined the room!`);
    this.sendRoomSnapshot(socket);

    if (this.activeGame) {
      this.sendGameStateToPlayer(playerId);
    }

    return { player: newPlayer, sessionToken };
  }

  public removePlayer(playerId: string, reason: string = 'Left the room'): void {
    this.touch();
    const player = this.players.get(playerId);
    if (!player) return;

    this.playerSockets.delete(playerId);
    player.isOnline = false;

    // If game is active, inform game module
    if (this.activeGame) {
      this.activeGame.handlePlayerLeave(playerId);
    }

    // If host left, elect new host
    if (player.isHost) {
      const activePlayers = Array.from(this.players.values()).filter(p => p.isOnline && !p.isBot);
      if (activePlayers.length > 0) {
        const newHost = activePlayers[0];
        player.isHost = false;
        newHost.isHost = true;
        this.hostId = newHost.id;
        this.sendSystemMessage(`👑 ${newHost.nickname} is now the room host!`);
      }
    }

    this.broadcast({
      type: 'room:player_left',
      payload: { playerId, nickname: player.nickname, reason },
    });

    // Check if room is completely empty
    const onlineHumanCount = Array.from(this.players.values()).filter(p => p.isOnline && !p.isBot).length;
    if (onlineHumanCount === 0) {
      if (this.onRoomEmptyCallback) {
        this.onRoomEmptyCallback(this.code);
      }
    }
  }

  public setPlayerReady(playerId: string, isReady: boolean): void {
    this.touch();
    const player = this.players.get(playerId);
    if (!player) return;

    player.isReady = isReady;
    this.broadcast({
      type: 'room:player_updated',
      payload: player,
    });
  }

  public selectGame(playerId: string, gameId: string): void {
    this.touch();
    if (playerId !== this.hostId) {
      throw new Error('Only the host can select a game');
    }

    this.selectedGameId = gameId;
    this.broadcast({
      type: 'room:game_selected',
      payload: { gameId },
    });

    this.sendSystemMessage(`🎯 Host changed game to: ${gameId}`);
  }

  public updateSettings(playerId: string, newSettings: Partial<RoomSettings>): void {
    this.touch();
    if (playerId !== this.hostId) {
      throw new Error('Only the host can update room settings');
    }

    this.settings = { ...this.settings, ...newSettings };
    this.broadcastSnapshot();
  }

  public startGame(playerId: string): void {
    this.touch();
    if (playerId !== this.hostId) {
      throw new Error('Only the host can start the game');
    }

    const onlinePlayers = Array.from(this.players.values()).filter(p => p.isOnline);
    if (onlinePlayers.length < 1) {
      throw new Error('At least 1 player required to start');
    }

    // Clean up previous game session if rematching or restarting
    if (this.activeGame) {
      this.activeGame.dispose();
      this.activeGame = null;
    }

    this.status = 'IN_GAME';
    this.activeGame = GameFactory.create(this.selectedGameId, this);
    this.activeGame.start();
    this.broadcastSnapshot();
    this.broadcastState();
  }

  public returnToLobby(playerId: string): void {
    this.touch();
    if (playerId !== this.hostId) {
      throw new Error('Only the host can return to lobby');
    }

    if (this.activeGame) {
      this.activeGame.dispose();
      this.activeGame = null;
    }

    this.status = 'LOBBY';
    for (const player of this.players.values()) {
      player.isReady = false;
    }

    this.sendSystemMessage('🏠 Returned to Waiting Lobby.');
    this.broadcastSnapshot();
  }

  public addBot(): void {
    this.touch();
    const botIndex = Array.from(this.players.values()).filter(p => p.isBot).length;
    const botName = this.botNames[botIndex % this.botNames.length] + (botIndex >= 5 ? `_${botIndex}` : '');
    const botAvatar = this.botAvatars[botIndex % this.botAvatars.length];
    const botId = `bot_${Math.random().toString(36).substring(2, 7)}`;

    const botPlayer: Player = {
      id: botId,
      nickname: botName,
      avatar: botAvatar,
      isHost: false,
      isOnline: true,
      isReady: true,
      score: 0,
      lastActive: Date.now(),
      isBot: true,
    };

    this.players.set(botId, botPlayer);
    this.broadcastSnapshot();
    this.broadcast({
      type: 'room:player_joined',
      payload: botPlayer,
    });
    this.sendSystemMessage(`🤖 Added simulated bot: ${botPlayer.nickname}`);

    if (this.activeGame) {
      this.activeGame.scores[botId] = 0;
      this.broadcastState();
    }
  }

  public removeBot(botId: string): void {
    this.touch();
    const bot = this.players.get(botId);
    if (!bot || !bot.isBot) return;

    this.players.delete(botId);
    this.broadcastSnapshot();
    this.broadcast({
      type: 'room:player_left',
      payload: { playerId: botId, nickname: bot.nickname, reason: 'Bot removed' },
    });
    this.sendSystemMessage(`🤖 Removed bot: ${bot.nickname}`);
  }

  public handleChatMessage(playerId: string, text: string): void {
    this.touch();
    const player = this.players.get(playerId);
    if (!player) return;

    const trimmed = text.trim().slice(0, 200);
    if (!trimmed) return;

    // Check if Draw & Guess is playing and this is a correct guess
    if (this.activeGame && this.activeGame.id === 'draw-and-guess' && this.activeGame.phase === 'PLAYING') {
      const dgGame = this.activeGame as DrawAndGuessGame;
      const isCorrect = dgGame.secretWord && trimmed.toUpperCase() === dgGame.secretWord.toUpperCase();
      if (isCorrect) {
        dgGame.checkGuess(playerId, trimmed);
        return; // Don't broadcast the answer in chat!
      }
    }

    const message: ChatMessage = {
      id: `msg_${Math.random().toString(36).substring(2, 9)}`,
      playerId,
      nickname: player.nickname,
      avatar: player.avatar,
      text: trimmed,
      timestamp: Date.now(),
      type: 'CHAT',
    };

    this.chatMessages.push(message);
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }

    this.broadcast({
      type: 'room:chat_message',
      payload: message,
    });
  }

  public sendReaction(playerId: string, emoji: string): void {
    this.touch();
    const reaction: EmojiReaction = {
      id: `rc_${Math.random().toString(36).substring(2, 9)}`,
      playerId,
      emoji: emoji.slice(0, 4),
      timestamp: Date.now(),
    };

    this.broadcast({
      type: 'room:reaction',
      payload: reaction,
    });
  }

  public sendSystemMessage(text: string): void {
    const message: ChatMessage = {
      id: `sys_${Math.random().toString(36).substring(2, 9)}`,
      playerId: 'system',
      nickname: 'CrowdParty',
      avatar: 'party',
      text,
      timestamp: Date.now(),
      type: 'SYSTEM',
    };

    this.chatMessages.push(message);
    this.broadcast({
      type: 'room:chat_message',
      payload: message,
    });
  }

  public broadcastStroke(stroke: DrawStroke): void {
    this.touch();
    for (const [playerId, socket] of this.playerSockets.entries()) {
      if (socket.connected) {
        socket.emit('game:stroke', stroke);
      }
    }
  }

  public broadcastClearCanvas(): void {
    this.touch();
    for (const socket of this.playerSockets.values()) {
      if (socket.connected) {
        socket.emit('game:clear_canvas');
      }
    }
  }

  public getSnapshot(): RoomSnapshot {
    return {
      code: this.code,
      hostId: this.hostId,
      status: this.status,
      selectedGameId: this.selectedGameId,
      players: Array.from(this.players.values()),
      settings: this.settings,
      createdAt: this.createdAt,
    };
  }

  public sendRoomSnapshot(socket: Socket): void {
    socket.emit('room:snapshot', this.getSnapshot());
    for (const msg of this.chatMessages.slice(-20)) {
      socket.emit('room:chat_message', msg);
    }
  }

  public broadcastSnapshot(): void {
    const snapshot = this.getSnapshot();
    for (const socket of this.playerSockets.values()) {
      if (socket.connected) {
        socket.emit('room:snapshot', snapshot);
      }
    }
  }

  public broadcastState(): void {
    if (!this.activeGame) return;
    const publicState = this.activeGame.getPublicState();

    for (const [playerId, socket] of this.playerSockets.entries()) {
      if (socket.connected) {
        const privateState = this.activeGame.getPrivateState(playerId);
        socket.emit('game:public_state', publicState);
        socket.emit('game:private_state', privateState);
      }
    }
  }

  public sendGameStateToPlayer(playerId: string): void {
    if (!this.activeGame) return;
    const socket = this.playerSockets.get(playerId);
    if (socket && socket.connected) {
      socket.emit('game:public_state', this.activeGame.getPublicState());
      socket.emit('game:private_state', this.activeGame.getPrivateState(playerId));
    }
  }

  public onGameFinished(results: GameResultPayload): void {
    this.touch();
    for (const socket of this.playerSockets.values()) {
      if (socket.connected) {
        socket.emit('game:ended', results);
      }
    }
    this.broadcastSnapshot();
    this.broadcastState();
  }

  public tick(now: number): void {
    if (this.activeGame) {
      this.activeGame.tick(now);
      this.simulateBots(now);
    }
  }

  private simulateBots(now: number): void {
    if (!this.activeGame || this.activeGame.phase !== 'PLAYING') return;

    const bots = Array.from(this.players.values()).filter(p => p.isBot);
    if (bots.length === 0) return;

    // Simulate bot answers or reactions with natural delay
    for (const bot of bots) {
      if (this.activeGame.id === 'quiz-battle') {
        const qg = this.activeGame as QuizBattleGame;
        const priv = qg.getPrivateState(bot.id);
        if (!priv.hasAnswered && Math.random() < 0.08) {
          const q = qg.getPublicState().currentQuestion;
          if (q && q.options.length > 0) {
            const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
            qg.handleAction(bot.id, { type: 'submit_answer', payload: { optionId: randomOpt.id } });
          }
        }
      } else if (this.activeGame.id === 'hot-takes') {
        const hg = this.activeGame as HotTakesGame;
        const priv = hg.getPrivateState(bot.id);
        if (!priv.hasVoted && Math.random() < 0.1) {
          const choice = Math.random() > 0.5 ? 'A' : 'B';
          const prediction = Math.random() > 0.5 ? 'A' : 'B';
          hg.handleAction(bot.id, { type: 'submit_vote', payload: { choice, prediction } });
        }
      } else if (this.activeGame.id === 'reaction-arena') {
        const rg = this.activeGame as ReactionArenaGame;
        const pub = rg.getPublicState();
        const priv = rg.getPrivateState(bot.id);
        if (pub.arenaStatus === 'SIGNAL_ACTIVE' && !priv.hasReacted && Math.random() < 0.15) {
          rg.handleAction(bot.id, { type: 'react', payload: {} });
        }
      }
    }
  }

  private broadcast(event: { type: string; payload: any }): void {
    for (const socket of this.playerSockets.values()) {
      if (socket.connected) {
        socket.emit(event.type as any, event.payload);
      }
    }
  }
}
