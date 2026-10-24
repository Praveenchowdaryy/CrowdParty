import React from 'react';
import { AVATAR_OPTIONS } from '@crowdparty/shared';
import { PlayerAvatar } from './PlayerAvatar';

interface AvatarPickerProps {
  selectedId: string;
  onSelect: (avatarId: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Choose Your Avatar
        </label>
        <span className="text-[11px] text-brand-300 font-medium">
          {AVATAR_OPTIONS.find(a => a.id === selectedId)?.label || 'Character'}
        </span>
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
        {AVATAR_OPTIONS.map((av) => {
          const isSelected = selectedId === av.id;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelect(av.id)}
              title={av.label}
              className={`relative flex items-center justify-center p-1.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-brand-400 bg-brand-500/20 scale-110 shadow-glow ring-2 ring-brand-400/40 ring-offset-2 ring-offset-background'
                  : 'border-border/60 bg-surface-elevated/40 hover:border-brand-500/40 hover:scale-105 opacity-80 hover:opacity-100'
              }`}
            >
              <PlayerAvatar avatar={av.id} size="sm" />
              {isSelected && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-background flex items-center justify-center shadow">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
