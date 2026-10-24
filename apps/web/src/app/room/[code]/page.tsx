'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  RoomSnapshot,
  Player,
  GameResultPayload,
  ChatMessage,
  EmojiReaction,
  DrawStroke,
} from '@crowdparty/shared';
import {
  getSocket,
  getSavedSession,
  saveSession,
  getLastUserProfile,
} from '@/lib/socket';
import { WaitingLobby } from '@/components/room/WaitingLobby';
import { GameContainer } from '@/components/room/GameContainer';
import { AvatarPicker } from '@/components/common/AvatarPicker';
import { AlertCircle, Sparkles, ArrowRight, Home } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = ((params?.code as string) || '').toUpperCase().trim();

  const [connected, setConnected] = useState(false);
  const [roomSnapshot, setRoomSnapshot] = useState<RoomSnapshot | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [publicGameState, setPublicGameState] = useState<any>(null);
  const [privateGameState, setPrivateGameState] = useState<any>(null);
  const [gameResults, setGameResults] = useState<GameResultPayload | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // First-time join modal state
  const [needsJoinModal, setNeedsJoinModal] = useState(false);
  const [joinNickname, setJoinNickname] = useState('');
  const [joinAvatar, setJoinAvatar] = useState('cat');
  const [isJoining, setIsJoining] = useState(false);

  // Initialize socket and attempt session restore
  useEffect(() => {
    if (!roomCode) return;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setConnected(true);
      setErrorMessage('');

      // Check for saved session
      const saved = getSavedSession(roomCode);
      if (saved && saved.token) {
        socket.emit('room:reconnect', { roomCode, sessionToken: saved.token }, (res) => {
          if (!res.success) {
            // Reconnection expired, show join modal
            const lastProf = getLastUserProfile();
            setJoinNickname(lastProf.nickname || saved.nickname || '');
            setJoinAvatar(lastProf.avatar || saved.avatar || 'cat');
            setNeedsJoinModal(true);
          }
        });
      } else {
        const lastProf = getLastUserProfile();
        setJoinNickname(lastProf.nickname || '');
        setJoinAvatar(lastProf.avatar || 'cat');
        setNeedsJoinModal(true);
      }
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onSnapshot = (snapshot: RoomSnapshot) => {
      setRoomSnapshot(snapshot);
      if (snapshot.status === 'LOBBY') {
        setGameResults(null);
        setPublicGameState(null);
        setPrivateGameState(null);
      }
      // Find current player by stored token or ID
      const saved = getSavedSession(roomCode);
      if (saved) {
        const me = snapshot.players.find(p => p.nickname === saved.nickname) || snapshot.players[0];
        if (me) setCurrentPlayer(me);
      } else if (snapshot.players.length > 0) {
        setCurrentPlayer(snapshot.players[0]);
      }
    };

    const onPlayerJoined = (player: Player) => {
      setRoomSnapshot(prev => {
        if (!prev) return prev;
        const exists = prev.players.some(p => p.id === player.id);
        const updated = exists
          ? prev.players.map(p => p.id === player.id ? player : p)
          : [...prev.players, player];
        return { ...prev, players: updated };
      });
    };

    const onPlayerLeft = ({ playerId }: { playerId: string }) => {
      setRoomSnapshot(prev => {
        if (!prev) return prev;
        const target = prev.players.find(p => p.id === playerId);
        const updated = target?.isBot
          ? prev.players.filter(p => p.id !== playerId)
          : prev.players.map(p => p.id === playerId ? { ...p, isOnline: false } : p);
        return {
          ...prev,
          players: updated,
        };
      });
    };

    const onPlayerUpdated = (player: Player) => {
      setRoomSnapshot(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => p.id === player.id ? player : p),
        };
      });
      setCurrentPlayer(prev => prev?.id === player.id ? player : prev);
    };

    const onGameSelected = ({ gameId }: { gameId: string }) => {
      setRoomSnapshot(prev => prev ? { ...prev, selectedGameId: gameId } : prev);
    };

    const onChatMessage = (msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-49), msg]);
    };

    const onReaction = (reaction: EmojiReaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2500);
    };

    const onPublicState = (state: any) => {
      setPublicGameState(state);
      if (state && state.phase !== 'RESULTS') {
        setGameResults(null);
      } else if (state && state.phase === 'RESULTS' && !gameResults) {
        setGameResults({
          gameId: state.gameId,
          winnerIds: state.leaderboard?.[0]?.playerId ? [state.leaderboard[0].playerId] : [],
          finalStandings: state.leaderboard || [],
          statistics: {},
          completedAt: Date.now(),
        });
      }
    };

    const onPrivateState = (state: any) => {
      setPrivateGameState(state);
    };

    const onGameEnded = (results: GameResultPayload) => {
      setGameResults(results);
    };

    const onGameStroke = (stroke: DrawStroke) => {
      setPublicGameState((prev: any) => {
        if (!prev || prev.gameId !== 'draw-and-guess') return prev;
        return {
          ...prev,
          strokes: [...(prev.strokes || []), stroke],
        };
      });
    };

    const onClearCanvas = () => {
      setPublicGameState((prev: any) => {
        if (!prev || prev.gameId !== 'draw-and-guess') return prev;
        return {
          ...prev,
          strokes: [],
        };
      });
    };

    const onError = ({ message }: { message: string }) => {
      setErrorMessage(message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:snapshot', onSnapshot);
    socket.on('room:player_joined', onPlayerJoined);
    socket.on('room:player_left', onPlayerLeft);
    socket.on('room:player_updated', onPlayerUpdated);
    socket.on('room:game_selected', onGameSelected);
    socket.on('room:chat_message', onChatMessage);
    socket.on('room:reaction', onReaction);
    socket.on('game:public_state', onPublicState);
    socket.on('game:private_state', onPrivateState);
    socket.on('game:ended', onGameEnded);
    socket.on('game:stroke', onGameStroke);
    socket.on('game:clear_canvas', onClearCanvas);
    socket.on('error', onError);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room:snapshot', onSnapshot);
      socket.off('room:player_joined', onPlayerJoined);
      socket.off('room:player_left', onPlayerLeft);
      socket.off('room:player_updated', onPlayerUpdated);
      socket.off('room:game_selected', onGameSelected);
      socket.off('room:chat_message', onChatMessage);
      socket.off('room:reaction', onReaction);
      socket.off('game:public_state', onPublicState);
      socket.off('game:private_state', onPrivateState);
      socket.off('game:ended', onGameEnded);
      socket.off('game:stroke', onGameStroke);
      socket.off('game:clear_canvas', onClearCanvas);
      socket.off('error', onError);
    };
  }, [roomCode, gameResults]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinNickname.trim()) return;

    setIsJoining(true);
    setErrorMessage('');
    const socket = getSocket();

    socket.emit(
      'room:join',
      { roomCode, nickname: joinNickname.trim(), avatar: joinAvatar },
      (res) => {
        setIsJoining(false);
        if (res.success && res.sessionToken) {
          saveSession(roomCode, res.sessionToken, joinNickname.trim(), joinAvatar);
          setNeedsJoinModal(false);
        } else {
          setErrorMessage(res.error || 'Failed to join room');
        }
      }
    );
  };

  // Actions
  const handleSelectGame = (gameId: string) => {
    getSocket().emit('room:select_game', { gameId });
  };

  const handleStartGame = () => {
    setGameResults(null);
    getSocket().emit('room:start_game');
  };

  const handleSetReady = (isReady: boolean) => {
    getSocket().emit('room:set_ready', { isReady });
  };

  const handleAddBot = () => {
    getSocket().emit('room:add_bot');
  };

  const handleRemoveBot = (botId: string) => {
    getSocket().emit('room:remove_bot', { botId });
  };

  const handleLeaveRoom = () => {
    getSocket().emit('room:leave');
    router.push('/');
  };

  const handleUpdateSettings = (settings: any) => {
    getSocket().emit('room:update_settings', { settings });
  };

  const handleSendGameAction = (type: string, payload: any) => {
    getSocket().emit('game:action', { type, payload });
  };

  const handleSendStroke = (stroke: DrawStroke) => {
    getSocket().emit('game:draw_stroke', stroke);
  };

  const handleClearCanvas = () => {
    getSocket().emit('game:clear_canvas');
  };

  const handleSendMessage = (text: string) => {
    getSocket().emit('chat:send', { text });
  };

  const handleSendReaction = (emoji: string) => {
    getSocket().emit('reaction:send', { emoji });
  };

  const handlePlayAgain = () => {
    setGameResults(null);
    getSocket().emit('room:start_game');
  };

  const handleReturnToLobby = () => {
    setGameResults(null);
    setPublicGameState(null);
    getSocket().emit('room:return_to_lobby');
  };

  // First-time join modal overlay
  if (needsJoinModal) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-border shadow-glow space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>You have been invited!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Join Room: <span className="font-mono text-brand-400">{roomCode}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pick a nickname and avatar to jump straight into the party.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-coral/15 border border-coral/40 text-coral-light text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-coral shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Your Nickname
              </label>
              <input
                type="text"
                maxLength={20}
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                placeholder="e.g. PixelChamp"
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border text-white text-sm font-medium focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <AvatarPicker selectedId={joinAvatar} onSelect={setJoinAvatar} />

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-coral hover:opacity-95 shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isJoining ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Party</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading room snapshot state
  if (!roomSnapshot || !currentPlayer) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <span className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-bold text-white">Entering Room {roomCode}...</h2>
        <p className="text-xs text-slate-400">Connecting to server session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-coral/15 border border-coral/40 text-coral-light text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-coral shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs font-bold text-coral hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Render Waiting Lobby or Active Game Container */}
      {roomSnapshot.status === 'LOBBY' ? (
        <WaitingLobby
          room={roomSnapshot}
          currentPlayer={currentPlayer}
          onSelectGame={handleSelectGame}
          onStartGame={handleStartGame}
          onSetReady={handleSetReady}
          onAddBot={handleAddBot}
          onRemoveBot={handleRemoveBot}
          onLeaveRoom={handleLeaveRoom}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : (
        <GameContainer
          room={roomSnapshot}
          currentPlayer={currentPlayer}
          publicState={publicGameState}
          privateState={privateGameState}
          gameResults={gameResults}
          chatMessages={chatMessages}
          reactions={reactions}
          onSendGameAction={handleSendGameAction}
          onSendStroke={handleSendStroke}
          onClearCanvas={handleClearCanvas}
          onSendMessage={handleSendMessage}
          onSendReaction={handleSendReaction}
          onPlayAgain={handlePlayAgain}
          onReturnToLobby={handleReturnToLobby}
        />
      )}
    </div>
  );
}
