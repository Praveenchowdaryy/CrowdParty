'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CATALOGUE } from '@crowdparty/shared';
import {
  Search,
  Users,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  Gamepad2,
  CheckCircle2,
} from 'lucide-react';

const gameVisuals: Record<string, { banner: React.ReactNode; accentBadge: string; highlights: string[] }> = {
  draw_and_guess: {
    accentBadge: 'bg-brand-500/15 border-brand-500/30 text-brand-300',
    highlights: ['Real-time canvas sync', 'Automatic word masking & hints', 'Speed-based guessing bonus'],
    banner: (
      <svg viewBox="0 0 200 90" fill="none" className="w-full h-24 rounded-2xl overflow-hidden">
        <rect width="200" height="90" fill="#13192B" />
        <rect x="45" y="12" width="110" height="58" rx="8" fill="#1E273D" stroke="#A78BFA" strokeWidth="1.5" />
        <path d="M65 52C75 32 95 62 115 38C120 32 125 42 130 38" stroke="#FF5E62" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="70" cy="32" r="4.5" fill="#F59E0B" />
        <line x1="125" y1="16" x2="158" y2="62" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="120,12 127,15 124,20" fill="#06B6D4" />
      </svg>
    ),
  },
  quiz_battle: {
    accentBadge: 'bg-cyan/15 border-cyan/30 text-cyan-light',
    highlights: ['Multi-category trivia questions', 'Decaying speed bonus multipliers', 'Instant round reveal explanations'],
    banner: (
      <svg viewBox="0 0 200 90" fill="none" className="w-full h-24 rounded-2xl overflow-hidden">
        <rect width="200" height="90" fill="#111B2C" />
        <circle cx="100" cy="45" r="30" fill="#16233B" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M103 24L88 48H102L96 68L116 42H102L103 24Z" fill="#F59E0B" />
        <circle cx="35" cy="45" r="13" fill="#1C2740" stroke="#06B6D4" strokeWidth="1.5" />
        <text x="35" y="50" fill="#67E8F9" fontSize="11" fontWeight="bold" textAnchor="middle">A</text>
        <circle cx="165" cy="45" r="13" fill="#1C2740" stroke="#A78BFA" strokeWidth="1.5" />
        <text x="165" y="50" fill="#DDD6FE" fontSize="11" fontWeight="bold" textAnchor="middle">B</text>
      </svg>
    ),
  },
  hot_takes: {
    accentBadge: 'bg-coral/15 border-coral/30 text-coral-light',
    highlights: ['Work-safe & spicy dilemmas', 'Majority prediction scoring mode', 'Live percentage crowd reveal'],
    banner: (
      <svg viewBox="0 0 200 90" fill="none" className="w-full h-24 rounded-2xl overflow-hidden">
        <rect width="200" height="90" fill="#1C1420" />
        <line x1="100" y1="18" x2="100" y2="70" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="32" x2="150" y2="26" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 48C40 54 50 58 60 58C70 58 80 54 80 48H40Z" fill="#FF5E62" />
        <path d="M130 42C130 48 140 52 150 52C160 52 170 48 170 42H130Z" fill="#A78BFA" />
      </svg>
    ),
  },
  reaction_arena: {
    accentBadge: 'bg-mint/15 border-mint/30 text-mint',
    highlights: ['Server-randomized signal delays', 'False-start disqualification penalty', 'Sub-millisecond reflex standings'],
    banner: (
      <svg viewBox="0 0 200 90" fill="none" className="w-full h-24 rounded-2xl overflow-hidden">
        <rect width="200" height="90" fill="#0C1B1A" />
        <circle cx="100" cy="45" r="34" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        <circle cx="100" cy="45" r="20" stroke="#10B981" strokeWidth="1.5" opacity="0.7" />
        <circle cx="100" cy="45" r="8" fill="#10B981" />
        <rect x="76" y="60" width="48" height="16" rx="4" fill="#090D16" stroke="#10B981" strokeWidth="1" />
        <text x="100" y="72" fill="#6EE7B7" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">184 ms</text>
      </svg>
    ),
  },
};

export default function GameLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'party', label: 'Creative Drawing' },
    { id: 'trivia', label: 'Fast Trivia' },
    { id: 'social', label: 'Debates & Dilemmas' },
    { id: 'arcade', label: 'Reflex Gauntlet' },
  ];

  const filteredGames = GAME_CATALOGUE.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || game.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Curated Multiplayer Arena</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Game Catalogue & Rules
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Explore the mechanics, player limits, and strategies for each built-in party game.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-border shadow-glow flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search game, mechanic, tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow'
                  : 'bg-surface-elevated text-slate-400 hover:text-white border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-border text-center space-y-2">
          <Filter className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No games matched your query</h3>
          <p className="text-xs text-slate-400">Try adjusting your search keywords or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredGames.map((game, idx) => {
            const visual = gameVisuals[game.id] || gameVisuals.draw_and_guess;

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 hover:border-brand-500/50 hover:shadow-glow transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Top Illustrated Banner */}
                  <div className="relative">
                    {visual.banner}
                    <span className={`absolute top-2.5 right-2.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-lg border backdrop-blur-md ${visual.accentBadge}`}>
                      {game.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-brand-300 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs font-bold text-coral-light mt-0.5">
                      {game.tagline}
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed mt-2.5">
                      {game.description}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-1.5 pt-2">
                    {visual.highlights.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-mint shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-surface-elevated text-slate-400 border border-border/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-slate-400 w-full sm:w-auto font-medium">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-500" />
                      {game.minPlayers}–{game.maxPlayers} players
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      ~{game.durationMinutes} min
                    </span>
                  </div>

                  <Link
                    href="/#join"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black text-xs shadow-glow transition-all active:scale-95"
                  >
                    <span>Play in Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
