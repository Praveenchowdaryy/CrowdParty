import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { Gamepad2, Compass, Play, Sparkles } from 'lucide-react';

interface NavbarProps {
  onCreateRoomClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateRoomClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-[#090D16]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        {/* Brand */}
        <Logo size="md" />

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-surface/80 border border-border/80 shadow-inner">
          <Link
            href="/games"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-surface-elevated transition-all"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-brand-400" />
            <span>Game Library</span>
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-surface-elevated transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-cyan" />
            <span>How It Works</span>
          </a>
        </nav>

        {/* Right Action & Engine Status */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/70 border border-border/60 text-[11px] font-semibold text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
            </span>
            <span>Instant Sync</span>
          </div>

          {onCreateRoomClick ? (
            <button
              onClick={onCreateRoomClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-glow transition-all duration-200 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Room</span>
            </button>
          ) : (
            <Link
              href="/#join"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 via-brand-500 to-coral hover:opacity-95 shadow-glow transition-all duration-200 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Now</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
