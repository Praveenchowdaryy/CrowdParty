'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarPicker } from '../common/AvatarPicker';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { getLastUserProfile, saveSession, getSocket } from '@/lib/socket';
import {
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Users2,
  AlertCircle,
  Wifi,
  Radio,
  Gamepad2,
  Palette,
  Flame,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('cat');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const saved = getLastUserProfile();
    if (saved.nickname) setNickname(saved.nickname);
    if (saved.avatar) setAvatar(saved.avatar);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMessage('Please pick a nickname to enter');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'room:create',
      { nickname: nickname.trim(), avatar },
      (res) => {
        setLoading(false);
        if (res.success && res.roomCode && res.sessionToken) {
          saveSession(res.roomCode, res.sessionToken, nickname.trim(), avatar);
          router.push(`/room/${res.roomCode}`);
        } else {
          setErrorMessage(res.error || 'Failed to initialize room. Please retry.');
        }
      }
    );
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMessage('Please pick a nickname to enter');
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) {
      setErrorMessage('Enter the 6-character room code from your host');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      'room:join',
      { roomCode: cleanCode, nickname: nickname.trim(), avatar },
      (res) => {
        setLoading(false);
        if (res.success && res.roomCode && res.sessionToken) {
          saveSession(res.roomCode, res.sessionToken, nickname.trim(), avatar);
          router.push(`/room/${res.roomCode}`);
        } else {
          setErrorMessage(res.error || 'Room not found or game has concluded.');
        }
      }
    );
  };

  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-radial-mesh">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-600/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Vision & Pitch + Live Room Showcase */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              <span>SYNCHRONIZED ROOM ENGINE • BROWSER NATIVE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.06]">
              One Room. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-coral to-yellow">
                Endless Multiplayer Parties.
              </span>
            </h1>

            {/* Crisp Copy */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Gather friends, teammates, or coworkers into one room. Switch on the fly between sketch duels, lightning trivia, social dilemmas, and reflex shootouts — zero downloads, zero registration.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated/80 border border-border/80 shadow-sm hover:border-brand-500/40 transition-colors">
                <Wifi className="w-3.5 h-3.5 text-mint" />
                <span>Zero Installs</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated/80 border border-border/80 shadow-sm hover:border-cyan/40 transition-colors">
                <Users2 className="w-3.5 h-3.5 text-cyan" />
                <span>2 to 20 Players</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated/80 border border-border/80 shadow-sm hover:border-yellow/40 transition-colors">
                <Gamepad2 className="w-3.5 h-3.5 text-yellow" />
                <span>Switch Games in 1-Click</span>
              </div>
            </div>

            {/* Live Room Architecture Showcase (Visual Demonstration) */}
            <div className="pt-2 hidden sm:block">
              <div className="p-4 rounded-2xl bg-surface/60 border border-border/70 backdrop-blur-md max-w-lg mx-auto lg:mx-0 shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">Room Preview</span>
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-[10px] text-brand-300 font-mono font-bold">#ARCADE</span>
                  </div>
                  <span className="text-[11px] text-slate-400">4 Players Connected</span>
                </div>

                {/* Simulated live party participants */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 rounded-xl bg-surface-elevated/60 border border-brand-500/30 flex flex-col items-center gap-1.5">
                    <PlayerAvatar avatar="cat" size="sm" />
                    <span className="text-[10px] font-bold text-white truncate max-w-full">Maya (Host)</span>
                    <span className="text-[9px] text-brand-300 font-semibold">Drawing...</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-elevated/60 border border-border/60 flex flex-col items-center gap-1.5">
                    <PlayerAvatar avatar="fox" size="sm" />
                    <span className="text-[10px] font-bold text-white truncate max-w-full">Sam</span>
                    <span className="text-[9px] text-mint font-semibold">Guessed!</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-elevated/60 border border-border/60 flex flex-col items-center gap-1.5">
                    <PlayerAvatar avatar="bear" size="sm" />
                    <span className="text-[10px] font-bold text-white truncate max-w-full">Ravi</span>
                    <span className="text-[9px] text-yellow font-semibold">Voting...</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-elevated/60 border border-border/60 flex flex-col items-center gap-1.5">
                    <PlayerAvatar avatar="robot" size="sm" />
                    <span className="text-[10px] font-bold text-white truncate max-w-full">Bot Alex</span>
                    <span className="text-[9px] text-cyan font-semibold">Ready</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Room Entry Hub */}
          <div id="join" className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-glow-lg border border-border/90 relative">
              
              {/* Sliding Tab Segmented Control */}
              <div className="relative flex rounded-2xl bg-surface p-1.5 mb-6 border border-border/80">
                <button
                  type="button"
                  onClick={() => { setTab('create'); setErrorMessage(''); }}
                  className={`relative flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors duration-200 z-10 ${
                    tab === 'create' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'create' && (
                    <motion.div
                      layoutId="heroTabBg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-coral shadow-md"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Create Room
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setTab('join'); setErrorMessage(''); }}
                  className={`relative flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors duration-200 z-10 ${
                    tab === 'join' ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'join' && (
                    <motion.div
                      layoutId="heroTabBg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-coral shadow-md"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    Join Room
                  </span>
                </button>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 p-3 rounded-xl bg-coral/15 border border-coral/40 text-coral-light text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-coral" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={tab === 'create' ? handleCreate : handleJoin} className="space-y-4">
                
                {/* Nickname Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Your Nickname
                    </label>
                    <span className="text-[10px] text-slate-500">{nickname.length}/20</span>
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. CaptainAwesome"
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated/90 border border-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-semibold transition-all shadow-inner"
                    required
                  />
                </div>

                {/* Avatar Picker with Vector Characters */}
                <AvatarPicker selectedId={avatar} onSelect={setAvatar} />

                {/* Room code input (Only if Join tab) */}
                {tab === 'join' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      6-Letter Room Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. K9XZ8W"
                      className="w-full px-4 py-3 rounded-xl bg-surface-elevated/90 border border-border text-white placeholder-slate-500 uppercase tracking-widest text-center text-xl font-black focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all shadow-inner"
                      required
                    />
                  </motion.div>
                )}

                {/* Action Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3.5 px-6 rounded-xl text-sm font-black text-white bg-gradient-to-r from-brand-600 via-brand-500 to-coral hover:opacity-95 shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : tab === 'create' ? (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow" />
                      <span>Create Party Room</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Enter Party Room</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-[11px] text-slate-400">
                  {tab === 'create' 
                    ? 'Instant private room. You can invite friends with link or code.'
                    : 'Get the room code or link from the host to jump right in.'}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
