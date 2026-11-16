import React, { useEffect, useState } from 'react';
import { FileJson, Printer, X } from 'lucide-react';
import { ComicDocument, ComicPage } from '../types/comic';
import { triggerDownload } from '../utils/canvasExport';
import {
  exportPagesToCbz,
  exportPagesToEpub,
  exportPagesToImages,
  exportPagesToPdf,
} from '../utils/exporters';
import { Translations } from '../i18n/translations';
import { ComicElementView } from './ComicElementView';

export type ExportMode = 'pdf' | 'images' | 'epub' | 'cbz';

interface ExportModalProps {
  t: Translations;
  isOpen: boolean;
  initialTab?: ExportMode;
  doc: ComicDocument;
  activePageIndex: number;
  onClose: () => void;
  onPrint: () => void;
}

const DPI_OPTIONS = [
  { label: '72 dpi', dpi: 72, scale: 1 },
  { label: '150 dpi', dpi: 150, scale: 1.5 },
  { label: '300 dpi', dpi: 300, scale: 2.5 },
  { label: '600 dpi', dpi: 600, scale: 3.5 },
];

const DocumentBadgeIcon: React.FC<{ label: string; color: string }> = ({
  label,
  color,
}) => (
  <div className="relative w-9 h-10 bg-white border border-slate-400 rounded-[2px] shadow-xs flex flex-col justify-between overflow-hidden select-none">
    <div className="flex justify-end">
      <div className="w-2.5 h-2.5 bg-slate-200 border-b border-l border-slate-400" />
    </div>
    <div
      className="mx-0.5 mb-1.5 py-0.5 text-center text-[8px] font-extrabold tracking-tight text-white rounded-[1px]"
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  </div>
);

