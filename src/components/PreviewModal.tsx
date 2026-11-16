import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ComicDocument } from '../types/comic';
import { ComicElementView } from './ComicElementView';
import { Translations } from '../i18n/translations';

interface PreviewModalProps {
  t: Translations;
  isOpen: boolean;
  doc: ComicDocument;
  initialPageIndex: number;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  t,
  isOpen,
  doc,
  initialPageIndex,
  onClose,
}) => {
  const [pageIdx, setPageIdx] = useState(initialPageIndex);

  useEffect(() => {
    setPageIdx(initialPageIndex);
  }, [initialPageIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setPageIdx((i) => Math.min(doc.pages.length - 1, i + 1));
      }
      if (e.key === 'ArrowLeft') {
        setPageIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, doc.pages.length, onClose]);

  if (!isOpen) return null;

  const page = doc.pages[pageIdx] || doc.pages[0];
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight - 120 : 720;
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 160 : 680;
  const scale = Math.min(
    maxHeight / doc.pageHeight,
    maxWidth / doc.pageWidth,
    1
  );

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/92 flex flex-col items-center justify-between p-4 select-none">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm">{doc.title}</span>
          <span className="text-xs text-slate-400 tabular-nums">
            {t.pageOf
              .replace('{current}', String(pageIdx + 1))
              .replace('{total}', String(doc.pages.length))}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold flex items-center gap-1.5"
        >
          <X className="w-4 h-4" />
          <span>{t.exitReader}</span>
        </button>
      </div>

      {/* Page Stage */}
      <div className="flex items-center gap-6 my-auto">
        <button
          type="button"
          disabled={pageIdx === 0}
          onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white disabled:opacity-25 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          className="shadow-[0_20px_50px_rgba(0,0,0,0.75)] overflow-hidden"
          style={{
            width: `${doc.pageWidth * scale}px`,
            height: `${doc.pageHeight * scale}px`,
          }}
        >
          <div
            style={{
              width: `${doc.pageWidth}px`,
              height: `${doc.pageHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: page.backgroundColor,
              position: 'relative',
            }}
          >
            {page.elements
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => (
                <ComicElementView key={el.id} element={el} interactive={false} />
              ))}
          </div>
        </div>

        <button
          type="button"
          disabled={pageIdx >= doc.pages.length - 1}
          onClick={() => setPageIdx((i) => Math.min(doc.pages.length - 1, i + 1))}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white disabled:opacity-25 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="text-[11px] text-slate-400">
        {t.readerHint}
      </div>
    </div>
  );
};
