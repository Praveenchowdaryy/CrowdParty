'use client';

import React, { useEffect, useCallback } from 'react';
import {
  ReactionArenaPublicState,
  ReactionArenaPrivateState,
} from '@crowdparty/shared';
import { Zap, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { PlayerAvatar } from '../../common/PlayerAvatar';

interface ReactionArenaViewProps {
  publicState: ReactionArenaPublicState;
  privateState: ReactionArenaPrivateState;
  onSendAction: (type: string, payload: any) => void;
}

export const ReactionArenaView: React.FC<ReactionArenaViewProps> = ({
  publicState,
  privateState,
  onSendAction,
}) => {
  const isWaitingSignal = publicState.arenaStatus === 'WAITING_SIGNAL';
  const isSignalActive = publicState.arenaStatus === 'SIGNAL_ACTIVE';
  const isRoundResults = publicState.arenaStatus === 'ROUND_RESULTS' || publicState.phase === 'ROUND_END';

  const handleReact = useCallback(() => {
    if (privateState.hasReacted || isRoundResults) return;
    onSendAction('react', {
      clientTimestamp: Date.now(),
    });
  }, [privateState.hasReacted, isRoundResults, onSendAction]);

  // Spacebar hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !privateState.hasReacted && !isRoundResults) {
        e.preventDefault();
        handleReact();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReact, privateState.hasReacted, isRoundResults]);

  let arenaBg = 'bg-[#18111A] border-border';
  let statusText = 'GET READY...';
  let subText = 'Wait for the arena to turn green. Press SPACE or Click anywhere!';

  if (isWaitingSignal) {
    arenaBg = 'bg-gradient-to-b from-rose-950/60 to-surface border-coral/40';
    statusText = 'WAIT FOR GREEN...';
    subText = 'Do NOT click yet! False starts are penalized.';
  } else if (isSignalActive) {
    arenaBg = 'bg-gradient-to-b from-emerald-900/80 to-emerald-950 border-mint shadow-glow';
    statusText = 'CLICK NOW!!!';
    subText = 'REACT FAST! TAP SCREEN OR HIT SPACE!';
  } else if (isRoundResults) {
    arenaBg = 'bg-surface border-border';
    statusText = 'ROUND FINISHED';
    subText = 'Here are the fastest reflexes of this round:';
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider">
          <Zap className="w-4 h-4 text-cyan" />
          <span>Reaction Arena • Round {publicState.round} of {publicState.totalRounds}</span>
        </div>
        <span>{publicState.reactedPlayerIds.length} players reacted</span>
      </div>

      {/* Main Interactive Arena Box */}
      <div
        onClick={handleReact}
        className={`w-full h-80 sm:h-96 rounded-3xl border-2 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-150 select-none shadow-glow relative overflow-hidden ${arenaBg}`}
      >
        {isSignalActive && (
          <div className="absolute inset-0 bg-mint/20 animate-ping pointer-events-none" />
        )}

        {privateState.isFalseStart ? (
          <div className="space-y-3">
            <AlertTriangle className="w-16 h-16 text-yellow mx-auto animate-bounce" />
            <h3 className="text-3xl font-black text-yellow tracking-tight">
              FALSE START!
            </h3>
            <p className="text-xs text-slate-300">
              You clicked before the green signal! 0 points this round.
            </p>
          </div>
        ) : privateState.hasReacted && privateState.myReactionTimeMs ? (
          <div className="space-y-2">
            <CheckCircle2 className="w-12 h-12 text-mint mx-auto" />
            <div className="text-4xl sm:text-5xl font-black text-white font-mono">
              {privateState.myReactionTimeMs} <span className="text-xl text-mint">ms</span>
            </div>
            <p className="text-xs text-slate-300">
              Reaction time locked in! Waiting for round results...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {isSignalActive ? (
              <Zap className="w-20 h-20 text-white fill-mint mx-auto animate-bounce" />
            ) : (
              <Clock className="w-12 h-12 text-slate-400 mx-auto" />
            )}
            <h3 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              isSignalActive ? 'text-white' : 'text-slate-200'
            }`}>
              {statusText}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
              {subText}
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard for Current Round Results */}
      {isRoundResults && (
        <div className="glass-panel p-6 rounded-3xl border border-border shadow-glow space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan" />
            <span>Round {publicState.round} Reflex Standings</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publicState.results.map((res) => (
              <div
                key={res.playerId}
                className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border/70 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-400 w-5">#{res.rank}</span>
                  <PlayerAvatar avatar={res.avatar} size="xs" />
                  <span className="font-bold text-white">{res.nickname}</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  {res.isFalseStart ? (
                    <span className="text-yellow font-bold text-[11px]">False Start</span>
                  ) : res.reactionTimeMs !== null ? (
                    <span className="text-mint font-bold">{res.reactionTimeMs} ms</span>
                  ) : (
                    <span className="text-slate-500">Timed out</span>
                  )}
                  {res.scoreEarned > 0 && (
                    <span className="text-brand-300 font-bold">(+{res.scoreEarned})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
