'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GAME_CATALOGUE } from '@crowdparty/shared';
import { Users, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getGameVisual } from '../brand/GameArt';

export const FeaturedGames: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#0A0F1D]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/15 border border-cyan/30 text-cyan-light text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multiplayer Game Arcade</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Six Built-In Multiplayer Hits
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1.5">
              Switch smoothly between drawing, trivia, debates, word sprints, and superlatives — all in one room.
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

        {/* Games Grid (3 cols on desktop for 6 games) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAME_CATALOGUE.map((game, idx) => {
            const visual = getGameVisual(game.id);

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
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
                  <h3 className="text-xl font-black text-white group-hover:text-brand-300 transition-colors">
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
