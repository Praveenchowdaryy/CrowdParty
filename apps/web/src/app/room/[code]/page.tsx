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
import { AlertCircle, Sparkles, ArrowRight, Home, RefreshCw, Radio } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = ((params?.code as string) || '').toUpperCase().trim();

  const [connected, setConnected] = useState(false);
  const [connectingElapsedSec, setConnectingElapsedSec] = useState(0);
  const [roomNotFound, setRoomNotFound] = useState(false);
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

  // Timer for tracking cold-start delays on free cloud hosts
  useEffect(() => {
    if (connected || roomSnapshot) return;
    const interval = setInterval(() => {
      setConnectingElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [connected, roomSnapshot]);

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
            if (res.error?.toLowerCase().includes('not found') || res.error?.toLowerCase().includes('expired')) {
              setRoomNotFound(true);
            } else {
              const lastProf = getLastUserProfile();
              setJoinNickname(lastProf.nickname || saved.nickname || '');
              setJoinAvatar(lastProf.avatar || saved.avatar || 'cat');
              setNeedsJoinModal(true);
            }
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
      setRoomNotFound(false);
      setRoomSnapshot(snapshot);
      if (snapshot.status === 'LOBBY') {
        setGameResults(null);
        setPublicGameState(null);
        setPrivateGameState(null);
      }
      // Find current player
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

    const onChatMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev.slice(-80), msg]);
    };

    const onReaction = (reaction: EmojiReaction) => {
      setReactions((prev) => [...prev.slice(-15), reaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
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
      if (message?.toLowerCase().includes('not found') || message?.toLowerCase().includes('expired')) {
        setRoomNotFound(true);
      }
      setErrorMessage(message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:snapshot', onSnapshot);
    socket.on('room:player_joined', onPlayerJoined);
    socket.on('room:player_left', onPlayerLeft);
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
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'room:join',
      { roomCode, nickname: joinNickname.trim(), avatar: joinAvatar },
      (res) => {
        setIsJoining(false);
        if (res.success && res.sessionToken) {
          saveSession(roomCode, res.sessionToken, joinNickname.trim(), joinAvatar);
          setNeedsJoinModal(false);
        } else {
          if (res.error?.toLowerCase().includes('not found') || res.error?.toLowerCase().includes('expired')) {
            setRoomNotFound(true);
          }
          setErrorMessage(res.error || 'Failed to join room. Please check the code.');
        }
      }
    );
  };

  const handleSelectGame = (gameId: string) => {
    getSocket().emit('room:select_game', { gameId });
  };

  const handleStartGame = () => {
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

  const handleUpdateSettings = (settings: { maxPlayers?: number; allowLateJoin?: boolean }) => {
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

  // 1. Room Not Found or Expired State
  if (roomNotFound) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-coral/40 text-center space-y-5 shadow-glow">
          <div className="w-14 h-14 rounded-2xl bg-coral/15 border border-coral/30 text-coral flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-coral uppercase tracking-wider block">
              Room Unavailable
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              Room &ldquo;{roomCode}&rdquo; Expired
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              This party room does not exist or has already finished. Create a new room to start playing!
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => router.push('/#join')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-coral text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow" />
              <span>Create New Room</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-2xl bg-surface-elevated hover:bg-surface border border-border text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. First-time Join Modal (When invited via direct link)
  if (needsJoinModal) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-border shadow-glow space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>You Have Been Invited!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Join Room: <span className="font-mono text-brand-400">{roomCode}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pick your nickname and character to enter the room.
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
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                autoFocus
                required
              />
            </div>

            <AvatarPicker selectedId={joinAvatar} onSelect={setJoinAvatar} />

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-coral hover:opacity-95 shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isJoining ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enter Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Loading room snapshot state with cold-start feedback
  if (!roomSnapshot || !currentPlayer) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center space-y-4 animate-fadeIn">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <Radio className="w-5 h-5 text-brand-400 absolute inset-0 m-auto" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Connecting to Room {roomCode}...
          </h2>
          <p className="text-xs text-slate-400">
            Synchronizing game session and lobby presence
          </p>
        </div>

        {/* Cold-start helper note for free cloud hosts (Render / Railway) */}
        {connectingElapsedSec > 4 && (
          <div className="glass-panel p-4 rounded-2xl border border-yellow/30 max-w-sm mx-auto text-xs text-slate-300 space-y-2 animate-fadeIn">
            <p className="text-yellow font-bold">
              ⚡ Waking up game server instance...
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If the server was idle, free cloud hosts take ~15–25 seconds to spin up. Hang tight!
            </p>
          </div>
        )}

        {connectingElapsedSec > 10 && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                const socket = getSocket();
                socket.disconnect();
                socket.connect();
              }}
              className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. Room Ready: Lobby or Active Game
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
            className="text-xs font-bold text-coral hover:text-white cursor-pointer"
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
