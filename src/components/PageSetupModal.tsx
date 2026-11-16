import React, { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { ComicDocument, ComicPage, PageSizeKey } from '../types/comic';
import { PX_PER_CM } from '../data/presets';
import { Translations } from '../i18n/translations';

interface PaperPreset {
  id: string;
  name: string;
  categoryLabel: string;
  widthCm: number;
  heightCm: number;
  pageSizeKey?: PageSizeKey;
}

interface PaperCategory {
  id: string;
  label: string;
  presets: PaperPreset[];
}

const STORAGE_USER_SIZES_KEY = 'comic4life_user_paper_sizes_v1';

const BUILTIN_PAPER_CATEGORIES: PaperCategory[] = [
  {
    id: 'comic',
    label: 'Tamaños de papel de cómic',
    presets: [
      { id: 'us-comic', name: 'US Comic (Estándar)', categoryLabel: 'Cómic', widthCm: 18.10, heightCm: 26.99, pageSizeKey: 'us-comic' },
      { id: 'golden-age', name: 'Golden Age Comic', categoryLabel: 'Cómic', widthCm: 19.69, heightCm: 27.31, pageSizeKey: 'custom' },
      { id: 'manga-b5', name: 'Manga B5 (Tankobon)', categoryLabel: 'Manga', widthCm: 18.20, heightCm: 25.70, pageSizeKey: 'manga' },
      { id: 'euro-album', name: 'Álbum Europeo (BD)', categoryLabel: 'Euro', widthCm: 24.00, heightCm: 32.00, pageSizeKey: 'custom' },
      { id: 'magazine', name: 'Revista / Magazine', categoryLabel: 'Cómic', widthCm: 21.59, heightCm: 27.94, pageSizeKey: 'letter' },
    ],
  },
  {
    id: 'iso',
    label: 'Tamaños de papel ISO',
    presets: [
      { id: 'iso-a4', name: 'A4', categoryLabel: 'ISO', widthCm: 21.00, heightCm: 29.70, pageSizeKey: 'a4' },
      { id: 'iso-a3', name: 'A3', categoryLabel: 'ISO', widthCm: 29.70, heightCm: 42.00, pageSizeKey: 'custom' },
      { id: 'iso-a5', name: 'A5', categoryLabel: 'ISO', widthCm: 14.80, heightCm: 21.00, pageSizeKey: 'custom' },
      { id: 'iso-b4', name: 'B4', categoryLabel: 'ISO', widthCm: 25.00, heightCm: 35.30, pageSizeKey: 'custom' },
      { id: 'iso-b5', name: 'B5', categoryLabel: 'ISO', widthCm: 17.60, heightCm: 25.00, pageSizeKey: 'custom' },
    ],
  },
  {
    id: 'supports',
    label: 'Soportes',
    presets: [
      { id: 'sup-4-3', name: 'Presentación 4:3', categoryLabel: 'Soporte', widthCm: 25.40, heightCm: 19.05, pageSizeKey: 'custom' },
      { id: 'sup-16-9', name: 'Panorámica 16:9', categoryLabel: 'Soporte', widthCm: 33.87, heightCm: 19.05, pageSizeKey: 'custom' },
      { id: 'sup-poster', name: 'Póster 50×70', categoryLabel: 'Soporte', widthCm: 50.00, heightCm: 70.00, pageSizeKey: 'custom' },
    ],
  },
  {
    id: 'book',
    label: 'Tamaños de papel de libro',
    presets: [
      { id: 'book-kdp', name: 'Amazon KDP 6×9"', categoryLabel: 'Libro', widthCm: 15.24, heightCm: 22.86, pageSizeKey: 'custom' },
      { id: 'book-trade', name: 'Trade Paperback', categoryLabel: 'Libro', widthCm: 16.99, heightCm: 26.01, pageSizeKey: 'custom' },
      { id: 'book-digest', name: 'Digest (5.5×8.5")', categoryLabel: 'Libro', widthCm: 13.97, heightCm: 21.59, pageSizeKey: 'custom' },
    ],
  },
  {
    id: 'square',
    label: 'Tamaños de papel cuadrado',
    presets: [
      { id: 'sq-20', name: 'Cuadrado 20 × 20 cm', categoryLabel: 'Cuadrado', widthCm: 20.00, heightCm: 20.00, pageSizeKey: 'square' },
      { id: 'sq-web', name: 'Webcomic 800 × 800 px', categoryLabel: 'Cuadrado', widthCm: 21.17, heightCm: 21.17, pageSizeKey: 'square' },
      { id: 'sq-15', name: 'Cuadrado 15 × 15 cm', categoryLabel: 'Cuadrado', widthCm: 15.00, heightCm: 15.00, pageSizeKey: 'square' },
    ],
  },
  {
    id: 'us',
    label: 'Tamaños papel EE.UU.',
    presets: [
      { id: 'us-letter', name: 'Carta EE.UU. (Letter)', categoryLabel: 'EE.UU.', widthCm: 21.59, heightCm: 27.94, pageSizeKey: 'letter' },
      { id: 'us-legal', name: 'Oficio (Legal)', categoryLabel: 'EE.UU.', widthCm: 21.59, heightCm: 35.56, pageSizeKey: 'custom' },
      { id: 'us-tabloid', name: 'Tabloide (11×17")', categoryLabel: 'EE.UU.', widthCm: 27.94, heightCm: 43.18, pageSizeKey: 'tabloid' },
    ],
  },
  {
    id: 'video',
    label: 'Vídeo',
    presets: [
      { id: 'vid-720', name: 'HD 720p (1280×720)', categoryLabel: 'Vídeo', widthCm: 33.87, heightCm: 19.05, pageSizeKey: 'custom' },
      { id: 'vid-1080', name: 'Full HD (1920×1080)', categoryLabel: 'Vídeo', widthCm: 50.80, heightCm: 28.58, pageSizeKey: 'custom' },
      { id: 'vid-reel', name: 'Vertical 9:16', categoryLabel: 'Vídeo', widthCm: 19.05, heightCm: 33.87, pageSizeKey: 'custom' },
    ],
  },
  {
    id: 'web',
    label: 'Tamaños de página web',
    presets: [
      { id: 'web-1024', name: 'Web 1024 × 768', categoryLabel: 'Web', widthCm: 27.09, heightCm: 20.32, pageSizeKey: 'custom' },
      { id: 'web-1280', name: 'Web 1280 × 800', categoryLabel: 'Web', widthCm: 33.87, heightCm: 21.17, pageSizeKey: 'custom' },
      { id: 'web-strip', name: 'Webtoon Tira Vertical', categoryLabel: 'Web', widthCm: 21.17, heightCm: 42.33, pageSizeKey: 'custom' },
    ],
  },
  {
    id: 'blog',
    label: 'Tamaños de página de blog',
    presets: [
      { id: 'blog-post', name: 'Entrada Blog (800×1000)', categoryLabel: 'Blog', widthCm: 21.17, heightCm: 26.46, pageSizeKey: 'custom' },
      { id: 'blog-banner', name: 'Cabecera Blog (1200×628)', categoryLabel: 'Blog', widthCm: 31.75, heightCm: 16.62, pageSizeKey: 'custom' },
    ],
  },
  {
    id: 'photo',
    label: 'Tamaños de fotos',
    presets: [
      { id: 'ph-10x15', name: '10 × 15 cm (4×6")', categoryLabel: 'Foto', widthCm: 10.16, heightCm: 15.24, pageSizeKey: 'custom' },
      { id: 'ph-13x18', name: '13 × 18 cm (5×7")', categoryLabel: 'Foto', widthCm: 12.70, heightCm: 17.78, pageSizeKey: 'custom' },
      { id: 'ph-20x25', name: '20 × 25 cm (8×10")', categoryLabel: 'Foto', widthCm: 20.32, heightCm: 25.40, pageSizeKey: 'custom' },
    ],
  },
  {
    id: 'tablet',
    label: 'Tableta',
    presets: [
      { id: 'tab-ipad', name: 'iPad Vertical', categoryLabel: 'Tableta', widthCm: 20.32, heightCm: 27.09, pageSizeKey: 'custom' },
      { id: 'tab-ipad-pro', name: 'iPad Pro 12.9"', categoryLabel: 'Tableta', widthCm: 21.50, heightCm: 28.00, pageSizeKey: 'custom' },
      { id: 'tab-ereader', name: 'Lector eBook / Kindle', categoryLabel: 'Tableta', widthCm: 15.24, heightCm: 20.32, pageSizeKey: 'custom' },
    ],
  },
];

interface PageSetupModalProps {
  t: Translations;
  isOpen: boolean;
  doc: ComicDocument;
  activePage: ComicPage;
  onClose: () => void;
  onApply: (config: {
    pageSize: PageSizeKey;
    pageWidth: number;
    pageHeight: number;
    margins: { top: number; right: number; bottom: number; left: number };
  }) => void;
}

function loadUserSizes(): PaperPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_USER_SIZES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function parseCmInput(val: string, fallback: number): number {
  const normalized = val.replace(',', '.').replace(/[^0-9.]/g, '');
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? num : fallback;
}

function formatCm(cm: number): string {
  return cm.toFixed(2).replace('.', ',');
}

export const PageSetupModal: React.FC<PageSetupModalProps> = ({
  t,
  isOpen,
  doc,
  activePage,
  onClose,
  onApply,
}) => {
  const [setupMode, setSetupMode] = useState<'printer' | 'custom'>('custom');
  const [categoryId, setCategoryId] = useState<string>('comic');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('us-comic');
  const [selectedPageSizeKey, setSelectedPageSizeKey] = useState<PageSizeKey>(
    doc.pageSize
  );

  const [widthCm, setWidthCm] = useState<number>(doc.pageWidth / PX_PER_CM);
  const [heightCm, setHeightCm] = useState<number>(doc.pageHeight / PX_PER_CM);
  const [widthText, setWidthText] = useState<string>(
    formatCm(doc.pageWidth / PX_PER_CM)
  );
  const [heightText, setHeightText] = useState<string>(
    formatCm(doc.pageHeight / PX_PER_CM)
  );

  const [marginLeftCm, setMarginLeftCm] = useState<string>('0,95');
  const [marginRightCm, setMarginRightCm] = useState<string>('0,95');
  const [marginTopCm, setMarginTopCm] = useState<string>('0,95');
  const [marginBottomCm, setMarginBottomCm] = useState<string>('0,95');

  const [userPresets, setUserPresets] = useState<PaperPreset[]>(loadUserSizes);
  const [addingUserPreset, setAddingUserPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const w = doc.pageWidth / PX_PER_CM;
    const h = doc.pageHeight / PX_PER_CM;
    setWidthCm(w);
    setHeightCm(h);
    setWidthText(formatCm(w));
    setHeightText(formatCm(h));
    setSelectedPageSizeKey(doc.pageSize);

    const mTop = (activePage.margins?.top ?? activePage.margin) / PX_PER_CM;
    const mRight = (activePage.margins?.right ?? activePage.margin) / PX_PER_CM;
    const mBottom = (activePage.margins?.bottom ?? activePage.margin) / PX_PER_CM;
    const mLeft = (activePage.margins?.left ?? activePage.margin) / PX_PER_CM;
    setMarginTopCm(formatCm(mTop));
    setMarginRightCm(formatCm(mRight));
    setMarginBottomCm(formatCm(mBottom));
    setMarginLeftCm(formatCm(mLeft));
  }, [isOpen, doc.pageWidth, doc.pageHeight, doc.pageSize, activePage]);

  if (!isOpen) return null;

  const allCategories: PaperCategory[] = [
    ...BUILTIN_PAPER_CATEGORIES,
    {
      id: 'user',
      label: 'Tamaños del usuario',
      presets: userPresets,
    },
  ];

  const activeCategory =
    allCategories.find((c) => c.id === categoryId) || allCategories[0];
  const isLandscape = widthCm > heightCm;

  const selectPreset = (preset: PaperPreset) => {
    setSelectedPresetId(preset.id);
    setSelectedPageSizeKey(preset.pageSizeKey ?? 'custom');
    const nextW = isLandscape ? Math.max(preset.widthCm, preset.heightCm) : preset.widthCm;
    const nextH = isLandscape ? Math.min(preset.widthCm, preset.heightCm) : preset.heightCm;
    setWidthCm(nextW);
    setHeightCm(nextH);
    setWidthText(formatCm(nextW));
    setHeightText(formatCm(nextH));
    setSetupMode('custom');
  };

  const setOrientation = (target: 'portrait' | 'landscape') => {
    const currentlyLandscape = widthCm > heightCm;
    if (
      (target === 'landscape' && !currentlyLandscape) ||
      (target === 'portrait' && currentlyLandscape)
    ) {
      const nextW = heightCm;
      const nextH = widthCm;
      setWidthCm(nextW);
      setHeightCm(nextH);
      setWidthText(formatCm(nextW));
      setHeightText(formatCm(nextH));
    }
  };

  const handleSaveUserPreset = () => {
    const cleanName =
      newPresetName.trim() ||
      `Personalizado (${formatCm(widthCm)}×${formatCm(heightCm)} cm)`;
    const item: PaperPreset = {
      id: `user-${Date.now()}`,
      name: cleanName,
      categoryLabel: 'Usuario',
      widthCm: Number(widthCm.toFixed(2)),
      heightCm: Number(heightCm.toFixed(2)),
      pageSizeKey: 'custom',
    };
    const next = [...userPresets, item];
    setUserPresets(next);
    try {
      localStorage.setItem(STORAGE_USER_SIZES_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setCategoryId('user');
    setSelectedPresetId(item.id);
    setAddingUserPreset(false);
    setNewPresetName('');
  };

  const handleRemoveUserPreset = () => {
    if (categoryId !== 'user' || !selectedPresetId) return;
    const next = userPresets.filter((p) => p.id !== selectedPresetId);
    setUserPresets(next);
    try {
      localStorage.setItem(STORAGE_USER_SIZES_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setSelectedPresetId(next[0]?.id || '');
  };

  const handleAccept = () => {
    const finalW = Math.max(200, Math.round(widthCm * PX_PER_CM));
    const finalH = Math.max(200, Math.round(heightCm * PX_PER_CM));
    const topPx = Math.max(0, Math.round(parseCmInput(marginTopCm, 0.95) * PX_PER_CM));
    const rightPx = Math.max(0, Math.round(parseCmInput(marginRightCm, 0.95) * PX_PER_CM));
    const bottomPx = Math.max(0, Math.round(parseCmInput(marginBottomCm, 0.95) * PX_PER_CM));
    const leftPx = Math.max(0, Math.round(parseCmInput(marginLeftCm, 0.95) * PX_PER_CM));

    onApply({
      pageSize: selectedPageSizeKey,
      pageWidth: finalW,
      pageHeight: finalH,
      margins: { top: topPx, right: rightPx, bottom: bottomPx, left: leftPx },
    });
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
      <div className="w-full max-w-[680px] bg-[#f0f0f0] border border-slate-500 rounded-md shadow-2xl overflow-hidden text-[12px] text-slate-900 select-none">
        {/* Window Header */}
        <div className="h-8 bg-white border-b border-slate-200 px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-gradient-to-br from-amber-400 to-red-600 text-white text-[8px] font-black shadow-xs">
              C4L
            </span>
            <span className="font-medium text-slate-800">{t.pageSetupTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded"
            aria-label={t.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Top Radio Mode Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="page-setup-mode"
                  checked={setupMode === 'printer'}
                  onChange={() => {
                    setSetupMode('printer');
                    const a4 = BUILTIN_PAPER_CATEGORIES[1].presets[0];
                    selectPreset(a4);
                    setSetupMode('printer');
                  }}
                  className="accent-blue-600"
                />
                <span>{t.usePageSetupPrinter}</span>
              </label>

              <button
                type="button"
                disabled={setupMode !== 'printer'}
                onClick={() => {
                  const letter = BUILTIN_PAPER_CATEGORIES[5].presets[0];
                  selectPreset(letter);
                }}
                className="w-[330px] h-6 px-3 bg-white border border-slate-300 rounded-xs text-slate-700 disabled:text-slate-400 disabled:bg-slate-100 shadow-2xs"
              >
                {t.pageSetupBtn}
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="page-setup-mode"
                checked={setupMode === 'custom'}
                onChange={() => setSetupMode('custom')}
                className="accent-blue-600"
              />
              <span>{t.useCustomSettings}</span>
            </label>
          </div>

          {/* Main 2-Column Configuration Area */}
          <div className="grid grid-cols-12 gap-4 items-start">
            {/* Left Column: Paper Categories + Preset List + +/- */}
            <div className="col-span-5 space-y-2">
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSetupMode('custom');
                }}
                className="w-full h-7 px-2 bg-white border border-slate-400 rounded-sm shadow-2xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <div className="h-[195px] bg-white border border-slate-400 overflow-y-auto">
                <div className="grid grid-cols-3 bg-[#1468d4] text-white text-[11px] font-semibold px-2 py-1 sticky top-0">
                  <span className="col-span-2">Tamaño</span>
                  <span className="text-right">Categoría</span>
                </div>
                {activeCategory.presets.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-slate-400">
                    Pulsa + para guardar el tamaño actual
                  </div>
                ) : (
                  activeCategory.presets.map((preset, idx) => {
                    const active = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectPreset(preset)}
                        className={`w-full grid grid-cols-3 px-2 py-1 text-left text-[11px] transition-colors ${
                          active
                            ? 'bg-blue-600 text-white font-medium'
                            : idx % 2 === 1
                              ? 'bg-[#eaf2fc] text-slate-900 hover:bg-blue-100'
                              : 'bg-white text-slate-900 hover:bg-blue-100'
                        }`}
                      >
                        <span className="col-span-2 truncate pr-1">
                          {preset.name}
                        </span>
                        <span className="text-right opacity-80 truncate">
                          {preset.categoryLabel}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {addingUserPreset ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveUserPreset();
                      if (e.key === 'Escape') setAddingUserPreset(false);
                    }}
                    placeholder={t.customPresetPlaceholder}
                    className="flex-1 h-7 px-2 bg-white border border-blue-500 rounded-xs text-[11px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUserPreset}
                    className="h-7 px-2 bg-blue-600 text-white rounded-xs text-[11px] font-semibold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAddingUserPreset(true)}
                    title="Guardar tamaño personalizado"
                    className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs flex items-center justify-center shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <button
                    type="button"
                    disabled={categoryId !== 'user' || userPresets.length === 0}
                    onClick={handleRemoveUserPreset}
                    title="Eliminar tamaño de usuario"
                    className="w-7 h-7 bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-400 rounded-xs flex items-center justify-center shadow-2xs"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Dimensions + Orientation + Document Margins */}
            <div className="col-span-7 space-y-4">
              {/* Page Size & Orientation Box */}
              <div className="border border-slate-300 bg-[#f6f6f6] p-3.5 space-y-3 rounded-xs">
                <div className="flex items-start gap-3">
                  <span className="w-32 text-right pt-1 text-slate-800 shrink-0">
                    {t.pageSizeLabel}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center bg-white border border-slate-400 px-1.5 h-6 w-[76px]">
                        <input
                          type="text"
                          value={widthText}
                          onChange={(e) => {
                            setWidthText(e.target.value);
                            const v = parseCmInput(e.target.value, widthCm);
                            if (v > 2 && v < 200) {
                              setWidthCm(v);
                              setSelectedPageSizeKey('custom');
                            }
                          }}
                          onBlur={() => setWidthText(formatCm(widthCm))}
                          className="w-full text-right outline-none tabular-nums text-[11px]"
                        />
                        <span className="text-[11px] text-slate-500 ml-1">cm</span>
                      </div>
                      <span className="text-[10px] text-slate-600">
                        {t.width.toLowerCase()}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center bg-white border border-slate-400 px-1.5 h-6 w-[76px]">
                        <input
                          type="text"
                          value={heightText}
                          onChange={(e) => {
                            setHeightText(e.target.value);
                            const v = parseCmInput(e.target.value, heightCm);
                            if (v > 2 && v < 200) {
                              setHeightCm(v);
                              setSelectedPageSizeKey('custom');
                            }
                          }}
                          onBlur={() => setHeightText(formatCm(heightCm))}
                          className="w-full text-right outline-none tabular-nums text-[11px]"
                        />
                        <span className="text-[11px] text-slate-500 ml-1">cm</span>
                      </div>
                      <span className="text-[10px] text-slate-600">
                        {t.height.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-32 text-right pt-0.5 text-slate-800 shrink-0">
                    {t.orientation}:
                  </span>
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="page-orient"
                        checked={!isLandscape}
                        onChange={() => setOrientation('portrait')}
                        className="accent-blue-600"
                      />
                      <span>{t.portrait}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="page-orient"
                        checked={isLandscape}
                        onChange={() => setOrientation('landscape')}
                        className="accent-blue-600"
                      />
                      <span>{t.landscape}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Document Margins Box */}
              <div className="relative border border-slate-300 bg-[#f6f6f6] pt-4 pb-3 px-4 rounded-xs">
                <span className="absolute -top-2 left-3 px-1 bg-[#f0f0f0] text-[11px] text-slate-800">
                  {t.docMarginsTitle}
                </span>

                <div className="grid grid-cols-3 gap-2 items-center justify-items-center">
                  <div />
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center bg-white border border-slate-400 px-1.5 h-6 w-[74px]">
                      <input
                        type="text"
                        value={marginTopCm}
                        onChange={(e) => setMarginTopCm(e.target.value)}
                        onBlur={() =>
                          setMarginTopCm(formatCm(parseCmInput(marginTopCm, 0.95)))
                        }
                        className="w-full text-right outline-none tabular-nums text-[11px]"
                      />
                      <span className="text-[11px] text-slate-500 ml-1">cm</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{t.marginTop}</span>
                  </div>
                  <div />

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center bg-white border border-slate-400 px-1.5 h-6 w-[74px]">
                      <input
                        type="text"
                        value={marginLeftCm}
                        onChange={(e) => setMarginLeftCm(e.target.value)}
                        onBlur={() =>
                          setMarginLeftCm(formatCm(parseCmInput(marginLeftCm, 0.95)))
                        }
                        className="w-full text-right outline-none tabular-nums text-[11px]"
                      />
                      <span className="text-[11px] text-slate-500 ml-1">cm</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{t.marginLeft}</span>
                  </div>
                  <div className="w-8 h-10 border border-dashed border-slate-400 bg-white/70" />
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center bg-white border border-slate-400 px-1.5 h-6 w-[74px]">
                      <input
                        type="text"
                        value={marginRightCm}
                        onChange={(e) => setMarginRightCm(e.target.value)}
                        onBlur={() =>
                          setMarginRightCm(formatCm(parseCmInput(marginRightCm, 0.95)))
                        }
                        className="w-full text-right outline-none tabular-nums text-[11px]"
                      />
                      <span className="text-[11px] text-slate-500 ml-1">cm</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{t.marginRight}</span>
                  </div>

                  <div />
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center bg-white border border-slate-400 px-1.5 h-6 w-[74px]">
                      <input
                        type="text"
                        value={marginBottomCm}
                        onChange={(e) => setMarginBottomCm(e.target.value)}
                        onBlur={() =>
                          setMarginBottomCm(formatCm(parseCmInput(marginBottomCm, 0.95)))
                        }
                        className="w-full text-right outline-none tabular-nums text-[11px]"
                      />
                      <span className="text-[11px] text-slate-500 ml-1">cm</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{t.marginBottom}</span>
                  </div>
                  <div />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[92px] h-7 px-4 bg-white hover:bg-slate-50 border border-slate-400 rounded-sm shadow-2xs text-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="min-w-[92px] h-7 px-4 bg-white hover:bg-blue-50 border border-blue-600 text-blue-900 font-semibold rounded-sm shadow-2xs"
            >
              {t.acceptBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
