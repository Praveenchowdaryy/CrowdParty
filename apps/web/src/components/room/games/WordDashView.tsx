'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordDashPublicState, WordDashPrivateState } from '@crowdparty/shared';
import { Zap, CheckCircle2, Trophy, Clock, Send, Sparkles } from 'lucide-react';

interface WordDashViewProps {
  publicState: WordDashPublicState;
  privateState: WordDashPrivateState;
  onSendAction: (type: string, payload: any) => void;
}

export const WordDashView: React.FC<WordDashViewProps> = ({
  publicState,
  privateState,
  onSendAction,
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const currentW = publicState.currentWord;
  const isRevealPhase = publicState.phase === 'ROUND_END' || publicState.phase === 'RESULTS';
  const revealData = publicState.roundReveal;

  if (!currentW) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-border text-center">
        <Zap className="w-8 h-8 text-mint mx-auto animate-pulse mb-3" />
        <h3 className="text-xl font-bold text-white">Preparing Next Word Scramble...</h3>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || privateState.hasSolved || isRevealPhase) return;

    onSendAction('submit_word', { word: guessInput.trim() });
    setGuessInput('');
  };

  const letters = currentW.scrambled.split(' ').filter(Boolean);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn select-none">
      {/* Question / Scramble Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-glow text-center space-y-4 relative overflow-hidden">
        {/* Category Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/15 border border-mint/30 text-mint text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-mint" />
            <span>{currentW.category} • Round {publicState.round}/{publicState.totalRounds}</span>
          </div>

          <div className="text-xs text-yellow font-semibold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow" />
            <span>Fastest Solvers Earn +600 pts</span>
          </div>
        </div>

        {/* Clue Prompt */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto">
          Clue: &ldquo;{currentW.clue}&rdquo;
        </p>

        {/* Scrambled Letter Tiles */}
        <div className="pt-2 pb-2">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {letters.map((char, index) => (
              <motion.div
                key={`${char}-${index}`}
                initial={{ scale: 0.8, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', bounce: 0.3 }}
                className="w-11 h-14 sm:w-14 sm:h-18 rounded-2xl bg-gradient-to-b from-surface-elevated to-surface border-2 border-mint/40 shadow-glow flex items-center justify-center font-black text-2xl sm:text-3xl text-mint font-mono select-none"
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Word length: <span className="text-white font-bold">{currentW.wordLength} letters</span>
        </p>
      </div>

      {/* Solved Status & Input */}
      {privateState.hasSolved ? (
        <div className="glass-panel p-6 rounded-3xl border border-mint/40 bg-mint/10 text-center space-y-2 animate-fadeIn">
          <CheckCircle2 className="w-10 h-10 text-mint mx-auto" />
          <h3 className="text-xl font-black text-white">Unscrambled Correctly!</h3>
          <p className="text-xs text-mint">
            You solved it in {((privateState.mySolveTimeMs || 0) / 1000).toFixed(1)}s (+{privateState.myPointsEarned || 500} pts)! Waiting for others...
          </p>
        </div>
      ) : !isRevealPhase ? (
        <form onSubmit={handleSubmit} className="glass-panel p-3 rounded-2xl border border-border shadow-glow flex gap-2">
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value.toUpperCase())}
            placeholder="Type your unscrambled word..."
            maxLength={currentW.wordLength + 5}
            className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated border border-border text-white text-base font-black tracking-widest text-center uppercase placeholder-slate-500 focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint/30"
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-mint to-cyan text-slate-950 font-black text-sm uppercase tracking-wider shadow-glow hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Solve</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : null}

      {/* Round Reveal Card */}
      <AnimatePresence>
        {isRevealPhase && revealData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 rounded-3xl border border-mint/50 bg-surface/90 text-center space-y-3 shadow-glow"
          >
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Round Complete
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              The answer was <span className="text-mint font-mono underline">{revealData.answer}</span>!
            </h3>
            {revealData.fastestPlayerNickname && (
              <p className="text-xs text-yellow font-bold flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 fill-yellow" />
                <span>Fastest Solver: {revealData.fastestPlayerNickname} ({((revealData.fastestTimeMs || 0) / 1000).toFixed(1)}s)</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
