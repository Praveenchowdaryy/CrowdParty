'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  DrawAndGuessPublicState,
  DrawAndGuessPrivateState,
  DrawStroke,
  DrawPoint,
} from '@crowdparty/shared';
import {
  Palette,
  Eraser,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface DrawAndGuessViewProps {
  publicState: DrawAndGuessPublicState;
  privateState: DrawAndGuessPrivateState;
  myPlayerId: string;
  onSendAction: (type: string, payload: any) => void;
  onSendStroke: (stroke: DrawStroke) => void;
  onClearCanvas: () => void;
  onSendGuess?: (text: string) => void;
}

const PALETTE = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF5E62', // Coral Red
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber Yellow
  '#8B5CF6', // Electric Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#84CC16', // Lime
];

export const DrawAndGuessView: React.FC<DrawAndGuessViewProps> = ({
  publicState,
  privateState,
  myPlayerId,
  onSendAction,
  onSendStroke,
  onClearCanvas,
  onSendGuess,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [quickGuessInput, setQuickGuessInput] = useState('');

  // Keep track of active stroke ID and last point for real-time streaming
  const activeStrokeId = useRef<string>('');
  const lastPoint = useRef<DrawPoint | null>(null);
  const lastDrawnStrokeCount = useRef<number>(0);

  const isDrawer = privateState.isDrawer;

  // Draw a single stroke onto the canvas context
  const drawSingleStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawStroke, width: number, height: number) => {
    if (!stroke.points || stroke.points.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.isEraser ? '#0F1626' : stroke.color;
    ctx.lineWidth = stroke.isEraser ? stroke.size * 3 : stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const firstPt = stroke.points[0];
    ctx.moveTo(firstPt.x * width, firstPt.y * height);

    if (stroke.points.length === 1) {
      // Single dot tap
      ctx.lineTo(firstPt.x * width + 0.5, firstPt.y * height + 0.5);
    } else {
      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ctx.lineTo(pt.x * width, pt.y * height);
      }
    }
    ctx.stroke();
  }, []);

  // Full canvas redraw (only when canvas resizes or strokes array is reset/cleared)
  const fullRedraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0F1626';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const stroke of publicState.strokes) {
      drawSingleStroke(ctx, stroke, canvas.width, canvas.height);
    }
    lastDrawnStrokeCount.current = publicState.strokes.length;
  }, [publicState.strokes, drawSingleStroke]);

  // Fast incremental sync: If new strokes were appended, draw only the new ones!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentCount = publicState.strokes.length;
    const prevCount = lastDrawnStrokeCount.current;

    if (currentCount === 0) {
      // Canvas was cleared
      ctx.fillStyle = '#0F1626';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      lastDrawnStrokeCount.current = 0;
      return;
    }

    if (currentCount < prevCount) {
      // State reset or round changed, full redraw
      fullRedraw();
      return;
    }

    // Incrementally draw only new strokes
    for (let i = prevCount; i < currentCount; i++) {
      drawSingleStroke(ctx, publicState.strokes[i], canvas.width, canvas.height);
    }
    lastDrawnStrokeCount.current = currentCount;
  }, [publicState.strokes, drawSingleStroke, fullRedraw]);

  // Adjust canvas resolution to parent container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      fullRedraw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fullRedraw]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): DrawPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  // Start Drawing: initiates a stroke ID and streams immediately
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || publicState.phase !== 'PLAYING') return;
    
    // Prevent default scroll on touch devices
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const pt = getCanvasCoords(e);
    if (!pt) return;

    setIsDrawing(true);
    activeStrokeId.current = `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    lastPoint.current = pt;

    // Draw locally immediately
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = isEraser ? '#0F1626' : selectedColor;
        ctx.lineWidth = (isEraser ? brushSize * 3 : brushSize) * (window.devicePixelRatio || 1);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
        ctx.lineTo(pt.x * canvas.width + 0.1, pt.y * canvas.height + 0.1);
        ctx.stroke();
      }
    }

    // Emit initial dot immediately so teammates see touch start instantly
    const initialStroke: DrawStroke = {
      id: activeStrokeId.current,
      points: [pt],
      color: selectedColor,
      size: brushSize * (window.devicePixelRatio || 1),
      isEraser,
    };
    onSendStroke(initialStroke);
  };

  // Move Drawing: stream segments in real-time as finger/mouse moves
  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawer || publicState.phase !== 'PLAYING') return;

    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const pt = getCanvasCoords(e);
    if (!pt || !lastPoint.current) return;

    const prevPt = lastPoint.current;

    // Skip redundant points
    const dist = Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
    if (dist < 0.002) return;

    // Render locally immediately
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = isEraser ? '#0F1626' : selectedColor;
        ctx.lineWidth = (isEraser ? brushSize * 3 : brushSize) * (window.devicePixelRatio || 1);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(prevPt.x * canvas.width, prevPt.y * canvas.height);
        ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
        ctx.stroke();
      }
    }

    // Stream line segment to teammates in real time!
    const segmentStroke: DrawStroke = {
      id: activeStrokeId.current,
      points: [prevPt, pt],
      color: selectedColor,
      size: brushSize * (window.devicePixelRatio || 1),
      isEraser,
    };
    onSendStroke(segmentStroke);

    lastPoint.current = pt;
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPoint.current = null;
    activeStrokeId.current = '';
  };

  const handleQuickGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGuessInput.trim()) return;
    if (onSendGuess) {
      onSendGuess(quickGuessInput.trim());
    } else {
      onSendAction('guess', { guess: quickGuessInput.trim() });
    }
    setQuickGuessInput('');
  };

  return (
    <div className="space-y-3 select-none">
      {/* Drawer / Word Status Header */}
      <div className="glass-panel p-3.5 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-surface-elevated border border-border">
            <Palette className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
              {isDrawer ? '🎨 You are drawing!' : `👀 ${publicState.drawerNickname || 'Teammate'} is drawing`}
            </span>
            <div className="text-base sm:text-lg font-black text-white">
              {isDrawer ? (
                <span className="text-brand-300 tracking-wide">
                  WORD: {privateState.secretWord || 'Choosing word...'}
                </span>
              ) : (
                <span className="font-mono tracking-widest text-brand-400 text-lg">
                  {publicState.hintMask || '_ '.repeat(publicState.wordLength || 4)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Guesser Status Indicator */}
        {!isDrawer && (
          <div>
            {privateState.hasGuessed ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint/20 border border-mint/40 text-mint text-xs font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>You guessed correctly! 🎉</span>
              </div>
            ) : (
              <div className="text-xs text-yellow font-semibold flex items-center gap-1.5 bg-yellow/10 px-3 py-1.5 rounded-xl border border-yellow/20">
                <Sparkles className="w-3.5 h-3.5 text-yellow animate-pulse" />
                <span>Type guesses below!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Word Selection Modal for Drawer */}
      {isDrawer && publicState.isSelectingWord && privateState.wordChoices && (
        <div className="glass-panel p-6 rounded-3xl border border-brand-500/50 bg-surface/95 text-center space-y-4 shadow-glow animate-fadeIn">
          <Sparkles className="w-8 h-8 text-brand-400 mx-auto animate-pulse" />
          <h3 className="text-xl font-black text-white">Pick a Secret Word to Draw</h3>
          <p className="text-xs text-slate-300">
            Choose which word you want teammates to guess:
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {privateState.wordChoices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => onSendAction('choose_word', { word: choice })}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-glow transition-transform active:scale-95 cursor-pointer"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Synchronized Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden border border-border shadow-glow bg-[#0F1626] touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={drawMove}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={drawMove}
          onTouchEnd={endDrawing}
          onTouchCancel={endDrawing}
          style={{ touchAction: 'none' }}
          className={`w-full h-[360px] sm:h-[440px] block ${
            isDrawer && publicState.phase === 'PLAYING' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        />

        {/* Round Reveal Overlay */}
        {publicState.roundReveal && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 animate-fadeIn">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Round Complete
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-white">
              The secret word was <span className="text-brand-400 font-mono underline">{publicState.roundReveal.secretWord}</span>!
            </h4>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {Object.entries(publicState.roundReveal.scoresEarned).map(([pId, pts]) => (
                <span
                  key={pId}
                  className="px-3 py-1 rounded-full bg-surface-elevated text-mint border border-mint/30 text-xs font-bold"
                >
                  +{pts} pts
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* GUESSER QUICK-GUESS BAR: Always visible directly under canvas on mobile & desktop! */}
      {!isDrawer && publicState.phase === 'PLAYING' && !privateState.hasGuessed && (
        <form onSubmit={handleQuickGuessSubmit} className="glass-panel p-2 rounded-2xl border border-brand-500/40 flex gap-2 shadow-lg">
          <input
            type="text"
            value={quickGuessInput}
            onChange={(e) => setQuickGuessInput(e.target.value)}
            placeholder="Type your guess here (e.g. coffee, airplane)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
            autoComplete="off"
            autoCapitalize="none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-coral text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Guess</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Drawing Toolbar (Only active for Drawer) */}
      {isDrawer && publicState.phase === 'PLAYING' && (
        <div className="glass-panel p-3 rounded-2xl border border-border flex flex-wrap items-center justify-between gap-3">
          {/* Colors */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setSelectedColor(c); setIsEraser(false); }}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shrink-0 ${
                  selectedColor === c && !isEraser
                    ? 'scale-125 border-white shadow-glow'
                    : 'border-transparent hover:scale-110'
                }`}
                title={`Color ${c}`}
              />
            ))}
          </div>

          {/* Tools & Size */}
          <div className="flex items-center gap-2">
            {[2, 5, 10].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setBrushSize(sz)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  brushSize === sz && !isEraser
                    ? 'border-brand-500 bg-brand-500/20 text-brand-300 shadow-sm'
                    : 'border-border text-slate-400 hover:text-white'
                }`}
              >
                {sz === 2 ? 'Fine' : sz === 5 ? 'Medium' : 'Thick'}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isEraser
                  ? 'border-brand-500 bg-brand-500/30 text-white shadow-sm'
                  : 'border-border text-slate-400 hover:text-white'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClearCanvas}
              className="p-2 rounded-xl border border-border hover:border-coral/50 text-slate-400 hover:text-coral transition-colors cursor-pointer"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
