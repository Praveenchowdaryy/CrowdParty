'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { GameResultPayload, Player } from '@crowdparty/shared';
import { Trophy, Crown, RotateCcw, Home, Sparkles, Medal } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface PodiumResultsProps {
  results: GameResultPayload;
  currentPlayer: Player;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const PodiumResults: React.FC<PodiumResultsProps> = ({
  results,
  currentPlayer,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const isHost = currentPlayer.isHost;
  const standings = results.finalStandings;
  const first = standings[0];
  const second = standings[1];
  const third = standings[2];

  useEffect(() => {
    // Fire celebratory confetti!
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#FF5E62', '#06B6D4', '#F59E0B'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#FF5E62', '#06B6D4', '#F59E0B'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Victory Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow/20 text-yellow text-xs font-bold border border-yellow/30 uppercase tracking-wider">
          <Trophy className="w-4 h-4 fill-yellow" />
          <span>Match Complete • {results.gameId.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Victory Podium
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Game Leaderboard: Final scores for this room match.
        </p>
      </motion.div>

      {/* 3-Step Podium Display with Framer Motion Stagger */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8 max-w-2xl mx-auto text-center">
        {/* 2nd Place (Silver) */}
        {second ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.3 }}
            className="space-y-2"
          >
            <div className="flex justify-center">
              <PlayerAvatar avatar={second.avatar} size="lg" />
            </div>
            <div className="font-bold text-white text-xs sm:text-sm truncate">
              {second.nickname}
            </div>
            <div className="font-mono text-xs text-slate-400 font-bold">
              {second.score} pts
            </div>
            <div className="h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-slate-700/60 to-slate-500/40 border-t-2 border-slate-400 flex items-center justify-center font-black text-2xl sm:text-4xl text-slate-300 shadow-md">
              2
            </div>
          </motion.div>
        ) : (
          <div className="h-28" />
        )}

        {/* 1st Place (Gold Winner) */}
        {first ? (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', bounce: 0.4 }}
            className="space-y-2 relative -top-4"
          >
            <div className="relative inline-block">
              <Crown className="w-7 h-7 text-yellow fill-yellow absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" />
              <PlayerAvatar avatar={first.avatar} size="xl" />
            </div>
            <div className="font-black text-white text-sm sm:text-base truncate">
              {first.nickname}
            </div>
            <div className="font-mono text-sm text-yellow font-black">
              {first.score} pts
            </div>
            <div className="h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-amber-600/70 to-yellow/50 border-t-2 border-yellow shadow-glow-lg flex items-center justify-center font-black text-4xl sm:text-5xl text-yellow">
              1
            </div>
          </motion.div>
        ) : (
          <div className="h-36" />
        )}

        {/* 3rd Place (Bronze) */}
        {third ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', bounce: 0.3 }}
            className="space-y-2"
          >
            <div className="flex justify-center">
              <PlayerAvatar avatar={third.avatar} size="lg" />
            </div>
            <div className="font-bold text-white text-xs sm:text-sm truncate">
              {third.nickname}
            </div>
            <div className="font-mono text-xs text-slate-400 font-bold">
              {third.score} pts
            </div>
            <div className="h-20 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-900/60 to-amber-700/40 border-t-2 border-amber-600 flex items-center justify-center font-black text-2xl sm:text-4xl text-amber-500 shadow-md">
              3
            </div>
          </motion.div>
        ) : (
          <div className="h-20" />
        )}
      </div>

      {/* Standings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-6 rounded-3xl border border-border shadow-glow space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Medal className="w-4 h-4 text-brand-400" />
            <span>Room Standings</span>
          </h3>
          <span className="text-xs text-brand-300 font-semibold">Match Complete</span>
        </div>
        <div className="space-y-2">
          {standings.map((p) => (
            <div
              key={p.playerId}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border/70 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-500 w-5">#{p.rank}</span>
                <PlayerAvatar avatar={p.avatar} size="sm" />
                <span className="font-bold text-white">{p.nickname}</span>
                {p.isWinner && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow/20 text-yellow border border-yellow/30 font-bold">
                    WINNER
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-brand-300">{p.score} pts</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {isHost ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsStarting(true);
                onPlayAgain();
              }}
              disabled={isStarting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-coral text-white font-black text-sm shadow-glow flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isStarting ? 'animate-spin' : ''}`} />
              <span>{isStarting ? 'Starting Rematch...' : 'Play Again (Rematch)'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReturnToLobby}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-brand-400" />
              <span>Return to Waiting Lobby</span>
            </motion.button>
          </>
        ) : (
          <div className="text-xs text-slate-400 text-center py-2">
            Waiting for the host to start a rematch or return to the lobby...
          </div>
        )}
      </div>
    </div>
  );
};
