import React from 'react';
import { BalloonType } from '../types/comic';
import { Translations } from '../i18n/translations';

export type DockItemType = 'panel' | 'lettering' | BalloonType;

interface BottomDockProps {
  t: Translations;
  onInsertItem: (itemType: DockItemType) => void;
}

const DockButton: React.FC<{
  itemType: DockItemType;
  label: string;
  onInsert: (t: DockItemType) => void;
  children: React.ReactNode;
}> = ({ itemType, label, onInsert, children }) => {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-comic-dock', itemType);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => onInsert(itemType)}
      title={label}
      className="group relative flex items-center justify-center p-1 rounded hover:bg-white/80 hover:shadow-xs active:scale-95 transition-all cursor-grab active:cursor-grabbing shrink-0"
    >
      {children}
    </button>
  );
};

export const BottomDock: React.FC<BottomDockProps> = ({ t, onInsertItem }) => {
  return (
    <div className="no-print h-[74px] bg-gradient-to-b from-[#eef0f3] to-[#d6dae1] border-t border-slate-400/80 flex items-center justify-center px-4 gap-3 overflow-x-auto shrink-0 select-none shadow-inner">
      {/* Panel Frame */}
      <DockButton itemType="panel" label={t.panelFrame} onInsert={onInsertItem}>
        <svg width="32" height="44" viewBox="0 0 32 44" className="drop-shadow-xs">
          <rect
            x="4"
            y="4"
            width="24"
            height="36"
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth="2"
          />
        </svg>
      </DockButton>

      {/* Free Text Box */}
      <DockButton itemType="text" label={t.textBox} onInsert={onInsertItem}>
        <div className="w-8 h-10 bg-white/80 border border-dashed border-slate-500 rounded-xs flex flex-col items-center justify-center shadow-2xs">
          <span className="font-serif font-extrabold text-[17px] leading-none text-slate-800">
            T
          </span>
          <span className="text-[7px] font-bold uppercase text-slate-500 mt-0.5">
            TEXT
          </span>
        </div>
      </DockButton>

      {/* Caption & Lettering Stacked */}
      <div className="flex flex-col items-center justify-center gap-1 shrink-0">
        <DockButton itemType="caption" label={t.captionBox} onInsert={onInsertItem}>
          <div className="w-[74px] h-[22px] bg-white border-[1.5px] border-slate-900 rounded-[2px] flex items-center justify-center shadow-xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-900 italic">
              ABCDE...
            </span>
          </div>
        </DockButton>

        <DockButton itemType="lettering" label={t.comicLettering} onInsert={onInsertItem}>
          <svg width="96" height="28" viewBox="0 0 96 28" className="overflow-visible">
            <defs>
              <linearGradient id="dockLetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <text
              x="48"
              y="21"
              textAnchor="middle"
              fontFamily="Bangers, Impact, sans-serif"
              fontSize="21"
              letterSpacing="1"
              fill="url(#dockLetGrad)"
              stroke="#0f172a"
              strokeWidth="3"
              paintOrder="stroke fill"
              transform="skewY(-3)"
            >
              LETTERING
            </text>
          </svg>
        </DockButton>
      </div>

      {/* Speech / Whisper / Thought / Burst Grid */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 items-center">
        <DockButton itemType="speech" label={t.speechBalloon} onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <path
              d="M 24,3 C 36,3 44,8 44,14 C 44,20 36,24 24,24 C 21,24 19,24 17,23 L 10,28 L 13,22 C 7,20 4,17 4,14 C 4,8 12,3 24,3 Z"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
          </svg>
        </DockButton>

        <DockButton itemType="whisper" label="Whisper Balloon" onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <path
              d="M 24,3 C 36,3 44,8 44,14 C 44,20 36,24 24,24 C 21,24 19,24 17,23 L 10,28 L 13,22 C 7,20 4,17 4,14 C 4,8 12,3 24,3 Z"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.5"
              strokeDasharray="3 2.5"
            />
          </svg>
        </DockButton>

        <DockButton itemType="thought" label={t.thoughtBalloon} onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <path
              d="M 14,20 C 9,20 6,17 6,14 C 6,11 9,9 12,9 C 13,5 18,3 24,3 C 29,3 33,5 35,8 C 39,8 42,11 42,14 C 42,18 38,20 33,20 Z"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <circle cx="15" cy="24" r="2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.2" />
            <circle cx="10" cy="27" r="1.4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" />
          </svg>
        </DockButton>

        <DockButton itemType="burst" label="Shout Burst" onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <polygon
              points="24,2 28,8 36,4 35,11 44,12 37,17 43,23 34,22 33,28 26,23 20,28 18,22 9,24 13,18 5,14 13,10 10,4 19,8"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </DockButton>

        <DockButton itemType="rect-speech" label="Rounded Speech Balloon" onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <path
              d="M 9,4 H 39 Q 43,4 43,8 V 19 Q 43,23 39,23 H 18 L 11,28 L 13,23 H 9 Q 5,23 5,19 V 8 Q 5,4 9,4 Z"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
          </svg>
        </DockButton>

        <DockButton itemType="exclaim" label="Exclaim Burst" onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <polygon
              points="24,3 30,9 39,5 36,13 44,16 35,19 39,26 29,22 24,28 19,22 10,26 13,19 5,16 13,13 10,5 19,9"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </DockButton>

        <DockButton itemType="speech" label={t.speechBalloon} onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <ellipse
              cx="24"
              cy="14"
              rx="19"
              ry="10"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <polygon
              points="15,22 9,28 19,23"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.3"
            />
          </svg>
        </DockButton>

        <DockButton itemType="caption" label={t.captionBox} onInsert={onInsertItem}>
          <svg width="48" height="30" viewBox="0 0 48 30" className="drop-shadow-xs">
            <rect
              x="6"
              y="5"
              width="36"
              height="19"
              rx="2"
              fill="#fef9c3"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <line x1="12" y1="12" x2="36" y2="12" stroke="#475569" strokeWidth="1.5" />
            <line x1="12" y1="17" x2="29" y2="17" stroke="#475569" strokeWidth="1.5" />
          </svg>
        </DockButton>
      </div>

      {/* Add Speech with + badge */}
      <DockButton itemType="speech" label={t.speechBalloon} onInsert={onInsertItem}>
        <div className="relative">
          <svg width="44" height="36" viewBox="0 0 44 36">
            <path
              d="M 22,5 C 33,5 40,10 40,16 C 40,22 33,26 22,26 C 19,26 17,26 15,25 L 9,31 L 12,24 C 7,22 4,19 4,16 C 4,10 11,5 22,5 Z"
              fill="#ffffff"
              stroke="#334155"
              strokeWidth="1.6"
            />
          </svg>
          <span className="absolute bottom-0 left-0 w-4 h-4 rounded-full bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
            +
          </span>
        </div>
      </DockButton>
    </div>
  );
};