const PageMiniPreview: React.FC<{
  doc: ComicDocument;
  page?: ComicPage;
  pageNum: number;
}> = ({ doc, page, pageNum }) => {
  const frameW = 84;
  const frameH = 104;
  const innerMaxW = frameW - 14;
  const innerMaxH = frameH - 8;
  const scale = Math.min(innerMaxW / doc.pageWidth, innerMaxH / doc.pageHeight);
  const scaledW = Math.round(doc.pageWidth * scale);
  const scaledH = Math.round(doc.pageHeight * scale);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="bg-[#e3e4e8] border border-slate-400 shadow-inner flex items-center justify-center overflow-hidden"
        style={{ width: frameW, height: frameH }}
      >
        {page ? (
          <div
            className="relative bg-white shadow-xs overflow-hidden border border-slate-300"
            style={{
              width: scaledW,
              height: scaledH,
              backgroundColor: page.backgroundColor || '#ffffff',
            }}
          >
            <div
              className="origin-top-left pointer-events-none"
              style={{
                width: doc.pageWidth,
                height: doc.pageHeight,
                transform: `scale(${scale})`,
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
        ) : (
          <div className="w-12 h-16 bg-white border border-slate-300" />
        )}
      </div>
      <span className="text-[10px] text-slate-500 tabular-nums">
        {pageNum}
      </span>
    </div>
  );
};

export const ExportModal: React.FC<ExportModalProps> = ({
  t,
  isOpen,
  initialTab = 'pdf',
  doc,
  activePageIndex,
  onClose,
  onPrint,
}) => {
  const totalPages = Math.max(1, doc.pages.length);
  const cleanTitle = doc.title.replace(/\.comic4life$/i, '') || 'comic';

  const [mode, setMode] = useState<ExportMode>(initialTab);
  const [dpi, setDpi] = useState<number>(300);
  const [scope, setScope] = useState<'all' | 'range'>('all');
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(totalPages);
  const [imageFormat, setImageFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [bookTitle, setBookTitle] = useState<string>(cleanTitle);
  const [author, setAuthor] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialTab);
      setBookTitle(doc.title.replace(/\.comic4life$/i, '') || 'comic');
      setFromPage((prev) => Math.min(Math.max(1, prev), totalPages));
      setToPage(totalPages);
      setProgress(0);
      setErrorMsg(null);
    }
  }, [isOpen, initialTab, totalPages, doc.title]);

  if (!isOpen) return null;

  const selectedDpi = DPI_OPTIONS.find((d) => d.dpi === dpi) || DPI_OPTIONS[2];
  const baseName = cleanTitle;

  const effectiveStart = scope === 'all' ? 1 : Math.min(Math.max(1, fromPage), totalPages);
  const effectiveEnd =
    scope === 'all'
      ? totalPages
      : Math.min(Math.max(effectiveStart, toPage), totalPages);

  const startPageObj = doc.pages[effectiveStart - 1] || doc.pages[activePageIndex];
  const endPageObj = doc.pages[effectiveEnd - 1] || doc.pages[effectiveStart - 1];

  const handleFromChange = (val: number) => {
    const clamped = Math.min(Math.max(1, Number.isFinite(val) ? val : 1), totalPages);
    setScope('range');
    setFromPage(clamped);
    if (toPage < clamped) {
      setToPage(clamped);
    }
  };

  const handleToChange = (val: number) => {
    const clamped = Math.min(Math.max(1, Number.isFinite(val) ? val : 1), totalPages);
    setScope('range');
    setToPage(clamped);
    if (fromPage > clamped) {
      setFromPage(clamped);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);
    setErrorMsg(null);
    try {
      const targetPages = doc.pages.slice(effectiveStart - 1, effectiveEnd);
      if (!targetPages.length) return;

      const qualityDecimal = Math.min(1, Math.max(0.4, jpegQuality / 100));
      const metaTitle = bookTitle.trim() || baseName;
      const metaAuthor = author.trim();

      if (mode === 'pdf') {
        await exportPagesToPdf(
          doc,
          targetPages,
          selectedDpi.scale,
          baseName,
          setProgress
        );
      } else if (mode === 'images') {
        await exportPagesToImages(
          doc,
          targetPages,
          effectiveStart,
          selectedDpi.scale,
          imageFormat,
          qualityDecimal,
          baseName,
          setProgress
        );
      } else if (mode === 'epub') {
        await exportPagesToEpub(
          doc,
          targetPages,
          selectedDpi.scale,
          metaTitle,
          metaAuthor,
          baseName,
          setProgress
        );
      } else if (mode === 'cbz') {
        await exportPagesToCbz(
          doc,
          targetPages,
          selectedDpi.scale,
          imageFormat,
          qualityDecimal,
          metaTitle,
          metaAuthor,
          baseName,
          setProgress
        );
      }

      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${baseName}.comic4life`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onClose();
  };

  const modeTitleMap: Record<ExportMode, string> = {
    pdf: t.exportToPdfTitle,
    images: t.exportToImagesTitle,
    epub: t.exportToEpubTitle,
    cbz: t.exportToCbzTitle,
  };

  const tabs: Array<{ id: ExportMode; label: string; badge: string; color: string }> = [
    { id: 'pdf', label: t.exportTabPdf, badge: 'PDF', color: '#4a90d9' },
    { id: 'images', label: t.exportTabImages, badge: 'JPEG', color: '#d44842' },
    { id: 'epub', label: t.exportTabEpub, badge: 'ePub', color: '#9a8458' },
    { id: 'cbz', label: t.exportTabCbz, badge: 'CBZ', color: '#58a846' },
  ];

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
      <div className="w-full max-w-[540px] bg-[#f4f4f5] border border-slate-500 rounded-md shadow-2xl overflow-hidden text-[12px] text-slate-900 select-none">
        {/* Window Title Bar */}
        <div className="h-8 bg-white border-b border-slate-200 px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-gradient-to-br from-amber-400 to-red-600 text-white text-[8px] font-black shadow-xs">
              C4L
            </span>
            <span className="font-medium text-slate-800">{t.exportComicTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={exporting}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded disabled:opacity-40"
            aria-label={t.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Comic Life Export Tabs */}
        <div className="grid grid-cols-4 bg-white border-b border-slate-400">
          {tabs.map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={exporting}
                onClick={() => setMode(tab.id)}
                className={`py-2.5 px-2 flex flex-col items-center justify-center gap-1.5 border-r last:border-r-0 border-slate-300 transition-colors ${
                  active
                    ? 'bg-[#d0d1d4] shadow-inner font-semibold text-slate-950'
                    : 'bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <DocumentBadgeIcon label={tab.badge} color={tab.color} />
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-6 pt-3 pb-5 space-y-4">
          <div className="text-[13px] text-slate-500 font-medium">
            {modeTitleMap[mode]}
          </div>

          <div className="space-y-3 pl-4">
            {/* Image Limit (DPI) */}
            <div className="flex items-center gap-3">
              <label className="w-28 text-right text-slate-800 shrink-0">
                {t.imageLimitLabel}
              </label>
              <select
                value={dpi}
                disabled={exporting}
                onChange={(e) => setDpi(Number(e.target.value))}
                className="h-7 min-w-[116px] px-2.5 bg-white border border-slate-400 rounded-sm shadow-xs text-slate-900 tabular-nums focus:outline-none focus:border-blue-500"
              >
                {DPI_OPTIONS.map((opt) => (
                  <option key={opt.dpi} value={opt.dpi}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 tabular-nums">
                ({Math.round(doc.pageWidth * selectedDpi.scale)}×
                {Math.round(doc.pageHeight * selectedDpi.scale)} px)
              </span>
            </div>

            {/* Image Format & Quality for Images and CBZ */}
            {(mode === 'images' || mode === 'cbz') && (
              <div className="flex items-center gap-3 flex-wrap">
                <label className="w-28 text-right text-slate-800 shrink-0">
                  {t.imageFormat}:
                </label>
                <select
                  value={imageFormat}
                  disabled={exporting}
                  onChange={(e) =>
                    setImageFormat(e.target.value as 'image/jpeg' | 'image/png')
                  }
                  className="h-7 px-2.5 bg-white border border-slate-400 rounded-sm shadow-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                </select>

                {imageFormat === 'image/jpeg' && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-slate-700">{t.qualityLabel}</span>
                    <input
                      type="range"
                      min={60}
                      max={100}
                      step={2}
                      value={jpegQuality}
                      disabled={exporting}
                      onChange={(e) => setJpegQuality(Number(e.target.value))}
                      className="w-24 accent-blue-600"
                    />
                    <span className="w-9 text-[11px] text-slate-700 tabular-nums">
                      {jpegQuality}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Metadata for ePub & CBZ */}
            {(mode === 'epub' || mode === 'cbz') && (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3">
                  <label className="w-28 text-right text-slate-800 shrink-0">
                    {t.bookTitleLabel}
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    disabled={exporting}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="h-7 flex-1 max-w-[260px] px-2 bg-white border border-slate-400 rounded-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="w-28 text-right text-slate-800 shrink-0">
                    {t.authorLabel}
                  </label>
                  <input
                    type="text"
                    value={author}
                    disabled={exporting}
                    placeholder="Comic4Life"
                    onChange={(e) => setAuthor(e.target.value)}
                    className="h-7 flex-1 max-w-[260px] px-2 bg-white border border-slate-400 rounded-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Page Range & Live Start/End Thumbnails */}
            <div className="flex items-start gap-3 pt-1">
              <label className="w-28 text-right text-slate-800 pt-1 shrink-0">
                {t.pagesRangeLabel}
              </label>

              <div className="space-y-2.5">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="export-scope"
                      checked={scope === 'all'}
                      disabled={exporting}
                      onChange={() => setScope('all')}
                      className="accent-blue-600"
                    />
                    <span>
                      {t.allPagesRadio} ({totalPages})
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="export-scope"
                        checked={scope === 'range'}
                        disabled={exporting}
                        onChange={() => setScope('range')}
                        className="accent-blue-600"
                      />
                      <span>{t.fromPageLabel}</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={effectiveStart}
                      disabled={exporting}
                      onFocus={() => setScope('range')}
                      onChange={(e) => handleFromChange(Number(e.target.value))}
                      className="w-12 h-6 px-1.5 bg-white border border-slate-400 rounded-xs text-center tabular-nums focus:outline-none focus:border-blue-500"
                    />
                    <span>{t.toPageLabel}</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={effectiveEnd}
                      disabled={exporting}
                      onFocus={() => setScope('range')}
                      onChange={(e) => handleToChange(Number(e.target.value))}
                      className="w-12 h-6 px-1.5 bg-white border border-slate-400 rounded-xs text-center tabular-nums focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Live Start / End Page Previews */}
                <div className="flex items-center gap-3 pl-16">
                  <PageMiniPreview
                    doc={doc}
                    page={startPageObj}
                    pageNum={effectiveStart}
                  />
                  <span className="text-slate-500 font-semibold pb-4">...</span>
                  <PageMiniPreview
                    doc={doc}
                    page={endPageObj}
                    pageNum={effectiveEnd}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {exporting && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-700">
                <span>{t.rendering}</span>
                <span className="tabular-nums font-semibold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="px-2.5 py-1.5 bg-red-50 border border-red-300 text-red-700 rounded text-[11px]">
              {errorMsg}
            </div>
          )}

          {/* Footer Action Row */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={exporting}
                onClick={handleExportJson}
                className="h-7 px-2.5 bg-white hover:bg-slate-50 border border-slate-400 rounded-sm shadow-xs text-[11px] font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                <FileJson className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.saveProjectFile}</span>
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={() => {
                  onClose();
                  onPrint();
                }}
                className="h-7 px-2.5 bg-white hover:bg-slate-50 border border-slate-400 rounded-sm shadow-xs text-[11px] font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>{t.print}</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                disabled={exporting}
                onClick={onClose}
                className="min-w-[88px] h-7 px-4 bg-white hover:bg-slate-50 border border-slate-400 rounded-sm shadow-xs font-medium text-slate-800 disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={handleExport}
                className="min-w-[96px] h-7 px-4 bg-white hover:bg-blue-50 border border-blue-600 text-blue-900 rounded-sm shadow-xs font-semibold disabled:opacity-50"
              >
                {exporting ? t.rendering : t.nextExportBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
