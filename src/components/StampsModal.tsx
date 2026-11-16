import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Translations } from '../i18n/translations';

export interface ComicStampDef {
  id: string;
  label: string;
  kind: 'burst' | 'thought' | 'lettering';
  text: string;
  fillTop: string;
  fillBottom: string;
  stroke: string;
  textColor?: string;
  fontFamily: string;
}

export const COMIC_STAMPS: ComicStampDef[] = [
  {
    id: 'stamp-ouch',
    label: 'OUCH!',
    kind: 'burst',
    text: 'OUCH!',
    fillTop: '#facc15',
    fillBottom: '#ea580c',
    stroke: '#991b1b',
    textColor: '#0284c7',
    fontFamily: 'Bangers',
  },
  {
    id: 'stamp-grrr',
    label: 'GRRRR!!',
    kind: 'burst',
    text: 'GRRRR!!',
    fillTop: '#ffffff',
    fillBottom: '#f8fafc',
    stroke: '#111827',
    textColor: '#111827',
    fontFamily: 'Permanent Marker',
  },
  {
    id: 'stamp-ding',
    label: 'DING! DING!',
    kind: 'thought',
    text: 'DING!\nDING!',
    fillTop: '#ffffff',
    fillBottom: '#f1f5f9',
    stroke: '#111827',
    textColor: '#111827',
    fontFamily: 'Comic Neue',
  },
  {
    id: 'stamp-boom',
    label: 'BOOM',
    kind: 'lettering',
    text: 'BOOM!',
    fillTop: '#fef08a',
    fillBottom: '#f97316',
    stroke: '#7c2d12',
    fontFamily: 'Bangers',
  },
  {
    id: 'stamp-omnom',
    label: 'Om-Nom',
    kind: 'lettering',
    text: 'OM-NOM',
    fillTop: '#a3e635',
    fillBottom: '#3f6212',
    stroke: '#14532d',
    fontFamily: 'Luckiest Guy',
  },
  {
    id: 'stamp-pow',
    label: 'POW!',
    kind: 'lettering',
    text: 'POW!',
    fillTop: '#fde047',
    fillBottom: '#dc2626',
    stroke: '#000000',
    fontFamily: 'Bangers',
  },
  {
    id: 'stamp-zap',
    label: 'ZAP!',
    kind: 'lettering',
    text: 'ZAP!',
    fillTop: '#67e8f9',
    fillBottom: '#2563eb',
    stroke: '#0f172a',
    fontFamily: 'Bungee',
  },
  {
    id: 'stamp-crash',
    label: 'CRASH!',
    kind: 'lettering',
    text: 'CRASH!',
    fillTop: '#f9a8d4',
    fillBottom: '#db2777',
    stroke: '#18181b',
    fontFamily: 'Bangers',
  },
];

interface StampsModalProps {
  t: Translations;
  isOpen: boolean;
  onClose: () => void;
  onInsertStamp: (stamp: ComicStampDef) => void;
  bringFrontSignal?: number;
}

export const StampsModal: React.FC<StampsModalProps> = ({
  t,
  isOpen,
  onClose,
  onInsertStamp,
  bringFrontSignal,
}) => {
  const [pos, setPos] = useState({ x: 520, y: 120 });
  const [selectedId, setSelectedId] = useState<string>(COMIC_STAMPS[0].id);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(
    null
  );

  useEffect(() => {
    if (!bringFrontSignal) return;
    setPos((prev) => ({
      x: Math.max(8, Math.min(prev.x, window.innerWidth - 344)),
      y: Math.max(36, Math.min(prev.y, window.innerHeight - 360)),
    }));
  }, [bringFrontSignal]);

  if (!isOpen) return null;

  const selectedStamp =
    COMIC_STAMPS.find((s) => s.id === selectedId) || COMIC_STAMPS[0];

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: Math.max(8, dragRef.current.ox + (ev.clientX - dragRef.current.sx)),
        y: Math.max(32, dragRef.current.oy + (ev.clientY - dragRef.current.sy)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="no-print fixed z-40 w-[330px] bg-[#f4f5f7] border border-slate-400 rounded shadow-2xl overflow-hidden text-[12px] text-slate-900 select-none"
    >
      {/* Draggable Header */}
      <div
        onPointerDown={onHeaderPointerDown}
        className="h-8 bg-[#eceef2] border-b border-slate-300 px-3 flex items-center justify-between cursor-move"
      >
        <span className="font-semibold text-slate-800">{t.stampsTitle}</span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="p-0.5 rounded hover:bg-slate-300 text-slate-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-Column Scrollable Grid */}
      <div className="bg-white h-[310px] overflow-y-auto p-3 grid grid-cols-2 gap-3">
        {COMIC_STAMPS.map((stamp) => {
          const active = stamp.id === selectedId;
          return (
            <button
              key={stamp.id}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-comic-stamp', stamp.id);
                e.dataTransfer.effectAllowed = 'copy';
                setSelectedId(stamp.id);
              }}
              onClick={() => setSelectedId(stamp.id)}
              onDoubleClick={() => onInsertStamp(stamp)}
              title={`${stamp.label} (Arrastra al lienzo o doble clic)`}
              className={`h-24 rounded border flex items-center justify-center p-2 transition-all cursor-grab active:cursor-grabbing ${
                active
                  ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-400'
                  : 'border-slate-200 hover:border-slate-400 bg-white'
              }`}
            >
              {stamp.kind === 'burst' ? (
                <div
                  className="px-3 py-2 border-2 font-extrabold text-[15px] shadow-xs"
                  style={{
                    background: `linear-gradient(180deg, ${stamp.fillTop}, ${stamp.fillBottom})`,
                    borderColor: stamp.stroke,
                    color: stamp.textColor || '#111827',
                    fontFamily: stamp.fontFamily,
                    clipPath:
                      'polygon(8% 12%, 25% 2%, 44% 14%, 64% 0%, 79% 16%, 98% 10%, 88% 38%, 100% 60%, 84% 76%, 92% 96%, 68% 84%, 50% 100%, 34% 84%, 10% 95%, 16% 70%, 0% 52%, 14% 34%)',
                  }}
                >
                  {stamp.text}
                </div>
              ) : stamp.kind === 'thought' ? (
                <div
                  className="px-3 py-2 rounded-full border-2 text-[11px] font-bold whitespace-pre-line text-center leading-tight shadow-xs"
                  style={{
                    backgroundColor: stamp.fillTop,
                    borderColor: stamp.stroke,
                    color: stamp.textColor,
                    fontFamily: stamp.fontFamily,
                  }}
                >
                  {stamp.text}
                </div>
              ) : (
                <span
                  className="text-[22px] font-black leading-none tracking-wide"
                  style={{
                    fontFamily: stamp.fontFamily,
                    background: `linear-gradient(180deg, ${stamp.fillTop}, ${stamp.fillBottom})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    WebkitTextStroke: `1px ${stamp.stroke}`,
                    filter: 'drop-shadow(1px 2px 0px rgba(0,0,0,0.45))',
                  }}
                >
                  {stamp.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Insert Button */}
      <div className="h-10 bg-[#eceef2] border-t border-slate-300 px-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onInsertStamp(selectedStamp)}
          className="h-7 px-4 bg-white hover:bg-blue-50 border border-slate-400 rounded-sm shadow-2xs font-medium text-slate-800"
        >
          {t.insertStampBtn}
        </button>
      </div>
    </div>
  );
};
