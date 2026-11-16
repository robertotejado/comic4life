import React from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
} from 'lucide-react';
import { ComicElement } from '../types/comic';
import { Translations } from '../i18n/translations';

interface FormatBarProps {
  t: Translations;
  selectedElement: ComicElement | null;
  pageBgColor: string;
  onChangePageBg: (color: string) => void;
  onUpdateElement: (patch: Record<string, unknown>) => void;
}

export const FormatBar: React.FC<FormatBarProps> = ({
  t,
  selectedElement,
  pageBgColor,
  onChangePageBg,
  onUpdateElement,
}) => {
  const isPanel = selectedElement?.kind === 'panel';
  const isBalloon = selectedElement?.kind === 'balloon';
  const isLettering = selectedElement?.kind === 'lettering';

  const strokeEnabled = selectedElement ? selectedElement.strokeEnabled : false;
  const strokeWidth = selectedElement ? selectedElement.strokeWidth : 1;
  const strokeColor = selectedElement ? selectedElement.strokeColor : '#000000';

  const fillEnabled = isPanel
    ? selectedElement.fillEnabled
    : isBalloon
      ? selectedElement.fillEnabled
      : true;

  const fillColor = isPanel
    ? selectedElement.fillColor
    : isBalloon
      ? selectedElement.fillColor
      : isLettering
        ? selectedElement.fillTopColor
        : pageBgColor;

  const shadow = selectedElement ? selectedElement.shadow : false;
  const opacity = selectedElement ? selectedElement.opacity : 100;
  const cornerRadius =
    isPanel || isBalloon ? selectedElement.cornerRadius : 0;
  const padding = isPanel || isBalloon ? selectedElement.padding : 0;

  const hasText = isBalloon || isLettering;
  const isBold = hasText ? selectedElement.fontWeight === 'bold' : false;
  const isItalic = hasText ? selectedElement.italic : false;
  const isUnderline = hasText ? selectedElement.underline : false;
  const textAlign = hasText ? selectedElement.textAlign : 'center';

  return (
    <div className="no-print h-8 bg-[#dfe3e8] border-b border-slate-400/70 flex items-center gap-3 px-3 text-[11px] text-slate-800 overflow-x-auto shrink-0 select-none">
      {/* Stroke */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            disabled={!selectedElement}
            checked={strokeEnabled}
            onChange={(e) => onUpdateElement({ strokeEnabled: e.target.checked })}
            className="accent-blue-600"
          />
          <span>{t.stroke}</span>
        </label>
        <input
          type="number"
          min={0}
          max={24}
          disabled={!selectedElement}
          value={strokeWidth}
          onChange={(e) =>
            onUpdateElement({ strokeWidth: Math.max(0, Number(e.target.value)) })
          }
          className="w-11 h-5 px-1 bg-white border border-slate-400 rounded-xs text-right tabular-nums"
        />
        <span className="text-slate-600">pt</span>
        <input
          type="color"
          disabled={!selectedElement}
          value={strokeColor}
          onChange={(e) => onUpdateElement({ strokeColor: e.target.value })}
          className="w-6 h-5 p-0 border border-slate-400 rounded-xs bg-white cursor-pointer"
        />
      </div>

      <div className="h-4 w-px bg-slate-400/70 shrink-0" />

      {/* Fill */}
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
          {selectedElement && !isLettering && (
            <input
              type="checkbox"
              checked={fillEnabled}
              onChange={(e) => onUpdateElement({ fillEnabled: e.target.checked })}
              className="accent-blue-600"
            />
          )}
          <span>{selectedElement ? t.fill : t.pageFill}</span>
        </label>
        <input
          type="color"
          value={fillColor}
          onChange={(e) => {
            if (!selectedElement) {
              onChangePageBg(e.target.value);
            } else if (isLettering) {
              onUpdateElement({ fillTopColor: e.target.value });
            } else {
              onUpdateElement({ fillColor: e.target.value, fillEnabled: true });
            }
          }}
          className="w-7 h-5 p-0 border border-slate-400 rounded-xs bg-white cursor-pointer"
        />
      </div>

      {/* Shadow */}
      <label className="flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap">
        <input
          type="checkbox"
          disabled={!selectedElement}
          checked={shadow}
          onChange={(e) => onUpdateElement({ shadow: e.target.checked })}
          className="accent-blue-600"
        />
        <span>{t.shadow}</span>
      </label>

      <div className="h-4 w-px bg-slate-400/70 shrink-0" />

      {/* Corner Radius, Padding, Opacity */}
      <div className="flex items-center gap-2 shrink-0">
        <label className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-slate-600">{t.radius}</span>
          <input
            type="number"
            min={0}
            max={100}
            disabled={!isPanel && !isBalloon}
            value={cornerRadius}
            onChange={(e) =>
              onUpdateElement({ cornerRadius: Math.max(0, Number(e.target.value)) })
            }
            className="w-11 h-5 px-1 bg-white border border-slate-400 rounded-xs text-right tabular-nums"
          />
        </label>
        <label className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-slate-600">{t.pad}</span>
          <input
            type="number"
            min={0}
            max={40}
            disabled={!isPanel && !isBalloon}
            value={padding}
            onChange={(e) =>
              onUpdateElement({ padding: Math.max(0, Number(e.target.value)) })
            }
            className="w-11 h-5 px-1 bg-white border border-slate-400 rounded-xs text-right tabular-nums"
          />
        </label>
        <label className="flex items-center gap-1 whitespace-nowrap">
          <span className="text-slate-600">{t.opacity}</span>
          <input
            type="number"
            min={10}
            max={100}
            disabled={!selectedElement}
            value={opacity}
            onChange={(e) =>
              onUpdateElement({
                opacity: Math.min(100, Math.max(10, Number(e.target.value))),
              })
            }
            className="w-12 h-5 px-1 bg-white border border-slate-400 rounded-xs text-right tabular-nums"
          />
        </label>
      </div>

      <div className="h-4 w-px bg-slate-400/70 shrink-0" />

      {/* Bold / Italic / Underline */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          disabled={!hasText}
          onClick={() =>
            onUpdateElement({ fontWeight: isBold ? 'normal' : 'bold' })
          }
          className={`w-6 h-5 rounded-xs font-bold border ${
            isBold
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white text-slate-700 border-slate-400 hover:bg-slate-100'
          } disabled:opacity-40`}
        >
          B
        </button>
        <button
          type="button"
          disabled={!hasText}
          onClick={() => onUpdateElement({ italic: !isItalic })}
          className={`w-6 h-5 rounded-xs italic font-serif border ${
            isItalic
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white text-slate-700 border-slate-400 hover:bg-slate-100'
          } disabled:opacity-40`}
        >
          I
        </button>
        <button
          type="button"
          disabled={!hasText}
          onClick={() => onUpdateElement({ underline: !isUnderline })}
          className={`w-6 h-5 rounded-xs underline border ${
            isUnderline
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white text-slate-700 border-slate-400 hover:bg-slate-100'
          } disabled:opacity-40`}
        >
          U
        </button>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center gap-0.5 shrink-0">
        {(
          [
            ['left', AlignLeft],
            ['center', AlignCenter],
            ['right', AlignRight],
            ['justify', AlignJustify],
          ] as const
        ).map(([alignKey, Icon]) => (
          <button
            key={alignKey}
            type="button"
            disabled={!hasText}
            onClick={() => onUpdateElement({ textAlign: alignKey })}
            className={`w-6 h-5 flex items-center justify-center rounded-xs border ${
              textAlign === alignKey && hasText
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white text-slate-700 border-slate-400 hover:bg-slate-100'
            } disabled:opacity-40`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
};
