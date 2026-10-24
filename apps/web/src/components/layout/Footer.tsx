import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/50 bg-surface/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showTagline />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The all-in-one real-time multiplayer party games platform for remote teams, friends, and colleagues. No downloads, no sign-ups — just share one link and play instantly.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300 mb-3">Games</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/games" className="hover:text-white transition-colors">Draw & Guess</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">Quiz Battle</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">Hot Takes</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">Reaction Arena</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">Word Dash</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">Most Likely To</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/games" className="hover:text-white transition-colors">Browse Catalogue</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">Free & Open Multiplayer</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CrowdParty. Real-time party platform.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-coral fill-coral" /> for teams & friends everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
