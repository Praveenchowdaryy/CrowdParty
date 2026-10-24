'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MostLikelyToPublicState, MostLikelyToPrivateState, RoomSnapshot } from '@crowdparty/shared';
import { Crown, CheckCircle2, Award, Users, Sparkles } from 'lucide-react';
import { PlayerAvatar } from '../../common/PlayerAvatar';

interface MostLikelyToViewProps {
  publicState: MostLikelyToPublicState;
  privateState: MostLikelyToPrivateState;
  room: RoomSnapshot;
  currentPlayerId: string;
  onSendAction: (type: string, payload: any) => void;
}

export const MostLikelyToView: React.FC<MostLikelyToViewProps> = ({
  publicState,
  privateState,
  room,
  currentPlayerId,
  onSendAction,
}) => {
  const currentPrompt = publicState.currentPrompt;
  const isRevealPhase = publicState.phase === 'ROUND_END' || publicState.phase === 'RESULTS';
  const revealData = publicState.roundReveal;

  if (!currentPrompt) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-border text-center">
        <Crown className="w-8 h-8 text-yellow mx-auto animate-pulse mb-3" />
        <h3 className="text-xl font-bold text-white">Loading Next Superlative...</h3>
      </div>
    );
  }

  const handleVote = (targetPlayerId: string) => {
    if (privateState.hasVoted || isRevealPhase) return;
    onSendAction('vote_player', { targetPlayerId });
  };

  const activePlayers = room.players.filter(p => p.isOnline);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn select-none">
      {/* Superlative Prompt Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-glow text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5 text-yellow" />
          <span>{currentPrompt.category} • Superlative {publicState.round}/{publicState.totalRounds}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          &ldquo;{currentPrompt.prompt}&rdquo;
        </h2>

        <p className="text-xs text-slate-400">
          Tap on the squad member who fits this superlative the best!
        </p>
      </div>

      {/* Reveal Banner */}
      <AnimatePresence>
        {isRevealPhase && revealData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-yellow/50 bg-gradient-to-b from-yellow/15 to-surface text-center space-y-3 shadow-glow"
          >
            <div className="relative inline-block">
              <Crown className="w-10 h-10 text-yellow fill-yellow mx-auto animate-bounce mb-1" />
              <PlayerAvatar avatar={revealData.winnerAvatar} size="xl" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-yellow tracking-widest block">
                The Squad Has Spoken!
              </span>
              <h3 className="text-3xl font-black text-white">
                {revealData.winnerNickname}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Received <span className="text-yellow font-black">{revealData.voteCount} votes</span>! (+500 pts)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Candidate Voting Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {activePlayers.map((player) => {
          const isVotedByMe = privateState.myVotePlayerId === player.id;
          const isWinner = isRevealPhase && revealData?.winnerId === player.id;
          const voterList = revealData?.votesByPlayer?.[player.id] || [];

          let cardStyle = 'border-border/70 bg-surface-elevated/50 hover:border-brand-500/50 hover:bg-surface-elevated';
          if (isVotedByMe && !isRevealPhase) {
            cardStyle = 'border-yellow bg-yellow/15 shadow-glow scale-[1.02] ring-2 ring-yellow/30';
          } else if (isWinner) {
            cardStyle = 'border-yellow bg-yellow/20 shadow-glow text-yellow scale-[1.02]';
          }

          return (
            <motion.button
              key={player.id}
              whileHover={(!privateState.hasVoted && !isRevealPhase) ? { scale: 1.03 } : {}}
              whileTap={(!privateState.hasVoted && !isRevealPhase) ? { scale: 0.97 } : {}}
              type="button"
              disabled={privateState.hasVoted || isRevealPhase}
              onClick={() => handleVote(player.id)}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle} ${
                privateState.hasVoted && !isVotedByMe ? 'opacity-60 cursor-default' : ''
              }`}
            >
              <div className="relative">
                {isWinner && (
                  <Crown className="w-5 h-5 text-yellow fill-yellow absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce" />
                )}
                <PlayerAvatar avatar={player.avatar} size="lg" />
              </div>

              <div className="min-w-0 w-full">
                <span className="text-sm font-bold text-white block truncate">
                  {player.nickname}
                </span>
                {player.id === currentPlayerId && (
                  <span className="text-[10px] text-brand-300 font-semibold block">
                    (You)
                  </span>
                )}
              </div>

              {/* Status pill */}
              {isVotedByMe && !isRevealPhase && (
                <span className="text-[10px] font-bold text-yellow px-2 py-0.5 rounded-full bg-yellow/20 border border-yellow/30">
                  Your Vote
                </span>
              )}

              {/* Reveal Phase Vote Count */}
              {isRevealPhase && (
                <div className="text-[11px] font-mono font-bold text-slate-300">
                  {voterList.length} {voterList.length === 1 ? 'vote' : 'votes'}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {privateState.hasVoted && !isRevealPhase && (
        <div className="text-center text-xs text-mint font-bold flex items-center justify-center gap-1.5 pt-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Vote submitted! Waiting for the squad results...</span>
        </div>
      )}
    </div>
  );
};
