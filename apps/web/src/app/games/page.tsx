'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GAME_CATALOGUE } from '@crowdparty/shared';
import {
  Search,
  Users,
  Clock,
  ArrowRight,
  Filter,
  Gamepad2,
  CheckCircle2,
} from 'lucide-react';
import { getGameVisual } from '@/components/brand/GameArt';

export default function GameLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'party', label: 'Party & Words' },
    { id: 'trivia', label: 'Fast Trivia' },
    { id: 'social', label: 'Debates & Superlatives' },
    { id: 'arcade', label: 'Reflex Shootout' },
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
          Explore mechanics, strategies, and player limits for each built-in multiplayer game.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game, idx) => {
            const visual = getGameVisual(game.id);

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="glass-panel p-5 sm:p-6 rounded-3xl border border-border/80 hover:border-brand-500/50 hover:shadow-glow transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Top Illustrated Banner */}
                  <div className="relative">
                    {visual.banner}
                    <span className={`absolute top-2.5 right-2.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-lg border backdrop-blur-md ${visual.badgeClass}`}>
                      {visual.badgeText}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-brand-300 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs font-bold text-coral-light mt-0.5">
                      {game.tagline}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                      {game.description}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="py-1 px-2.5 rounded-xl bg-surface-elevated border border-border/60 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mint shrink-0" />
                    <span className="truncate">{visual.highlight}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-elevated text-slate-400 border border-border/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {game.minPlayers}–{game.maxPlayers}p
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      ~{game.durationMinutes}m
                    </span>
                  </div>

                  <Link
                    href="/#join"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black text-xs shadow-glow transition-all active:scale-95"
                  >
                    <span>Play</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
