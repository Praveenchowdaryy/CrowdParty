'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GAME_CATALOGUE } from '@crowdparty/shared';
import { Users, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

// Custom rich SVG artwork banners for each game
const gameArtMap: Record<string, { banner: React.ReactNode; accentColor: string; badgeText: string; highlight: string }> = {
  draw_and_guess: {
    accentColor: 'from-purple-500/20 via-brand-500/10 to-transparent border-brand-500/40 text-brand-300',
    badgeText: 'Creative Duel',
    highlight: 'Real-time Canvas • Word Masking',
    banner: (
      <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-xl overflow-hidden">
        <rect width="200" height="100" fill="#13192B" />
        {/* Easel Canvas */}
        <rect x="50" y="15" width="100" height="60" rx="8" fill="#1E273D" stroke="#A78BFA" strokeWidth="1.5" />
        <path d="M70 55C80 35 100 65 120 40C125 35 130 45 135 42" stroke="#FF5E62" strokeWidth="4" strokeLinecap="round" />
        <circle cx="75" cy="35" r="5" fill="#F59E0B" />
        {/* Paint Brush */}
        <line x1="130" y1="20" x2="165" y2="70" stroke="#DDD6FE" strokeWidth="3" strokeLinecap="round" />
        <polygon points="125,15 132,18 128,24" fill="#06B6D4" />
        {/* Paint droplets */}
        <circle cx="60" cy="85" r="3" fill="#06B6D4" />
        <circle cx="95" cy="88" r="4" fill="#FF5E62" />
        <circle cx="140" cy="84" r="3" fill="#A78BFA" />
      </svg>
    ),
  },
  quiz_battle: {
    accentColor: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/40 text-cyan-light',
    badgeText: 'Knowledge Clash',
    highlight: 'Speed Multipliers • Category Packs',
    banner: (
      <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-xl overflow-hidden">
        <rect width="200" height="100" fill="#111B2C" />
        {/* Neural Question Node */}
        <circle cx="100" cy="50" r="32" fill="#16233B" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Lightning Bolt */}
        <path d="M104 28L88 52H102L96 72L116 46H102L104 28Z" fill="url(#quiz-bolt)" />
        {/* Option circles */}
        <circle cx="35" cy="50" r="14" fill="#1C2740" stroke="#06B6D4" strokeWidth="1.5" />
        <text x="35" y="55" fill="#67E8F9" fontSize="12" fontWeight="bold" textAnchor="middle">A</text>
        <circle cx="165" cy="50" r="14" fill="#1C2740" stroke="#A78BFA" strokeWidth="1.5" />
        <text x="165" y="55" fill="#DDD6FE" fontSize="12" fontWeight="bold" textAnchor="middle">B</text>
        <defs>
          <linearGradient id="quiz-bolt" x1="88" y1="28" x2="116" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  hot_takes: {
    accentColor: 'from-coral/20 via-yellow/10 to-transparent border-coral/40 text-coral-light',
    badgeText: 'Social Debates',
    highlight: 'Majority Prediction • Split Percentages',
    banner: (
      <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-xl overflow-hidden">
        <rect width="200" height="100" fill="#1C1420" />
        {/* Balance Scale Pillar */}
        <line x1="100" y1="20" x2="100" y2="75" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="36" x2="150" y2="28" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        {/* Left Pan (Hot) */}
        <path d="M40 54C40 60 50 64 60 64C70 64 80 60 80 54H40Z" fill="#FF5E62" />
        <path d="M60 40C62 44 65 47 65 50C65 54 62 56 60 56C58 56 55 54 55 50C55 47 58 44 60 40Z" fill="#F59E0B" />
        {/* Right Pan */}
        <path d="M130 46C130 52 140 56 150 56C160 56 170 52 170 46H130Z" fill="#A78BFA" />
      </svg>
    ),
  },
  reaction_arena: {
    accentColor: 'from-mint/20 via-cyan/10 to-transparent border-mint/40 text-mint',
    badgeText: 'Reflex Shootout',
    highlight: 'Millisecond Timing • False Start Penalty',
    banner: (
      <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-xl overflow-hidden">
        <rect width="200" height="100" fill="#0C1B1A" />
        {/* Radar Concentric Rings */}
        <circle cx="100" cy="50" r="38" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        <circle cx="100" cy="50" r="24" stroke="#10B981" strokeWidth="1.5" opacity="0.7" />
        <circle cx="100" cy="50" r="10" fill="#10B981" />
        {/* Crosshair sweep */}
        <line x1="100" y1="10" x2="100" y2="90" stroke="#10B981" strokeWidth="1" opacity="0.5" />
        <line x1="60" y1="50" x2="140" y2="50" stroke="#10B981" strokeWidth="1" opacity="0.5" />
        {/* Digital millisecond badge */}
        <rect x="74" y="66" width="52" height="18" rx="4" fill="#090D16" stroke="#10B981" strokeWidth="1" />
        <text x="100" y="79" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">184 ms</text>
      </svg>
    ),
  },
};

export const FeaturedGames: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#0A0F1D]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/15 border border-cyan/30 text-cyan-light text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Included Game Catalogue</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Four Built-In Multiplayer Games
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1.5">
              Switch smoothly between games with the same room — no room recreating or re-inviting.
            </p>
          </div>

          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-wider"
          >
            <span>Browse Full Rules & Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAME_CATALOGUE.map((game, idx) => {
            const visual = gameArtMap[game.id] || gameArtMap.draw_and_guess;

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-3xl p-5 border border-border/80 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Visual Illustrated Art Banner */}
                <div className="mb-4 relative">
                  {visual.banner}
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#090D16]/80 backdrop-blur-sm border ${visual.accentColor}`}>
                    {visual.badgeText}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-brand-300 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs font-bold text-coral-light/90 mt-0.5 mb-2">
                    {game.tagline}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {game.description}
                  </p>
                </div>

                {/* Footer Metadata & Rule Chip */}
                <div>
                  <div className="mb-3 py-1.5 px-2.5 rounded-xl bg-surface-elevated/70 border border-border/50 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mint shrink-0" />
                    <span className="truncate">{visual.highlight}</span>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{game.minPlayers}–{game.maxPlayers} players</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>~{game.durationMinutes}m</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
