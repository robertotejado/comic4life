import React, { useState } from 'react';
import { Copy, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ComicDocument, ComicElement, StylePreset } from '../types/comic';
import { STYLE_PRESETS } from '../data/presets';
import { Translations } from '../i18n/translations';
import { ComicElementView } from './ComicElementView';

interface LeftSidebarProps {
  t: Translations;
  doc: ComicDocument;
  selectedPageId: string;
  selectedElement: ComicElement | null;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onMovePage: (pageId: string, dir: -1 | 1) => void;
  onReorderPage: (fromIndex: number, toIndex: number) => void;
  onDropLayoutOnPage: (layoutId: string, pageId: string) => void;
  onDropTemplateOnPage: (templateId: string, pageId: string) => void;
  onDropStyleOnPage: (styleId: string, pageId: string) => void;
  onDropColorOnPage: (hex: string, pageId: string) => void;
  onDropImageOnPage: (url: string, pageId: string) => void;
  onApplyStyle: (preset: StylePreset) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  t,
  doc,
  selectedPageId,
  selectedElement,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onReorderPage,
  onDropLayoutOnPage,
  onDropTemplateOnPage,
  onDropStyleOnPage,
  onDropColorOnPage,
  onDropImageOnPage,
  onApplyStyle,
}) => {
  const [dragOverPageIdx, setDragOverPageIdx] = useState<number | null>(null);
  const [draggingPageIdx, setDraggingPageIdx] = useState<number | null>(null);

  const thumbWidth = 86;
  const thumbScale = thumbWidth / doc.pageWidth;
  const thumbHeight = Math.round(doc.pageHeight * thumbScale);

  const handlePageThumbDrop = (
    e: React.DragEvent,
    targetPageId: string,
    targetIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPageIdx(null);
    setDraggingPageIdx(null);

    const srcPageIdx = e.dataTransfer.getData('application/x-comic-page-index');
    if (srcPageIdx !== '') {
      const from = Number(srcPageIdx);
      if (!Number.isNaN(from) && from !== targetIndex) {
        onReorderPage(from, targetIndex);
      }
      return;
    }

    const layoutId = e.dataTransfer.getData('application/x-comic-layout');
    if (layoutId) {
      onDropLayoutOnPage(layoutId, targetPageId);
      return;
    }

    const templateId = e.dataTransfer.getData('application/x-comic-template');
    if (templateId) {
      onDropTemplateOnPage(templateId, targetPageId);
      return;
    }

    const styleId = e.dataTransfer.getData('application/x-comic-style');
    if (styleId) {
      onDropStyleOnPage(styleId, targetPageId);
      return;
    }

    const colorHex = e.dataTransfer.getData('application/x-comic-color');
    if (colorHex) {
      onDropColorOnPage(colorHex, targetPageId);
      return;
    }

    const assetUrl = e.dataTransfer.getData('application/x-comic-asset');
    if (assetUrl) {
      onDropImageOnPage(assetUrl, targetPageId);
      return;
    }

    if (e.dataTransfer.files?.length) {
      const imgFile = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith('image/')
      );
      if (imgFile) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onDropImageOnPage(reader.result, targetPageId);
          }
        };
        reader.readAsDataURL(imgFile);
      }
    }
  };

  return (
    <aside className="no-print w-[132px] bg-[#e5e7eb] border-r border-slate-400/80 flex flex-col shrink-0 select-none">
      {/* PAGES Header */}
      <div className="h-6 bg-gradient-to-b from-[#f3f4f6] to-[#d5d8de] border-b border-slate-400/80 flex items-center justify-between px-2 shrink-0">
        <span className="text-[10px] font-bold tracking-wider text-slate-700">
          {t.pages}
        </span>
        <button
          type="button"
          onClick={onAddPage}
          title={t.newPage}
          className="p-0.5 rounded hover:bg-slate-300 text-slate-700"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pages Thumbnail List (Draggable to Reorder & Accepts Drops) */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 bg-[#d7dadf]">
        {doc.pages.map((page, index) => {
          const active = page.id === selectedPageId;
          const isDropTarget = dragOverPageIdx === index;
          const isDraggingSelf = draggingPageIdx === index;
          return (
            <div
              key={page.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-comic-page-index', String(index));
                e.dataTransfer.effectAllowed = 'copyMove';
                setDraggingPageIdx(index);
              }}
              onDragEnd={() => {
                setDraggingPageIdx(null);
                setDragOverPageIdx(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                if (dragOverPageIdx !== index) setDragOverPageIdx(index);
              }}
              onDragLeave={() => {
                if (dragOverPageIdx === index) setDragOverPageIdx(null);
              }}
              onDrop={(e) => handlePageThumbDrop(e, page.id, index)}
              onClick={() => onSelectPage(page.id)}
              className={`group flex flex-col items-center cursor-grab active:cursor-grabbing rounded p-0.5 transition-all ${
                isDropTarget ? 'ring-2 ring-sky-500 bg-sky-200/50 scale-[1.03]' : ''
              } ${isDraggingSelf ? 'opacity-50' : ''}`}
            >
              <div className="relative">
                <div
                  className={`relative overflow-hidden shadow-md transition-all ${
                    active
                      ? 'ring-2 ring-blue-600 shadow-blue-900/20'
                      : 'ring-1 ring-slate-500/60 hover:ring-slate-700'
                  }`}
                  style={{
                    width: `${thumbWidth}px`,
                    height: `${thumbHeight}px`,
                    backgroundColor: page.backgroundColor,
                  }}
                >
                  <div
                    style={{
                      width: `${doc.pageWidth}px`,
                      height: `${doc.pageHeight}px`,
                      transform: `scale(${thumbScale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                      position: 'relative',
                    }}
                  >
                    {page.elements.map((el) => (
                      <ComicElementView
                        key={el.id}
                        element={el}
                        interactive={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Hover quick actions */}
                <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5 bg-white/95 border border-slate-300 rounded shadow-sm p-0.5 z-10">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(page.id, -1);
                      }}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {index < doc.pages.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(page.id, 1);
                      }}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage(page.id);
                    }}
                    className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
                  >
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                  {doc.pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.id);
                      }}
                      className="p-0.5 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              <span
                className={`mt-1 text-[11px] tabular-nums ${
                  active
                    ? 'font-bold text-blue-700'
                    : 'font-medium text-slate-700'
                }`}
              >
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* STYLES Header */}
      <div className="h-6 bg-gradient-to-b from-[#f3f4f6] to-[#d5d8de] border-t border-b border-slate-400/80 flex items-center justify-center px-2 shrink-0">
        <span className="text-[10px] font-bold tracking-wider text-slate-700">
          {t.styles}
        </span>
      </div>

      {/* STYLES Grid (Click or Drag onto Element/Page) */}
      <div className="h-[156px] overflow-y-auto p-2 bg-[#dfe2e7] grid grid-cols-2 gap-1.5 content-start">
        {STYLE_PRESETS.map((preset) => {
          const matchesTarget =
            preset.target === 'page' ||
            (selectedElement && selectedElement.kind === preset.target);
          return (
            <button
              key={preset.id}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-comic-style', preset.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onApplyStyle(preset)}
              title={`${preset.name} (${preset.target})`}
              className={`h-11 rounded-xs border flex flex-col items-center justify-center p-1 transition-all shadow-xs cursor-grab active:cursor-grabbing ${
                matchesTarget
                  ? 'ring-1 ring-blue-500/70 hover:scale-[1.03]'
                  : 'opacity-85 hover:opacity-100'
              }`}
              style={{
                backgroundColor: preset.previewBg,
                borderColor: preset.previewBorder,
                borderWidth: '2px',
              }}
            >
              {preset.previewText ? (
                <span
                  className="text-[9px] font-extrabold leading-none truncate max-w-full"
                  style={{
                    color:
                      preset.target === 'lettering'
                        ? '#ffffff'
                        : preset.previewBorder,
                  }}
                >
                  {preset.previewText}
                </span>
              ) : (
                <span className="text-[8px] font-semibold uppercase tracking-tight text-slate-500 bg-white/80 px-1 rounded-xs">
                  {preset.target}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

