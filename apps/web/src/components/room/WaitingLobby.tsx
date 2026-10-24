'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RoomSnapshot,
  Player,
  GAME_CATALOGUE,
} from '@crowdparty/shared';
import {
  Copy,
  Check,
  Crown,
  Play,
  UserPlus,
  Settings,
  LogOut,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Share2,
  Bot,
  Gamepad2,
} from 'lucide-react';
import { copyTextToClipboard } from '@/lib/utils';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface WaitingLobbyProps {
  room: RoomSnapshot;
  currentPlayer: Player;
  onSelectGame: (gameId: string) => void;
  onStartGame: () => void;
  onSetReady: (isReady: boolean) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onLeaveRoom: () => void;
  onUpdateSettings: (settings: { maxPlayers?: number; allowLateJoin?: boolean }) => void;
}

// Custom mini art badges for game carousel
const gameMiniArt: Record<string, { color: string; badge: string }> = {
  draw_and_guess: { color: 'border-brand-500/40 bg-brand-500/10 text-brand-300', badge: 'Drawing' },
  quiz_battle: { color: 'border-cyan/40 bg-cyan/10 text-cyan-light', badge: 'Trivia' },
  hot_takes: { color: 'border-coral/40 bg-coral/10 text-coral-light', badge: 'Dilemmas' },
  reaction_arena: { color: 'border-mint/40 bg-mint/10 text-mint', badge: 'Reflex' },
};

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({
  room,
  currentPlayer,
  onSelectGame,
  onStartGame,
  onSetReady,
  onAddBot,
  onRemoveBot,
  onLeaveRoom,
  onUpdateSettings,
}) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const isHost = currentPlayer.isHost;
  const selectedGame = GAME_CATALOGUE.find((g) => g.id === room.selectedGameId) || GAME_CATALOGUE[0];

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/room/${room.code}`;

    // Native mobile share sheet if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join CrowdParty Room',
          text: `Join my multiplayer party room (${room.code}) on CrowdParty!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard copy if cancelled or rejected
      }
    }

    const success = await copyTextToClipboard(url);
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyTextToClipboard(room.code);
    if (success) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Room Banner Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-glow flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Lobby Active • Room Ready
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Room Code: <span className="font-mono text-brand-400 tracking-wider">{room.code}</span>
            </h1>
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleCopyCode}
              title="Copy Room Code"
              className="p-2.5 rounded-xl bg-surface-elevated hover:bg-brand-500/20 text-slate-300 hover:text-white border border-border transition-colors cursor-pointer"
            >
              {codeCopied ? <Check className="w-5 h-5 text-mint" /> : <Copy className="w-5 h-5 text-brand-400" />}
            </motion.button>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {codeCopied ? '✅ Room code copied to clipboard!' : 'Share this 6-letter pass or invitation link with friends to enter.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleCopyLink}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs sm:text-sm font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            {linkCopied ? <Check className="w-4 h-4 text-mint" /> : <Share2 className="w-4 h-4 text-brand-400" />}
            <span>{linkCopied ? 'Link Copied!' : 'Share / Copy Link'}</span>
          </motion.button>

          {isHost && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddBot}
                title="Add Simulated Player"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-brand-500/20 border border-border text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-cyan" />
                <span className="hidden sm:inline">Add Bot</span>
              </motion.button>

              <button
                onClick={() => setShowSettingsModal(true)}
                title="Room Settings"
                className="p-2.5 rounded-xl bg-surface-elevated hover:bg-brand-500/20 border border-border text-slate-300 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onLeaveRoom}
            title="Leave Room"
            className="p-2.5 rounded-xl bg-surface-elevated hover:bg-coral/20 border border-border text-slate-400 hover:text-coral transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Player Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan" />
              <span>Squad Roster</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-slate-300 border border-border font-mono">
                {room.players.length}/{room.settings.maxPlayers}
              </span>
            </h2>

            {!isHost && (
              <button
                onClick={() => onSetReady(!currentPlayer.isReady)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentPlayer.isReady
                    ? 'bg-mint/20 text-mint border border-mint/40'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow'
                }`}
              >
                {currentPlayer.isReady ? '✓ Ready' : 'Set Ready'}
              </button>
            )}
          </div>

          {/* Staggered Animated Player List */}
          <div className="grid grid-cols-1 gap-2.5">
            <AnimatePresence mode="popLayout">
              {room.players.map((player) => {
                const isMe = player.id === currentPlayer.id;
                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-brand-500/10 border-brand-500/40 shadow-sm'
                        : 'bg-surface-elevated/70 border-border/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlayerAvatar avatar={player.avatar} size="md" />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white truncate">
                            {player.nickname}
                          </span>
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/30 text-brand-300 font-bold shrink-0">
                              YOU
                            </span>
                          )}
                          {player.isHost && (
                            <span title="Room Host" className="shrink-0">
                              <Crown className="w-3.5 h-3.5 text-yellow fill-yellow/20" />
                            </span>
                          )}
                          {player.isBot && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan/20 text-cyan-light font-bold flex items-center gap-1 shrink-0">
                              <Bot className="w-3 h-3" />
                              CPU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Match Score: {player.score} pts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {player.isReady && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-mint px-2 py-0.5 rounded-md bg-mint/10 border border-mint/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      )}

                      {/* Bot Remove Action: High-visibility 40px touch button */}
                      {isHost && player.isBot && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveBot(player.id);
                          }}
                          className="w-9 h-9 rounded-xl bg-coral/20 border border-coral/40 text-coral hover:bg-coral hover:text-white flex items-center justify-center transition-all cursor-pointer ml-1"
                          title={`Remove CPU ${player.nickname}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Game Selector & Start Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-brand-400" />
                <span>Select Next Game</span>
              </h2>
              {isHost ? (
                <span className="text-xs text-brand-300 font-semibold">
                  (Host: Click any card to pick)
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Host is choosing game
                </span>
              )}
            </div>

            {/* Game Options Carousel / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GAME_CATALOGUE.map((game) => {
                const isSelected = game.id === room.selectedGameId;
                const visual = gameMiniArt[game.id] || gameMiniArt.draw_and_guess;

                return (
                  <motion.button
                    key={game.id}
                    whileHover={isHost ? { y: -2 } : {}}
                    type="button"
                    disabled={!isHost}
                    onClick={() => onSelectGame(game.id)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/15 shadow-glow scale-[1.01]'
                        : 'border-border/60 bg-surface-elevated/40 hover:border-brand-500/40 hover:bg-surface-elevated/70'
                    } ${!isHost && 'cursor-default'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${visual.color}`}>
                        {visual.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-500 text-white shadow">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {game.tagline}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        {game.minPlayers}–{game.maxPlayers}p
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        ~{game.durationMinutes}m
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Game Details & Start Bar */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-surface/85">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400 block mb-1">
                  Active Selection
                </span>
                <h3 className="text-xl font-bold text-white">
                  {selectedGame.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedGame.description}
                </p>
              </div>
            </div>

            {isHost ? (
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="button"
                onClick={onStartGame}
                className="w-full py-4 px-6 rounded-2xl text-base font-black text-white bg-gradient-to-r from-brand-600 via-brand-500 to-coral hover:opacity-95 shadow-glow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>START MATCH NOW</span>
              </motion.button>
            ) : (
              <div className="w-full py-4 px-6 rounded-2xl text-center bg-surface-elevated/70 border border-border text-sm text-slate-400 font-medium">
                Waiting for host <span className="text-white font-bold">{room.players.find(p => p.isHost)?.nickname || 'Host'}</span> to launch the game...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-border shadow-glow-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-400" />
              <span>Room Settings</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Max Players (2 - 20)
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={room.settings.maxPlayers}
                  onChange={(e) => onUpdateSettings({ maxPlayers: parseInt(e.target.value) || 12 })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-300">Allow Late Join</span>
                <input
                  type="checkbox"
                  checked={room.settings.allowLateJoin}
                  onChange={(e) => onUpdateSettings({ allowLateJoin: e.target.checked })}
                  className="w-4 h-4 accent-brand-500 rounded"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              Save Settings
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
