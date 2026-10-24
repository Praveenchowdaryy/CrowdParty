'use client';

import React, { useState, useEffect } from 'react';
import {
  RoomSnapshot,
  Player,
  GameResultPayload,
  ChatMessage,
  EmojiReaction,
  DrawStroke,
} from '@crowdparty/shared';
import { DrawAndGuessView } from './games/DrawAndGuessView';
import { QuizBattleView } from './games/QuizBattleView';
import { HotTakesView } from './games/HotTakesView';
import { ReactionArenaView } from './games/ReactionArenaView';
import { WordDashView } from './games/WordDashView';
import { MostLikelyToView } from './games/MostLikelyToView';
import { PodiumResults } from './PodiumResults';
import { ChatSidebar } from './ChatSidebar';
import { Clock, Users, ArrowLeft, MessageSquare, Gamepad2 } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface GameContainerProps {
  room: RoomSnapshot;
  currentPlayer: Player;
  publicState: any;
  privateState: any;
  gameResults: GameResultPayload | null;
  chatMessages: ChatMessage[];
  reactions: EmojiReaction[];
  onSendGameAction: (type: string, payload: any) => void;
  onSendStroke: (stroke: DrawStroke) => void;
  onClearCanvas: () => void;
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  room,
  currentPlayer,
  publicState,
  privateState,
  gameResults,
  chatMessages,
  reactions,
  onSendGameAction,
  onSendStroke,
  onClearCanvas,
  onSendMessage,
  onSendReaction,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [mobileTab, setMobileTab] = useState<'game' | 'chat'>('game');
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);

  // Authoritative local countdown calculation based on server deadline
  useEffect(() => {
    if (!publicState?.deadline) {
      setTimeLeftMs(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, publicState.deadline - Date.now());
      setTimeLeftMs(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);
    return () => clearInterval(interval);
  }, [publicState?.deadline]);

  // Track unread messages on mobile when chat is closed
  useEffect(() => {
    if (mobileTab === 'chat') {
      setLastReadMessageCount(chatMessages.length);
    }
  }, [chatMessages.length, mobileTab]);

  const unreadCount = Math.max(0, chatMessages.length - lastReadMessageCount);

  if (!publicState) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-border text-center max-w-md mx-auto">
        <span className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white">Connecting to Game Engine...</h3>
      </div>
    );
  }

  // If match finished, show victory podium!
  if (publicState.phase === 'RESULTS') {
    return (
      <PodiumResults
        results={gameResults || {
          gameId: publicState.gameId,
          winnerIds: publicState.leaderboard?.[0]?.playerId ? [publicState.leaderboard[0].playerId] : [],
          finalStandings: publicState.leaderboard || [],
          statistics: {},
          completedAt: Date.now(),
        }}
        currentPlayer={currentPlayer}
        onPlayAgain={onPlayAgain}
        onReturnToLobby={onReturnToLobby}
      />
    );
  }

  const gameTitles: Record<string, string> = {
    'draw-and-guess': 'Draw & Guess',
    'quiz-battle': 'Quiz Battle',
    'hot-takes': 'Hot Takes',
    'reaction-arena': 'Reaction Arena',
    'word-dash': 'Word Dash',
    'most-likely-to': 'Most Likely To',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Game HUD Bar */}
      <div className="glass-panel px-4 py-3 sm:px-6 sm:py-3 rounded-2xl border border-border flex items-center justify-between gap-4">
        {/* Left: Room Code & Game Name */}
        <div className="flex items-center gap-3">
          {currentPlayer.isHost && (
            <button
              onClick={onReturnToLobby}
              className="p-1.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Lobby"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">
                {room.code}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-bold text-brand-300">
                Round {publicState.round || 1}/{publicState.totalRounds || 1}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white">
              {gameTitles[publicState.gameId] || 'Party Game'}
            </h2>
          </div>
        </div>

        {/* Center: Authoritative Timer */}
        {publicState.deadline && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border font-mono font-black text-sm">
            <Clock className={`w-4 h-4 ${
              timeLeftMs < 5000 ? 'text-coral animate-ping' : 'text-cyan'
            }`} />
            <span className={timeLeftMs < 5000 ? 'text-coral' : 'text-white'}>
              {formatTime(timeLeftMs)}
            </span>
          </div>
        )}

        {/* Right: Player count and Mobile View Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-surface-elevated px-2.5 py-1.5 rounded-xl border border-border">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{room.players.length} players</span>
          </div>

          {/* Mobile Segments Tab Switcher (1-click, instant) */}
          <div className="flex lg:hidden rounded-xl bg-surface p-1 border border-border">
            <button
              type="button"
              onClick={() => setMobileTab('game')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                mobileTab === 'game'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileTab('chat');
                setLastReadMessageCount(chatMessages.length);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 relative ${
                mobileTab === 'chat'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
              {unreadCount > 0 && mobileTab !== 'chat' && (
                <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Arena + Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Game Play Area (8 cols on desktop, toggled on mobile) */}
        <div className={`lg:col-span-8 space-y-4 ${mobileTab === 'game' ? 'block' : 'hidden lg:block'}`}>
          {publicState.gameId === 'draw-and-guess' && (
            <DrawAndGuessView
              publicState={publicState}
              privateState={privateState}
              myPlayerId={currentPlayer.id}
              onSendAction={onSendGameAction}
              onSendStroke={onSendStroke}
              onClearCanvas={onClearCanvas}
              onSendGuess={onSendMessage}
            />
          )}

          {publicState.gameId === 'quiz-battle' && (
            <QuizBattleView
              publicState={publicState}
              privateState={privateState}
              onSendAction={onSendGameAction}
            />
          )}

          {publicState.gameId === 'hot-takes' && (
            <HotTakesView
              publicState={publicState}
              privateState={privateState}
              onSendAction={onSendGameAction}
            />
          )}

          {publicState.gameId === 'reaction-arena' && (
            <ReactionArenaView
              publicState={publicState}
              privateState={privateState}
              onSendAction={onSendGameAction}
            />
          )}

          {publicState.gameId === 'word-dash' && (
            <WordDashView
              publicState={publicState}
              privateState={privateState}
              onSendAction={onSendGameAction}
            />
          )}

          {publicState.gameId === 'most-likely-to' && (
            <MostLikelyToView
              publicState={publicState}
              privateState={privateState}
              room={room}
              currentPlayerId={currentPlayer.id}
              onSendAction={onSendGameAction}
            />
          )}

          {/* Real-Time Live Scoreboard Mini-Pills */}
          <div className="glass-panel p-3 rounded-2xl border border-border flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1 shrink-0">
              Scoreboard:
            </span>
            {(publicState.leaderboard || []).map((p: any) => (
              <div
                key={p.playerId}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 border ${
                  p.playerId === currentPlayer.id
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                    : 'bg-surface text-slate-300 border-border'
                }`}
              >
                <span>{p.nickname}</span>
                <span className="font-mono text-white">({p.score})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Chat & Reactions Sidebar (4 cols on desktop, toggled on mobile) */}
        <div className={`lg:col-span-4 h-[560px] ${mobileTab === 'chat' ? 'block' : 'hidden lg:block'}`}>
          <ChatSidebar
            messages={chatMessages}
            reactions={reactions}
            onSendMessage={onSendMessage}
            onSendReaction={onSendReaction}
            onClose={() => setMobileTab('game')}
          />
        </div>
      </div>
    </div>
  );
};
