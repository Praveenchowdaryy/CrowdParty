import React from 'react';

export interface PlayerAvatarProps {
  avatar: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar = 'cat',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Custom vector artwork per avatar
  const renderAvatarGraphic = () => {
    switch (avatar) {
      case 'fox':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <path d="M24 6L33 16L30 32L24 40L18 32L15 16L24 6Z" fill="url(#fox-grad)" />
            <path d="M15 16L7 8L10 24L18 32L15 16Z" fill="#F97316" opacity="0.9" />
            <path d="M33 16L41 8L38 24L30 32L33 16Z" fill="#EA580C" opacity="0.9" />
            <polygon points="24,34 21,30 27,30" fill="#18181B" />
            <polygon points="19,23 23,24 20,26" fill="#FEE2E2" />
            <polygon points="29,23 25,24 28,26" fill="#FEE2E2" />
            <circle cx="20.5" cy="24.5" r="1.5" fill="#431407" />
            <circle cx="27.5" cy="24.5" r="1.5" fill="#431407" />
            <defs>
              <linearGradient id="fox-grad" x1="24" y1="6" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FB923C" />
                <stop offset="1" stopColor="#C2410C" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'bear':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <circle cx="12" cy="14" r="7" fill="#78350F" />
            <circle cx="36" cy="14" r="7" fill="#78350F" />
            <circle cx="12" cy="14" r="3.5" fill="#B45309" />
            <circle cx="36" cy="14" r="3.5" fill="#B45309" />
            <rect x="10" y="14" width="28" height="26" rx="13" fill="url(#bear-grad)" />
            <ellipse cx="24" cy="30" rx="9" ry="7" fill="#D97706" />
            <ellipse cx="24" cy="28" rx="4" ry="2.5" fill="#18181B" />
            <circle cx="18" cy="22" r="2" fill="#1C1917" />
            <circle cx="30" cy="22" r="2" fill="#1C1917" />
            <defs>
              <linearGradient id="bear-grad" x1="24" y1="14" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#92400E" />
                <stop offset="1" stopColor="#451A03" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'panda':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <circle cx="12" cy="14" r="6" fill="#18181B" />
            <circle cx="36" cy="14" r="6" fill="#18181B" />
            <rect x="10" y="13" width="28" height="27" rx="14" fill="#F8FAFC" />
            <ellipse cx="17" cy="24" rx="4.5" ry="3.5" transform="rotate(-15 17 24)" fill="#18181B" />
            <ellipse cx="31" cy="24" rx="4.5" ry="3.5" transform="rotate(15 31 24)" fill="#18181B" />
            <circle cx="17.5" cy="23.5" r="1.5" fill="#38BDF8" />
            <circle cx="30.5" cy="23.5" r="1.5" fill="#38BDF8" />
            <ellipse cx="24" cy="31" rx="3.5" ry="2" fill="#18181B" />
            <path d="M10 24C6 24 6 28 8 32M38 24C42 24 42 28 40 32" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'lion':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <circle cx="24" cy="24" r="17" fill="url(#mane-grad)" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
            <rect x="13" y="14" width="22" height="22" rx="10" fill="#FBBF24" />
            <polygon points="24,10 21,15 27,15" fill="#D97706" />
            <circle cx="19" cy="23" r="2" fill="#451A03" />
            <circle cx="29" cy="23" r="2" fill="#451A03" />
            <polygon points="24,28 21.5,25 26.5,25" fill="#78350F" />
            <defs>
              <linearGradient id="mane-grad" x1="7" y1="7" x2="41" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D97706" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'rabbit':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <path d="M15 20L12 4C14 3 19 8 18 20Z" fill="#F472B6" />
            <path d="M33 20L36 4C34 3 29 8 30 20Z" fill="#F472B6" />
            <rect x="11" y="16" width="26" height="24" rx="12" fill="url(#bunny-grad)" />
            <rect x="13" y="23" width="22" height="5" rx="2.5" fill="#EC4899" opacity="0.8" />
            <circle cx="18" cy="25.5" r="1.5" fill="#FFFFFF" />
            <circle cx="30" cy="25.5" r="1.5" fill="#FFFFFF" />
            <polygon points="24,33 22,30 26,30" fill="#DB2777" />
            <defs>
              <linearGradient id="bunny-grad" x1="24" y1="16" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDF2F8" />
                <stop offset="1" stopColor="#FCE7F3" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'robot':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <rect x="22" y="6" width="4" height="6" fill="#06B6D4" />
            <circle cx="24" cy="5" r="2.5" fill="#22D3EE" />
            <rect x="11" y="12" width="26" height="24" rx="6" fill="url(#bot-grad)" stroke="#0891B2" strokeWidth="1.5" />
            <rect x="15" y="18" width="18" height="7" rx="3" fill="#082F49" />
            <circle cx="19" cy="21.5" r="2" fill="#22D3EE" />
            <circle cx="29" cy="21.5" r="2" fill="#22D3EE" />
            <line x1="17" y1="30" x2="31" y2="30" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
            <rect x="7" y="19" width="4" height="9" rx="2" fill="#0E7490" />
            <rect x="37" y="19" width="4" height="9" rx="2" fill="#0E7490" />
            <defs>
              <linearGradient id="bot-grad" x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1E293B" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'alien':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <path d="M24 5C24 5 21 2 18 4C16 5 20 10 21 11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <circle cx="17" cy="4" r="2" fill="#34D399" />
            <path d="M12 20C12 11 36 11 36 20C36 32 28 41 24 41C20 41 12 32 12 20Z" fill="url(#alien-grad)" />
            <ellipse cx="18" cy="22" rx="4.5" ry="6.5" transform="rotate(25 18 22)" fill="#064E3B" />
            <ellipse cx="30" cy="22" rx="4.5" ry="6.5" transform="rotate(-25 30 22)" fill="#064E3B" />
            <circle cx="17.5" cy="20.5" r="1.5" fill="#A7F3D0" />
            <circle cx="30.5" cy="20.5" r="1.5" fill="#A7F3D0" />
            <ellipse cx="24" cy="33" rx="2" ry="1" fill="#064E3B" />
            <defs>
              <linearGradient id="alien-grad" x1="24" y1="12" x2="24" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'wizard':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <path d="M24 4L11 32L37 32L24 4Z" fill="url(#hat-grad)" />
            <ellipse cx="24" cy="32" rx="17" ry="4" fill="#4338CA" />
            <polygon points="24,14 26,18 30,19 27,22 28,26 24,24 20,26 21,22 18,19 22,18" fill="#FBBF24" />
            <circle cx="24" cy="33" r="7" fill="#FDE047" opacity="0.9" />
            <circle cx="21" cy="33" r="1.5" fill="#312E81" />
            <circle cx="27" cy="33" r="1.5" fill="#312E81" />
            <defs>
              <linearGradient id="hat-grad" x1="24" y1="4" x2="24" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#3730A3" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'rocket':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <path d="M24 4C28 10 32 18 32 28L16 28C16 18 20 10 24 4Z" fill="url(#rocket-grad)" />
            <circle cx="24" cy="18" r="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
            <polygon points="16,24 8,32 16,30" fill="#E11D48" />
            <polygon points="32,24 40,32 32,30" fill="#E11D48" />
            <polygon points="24,42 20,32 28,32" fill="#F97316" />
            <polygon points="24,38 22,32 26,32" fill="#FDE047" />
            <defs>
              <linearGradient id="rocket-grad" x1="24" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F43F5E" />
                <stop offset="1" stopColor="#BE123C" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'party':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <polygon points="24,6 30,18 42,24 30,30 24,42 18,30 6,24 18,18" fill="url(#star-grad)" />
            <circle cx="24" cy="24" r="6" fill="#FDF2F8" />
            <circle cx="24" cy="24" r="3.5" fill="#8B5CF6" />
            <defs>
              <linearGradient id="star-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="0.5" stopColor="#EC4899" />
                <stop offset="1" stopColor="#EAB308" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'ninja':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <circle cx="24" cy="24" r="17" fill="url(#ninja-grad)" />
            <rect x="11" y="19" width="26" height="8" rx="4" fill="#090D16" />
            <ellipse cx="18" cy="23" rx="3.5" ry="1.5" fill="#06B6D4" />
            <ellipse cx="30" cy="23" rx="3.5" ry="1.5" fill="#06B6D4" />
            <path d="M12 17L36 17" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="ninja-grad" x1="24" y1="7" x2="24" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="#27272A" />
                <stop offset="1" stopColor="#09090B" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'cat':
      default:
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1 drop-shadow-md">
            <polygon points="12,18 9,5 21,12" fill="#8B5CF6" />
            <polygon points="36,18 39,5 27,12" fill="#8B5CF6" />
            <polygon points="12,16 11,8 18,13" fill="#C4B5FD" />
            <polygon points="36,16 37,8 30,13" fill="#C4B5FD" />
            <rect x="11" y="11" width="26" height="26" rx="13" fill="url(#cat-grad)" />
            <rect x="14" y="18" width="20" height="7" rx="3.5" fill="#1E1B4B" />
            <circle cx="19" cy="21.5" r="2" fill="#38BDF8" />
            <circle cx="29" cy="21.5" r="2" fill="#38BDF8" />
            <polygon points="24,28 22,26 26,26" fill="#F472B6" />
            <line x1="8" y1="26" x2="14" y2="27" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="29" x2="14" y2="29" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="40" y1="26" x2="34" y2="27" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="40" y1="29" x2="34" y2="29" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="cat-grad" x1="24" y1="11" x2="24" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C3AED" />
                <stop offset="1" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
          </svg>
        );
    }
  };

  // Background aura colors per avatar
  const bgColors: Record<string, string> = {
    cat: 'from-violet-900/40 to-indigo-950/60 border-violet-500/30',
    fox: 'from-orange-900/40 to-amber-950/60 border-orange-500/30',
    bear: 'from-amber-900/40 to-stone-950/60 border-amber-600/30',
    panda: 'from-slate-800/40 to-zinc-950/60 border-cyan-500/30',
    lion: 'from-yellow-900/40 to-amber-950/60 border-yellow-500/30',
    rabbit: 'from-pink-900/40 to-rose-950/60 border-pink-500/30',
    robot: 'from-cyan-900/40 to-slate-950/60 border-cyan-500/30',
    alien: 'from-emerald-900/40 to-teal-950/60 border-emerald-500/30',
    wizard: 'from-indigo-900/40 to-violet-950/60 border-indigo-500/30',
    rocket: 'from-rose-900/40 to-red-950/60 border-rose-500/30',
    party: 'from-purple-900/40 to-fuchsia-950/60 border-purple-500/30',
    ninja: 'from-zinc-800/40 to-neutral-950/60 border-zinc-500/30',
  };

  const bgStyle = bgColors[avatar] || bgColors.cat;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-b ${bgStyle} border shadow-inner shrink-0 select-none ${currentSize} ${className}`}
    >
      {renderAvatarGraphic()}
    </div>
  );
};
