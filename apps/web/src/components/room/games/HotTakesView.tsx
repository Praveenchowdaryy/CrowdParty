'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HotTakesPublicState,
  HotTakesPrivateState,
} from '@crowdparty/shared';
import { Flame, CheckCircle2, Award, Users, ThumbsUp } from 'lucide-react';

interface HotTakesViewProps {
  publicState: HotTakesPublicState;
  privateState: HotTakesPrivateState;
  onSendAction: (type: string, payload: any) => void;
}

export const HotTakesView: React.FC<HotTakesViewProps> = ({
  publicState,
  privateState,
  onSendAction,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<'A' | 'B' | null>(null);

  const currentPrompt = publicState.currentPrompt;
  const isRevealPhase = publicState.phase === 'ROUND_END' || publicState.phase === 'RESULTS';
  const revealData = publicState.roundReveal;

  if (!currentPrompt) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-border text-center">
        <Flame className="w-8 h-8 text-yellow mx-auto animate-pulse mb-3" />
        <h3 className="text-xl font-bold text-white">Loading Dilemma...</h3>
      </div>
    );
  }

  const handleVoteSubmit = () => {
    if (!selectedChoice || !selectedPrediction || privateState.hasVoted) return;
    onSendAction('submit_vote', {
      choice: selectedChoice,
      prediction: selectedPrediction,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Prompt Card */}
      <motion.div
        key={currentPrompt.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-glow text-center space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/15 border border-coral/30 text-coral-light text-xs font-bold uppercase tracking-wider">
          <Flame className="w-4 h-4 fill-coral text-coral" />
          <span>{currentPrompt.category} • Hot Take {publicState.round}/{publicState.totalRounds}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          {currentPrompt.scenario}
        </h2>

        <p className="text-xs text-slate-400">
          Pick your stance, then predict what the majority of the room will choose!
        </p>
      </motion.div>

      {/* Reveal Percentage Bar (During Reveal Phase) */}
      <AnimatePresence>
        {isRevealPhase && revealData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-3xl border border-border shadow-glow space-y-4"
          >
            <div className="flex justify-between items-center text-sm font-black">
              <span className="text-brand-300">Option A: {revealData.percentA}%</span>
              <span className="text-xs uppercase font-bold text-slate-400">
                Majority: {revealData.majority === 'TIE' ? 'Split 50/50 Tie!' : `Option ${revealData.majority}`}
              </span>
              <span className="text-coral-light">Option B: {revealData.percentB}%</span>
            </div>

            {/* Split Bar with smooth CSS/Framer transitions */}
            <div className="w-full h-5 rounded-full bg-surface-elevated overflow-hidden flex border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${revealData.percentA}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-brand-600 to-brand-400 h-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${revealData.percentB}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-coral to-yellow h-full"
              />
            </div>

            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>{revealData.votesA.length} votes</span>
              <span>{revealData.votesB.length} votes</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voting Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option A */}
        <motion.div
          whileHover={(!privateState.hasVoted && !isRevealPhase) ? { scale: 1.015 } : {}}
          whileTap={(!privateState.hasVoted && !isRevealPhase) ? { scale: 0.985 } : {}}
          onClick={() => !privateState.hasVoted && !isRevealPhase && setSelectedChoice('A')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
            (privateState.myVote === 'A' || selectedChoice === 'A')
              ? 'border-brand-500 bg-brand-500/20 shadow-glow scale-[1.01]'
              : 'border-border bg-surface-elevated/40 hover:border-brand-500/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-xl bg-brand-500/30 text-brand-300 border border-brand-500/40 flex items-center justify-center font-black">
                A
              </span>
              {(privateState.myVote === 'A' || selectedChoice === 'A') && (
                <span className="text-xs font-bold text-brand-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" /> Your Choice
                </span>
              )}
            </div>

            <p className="text-lg font-bold text-white mb-4">
              {currentPrompt.optionA}
            </p>
          </div>

          {/* Prediction Selector button */}
          {!privateState.hasVoted && !isRevealPhase && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPrediction('A');
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                selectedPrediction === 'A'
                  ? 'border-yellow bg-yellow/20 text-yellow shadow'
                  : 'border-border/80 text-slate-400 hover:text-white'
              }`}
            >
              {selectedPrediction === 'A' ? '★ Predicted Majority Winner' : 'Predict Option A Wins'}
            </button>
          )}
        </motion.div>

        {/* Option B */}
        <motion.div
          whileHover={(!privateState.hasVoted && !isRevealPhase) ? { scale: 1.015 } : {}}
          whileTap={(!privateState.hasVoted && !isRevealPhase) ? { scale: 0.985 } : {}}
          onClick={() => !privateState.hasVoted && !isRevealPhase && setSelectedChoice('B')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
            (privateState.myVote === 'B' || selectedChoice === 'B')
              ? 'border-coral bg-coral/20 shadow-glow scale-[1.01]'
              : 'border-border bg-surface-elevated/40 hover:border-coral/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-xl bg-coral/30 text-coral border border-coral/40 flex items-center justify-center font-black">
                B
              </span>
              {(privateState.myVote === 'B' || selectedChoice === 'B') && (
                <span className="text-xs font-bold text-coral-light flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-coral" /> Your Choice
                </span>
              )}
            </div>

            <p className="text-lg font-bold text-white mb-4">
              {currentPrompt.optionB}
            </p>
          </div>

          {/* Prediction Selector button */}
          {!privateState.hasVoted && !isRevealPhase && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPrediction('B');
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                selectedPrediction === 'B'
                  ? 'border-yellow bg-yellow/20 text-yellow shadow'
                  : 'border-border/80 text-slate-400 hover:text-white'
              }`}
            >
              {selectedPrediction === 'B' ? '★ Predicted Majority Winner' : 'Predict Option B Wins'}
            </button>
          )}
        </motion.div>
      </div>

      {/* Submit Vote Button */}
      {!privateState.hasVoted && !isRevealPhase && (
        <div className="text-center pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={!selectedChoice || !selectedPrediction}
            onClick={handleVoteSubmit}
            className="py-3.5 px-8 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-brand-600 to-coral hover:opacity-95 shadow-glow transition-all disabled:opacity-40 cursor-pointer"
          >
            Lock In Vote & Prediction
          </motion.button>
        </div>
      )}

      {privateState.hasVoted && !isRevealPhase && (
        <div className="text-center text-xs text-mint font-bold flex items-center justify-center gap-1.5 pt-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Vote submitted! Waiting for the crowd reveal...</span>
        </div>
      )}
    </div>
  );
};
