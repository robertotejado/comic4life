import React, { useEffect, useRef, useState } from 'react';
import { Disc, Sliders, X } from 'lucide-react';
import { Translations } from '../i18n/translations';

interface ColorWheelPickerProps {
  t: Translations;
  currentColor: string;
  currentOpacity: number;
  target: 'fill' | 'stroke' | 'text' | 'page';
  onChangeTarget: (target: 'fill' | 'stroke' | 'text' | 'page') => void;
  onApplyColor: (hex: string) => void;
  onChangeOpacity: (opacity: number) => void;
  onClose: () => void;
  bringFrontSignal?: number;
}

const SWATCHES = [
  '#000000', '#1e293b', '#475569', '#94a3b8', '#e2e8f0', '#ffffff',
  '#ef4444', '#f97316', '#f59e0b', '#fde047', '#fef9c3', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#f43f5e', '#78350f', '#7f1d1d', '#1e3a8a', '#14532d',
];

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16) || 0,
      parseInt(clean[1] + clean[1], 16) || 0,
      parseInt(clean[2] + clean[2], 16) || 0,
    ];
  }
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  t,
  currentColor,
  currentOpacity,
  target,
  onChangeTarget,
  onApplyColor,
  onChangeOpacity,
  onClose,
  bringFrontSignal,
}) => {
  const [mode, setMode] = useState<'wheel' | 'sliders'>('wheel');
  const [pos, setPos] = useState({ x: 160, y: 120 });
  const dragWindowRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!bringFrontSignal) return;
    setPos((prev) => ({
      x: Math.max(8, Math.min(prev.x, window.innerWidth - 256)),
      y: Math.max(36, Math.min(prev.y, window.innerHeight - 320)),
    }));
  }, [bringFrontSignal]);

  const [initR, initG, initB] = hexToRgb(currentColor);
  const [initH, initS, initV] = rgbToHsv(initR, initG, initB);
  const [hue, setHue] = useState(initH);
  const [sat, setSat] = useState(initS);
  const [val, setVal] = useState(initV);
  const [hexDraft, setHexDraft] = useState(currentColor);

  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const pickingWheelRef = useRef(false);

  useEffect(() => {
    const [r, g, b] = hexToRgb(currentColor);
    const [h, s, v] = rgbToHsv(r, g, b);
    setHue(h);
    setSat(s);
    setVal(v);
    setHexDraft(currentColor);
  }, [currentColor, target]);

  // Drag window support
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragWindowRef.current) {
        setPos({
          x: Math.max(0, dragWindowRef.current.ox + e.clientX - dragWindowRef.current.sx),
          y: Math.max(28, dragWindowRef.current.oy + e.clientY - dragWindowRef.current.sy),
        });
      }
    };
    const onUp = () => {
      dragWindowRef.current = null;
      pickingWheelRef.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // Draw HSV color wheel canvas
  useEffect(() => {
    if (mode !== 'wheel' || !wheelCanvasRef.current) return;
    const canvas = wheelCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const r = size / 2;
    const img = ctx.createImageData(size, size);
    const data = img.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - r;
        const dy = y - r;
        const dist = Math.hypot(dx, dy);
        const idx = (y * size + x) * 4;
        if (dist <= r) {
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          if (angle < 0) angle += 360;
          const s = Math.min(1, dist / r);
          const [rr, gg, bb] = hsvToRgb(angle, s, val);
          data[idx] = rr;
          data[idx + 1] = gg;
          data[idx + 2] = bb;
          data[idx + 3] = 255;
        } else {
          data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [mode, val]);

  const updateFromWheelEvent = (clientX: number, clientY: number) => {
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const r = rect.width / 2;
    const dx = clientX - rect.left - r;
    const dy = clientY - rect.top - r;
    const dist = Math.min(r, Math.hypot(dx, dy));
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    const nextSat = dist / r;
    setHue(angle);
    setSat(nextSat);
    const [rr, gg, bb] = hsvToRgb(angle, nextSat, val);
    const hex = rgbToHex(rr, gg, bb);
    setHexDraft(hex);
    onApplyColor(hex);
  };

  const [curR, curG, curB] = hsvToRgb(hue, sat, val);
  const activeHex = rgbToHex(curR, curG, curB);

  const wheelSize = 156;
  const wheelRadius = wheelSize / 2;
  const radAngle = (hue * Math.PI) / 180;
  const dotX = wheelRadius + Math.cos(radAngle) * sat * (wheelRadius - 2);
  const dotY = wheelRadius + Math.sin(radAngle) * sat * (wheelRadius - 2);

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="no-print fixed w-[238px] bg-[#eceef1] border border-slate-500 rounded shadow-2xl z-40 overflow-hidden text-[11px] text-slate-800 select-none"
    >
      {/* Draggable Title Bar */}
      <div
        onPointerDown={(e) => {
          dragWindowRef.current = {
            sx: e.clientX,
            sy: e.clientY,
            ox: pos.x,
            oy: pos.y,
          };
        }}
        className="h-7 bg-gradient-to-b from-[#f4f5f7] to-[#dadde2] border-b border-slate-400 px-2.5 flex items-center justify-between cursor-move"
      >
        <span className="font-semibold text-slate-800">{t.colors}</span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="p-0.5 rounded hover:bg-slate-300 text-slate-700"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Tabs & Target Selector */}
      <div className="p-2.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode('wheel')}
              title="Color Wheel"
              className={`p-1.5 rounded border ${
                mode === 'wheel'
                  ? 'bg-white border-blue-600 shadow-2xs text-blue-600'
                  : 'bg-[#dfe2e7] border-slate-400 text-slate-600'
              }`}
            >
              <Disc className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMode('sliders')}
              title="RGB Sliders & Swatches"
              className={`p-1.5 rounded border ${
                mode === 'sliders'
                  ? 'bg-white border-blue-600 shadow-2xs text-blue-600'
                  : 'bg-[#dfe2e7] border-slate-400 text-slate-600'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 flex-1 justify-end">
            <button
              type="button"
              onClick={() => onApplyColor(activeHex)}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs text-[10px] font-semibold shadow-2xs"
            >
              {t.setButton}
            </button>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-comic-color', activeHex);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="w-12 h-6 rounded-xs border border-slate-500 shadow-inner cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: activeHex }}
              title={`${activeHex} (Drag to element or page)`}
            />
          </div>
        </div>

        {/* Target selector (Fill / Stroke / Text / Page) */}
        <div className="grid grid-cols-4 gap-1 text-[10px]">
          {(
            [
              ['fill', t.colorTargetFill],
              ['stroke', t.colorTargetStroke],
              ['text', t.colorTargetText],
              ['page', t.colorTargetPage],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChangeTarget(key)}
              className={`py-1 rounded-xs border font-medium truncate px-0.5 ${
                target === key
                  ? 'bg-[#1d5ec4] text-white border-blue-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'wheel' ? (
          <div className="flex flex-col items-center space-y-2.5">
            {/* Color Wheel */}
            <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
              <canvas
                ref={wheelCanvasRef}
                width={wheelSize}
                height={wheelSize}
                onPointerDown={(e) => {
                  pickingWheelRef.current = true;
                  updateFromWheelEvent(e.clientX, e.clientY);
                }}
                onPointerMove={(e) => {
                  if (pickingWheelRef.current) {
                    updateFromWheelEvent(e.clientX, e.clientY);
                  }
                }}
                className="rounded-full cursor-crosshair shadow-inner block"
              />
              <div
                className="pointer-events-none absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 border border-white ring-1 ring-black rounded-full"
                style={{ left: `${dotX}px`, top: `${dotY}px` }}
              />
            </div>

            {/* Brightness Slider */}
            <div className="w-full space-y-0.5">
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>{t.brightness}</span>
                <span className="tabular-nums">{Math.round(val * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.01}
                value={val}
                onChange={(e) => {
                  const nextV = Number(e.target.value);
                  setVal(nextV);
                  const [rr, gg, bb] = hsvToRgb(hue, sat, nextV);
                  const hex = rgbToHex(rr, gg, bb);
                  setHexDraft(hex);
                  onApplyColor(hex);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* RGB Sliders */}
            {(
              [
                ['R', curR, (v: number) => rgbToHex(v, curG, curB)],
                ['G', curG, (v: number) => rgbToHex(curR, v, curB)],
                ['B', curB, (v: number) => rgbToHex(curR, curG, v)],
              ] as const
            ).map(([ch, chVal, makeHex]) => (
              <div key={ch} className="flex items-center gap-2">
                <span className="w-3 font-bold text-slate-600">{ch}</span>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={chVal}
                  onChange={(e) => {
                    const hex = makeHex(Number(e.target.value));
                    const [r, g, b] = hexToRgb(hex);
                    const [nh, ns, nv] = rgbToHsv(r, g, b);
                    setHue(nh);
                    setSat(ns);
                    setVal(nv);
                    setHexDraft(hex);
                    onApplyColor(hex);
                  }}
                  className="flex-1 accent-blue-600"
                />
                <span className="w-7 text-right tabular-nums text-[10px]">
                  {chVal}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Hex & Opacity */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-300">
          <label className="flex items-center gap-1">
            <span className="text-[10px] text-slate-600">Hex</span>
            <input
              type="text"
              value={hexDraft}
              onChange={(e) => {
                setHexDraft(e.target.value);
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                  const [r, g, b] = hexToRgb(e.target.value);
                  const [nh, ns, nv] = rgbToHsv(r, g, b);
                  setHue(nh);
                  setSat(ns);
                  setVal(nv);
                  onApplyColor(e.target.value);
                }
              }}
              className="w-16 h-6 bg-white border border-slate-400 rounded-xs px-1 font-mono text-[10px]"
            />
          </label>

          <label className="flex items-center gap-1">
            <span className="text-[10px] text-slate-600">{t.opacity}</span>
            <input
              type="number"
              min={10}
              max={100}
              value={currentOpacity}
              onChange={(e) =>
                onChangeOpacity(
                  Math.min(100, Math.max(10, Number(e.target.value) || 100))
                )
              }
              className="w-11 h-6 bg-white border border-slate-400 rounded-xs px-1 text-right tabular-nums text-[10px]"
            />
            <span className="text-[10px]">%</span>
          </label>
        </div>

        {/* Classic Comic Swatches */}
        <div className="grid grid-cols-8 gap-1 pt-1">
          {SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-comic-color', hex);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => {
                const [r, g, b] = hexToRgb(hex);
                const [nh, ns, nv] = rgbToHsv(r, g, b);
                setHue(nh);
                setSat(ns);
                setVal(nv);
                setHexDraft(hex);
                onApplyColor(hex);
              }}
              title={`${hex} (Click or drag to canvas)`}
              className="w-5 h-4 rounded-2xs border border-slate-400 hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
