import React from 'react';
import { Users, Sparkles, MessageSquare, Crown } from 'lucide-react';

export const LivePreview: React.FC = () => {
  return (
    <section className="py-16 bg-surface-elevated/20 border-y border-border/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/15 border border-coral/30 text-coral-light text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-coral" />
            <span>Interactive Atmosphere</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Designed for Real Social Connection
          </h2>
        </div>

        {/* Mock Live Room Container */}
        <div className="glass-panel max-w-4xl mx-auto rounded-3xl border border-border shadow-glow p-4 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
              <span className="font-bold text-white tracking-wide">ROOM: PARTY9</span>
              <span className="px-2 py-0.5 rounded bg-surface border border-border/60">5 Players Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                Draw & Guess • Round 2/5
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Left: Player Cards */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Leaderboard
              </span>
              {[
                { name: 'Alex', avatar: '🦊', score: 1450, isHost: true, rank: 1 },
                { name: 'Sarah', avatar: '🐱', score: 1280, isHost: false, rank: 2 },
                { name: 'DevDave', avatar: '🤖', score: 920, isHost: false, rank: 3 },
                { name: 'Elena', avatar: '🚀', score: 850, isHost: false, rank: 4 },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border/70 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.avatar}</span>
                    <span className="font-bold text-white">{p.name}</span>
                    {p.isHost && <Crown className="w-3.5 h-3.5 text-yellow" />}
                  </div>
                  <span className="font-mono font-bold text-brand-400">{p.score} pts</span>
                </div>
              ))}
            </div>

            {/* Middle: Canvas Mockup */}
            <div className="rounded-2xl bg-surface p-4 border border-border flex flex-col items-center justify-between min-h-[220px] relative overflow-hidden">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
                Word Hint: <span className="font-mono text-brand-300 tracking-widest font-black text-sm">R O _ K _ T</span>
              </div>

              {/* Mock drawing SVG */}
              <div className="w-36 h-36 flex items-center justify-center my-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 50 15 L 65 50 L 50 70 L 35 50 Z"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="50" cy="40" r="6" fill="#06B6D4" />
                  <path
                    d="M 35 50 L 20 65 L 35 68 Z"
                    fill="#FF5E62"
                  />
                  <path
                    d="M 65 50 L 80 65 L 65 68 Z"
                    fill="#FF5E62"
                  />
                  <path
                    d="M 45 70 Q 50 85 55 70"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="text-[10px] text-slate-500 font-medium">
                Alex is currently sketching...
              </div>
            </div>

            {/* Right: Live Chat / Guesses */}
            <div className="rounded-2xl bg-surface p-4 border border-border flex flex-col justify-between h-[220px]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-border/50 pb-2">
                <MessageSquare className="w-3.5 h-3.5 text-cyan" />
                <span>Live Chat</span>
              </div>

              <div className="space-y-2 overflow-hidden text-xs my-auto">
                <div className="text-slate-400">
                  <span className="font-bold text-slate-300">Elena:</span> Is it an airplane?
                </div>
                <div className="text-slate-400">
                  <span className="font-bold text-slate-300">DevDave:</span> Space shuttle?
                </div>
                <div className="p-1.5 rounded-lg bg-mint/15 text-mint border border-mint/30 font-semibold text-[11px]">
                  🎉 Sarah guessed the secret word! (+420 pts)
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-border/50 pt-2 text-center">
                Instant reaction emoji feedback
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
