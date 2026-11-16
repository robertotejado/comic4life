import React from 'react';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  BookOpen,
  Download,
  Eye,
  FilePlus2,
  Info,
  Layers,
  Maximize2,
  Paintbrush,
  Palette,
  Printer,
  Redo2,
  Save,
  Sparkles,
  Type,
  Undo2,
  Wand2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Translations } from '../i18n/translations';

interface MainToolbarProps {
  t: Translations;
  onSave: () => void;
  saveFeedback: boolean;
  onPrint: () => void;
  onPreview: () => void;
  onStartComic: () => void;
  onNewPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  hasSelection: boolean;
  onCyclePageStyle: () => void;
  onTextLarger: () => void;
  onTextSmaller: () => void;
  canStepSize?: boolean;
  isPanelSelected: boolean;
  hasPanelImage?: boolean;
  instantAlphaActive: boolean;
  onToggleInstantAlpha: () => void;
  onExport: () => void;
  showInspector: boolean;
  onToggleInspector: () => void;
  showColors: boolean;
  onToggleColors: () => void;
  showFonts: boolean;
  onToggleFonts: () => void;
  showScript: boolean;
  onToggleScript: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const ToolbarBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}> = ({ icon, label, onClick, disabled, active }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    title={label}
    className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-colors min-w-[50px] shrink-0 whitespace-nowrap ${
      disabled
        ? 'opacity-40 cursor-not-allowed text-slate-400'
        : active
          ? 'bg-slate-600/80 text-white ring-1 ring-blue-400/70'
          : 'text-slate-200 hover:bg-white/10 active:bg-white/15'
    }`}
  >
    <div className="h-5 flex items-center justify-center">{icon}</div>
    <span className="text-[10px] leading-tight mt-0.5 tracking-tight whitespace-nowrap">
      {label}
    </span>
  </button>
);

export const MainToolbar: React.FC<MainToolbarProps> = ({
  t,
  onSave,
  saveFeedback,
  onPrint,
  onPreview,
  onStartComic,
  onNewPage,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onBringForward,
  onSendBackward,
  hasSelection,
  onCyclePageStyle,
  onTextLarger,
  onTextSmaller,
  canStepSize,
  isPanelSelected,
  hasPanelImage,
  instantAlphaActive,
  onToggleInstantAlpha,
  onExport,
  showInspector,
  onToggleInspector,
  showColors,
  onToggleColors,
  showFonts,
  onToggleFonts,
  showScript,
  onToggleScript,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="no-print h-[52px] bg-gradient-to-b from-[#2c3849] to-[#1e2734] border-b border-[#111720] flex items-center justify-between px-2 overflow-x-auto shrink-0 shadow-sm">
      <div className="flex items-center gap-0.5">
        <ToolbarBtn
          icon={<Save className={`w-4 h-4 ${saveFeedback ? 'text-emerald-400' : 'text-amber-400'}`} />}
          label={saveFeedback ? t.saved : t.save}
          onClick={onSave}
        />
        <ToolbarBtn
          icon={<Printer className="w-4 h-4 text-slate-200" />}
          label={t.print}
          onClick={onPrint}
        />
        <ToolbarBtn
          icon={<Eye className="w-4 h-4 text-sky-300" />}
          label={t.preview}
          onClick={onPreview}
        />

        <div className="h-7 w-px bg-white/10 mx-1 shrink-0" />

        <ToolbarBtn
          icon={<Undo2 className="w-4 h-4 text-slate-200" />}
          label={t.undo}
          disabled={!canUndo}
          onClick={onUndo}
        />
        <ToolbarBtn
          icon={<Redo2 className="w-4 h-4 text-slate-200" />}
          label={t.redo}
          disabled={!canRedo}
          onClick={onRedo}
        />

        <div className="h-7 w-px bg-white/10 mx-1 shrink-0" />

        <ToolbarBtn
          icon={<Sparkles className="w-4 h-4 text-amber-300" />}
          label={t.startComic}
          onClick={onStartComic}
        />
        <ToolbarBtn
          icon={<FilePlus2 className="w-4 h-4 text-slate-100" />}
          label={t.newPage}
          onClick={onNewPage}
        />

        <div className="h-7 w-px bg-white/10 mx-1 shrink-0" />

        <ToolbarBtn
          icon={<ZoomIn className="w-4 h-4 text-slate-200" />}
          label={t.zoomIn}
          onClick={onZoomIn}
        />
        <ToolbarBtn
          icon={<ZoomOut className="w-4 h-4 text-slate-200" />}
          label={t.zoomOut}
          onClick={onZoomOut}
        />
        <ToolbarBtn
          icon={<Maximize2 className="w-4 h-4 text-slate-200" />}
          label={t.fit}
          onClick={onZoomFit}
        />

        <div className="h-7 w-px bg-white/10 mx-1 shrink-0" />

        <ToolbarBtn
          icon={<ArrowUpToLine className="w-4 h-4 text-sky-300" />}
          label={t.front}
          disabled={!hasSelection}
          onClick={onBringForward}
        />
        <ToolbarBtn
          icon={<ArrowDownToLine className="w-4 h-4 text-slate-300" />}
          label={t.back}
          disabled={!hasSelection}
          onClick={onSendBackward}
        />

        <div className="h-7 w-px bg-white/10 mx-1 shrink-0" />

        <ToolbarBtn
          icon={<Paintbrush className="w-4 h-4 text-amber-300" />}
          label={t.style}
          onClick={onCyclePageStyle}
        />
        <ToolbarBtn
          icon={<span className="text-[13px] font-extrabold text-white">A+</span>}
          label={t.larger}
          disabled={canStepSize !== undefined ? !canStepSize : !hasSelection}
          onClick={onTextLarger}
        />
        <ToolbarBtn
          icon={<span className="text-[11px] font-bold text-slate-300">A-</span>}
          label={t.smaller}
          disabled={canStepSize !== undefined ? !canStepSize : !hasSelection}
          onClick={onTextSmaller}
        />

        <ToolbarBtn
          icon={<Wand2 className={`w-4 h-4 ${instantAlphaActive ? 'text-red-400' : 'text-rose-400'}`} />}
          label={t.instantAlpha}
          disabled={hasPanelImage !== undefined ? !hasPanelImage : !isPanelSelected}
          active={instantAlphaActive}
          onClick={onToggleInstantAlpha}
        />
      </div>

      <div className="flex items-center gap-0.5 pl-2">
        <ToolbarBtn
          icon={<BookOpen className="w-4 h-4 text-emerald-300" />}
          label={t.script}
          active={showScript}
          onClick={onToggleScript}
        />
        <ToolbarBtn
          icon={<Download className="w-4 h-4 text-amber-400" />}
          label={t.exportBtn}
          onClick={onExport}
        />
        <ToolbarBtn
          icon={<Info className="w-4 h-4 text-sky-400" />}
          label={t.inspector}
          active={showInspector}
          onClick={onToggleInspector}
        />
        <ToolbarBtn
          icon={<Palette className="w-4 h-4 text-pink-400" />}
          label={t.colors}
          active={showColors}
          onClick={onToggleColors}
        />
        <ToolbarBtn
          icon={<Type className="w-4 h-4 text-slate-100" />}
          label={t.fonts}
          active={showFonts}
          onClick={onToggleFonts}
        />
        <ToolbarBtn
          icon={<Layers className="w-4 h-4 text-slate-300" />}
          label={t.templates}
          onClick={onStartComic}
        />
      </div>
    </div>
  );
};
