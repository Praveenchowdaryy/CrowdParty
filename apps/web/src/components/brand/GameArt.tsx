import React from 'react';

export interface GameVisualInfo {
  badgeText: string;
  accentColor: string;
  badgeClass: string;
  highlight: string;
  banner: React.ReactNode;
}

export function getGameVisual(rawId: string): GameVisualInfo {
  const id = (rawId || '').toLowerCase().replace(/_/g, '-');

  switch (id) {
    case 'quiz-battle':
      return {
        badgeText: 'Knowledge Clash',
        accentColor: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/40 text-cyan-light',
        badgeClass: 'bg-cyan/15 border-cyan/40 text-cyan-light',
        highlight: 'Speed Multipliers • Category Trivia',
        banner: (
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-2xl overflow-hidden select-none">
            <rect width="200" height="100" fill="#0E1726" />
            {/* Glowing Aura */}
            <circle cx="100" cy="50" r="40" fill="#06B6D4" opacity="0.12" />
            
            {/* Illuminated Trivia Choices A, B, C, D */}
            <rect x="25" y="24" width="30" height="24" rx="8" fill="#172238" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="40" y="41" fill="#67E8F9" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">A</text>

            <rect x="25" y="54" width="30" height="24" rx="8" fill="#172238" stroke="#A78BFA" strokeWidth="1.5" />
            <text x="40" y="71" fill="#DDD6FE" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">B</text>

            <rect x="145" y="24" width="30" height="24" rx="8" fill="#172238" stroke="#FF5E62" strokeWidth="1.5" />
            <text x="160" y="41" fill="#FFA07A" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">C</text>

            <rect x="145" y="54" width="30" height="24" rx="8" fill="#172238" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="160" y="71" fill="#FDE047" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">D</text>

            {/* Central Quiz Buzzer & Electric Spark */}
            <circle cx="100" cy="50" r="24" fill="#162238" stroke="#06B6D4" strokeWidth="2" />
            <path d="M103 33L90 52H102L97 67L112 47H100L103 33Z" fill="url(#quiz-spark-grad)" />

            <defs>
              <linearGradient id="quiz-spark-grad" x1="90" y1="33" x2="112" y2="67" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        ),
      };

    case 'hot-takes':
      return {
        badgeText: 'Social Debates',
        accentColor: 'from-coral/20 via-yellow/10 to-transparent border-coral/40 text-coral-light',
        badgeClass: 'bg-coral/15 border-coral/40 text-coral-light',
        highlight: 'Majority Prediction • Split Percentages',
        banner: (
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-2xl overflow-hidden select-none">
            <rect width="200" height="100" fill="#1A1116" />
            <circle cx="100" cy="50" r="42" fill="#FF5E62" opacity="0.12" />

            {/* Scale Pillar */}
            <line x1="100" y1="16" x2="100" y2="76" stroke="#57221A" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="100" cy="18" r="4" fill="#F59E0B" />
            {/* Tilted Lever */}
            <line x1="45" y1="32" x2="155" y2="24" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />

            {/* Left Pan: Roaring Red Fire */}
            <path d="M36 50C36 58 48 64 60 64C72 64 84 58 84 50H36Z" fill="#FF5E62" />
            <path d="M60 34C63 38 67 42 67 46C67 52 63 54 60 54C57 54 53 52 53 46C53 42 57 38 60 34Z" fill="#F59E0B" />

            {/* Right Pan: Purple Cool Opinion */}
            <path d="M125 42C125 50 137 56 149 56C161 56 173 50 173 42H125Z" fill="#8B5CF6" />
            <circle cx="149" cy="36" r="4" fill="#A78BFA" />

            {/* VS Badge */}
            <rect x="88" y="72" width="24" height="16" rx="4" fill="#090D16" stroke="#FF5E62" strokeWidth="1" />
            <text x="100" y="84" fill="#FFA07A" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">VS</text>
          </svg>
        ),
      };

    case 'reaction-arena':
      return {
        badgeText: 'Reflex Shootout',
        accentColor: 'from-mint/20 via-cyan/10 to-transparent border-mint/40 text-mint',
        badgeClass: 'bg-mint/15 border-mint/40 text-mint',
        highlight: 'Millisecond Timing • False Start Penalty',
        banner: (
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-2xl overflow-hidden select-none">
            <rect width="200" height="100" fill="#091815" />
            {/* Concentric Radar Rings */}
            <circle cx="100" cy="50" r="40" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
            <circle cx="100" cy="50" r="26" stroke="#10B981" strokeWidth="1.5" opacity="0.6" />
            <circle cx="100" cy="50" r="12" fill="#10B981" />
            
            {/* Sweeping Crosshair */}
            <line x1="100" y1="8" x2="100" y2="92" stroke="#10B981" strokeWidth="1.5" opacity="0.4" />
            <line x1="58" y1="50" x2="142" y2="50" stroke="#10B981" strokeWidth="1.5" opacity="0.4" />

            {/* Digital Stopwatch Milliseconds Badge */}
            <rect x="70" y="66" width="60" height="20" rx="5" fill="#05120E" stroke="#10B981" strokeWidth="1.5" />
            <text x="100" y="80" fill="#6EE7B7" fontSize="11" fontFamily="monospace" fontWeight="900" textAnchor="middle">142 ms</text>
          </svg>
        ),
      };

    case 'word-dash':
      return {
        badgeText: 'Anagram Sprint',
        accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/40 text-emerald-300',
        badgeClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
        highlight: 'Scrambled Tiles • Rapid Word Solving',
        banner: (
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-2xl overflow-hidden select-none">
            <rect width="200" height="100" fill="#0B1C1A" />
            <circle cx="100" cy="50" r="38" fill="#10B981" opacity="0.12" />

            {/* 4 Floating Scrambled Letter Tiles */}
            <rect x="36" y="32" width="26" height="32" rx="6" fill="#163832" stroke="#34D399" strokeWidth="1.5" />
            <text x="49" y="54" fill="#A7F3D0" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="monospace">W</text>

            <rect x="68" y="24" width="26" height="32" rx="6" fill="#163832" stroke="#F59E0B" strokeWidth="1.5" transform="rotate(-8 81 40)" />
            <text x="81" y="46" fill="#FDE047" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="monospace">O</text>

            <rect x="104" y="34" width="26" height="32" rx="6" fill="#163832" stroke="#34D399" strokeWidth="1.5" transform="rotate(6 117 50)" />
            <text x="117" y="56" fill="#A7F3D0" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="monospace">R</text>

            <rect x="138" y="26" width="26" height="32" rx="6" fill="#163832" stroke="#34D399" strokeWidth="1.5" />
            <text x="151" y="48" fill="#A7F3D0" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="monospace">D</text>

            {/* Lightning Shuffle Arrow */}
            <path d="M75 76L100 68L125 76" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      };

    case 'most-likely-to':
      return {
        badgeText: 'Squad Superlatives',
        accentColor: 'from-pink-500/20 via-purple-500/10 to-transparent border-pink-500/40 text-pink-300',
        badgeClass: 'bg-pink-500/15 border-pink-500/40 text-pink-300',
        highlight: 'Anonymous Voting • Crown the Winner',
        banner: (
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-2xl overflow-hidden select-none">
            <rect width="200" height="100" fill="#1C0E1B" />
            <circle cx="100" cy="45" r="38" fill="#EC4899" opacity="0.15" />

            {/* Pedestal Stage */}
            <ellipse cx="100" cy="74" rx="45" ry="12" fill="#2E132D" stroke="#EC4899" strokeWidth="1.5" />

            {/* Golden Monarch Crown */}
            <path d="M78 62L70 38L86 48L100 30L114 48L130 38L122 62H78Z" fill="url(#crown-gold-grad)" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="70" cy="38" r="3.5" fill="#FF5E62" />
            <circle cx="100" cy="30" r="4" fill="#06B6D4" />
            <circle cx="130" cy="38" r="3.5" fill="#FF5E62" />
            <circle cx="100" cy="52" r="3.5" fill="#FDF2F8" />

            {/* Party sparkles */}
            <polygon points="45,30 48,36 54,37 49,42 51,48 45,44 39,48 41,42 36,37 42,36" fill="#FDE047" />
            <polygon points="155,32 157,36 161,37 158,40 159,44 155,42 151,44 152,40 149,37 153,36" fill="#FDE047" />

            <defs>
              <linearGradient id="crown-gold-grad" x1="70" y1="30" x2="130" y2="62" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        ),
      };

    case 'draw-and-guess':
    default:
      return {
        badgeText: 'Creative Duel',
        accentColor: 'from-purple-500/20 via-brand-500/10 to-transparent border-brand-500/40 text-brand-300',
        badgeClass: 'bg-brand-500/15 border-brand-500/40 text-brand-300',
        highlight: 'Real-time Canvas • Word Masking',
        banner: (
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-24 rounded-2xl overflow-hidden select-none">
            <rect width="200" height="100" fill="#13192B" />
            <circle cx="100" cy="50" r="38" fill="#8B5CF6" opacity="0.12" />

            {/* Easel Stand Legs */}
            <line x1="68" y1="20" x2="52" y2="88" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="132" y1="20" x2="148" y2="88" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="100" y1="12" x2="100" y2="88" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

            {/* Easel Canvas Board */}
            <rect x="52" y="16" width="96" height="58" rx="8" fill="#1E273D" stroke="#A78BFA" strokeWidth="1.5" />

            {/* Colorful Painted Curves */}
            <path d="M68 52C78 32 94 62 110 38C116 30 126 44 134 38" stroke="#FF5E62" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="74" cy="34" r="4.5" fill="#F59E0B" />

            {/* Paintbrush dipping in */}
            <line x1="128" y1="18" x2="158" y2="65" stroke="#DDD6FE" strokeWidth="3" strokeLinecap="round" />
            <polygon points="122,14 130,17 126,22" fill="#06B6D4" />

            {/* Droplets on palette tray */}
            <line x1="46" y1="74" x2="154" y2="74" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <circle cx="62" cy="74" r="3" fill="#06B6D4" />
            <circle cx="82" cy="74" r="3.5" fill="#FF5E62" />
            <circle cx="104" cy="74" r="3" fill="#F59E0B" />
            <circle cx="126" cy="74" r="3" fill="#10B981" />
          </svg>
        ),
      };
  }
}
