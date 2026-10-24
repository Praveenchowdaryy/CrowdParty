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
  HelpCircle,
} from 'lucide-react';

interface DrawAndGuessViewProps {
  publicState: DrawAndGuessPublicState;
  privateState: DrawAndGuessPrivateState;
  myPlayerId: string;
  onSendAction: (type: string, payload: any) => void;
  onSendStroke: (stroke: DrawStroke) => void;
  onClearCanvas: () => void;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokePoints = useRef<DrawPoint[]>([]);

  const isDrawer = privateState.isDrawer;

  // Redraw all strokes whenever state updates
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0F1626';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const stroke of publicState.strokes) {
      if (!stroke.points || stroke.points.length === 0) continue;

      ctx.beginPath();
      ctx.strokeStyle = stroke.isEraser ? '#0F1626' : stroke.color;
      ctx.lineWidth = stroke.isEraser ? stroke.size * 3 : stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const firstPt = stroke.points[0];
      ctx.moveTo(firstPt.x * canvas.width, firstPt.y * canvas.height);

      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
      }
      ctx.stroke();
    }
  }, [publicState.strokes]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Adjust canvas resolution to parent container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      redrawCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || publicState.phase !== 'PLAYING') return;
    const pt = getCanvasCoords(e);
    if (!pt) return;

    setIsDrawing(true);
    currentStrokePoints.current = [pt];

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
      }
    }
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawer || publicState.phase !== 'PLAYING') return;
    const pt = getCanvasCoords(e);
    if (!pt) return;

    currentStrokePoints.current.push(pt);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
        ctx.stroke();
      }
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokePoints.current.length > 0) {
      const stroke: DrawStroke = {
        id: `s_${Math.random().toString(36).substring(2, 8)}`,
        points: [...currentStrokePoints.current],
        color: selectedColor,
        size: brushSize * (window.devicePixelRatio || 1),
        isEraser,
      };

      onSendStroke(stroke);
      currentStrokePoints.current = [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Drawer / Word Status Header */}
      <div className="glass-panel p-4 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-brand-400" />
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {isDrawer ? 'You are drawing!' : `${publicState.drawerNickname} is drawing`}
            </span>
            <div className="text-lg font-black text-white">
              {isDrawer ? (
                <span className="text-brand-300">
                  WORD: {privateState.secretWord || 'Choosing word...'}
                </span>
              ) : (
                <span className="font-mono tracking-widest text-brand-400">
                  {publicState.hintMask || '_ '.repeat(publicState.wordLength || 4)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Guesser Status Banner */}
        {!isDrawer && (
          <div>
            {privateState.hasGuessed ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint/20 border border-mint/40 text-mint text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>You guessed correctly!</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-yellow" />
                <span>Type guesses in the chat box</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Word Selection Overlay for Drawer */}
      {isDrawer && publicState.isSelectingWord && privateState.wordChoices && (
        <div className="glass-panel p-6 rounded-3xl border border-brand-500/50 bg-surface/95 text-center space-y-4 shadow-glow">
          <Sparkles className="w-8 h-8 text-brand-400 mx-auto animate-pulse" />
          <h3 className="text-xl font-black text-white">Pick a Secret Word to Draw</h3>
          <p className="text-xs text-slate-300">
            Choose which word you want other players to guess:
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {privateState.wordChoices.map((choice) => (
              <button
                key={choice}
                onClick={() => onSendAction('choose_word', { word: choice })}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-glow transition-transform active:scale-95"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border border-border shadow-glow bg-[#0F1626]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={drawMove}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={drawMove}
          onTouchEnd={endDrawing}
          style={{ touchAction: 'none' }}
          className={`w-full h-[360px] sm:h-[460px] block ${
            isDrawer && publicState.phase === 'PLAYING' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        />

        {/* Round Reveal Overlay */}
        {publicState.roundReveal && (
          <div className="absolute inset-0 bg-background/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Round Complete
            </span>
            <h4 className="text-3xl font-black text-white">
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
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  selectedColor === c && !isEraser
                    ? 'scale-125 border-white shadow'
                    : 'border-transparent hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Tools & Size */}
          <div className="flex items-center gap-2">
            {/* Brush sizes */}
            {[2, 5, 10].map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`p-1.5 rounded-lg border text-xs font-bold ${
                  brushSize === sz && !isEraser
                    ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                    : 'border-border text-slate-400 hover:text-white'
                }`}
              >
                {sz === 2 ? 'Thin' : sz === 5 ? 'Med' : 'Thick'}
              </button>
            ))}

            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-xl border transition-colors ${
                isEraser
                  ? 'border-brand-500 bg-brand-500/30 text-white'
                  : 'border-border text-slate-400 hover:text-white'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <button
              onClick={onClearCanvas}
              className="p-2 rounded-xl border border-border hover:border-coral/50 text-slate-400 hover:text-coral transition-colors"
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
