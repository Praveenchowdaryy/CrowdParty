import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none select-none">
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        {/* Dynamic chromatic glow */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-brand-600 via-coral to-cyan rounded-2xl blur-md opacity-45 group-hover:opacity-85 transition-opacity duration-300" />
        
        {/* Custom CrowdParty Emblem: Interlocking Crowd & Party Crown */}
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300"
        >
          {/* Base Shield / Arcade Token */}
          <rect width="44" height="44" rx="12" fill="#0F1423" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          
          {/* Inner ambient background fill */}
          <rect x="2" y="2" width="40" height="40" rx="10" fill="url(#logo-bg)" />
          
          {/* Crown Base & Connected Crowd */}
          <path
            d="M10 32C10 26.5 14 24 18 24C20.5 24 22 25 22 25C22 25 23.5 24 26 24C30 24 34 26.5 34 32"
            stroke="url(#logo-crowd-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 3 Interlocking Party Characters / Crown Points */}
          {/* Left Player */}
          <circle cx="15" cy="18" r="3.5" fill="#06B6D4" />
          <path d="M12 28L15 21L18 28" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Right Player */}
          <circle cx="29" cy="18" r="3.5" fill="#FF5E62" />
          <path d="M26 28L29 21L32 28" stroke="#FF5E62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Center Crown Monarch Player */}
          <circle cx="22" cy="13" r="4" fill="url(#logo-center-grad)" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M18 27L22 17L26 27" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Spark Star above Center */}
          <polygon points="22,6 23.5,9.5 27,10 24,12 25,15.5 22,13.5 19,15.5 20,12 17,10 20.5,9.5" fill="#F59E0B" />

          <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#171F36" />
              <stop offset="1" stopColor="#0B0F1C" />
            </linearGradient>
            <linearGradient id="logo-crowd-grad" x1="10" y1="28" x2="34" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="0.5" stopColor="#A78BFA" />
              <stop offset="1" stopColor="#FF5E62" />
            </linearGradient>
            <linearGradient id="logo-center-grad" x1="18" y1="9" x2="26" y2="17" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DDD6FE" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-black tracking-tight ${textSizes[size]} text-white leading-none flex items-center`}>
          Crowd<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-coral to-yellow">Party</span>
          <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
            Play Together. Laugh Louder.
          </span>
        )}
      </div>
    </Link>
  );
};
