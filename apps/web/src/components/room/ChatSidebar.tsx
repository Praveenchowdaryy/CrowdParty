'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EmojiReaction } from '@crowdparty/shared';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface ChatSidebarProps {
  messages: ChatMessage[];
  reactions: EmojiReaction[];
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
}

const QUICK_EMOJIS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🤯', label: 'Shock' },
  { emoji: '🥳', label: 'Party' },
  { emoji: '🏆', label: 'Trophy' },
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  reactions,
  onSendMessage,
  onSendReaction,
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl border border-border overflow-hidden relative shadow-lg">
      {/* Floating Reaction Particles Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {reactions.map((rc) => (
          <div
            key={rc.id}
            className="absolute bottom-20 text-3xl animate-reaction-float select-none drop-shadow-md"
            style={{
              left: `${15 + (Math.abs(parseInt(rc.id.slice(-4), 16)) % 70)}%`,
            }}
          >
            {rc.emoji}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-border/70 bg-surface/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Room Chat & Guesses
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-mint font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          <span>Synced</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-8">
            <Sparkles className="w-6 h-6 text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-400">No chat messages yet.</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Type greetings or enter guesses here!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'SYSTEM') {
              return (
                <div
                  key={msg.id}
                  className="p-2 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-200 text-[11px] font-semibold text-center leading-relaxed"
                >
                  {msg.text}
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-surface/50 transition-colors">
                <PlayerAvatar avatar={msg.avatar} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-white text-[11px]">
                      {msg.nickname}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 break-words leading-relaxed font-normal">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Tactile Arcade Quick Reactions Bar */}
      <div className="px-3 py-2 border-t border-border/40 bg-surface/60 flex items-center justify-between gap-1 overflow-x-auto">
        {QUICK_EMOJIS.map((item) => (
          <button
            key={item.emoji}
            type="button"
            onClick={() => onSendReaction(item.emoji)}
            className="w-8 h-8 rounded-xl bg-surface-elevated/90 border border-border/70 hover:border-brand-500/50 hover:bg-brand-500/20 hover:scale-115 active:scale-90 flex items-center justify-center text-sm select-none focus:outline-none transition-all cursor-pointer shrink-0 shadow-sm"
            title={`React with ${item.label}`}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border/60 bg-surface/95 flex gap-2">
        <input
          type="text"
          value={inputText}
          maxLength={150}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a guess or chat..."
          className="flex-1 px-3 py-2 rounded-xl bg-surface-elevated border border-border text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all font-medium"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all active:scale-95 cursor-pointer"
          title="Send"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
