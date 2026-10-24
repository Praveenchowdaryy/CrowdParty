'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QuizBattlePublicState,
  QuizBattlePrivateState,
} from '@crowdparty/shared';
import { Sparkles, CheckCircle2, XCircle, Info, Zap, HelpCircle } from 'lucide-react';

interface QuizBattleViewProps {
  publicState: QuizBattlePublicState;
  privateState: QuizBattlePrivateState;
  onSendAction: (type: string, payload: any) => void;
}

export const QuizBattleView: React.FC<QuizBattleViewProps> = ({
  publicState,
  privateState,
  onSendAction,
}) => {
  const currentQ = publicState.currentQuestion;
  const isRevealPhase = publicState.phase === 'ROUND_END' || publicState.phase === 'RESULTS';
  const revealData = publicState.roundReveal;

  if (!currentQ) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-border text-center">
        <Sparkles className="w-8 h-8 text-brand-400 mx-auto animate-pulse mb-3" />
        <h3 className="text-xl font-bold text-white">Preparing Next Question...</h3>
      </div>
    );
  }

  const handleSelectOption = (optionId: string) => {
    if (privateState.hasAnswered || isRevealPhase) return;
    onSendAction('submit_answer', { optionId });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Question Card */}
      <motion.div
        key={currentQ.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-glow relative overflow-hidden"
      >
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black px-3 py-1 rounded-full bg-cyan/15 text-cyan-light border border-cyan/30">
              {currentQ.category}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Question {publicState.round} of {publicState.totalRounds}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-yellow font-semibold">
            <Zap className="w-4 h-4 fill-yellow" />
            <span>Speed Multiplier Active</span>
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
          {currentQ.question}
        </h2>

        {/* Answer status pill */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>{publicState.answeredPlayerIds.length} answered</span>
          {privateState.hasAnswered && !isRevealPhase && (
            <span className="text-mint font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Locked in! Waiting for others...
            </span>
          )}
        </div>
      </motion.div>

      {/* Multiple Choice Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQ.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = privateState.selectedOptionId === option.id;
          const isCorrect = isRevealPhase && revealData?.correctOptionId === option.id;
          const isWrong = isRevealPhase && isSelected && !isCorrect;

          let cardStyle = 'border-border/70 bg-surface-elevated/60 hover:border-brand-500/50 hover:bg-surface-elevated';
          if (isSelected && !isRevealPhase) {
            cardStyle = 'border-brand-500 bg-brand-500/25 shadow-glow scale-[1.01]';
          } else if (isCorrect) {
            cardStyle = 'border-mint bg-mint/20 shadow-glow text-mint scale-[1.02]';
          } else if (isWrong) {
            cardStyle = 'border-coral bg-coral/20 text-coral';
          }

          return (
            <motion.button
              key={option.id}
              whileHover={(!privateState.hasAnswered && !isRevealPhase) ? { scale: 1.015 } : {}}
              whileTap={(!privateState.hasAnswered && !isRevealPhase) ? { scale: 0.985 } : {}}
              type="button"
              disabled={privateState.hasAnswered || isRevealPhase}
              onClick={() => handleSelectOption(option.id)}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${cardStyle} ${
                privateState.hasAnswered && !isSelected ? 'opacity-50 cursor-default' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${
                  isSelected ? 'bg-brand-500 text-white border-brand-400' : 'bg-surface border-border text-slate-300'
                }`}>
                  {letter}
                </span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {option.text}
                </span>
              </div>

              {isCorrect && <CheckCircle2 className="w-6 h-6 text-mint shrink-0" />}
              {isWrong && <XCircle className="w-6 h-6 text-coral shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Reveal Explanation Card */}
      <AnimatePresence>
        {isRevealPhase && revealData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-5 rounded-2xl border border-brand-500/40 bg-surface/90 space-y-2 shadow-lg"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-300">
              <Info className="w-4 h-4" />
              <span>Explanation</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {revealData.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
