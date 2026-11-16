import React, { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  BookOpen,
  FileText,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Lock,
  MessageCircle,
  Paintbrush,
  Plus,
  Ruler,
  Sparkles,
  Trash2,
  Type,
  Unlock,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  BackgroundPattern,
  BalloonType,
  ComicDocument,
  ComicElement,
  ComicPage,
  CustomFontAsset,
  ImageFilterType,
  ImageFitMode,
  LetteringWarp,
  PageSizeKey,
  PanelShape,
  ScriptEntry,
  TailStyle,
} from '../types/comic';
import { COMIC_FONTS, PAGE_SIZES, PX_PER_CM, nextId } from '../data/presets';
import { Translations } from '../i18n/translations';
import { ColorWheelPicker } from './ColorWheelPicker';

interface FloatingPanelsProps {
  t: Translations;
  doc: ComicDocument;
  page: ComicPage;
  selectedElement: ComicElement | null;
  customFonts: CustomFontAsset[];
  showInspector: boolean;
  showColors: boolean;
  showFonts: boolean;
  showScript: boolean;
  onCloseInspector: () => void;
  onCloseColors: () => void;
  onCloseFonts: () => void;
  onCloseScript: () => void;
  onUpdateElement: (id: string, patch: Record<string, unknown>) => void;
  onUpdatePage: (patch: Partial<ComicPage>) => void;
  onChangePageSize: (
    sizeKey: PageSizeKey,
    customW?: number,
    customH?: number
  ) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onAddCustomFontFile: (file: File) => void;
  onAddGoogleFont: (familyName: string) => void;
  onInsertTextBox: () => void;
  onInsertImageToSelected: (url: string) => void;
  onUpdateScript: (entries: ScriptEntry[]) => void;
  onApplyScriptToPage: () => void;
  onImportScriptText?: (rawText: string) => void;
  bringFrontSignal?: number;
}

type InspectorTabKey =
  | 'document'
  | 'page'
  | 'style'
  | 'balloon'
  | 'image'
  | 'arrange'
  | 'metrics'
  | 'text';

export const FloatingPanels: React.FC<FloatingPanelsProps> = ({
  t,
  doc,
  page,
  selectedElement,
  customFonts,
  showInspector,
  showColors,
  showFonts,
  showScript,
  onCloseInspector,
  onCloseColors,
  onCloseFonts,
  onCloseScript,
  onUpdateElement,
  onUpdatePage,
  onChangePageSize,
  onBringForward,
  onSendBackward,
  onAddCustomFontFile,
  onAddGoogleFont,
  onInsertTextBox,
  onInsertImageToSelected,
  onUpdateScript,
  onApplyScriptToPage,
  onImportScriptText,
  bringFrontSignal,
}) => {
  const [inspectorTab, setInspectorTab] = useState<InspectorTabKey>('metrics');
  const [fontDropActive, setFontDropActive] = useState(false);
  const [scriptDropActive, setScriptDropActive] = useState(false);
  const [dragOverScriptIdx, setDragOverScriptIdx] = useState<number | null>(null);
  const [unit, setUnit] = useState<'cm' | 'px'>('cm');
  const [constrainProps, setConstrainProps] = useState(true);
  const [colorTarget, setColorTarget] = useState<
    'fill' | 'stroke' | 'text' | 'page'
  >('fill');

  // Draggable window positions
  const [inspPos, setInspPos] = useState({ x: 640, y: 120 });
  const [fontsPos, setFontsPos] = useState({ x: 150, y: 340 });

  useEffect(() => {
    if (!bringFrontSignal) return;
    setInspPos((prev) => ({
      x: Math.max(8, Math.min(prev.x, window.innerWidth - 310)),
      y: Math.max(36, Math.min(prev.y, window.innerHeight - 360)),
    }));
    setFontsPos((prev) => ({
      x: Math.max(8, Math.min(prev.x, window.innerWidth - 290)),
      y: Math.max(36, Math.min(prev.y, window.innerHeight - 320)),
    }));
  }, [bringFrontSignal]);

  const dragWinRef = useRef<{
    which: 'inspector' | 'fonts';
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  const [googleFontInput, setGoogleFontInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fontFileInputRef = useRef<HTMLInputElement>(null);
  const panelImgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragWinRef.current) return;
      const nx = Math.max(
        0,
        dragWinRef.current.ox + e.clientX - dragWinRef.current.sx
      );
      const ny = Math.max(
        28,
        dragWinRef.current.oy + e.clientY - dragWinRef.current.sy
      );
      if (dragWinRef.current.which === 'inspector') {
        setInspPos({ x: nx, y: ny });
      } else {
        setFontsPos({ x: nx, y: ny });
      }
    };
    const onUp = () => {
      dragWinRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const isPanel = selectedElement?.kind === 'panel';
  const isBalloon = selectedElement?.kind === 'balloon';
  const isLettering = selectedElement?.kind === 'lettering';

  const allFonts = [
    ...customFonts.map((f) => f.family),
    ...COMIC_FONTS.filter((cf) => !customFonts.some((u) => u.family === cf)),
  ];

  const pxToUnit = (px: number) =>
    unit === 'cm' ? Number((px / PX_PER_CM).toFixed(2)) : Math.round(px);

  const unitToPx = (val: number) =>
    unit === 'cm' ? Math.round(val * PX_PER_CM) : Math.round(val);

  const activeColorValue = (() => {
    if (colorTarget === 'page' || !selectedElement) return page.backgroundColor;
    if (colorTarget === 'stroke') return selectedElement.strokeColor;
    if (colorTarget === 'text') {
      if (isBalloon) return selectedElement.textColor;
      if (isLettering) return selectedElement.fillTopColor;
      return '#000000';
    }
    if (isLettering) return selectedElement.fillBottomColor;
    return selectedElement.fillColor;
  })();

  const applyColorValue = (hex: string) => {
    if (colorTarget === 'page' || !selectedElement) {
      onUpdatePage({ backgroundColor: hex });
      return;
    }
    if (colorTarget === 'stroke') {
      onUpdateElement(selectedElement.id, {
        strokeColor: hex,
        strokeEnabled: true,
      });
    } else if (colorTarget === 'text') {
      if (isBalloon) onUpdateElement(selectedElement.id, { textColor: hex });
      else if (isLettering)
        onUpdateElement(selectedElement.id, { fillTopColor: hex });
    } else {
      if (isLettering)
        onUpdateElement(selectedElement.id, { fillBottomColor: hex });
      else
        onUpdateElement(selectedElement.id, {
          fillColor: hex,
          fillEnabled: true,
        });
    }
  };

  const tabItems: Array<{
    key: InspectorTabKey;
    title: string;
    icon: React.ReactNode;
  }> = [
    { key: 'document', title: t.tabDocument, icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'page', title: t.tabPage, icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { key: 'style', title: t.tabStyle, icon: <Paintbrush className="w-3.5 h-3.5" /> },
    { key: 'balloon', title: t.tabBalloon, icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { key: 'image', title: t.tabImage, icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { key: 'arrange', title: t.tabArrange, icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'metrics', title: t.tabMetrics, icon: <Ruler className="w-3.5 h-3.5" /> },
    { key: 'text', title: t.tabText, icon: <Type className="w-3.5 h-3.5" /> },
  ];

  const currentTabTitle =
    tabItems.find((ti) => ti.key === inspectorTab)?.title || t.inspector;

  const isPortrait = doc.pageHeight >= doc.pageWidth;

  return (
    <>
      {/* 1. COMPLETE 8-TAB COMIC LIFE INSPECTOR */}
      {showInspector && (
        <div
          style={{ left: `${inspPos.x}px`, top: `${inspPos.y}px` }}
          className="no-print fixed w-[292px] max-h-[78vh] bg-[#eceef1] border border-slate-500 rounded shadow-2xl z-40 flex flex-col text-[11px] text-slate-800 overflow-hidden select-none"
        >
          {/* Draggable Header */}
          <div
            onPointerDown={(e) => {
              dragWinRef.current = {
                which: 'inspector',
                sx: e.clientX,
                sy: e.clientY,
                ox: inspPos.x,
                oy: inspPos.y,
              };
            }}
            className="h-7 bg-gradient-to-b from-[#f4f5f7] to-[#dadde2] border-b border-slate-400 px-2.5 flex items-center justify-between cursor-move shrink-0"
          >
            <span className="font-semibold text-slate-800">
              {currentTabTitle}
            </span>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onCloseInspector}
              className="p-0.5 rounded hover:bg-slate-300 text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 8 Icon Tabs (Matching Picture 3) */}
          <div className="grid grid-cols-8 bg-[#dfe2e7] border-b border-slate-400/80 shrink-0">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                type="button"
                title={tab.title}
                onClick={() => setInspectorTab(tab.key)}
                className={`h-7 flex items-center justify-center border-r last:border-r-0 border-slate-300 transition-colors ${
                  inspectorTab === tab.key
                    ? 'bg-[#eceef1] text-blue-700 shadow-inner font-bold border-b-2 border-b-blue-600'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
              </button>
            ))}
          </div>

          <div className="p-3 overflow-y-auto space-y-3">
            {/* TAB 1: DOCUMENT & PAGE DIMENSIONS */}
            {inspectorTab === 'document' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.pageDimensions}
                  </label>
                  <select
                    value={doc.pageSize}
                    onChange={(e) => onChangePageSize(e.target.value as PageSizeKey)}
                    className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2 outline-none"
                  >
                    {Object.entries(PAGE_SIZES).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Orientation + Units */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.orientation}
                    </label>
                    <div className="grid grid-cols-2 border border-slate-400 rounded-xs overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isPortrait) {
                            onChangePageSize('custom', doc.pageHeight, doc.pageWidth);
                          }
                        }}
                        className={`py-1 text-[10px] font-medium ${
                          isPortrait ? 'bg-blue-600 text-white' : 'text-slate-700'
                        }`}
                      >
                        {t.portrait}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isPortrait) {
                            onChangePageSize('custom', doc.pageHeight, doc.pageWidth);
                          }
                        }}
                        className={`py-1 text-[10px] font-medium ${
                          !isPortrait ? 'bg-blue-600 text-white' : 'text-slate-700'
                        }`}
                      >
                        {t.landscape}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t.units}
                    </label>
                    <div className="grid grid-cols-2 border border-slate-400 rounded-xs overflow-hidden bg-white">
                      {(['cm', 'px'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUnit(u)}
                          className={`py-1 text-[10px] font-medium uppercase ${
                            unit === u ? 'bg-blue-600 text-white' : 'text-slate-700'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Width / Height */}
                <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded border border-slate-300">
                  <label className="space-y-0.5">
                    <span className="text-[10px] text-slate-500">
                      {t.width} ({unit})
                    </span>
                    <input
                      type="number"
                      step={unit === 'cm' ? 0.1 : 10}
                      value={pxToUnit(doc.pageWidth)}
                      onChange={(e) => {
                        const val = Math.max(240, unitToPx(Number(e.target.value) || 10));
                        onChangePageSize('custom', val, doc.pageHeight);
                      }}
                      className="w-full h-6 border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[10px] text-slate-500">
                      {t.height} ({unit})
                    </span>
                    <input
                      type="number"
                      step={unit === 'cm' ? 0.1 : 10}
                      value={pxToUnit(doc.pageHeight)}
                      onChange={(e) => {
                        const val = Math.max(240, unitToPx(Number(e.target.value) || 10));
                        onChangePageSize('custom', doc.pageWidth, val);
                      }}
                      className="w-full h-6 border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                    />
                  </label>
                </div>

                <p className="text-[10px] text-slate-500">{t.applyAllPages}</p>
              </div>
            )}

            {/* TAB 2: PAGE SETUP */}
            {inspectorTab === 'page' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.backgroundColor}</span>
                  <input
                    type="color"
                    value={page.backgroundColor}
                    onChange={(e) =>
                      onUpdatePage({ backgroundColor: e.target.value })
                    }
                    className="w-10 h-6 border border-slate-400 rounded-xs cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t.pagePattern}</label>
                  <select
                    value={page.backgroundPattern}
                    onChange={(e) =>
                      onUpdatePage({
                        backgroundPattern: e.target.value as BackgroundPattern,
                      })
                    }
                    className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2 outline-none"
                  >
                    <option value="none">Solid Clean</option>
                    <option value="halftone">Halftone Dots</option>
                    <option value="burst">Radial Action Burst</option>
                    <option value="grid">Blueprint Grid</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="font-semibold">{t.margins}</span>
                    <span className="tabular-nums">{page.margin} px</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={64}
                    value={page.margin}
                    onChange={(e) =>
                      onUpdatePage({ margin: Number(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="font-semibold">{t.gutter}</span>
                    <span className="tabular-nums">{page.gutter} px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={36}
                    value={page.gutter}
                    onChange={(e) =>
                      onUpdatePage({ gutter: Number(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: STYLE (FILL / STROKE / SHADOW) */}
            {inspectorTab === 'style' && (
              !selectedElement ? (
                <p className="py-6 text-center text-slate-500">{t.selectElementHint}</p>
              ) : (
                <div className="space-y-3">
                  {isPanel && (
                    <div>
                      <label className="block font-semibold mb-1">{t.panelShape}</label>
                      <select
                        value={selectedElement.shape}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            shape: e.target.value as PanelShape,
                          })
                        }
                        className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2"
                      >
                        <option value="rect">Rectangle</option>
                        <option value="rounded">Rounded Box</option>
                        <option value="ellipse">Oval / Spotlight</option>
                        <option value="skew-left">Slant Left</option>
                        <option value="skew-right">Slant Right</option>
                        <option value="pentagon">Pentagon Action</option>
                      </select>
                    </div>
                  )}

                  <div className="bg-white p-2 rounded border border-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 font-semibold">
                        <input
                          type="checkbox"
                          checked={selectedElement.strokeEnabled}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              strokeEnabled: e.target.checked,
                            })
                          }
                          className="accent-blue-600"
                        />
                        <span>{t.stroke}</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={24}
                          value={selectedElement.strokeWidth}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              strokeWidth: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-12 h-6 border border-slate-300 rounded-xs px-1 text-right tabular-nums"
                        />
                        <input
                          type="color"
                          value={selectedElement.strokeColor}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              strokeColor: e.target.value,
                              strokeEnabled: true,
                            })
                          }
                          className="w-7 h-6 border border-slate-300 rounded-xs cursor-pointer"
                        />
                      </div>
                    </div>

                    {!isLettering ? (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-semibold">
                          <input
                            type="checkbox"
                            checked={selectedElement.fillEnabled}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                fillEnabled: e.target.checked,
                              })
                            }
                            className="accent-blue-600"
                          />
                          <span>{t.fill}</span>
                        </label>
                        <input
                          type="color"
                          value={selectedElement.fillColor}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              fillColor: e.target.value,
                              fillEnabled: true,
                            })
                          }
                          className="w-10 h-6 border border-slate-300 rounded-xs cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span>{t.topGradient}</span>
                          <input
                            type="color"
                            value={selectedElement.fillTopColor}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                fillTopColor: e.target.value,
                              })
                            }
                            className="w-10 h-6 border border-slate-300 rounded-xs"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t.bottomGradient}</span>
                          <input
                            type="color"
                            value={selectedElement.fillBottomColor}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                fillBottomColor: e.target.value,
                              })
                            }
                            className="w-10 h-6 border border-slate-300 rounded-xs"
                          />
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-1.5 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedElement.shadow}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            shadow: e.target.checked,
                          })
                        }
                        className="accent-blue-600"
                      />
                      <span>{t.shadow}</span>
                    </label>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{t.opacity}</span>
                      <span className="tabular-nums">{selectedElement.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={selectedElement.opacity}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          opacity: Number(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )
            )}

            {/* TAB 4: BALLOON & LETTERING */}
            {inspectorTab === 'balloon' && (
              isBalloon ? (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold mb-1">{t.balloonShape}</label>
                    <select
                      value={selectedElement.balloonType}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          balloonType: e.target.value as BalloonType,
                        })
                      }
                      className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2"
                    >
                      <option value="speech">Oval Speech</option>
                      <option value="whisper">Whisper (Dashed)</option>
                      <option value="thought">Thought Cloud</option>
                      <option value="burst">Shout Burst</option>
                      <option value="exclaim">Exclaim Jagged</option>
                      <option value="rect-speech">Rounded Speech</option>
                      <option value="caption">Caption Box</option>
                      <option value="text">Free Text Box</option>
                    </select>
                  </div>

                  {selectedElement.balloonType !== 'caption' &&
                    selectedElement.balloonType !== 'text' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-1">{t.tailStyle}</label>
                          <select
                            value={selectedElement.tail.style}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                tail: {
                                  ...selectedElement.tail,
                                  enabled: e.target.value !== 'none',
                                  style: e.target.value as TailStyle,
                                },
                              })
                            }
                            className="w-full h-7 bg-white border border-slate-400 rounded-xs px-1.5"
                          >
                            <option value="curved">Curved</option>
                            <option value="straight">Straight</option>
                            <option value="bubbles">Bubbles</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">{t.tailWidth}</label>
                          <input
                            type="number"
                            min={6}
                            max={42}
                            value={selectedElement.tail.width}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                tail: {
                                  ...selectedElement.tail,
                                  width: Math.max(6, Number(e.target.value)),
                                },
                              })
                            }
                            className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2 tabular-nums"
                          />
                        </div>
                      </div>
                    )}
                </div>
              ) : isLettering ? (
                <div className="space-y-3">
                  <label className="block font-semibold mb-1">{t.warpStyle}</label>
                  <select
                    value={selectedElement.warp}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        warp: e.target.value as LetteringWarp,
                      })
                    }
                    className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2"
                  >
                    <option value="none">Straight</option>
                    <option value="slant">Comic Slant</option>
                    <option value="arc-up">Arch Up</option>
                    <option value="arc-down">Arch Down</option>
                    <option value="wave">Wave</option>
                  </select>
                </div>
              ) : (
                <p className="py-6 text-center text-slate-500">{t.selectElementHint}</p>
              )
            )}

            {/* TAB 5: IMAGE & FILTERS */}
            {inspectorTab === 'image' && (
              <div className="space-y-2.5">
                <div className="bg-white p-2 rounded border border-slate-300 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => panelImgInputRef.current?.click()}
                      className="flex-1 py-1.5 bg-[#1d5ec4] hover:bg-blue-700 text-white rounded-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t.replacePhoto}</span>
                    </button>
                    <input
                      ref={panelImgInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            onInsertImageToSelected(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="url"
                      placeholder="https://... image URL"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 h-6 border border-slate-300 rounded-xs px-1.5 text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          onInsertImageToSelected(imageUrlInput.trim());
                          setImageUrlInput('');
                        }
                      }}
                      className="h-6 px-2 bg-slate-200 hover:bg-slate-300 rounded-xs text-[10px] font-semibold"
                    >
                      {t.loadFontBtn}
                    </button>
                  </div>
                </div>

                {isPanel && selectedElement.imageUrl && (
                  <>
                    {/* Fit Mode, Scale, Position X/Y & Image Rotation */}
                    <div className="bg-white p-2 rounded border border-slate-300 space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{t.imageFitLabel}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                imageScale: 1,
                                imageOffsetX: 0,
                                imageOffsetY: 0,
                                imageRotation: 0,
                                imageFit: 'cover',
                                flipX: false,
                                flipY: false,
                              })
                            }
                            className="text-[10px] text-blue-600 hover:underline font-medium"
                          >
                            {t.resetImageAdjust}
                          </button>
                        </div>
                        <div className="grid grid-cols-3 border border-slate-400 rounded-xs overflow-hidden bg-slate-50">
                          {(
                            [
                              ['cover', t.imageFitCover],
                              ['contain', t.imageFitContain],
                              ['fill', t.imageFitFill],
                            ] as Array<[ImageFitMode, string]>
                          ).map(([fitKey, fitLabel]) => (
                            <button
                              key={fitKey}
                              type="button"
                              onClick={() =>
                                onUpdateElement(selectedElement.id, {
                                  imageFit: fitKey,
                                })
                              }
                              className={`py-1 text-[10px] font-medium ${
                                (selectedElement.imageFit || 'cover') === fitKey
                                  ? 'bg-[#1d5ec4] text-white'
                                  : 'text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {fitLabel}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{t.photoZoom}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={15}
                              max={500}
                              step={5}
                              value={Math.round(selectedElement.imageScale * 100)}
                              onChange={(e) => {
                                const pct = Math.max(
                                  15,
                                  Math.min(500, Number(e.target.value) || 100)
                                );
                                onUpdateElement(selectedElement.id, {
                                  imageScale: Number((pct / 100).toFixed(2)),
                                });
                              }}
                              className="w-12 h-5 border border-slate-300 rounded-xs px-1 text-right tabular-nums text-[10px]"
                            />
                            <span className="text-[10px] text-slate-500">%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                imageScale: Math.max(
                                  0.15,
                                  Number((selectedElement.imageScale - 0.1).toFixed(2))
                                ),
                              })
                            }
                            className="w-5 h-5 flex items-center justify-center border border-slate-300 rounded-xs bg-slate-50 hover:bg-slate-200 font-bold"
                            title="-10%"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min={0.15}
                            max={5}
                            step={0.05}
                            value={selectedElement.imageScale}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                imageScale: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                imageScale: Math.min(
                                  5,
                                  Number((selectedElement.imageScale + 0.1).toFixed(2))
                                ),
                              })
                            }
                            className="w-5 h-5 flex items-center justify-center border border-slate-300 rounded-xs bg-slate-50 hover:bg-slate-200 font-bold"
                            title="+10%"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{t.imagePositionLabel}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                imageOffsetX: 0,
                                imageOffsetY: 0,
                              })
                            }
                            className="text-[10px] text-slate-600 hover:text-blue-600"
                          >
                            0 / 0
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <label className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">X</span>
                            <input
                              type="number"
                              min={-250}
                              max={250}
                              value={selectedElement.imageOffsetX}
                              onChange={(e) =>
                                onUpdateElement(selectedElement.id, {
                                  imageOffsetX: Math.max(
                                    -250,
                                    Math.min(250, Number(e.target.value) || 0)
                                  ),
                                })
                              }
                              className="w-full h-6 border border-slate-300 rounded-xs px-1 text-right tabular-nums"
                            />
                            <span className="text-[9px] text-slate-400">%</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">Y</span>
                            <input
                              type="number"
                              min={-250}
                              max={250}
                              value={selectedElement.imageOffsetY}
                              onChange={(e) =>
                                onUpdateElement(selectedElement.id, {
                                  imageOffsetY: Math.max(
                                    -250,
                                    Math.min(250, Number(e.target.value) || 0)
                                  ),
                                })
                              }
                              className="w-full h-6 border border-slate-300 rounded-xs px-1 text-right tabular-nums"
                            />
                            <span className="text-[9px] text-slate-400">%</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{t.imageRotationLabel}</span>
                          <span className="tabular-nums">
                            {selectedElement.imageRotation || 0}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={selectedElement.imageRotation || 0}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              imageRotation: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-600"
                        />
                        <div className="flex items-center justify-between gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                imageRotation: (selectedElement.imageRotation || 0) - 90,
                              })
                            }
                            className="flex-1 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs text-[10px]"
                          >
                            -90°
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                imageRotation: (selectedElement.imageRotation || 0) + 90,
                              })
                            }
                            className="flex-1 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs text-[10px]"
                          >
                            +90°
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                flipX: !selectedElement.flipX,
                              })
                            }
                            title="Flip Horizontal"
                            className={`px-2 py-0.5 border border-slate-300 rounded-xs ${
                              selectedElement.flipX ? 'bg-blue-600 text-white' : 'bg-slate-100'
                            }`}
                          >
                            <FlipHorizontal className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                flipY: !selectedElement.flipY,
                              })
                            }
                            title="Flip Vertical"
                            className={`px-2 py-0.5 border border-slate-300 rounded-xs ${
                              selectedElement.flipY ? 'bg-blue-600 text-white' : 'bg-slate-100'
                            }`}
                          >
                            <FlipVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{t.photoFilter}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              imageUrl: null,
                              imageScale: 1,
                              imageOffsetX: 0,
                              imageOffsetY: 0,
                              imageRotation: 0,
                              imageFit: 'cover',
                            })
                          }
                          className="text-[10px] text-red-600 hover:underline"
                        >
                          {t.clearPhoto}
                        </button>
                      </div>
                      <select
                        value={selectedElement.imageFilter}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            imageFilter: e.target.value as ImageFilterType,
                          })
                        }
                        className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2"
                      >
                        <option value="none">Original</option>
                        <option value="comic">Comic Ink Pop</option>
                        <option value="halftone">Halftone Print</option>
                        <option value="bw-ink">High-Contrast B&W Ink</option>
                        <option value="sketch">Pencil Sketch</option>
                        <option value="sepia">Vintage Sepia</option>
                        <option value="posterize">Posterize</option>
                        <option value="vivid">Vivid Color</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span>{t.brightness}</span>
                        <span className="tabular-nums">{selectedElement.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={150}
                        value={selectedElement.brightness}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            brightness: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span>{t.contrast}</span>
                        <span className="tabular-nums">{selectedElement.contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={160}
                        value={selectedElement.contrast}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            contrast: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span>{t.saturation}</span>
                        <span className="tabular-nums">{selectedElement.saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={selectedElement.saturation}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            saturation: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div className="bg-white p-2 rounded border border-slate-300 space-y-2">
                      <label className="flex items-center justify-between font-semibold cursor-pointer">
                        <span className="flex items-center gap-1 text-rose-700">
                          <Wand2 className="w-3.5 h-3.5" />
                          {t.instantAlphaKnockout}
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedElement.instantAlpha.enabled}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              instantAlpha: {
                                ...selectedElement.instantAlpha,
                                enabled: e.target.checked,
                              },
                            })
                          }
                          className="accent-rose-600"
                        />
                      </label>
                      {selectedElement.instantAlpha.enabled && (
                        <>
                          <div className="flex items-center justify-between">
                            <span>{t.keyColor}</span>
                            <input
                              type="color"
                              value={selectedElement.instantAlpha.color}
                              onChange={(e) =>
                                onUpdateElement(selectedElement.id, {
                                  instantAlpha: {
                                    ...selectedElement.instantAlpha,
                                    color: e.target.value,
                                  },
                                })
                              }
                              className="w-8 h-5 border border-slate-400 rounded-xs"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between">
                              <span>{t.tolerance}</span>
                              <span className="tabular-nums">
                                {selectedElement.instantAlpha.tolerance}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={90}
                              value={selectedElement.instantAlpha.tolerance}
                              onChange={(e) =>
                                onUpdateElement(selectedElement.id, {
                                  instantAlpha: {
                                    ...selectedElement.instantAlpha,
                                    tolerance: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-full accent-rose-600"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 6: ARRANGE & ALIGN */}
            {inspectorTab === 'arrange' && (
              !selectedElement ? (
                <p className="py-6 text-center text-slate-500">{t.selectElementHint}</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onBringForward}
                      className="py-1.5 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs font-semibold"
                    >
                      {t.bringForward}
                    </button>
                    <button
                      type="button"
                      onClick={onSendBackward}
                      className="py-1.5 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs font-semibold"
                    >
                      {t.sendBackward}
                    </button>
                  </div>

                  <div>
                    <div className="font-semibold mb-1.5">Align to Page</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        disabled={Boolean(selectedElement.locked)}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            x: page.margins?.left ?? page.margin,
                          })
                        }
                        className="py-1 bg-white border border-slate-400 rounded-xs flex items-center justify-center gap-1 hover:bg-slate-50 disabled:opacity-45"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(selectedElement.locked)}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            x: Math.round((doc.pageWidth - selectedElement.width) / 2),
                          })
                        }
                        className="py-1 bg-white border border-slate-400 rounded-xs flex items-center justify-center gap-1 hover:bg-slate-50 disabled:opacity-45"
                      >
                        <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(selectedElement.locked)}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            x: Math.max(
                              0,
                              Math.round(
                                doc.pageWidth -
                                  (page.margins?.right ?? page.margin) -
                                  selectedElement.width
                              )
                            ),
                          })
                        }
                        className="py-1 bg-white border border-slate-400 rounded-xs flex items-center justify-center gap-1 hover:bg-slate-50 disabled:opacity-45"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(selectedElement.locked)}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            y: page.margins?.top ?? page.margin,
                          })
                        }
                        className="py-1 bg-white border border-slate-400 rounded-xs text-[10px] hover:bg-slate-50 disabled:opacity-45"
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(selectedElement.locked)}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            y: Math.round((doc.pageHeight - selectedElement.height) / 2),
                          })
                        }
                        className="py-1 bg-white border border-slate-400 rounded-xs flex items-center justify-center hover:bg-slate-50 disabled:opacity-45"
                      >
                        <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(selectedElement.locked)}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, {
                            y: Math.max(
                              0,
                              Math.round(
                                doc.pageHeight -
                                  (page.margins?.bottom ?? page.margin) -
                                  selectedElement.height
                              )
                            ),
                          })
                        }
                        className="py-1 bg-white border border-slate-400 rounded-xs text-[10px] hover:bg-slate-50 disabled:opacity-45"
                      >
                        Bottom
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        locked: !selectedElement.locked,
                      })
                    }
                    className={`w-full py-1.5 border rounded-xs font-semibold flex items-center justify-center gap-1.5 ${
                      selectedElement.locked
                        ? 'bg-rose-50 border-rose-400 text-rose-700 hover:bg-rose-100'
                        : 'bg-white border-slate-400 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {selectedElement.locked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{t.unlockMenu}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t.lockMenu}</span>
                      </>
                    )}
                  </button>
                </div>
              )
            )}

            {/* TAB 7: METRICS / MEDICIÓN (EXACT MATCH TO PICTURE 3) */}
            {inspectorTab === 'metrics' && (
              <div className="space-y-3">
                {/* File Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{t.fileInfo}</span>
                    <button
                      type="button"
                      onClick={() => setUnit((u) => (u === 'cm' ? 'px' : 'cm'))}
                      className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-400 rounded-xs font-mono"
                    >
                      {unit}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={
                      selectedElement
                        ? `${selectedElement.kind.toUpperCase()} · ${selectedElement.id}`
                        : `${doc.title} (${doc.pages.length}p)`
                    }
                    className="w-full h-6 bg-white border border-slate-400 rounded-xs px-2 text-[10px] text-slate-700"
                  />
                </div>

                {/* Size */}
                <div className="space-y-1.5 border-t border-slate-300 pt-2">
                  <div className="font-bold text-slate-800">{t.sizeLabel}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step={unit === 'cm' ? 0.05 : 1}
                          value={
                            selectedElement
                              ? pxToUnit(selectedElement.width)
                              : pxToUnit(doc.pageWidth)
                          }
                          onChange={(e) => {
                            const nextW = Math.max(
                              24,
                              unitToPx(Number(e.target.value) || 1)
                            );
                            if (selectedElement) {
                              const patch: Record<string, unknown> = { width: nextW };
                              if (constrainProps && selectedElement.width > 0) {
                                patch.height = Math.max(
                                  24,
                                  Math.round(
                                    (selectedElement.height / selectedElement.width) *
                                      nextW
                                  )
                                );
                              }
                              onUpdateElement(selectedElement.id, patch);
                            } else {
                              onChangePageSize('custom', nextW, doc.pageHeight);
                            }
                          }}
                          className="w-full h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                        />
                        <span className="text-[10px] text-slate-500">{unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 text-center mt-0.5">
                        {t.width}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step={unit === 'cm' ? 0.05 : 1}
                          value={
                            selectedElement
                              ? pxToUnit(selectedElement.height)
                              : pxToUnit(doc.pageHeight)
                          }
                          onChange={(e) => {
                            const nextH = Math.max(
                              24,
                              unitToPx(Number(e.target.value) || 1)
                            );
                            if (selectedElement) {
                              const patch: Record<string, unknown> = { height: nextH };
                              if (constrainProps && selectedElement.height > 0) {
                                patch.width = Math.max(
                                  24,
                                  Math.round(
                                    (selectedElement.width / selectedElement.height) *
                                      nextH
                                  )
                                );
                              }
                              onUpdateElement(selectedElement.id, patch);
                            } else {
                              onChangePageSize('custom', doc.pageWidth, nextH);
                            }
                          }}
                          className="w-full h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                        />
                        <span className="text-[10px] text-slate-500">{unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 text-center mt-0.5">
                        {t.height}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={constrainProps}
                      onChange={(e) => setConstrainProps(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>{t.constrainProportions}</span>
                  </label>

                  <button
                    type="button"
                    disabled={!selectedElement}
                    onClick={() => {
                      if (!selectedElement) return;
                      onUpdateElement(selectedElement.id, {
                        rotation: 0,
                        ...(isPanel
                          ? {
                              imageScale: 1,
                              imageOffsetX: 0,
                              imageOffsetY: 0,
                              flipX: false,
                              flipY: false,
                            }
                          : {}),
                      });
                    }}
                    className="w-full h-6 bg-white hover:bg-slate-50 disabled:opacity-45 border border-slate-400 rounded-xs text-[11px] font-medium shadow-2xs"
                  >
                    {t.originalSize}
                  </button>
                </div>

                {/* Position */}
                <div className="space-y-1.5 border-t border-slate-300 pt-2">
                  <div className="font-bold text-slate-800">{t.positionLabel}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step={unit === 'cm' ? 0.1 : 1}
                          disabled={!selectedElement}
                          value={selectedElement ? pxToUnit(selectedElement.x) : 0}
                          onChange={(e) =>
                            selectedElement &&
                            onUpdateElement(selectedElement.id, {
                              x: unitToPx(Number(e.target.value) || 0),
                            })
                          }
                          className="w-full h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums disabled:opacity-50"
                        />
                        <span className="text-[10px] text-slate-500">{unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 text-center mt-0.5">
                        X
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step={unit === 'cm' ? 0.1 : 1}
                          disabled={!selectedElement}
                          value={selectedElement ? pxToUnit(selectedElement.y) : 0}
                          onChange={(e) =>
                            selectedElement &&
                            onUpdateElement(selectedElement.id, {
                              y: unitToPx(Number(e.target.value) || 0),
                            })
                          }
                          className="w-full h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums disabled:opacity-50"
                        />
                        <span className="text-[10px] text-slate-500">{unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 text-center mt-0.5">
                        Y
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rotate & Flip */}
                <div className="space-y-1.5 border-t border-slate-300 pt-2">
                  <div className="font-bold text-slate-800">{t.rotateLabel}</div>
                  <div className="flex items-center justify-between gap-2">
                    {/* Interactive angle dial */}
                    <div
                      onClick={(e) => {
                        if (!selectedElement) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const angle = Math.round(
                          (Math.atan2(
                            e.clientY - (rect.top + rect.height / 2),
                            e.clientX - (rect.left + rect.width / 2)
                          ) *
                            180) /
                            Math.PI
                        );
                        onUpdateElement(selectedElement.id, { rotation: angle });
                      }}
                      title="Click dial to rotate"
                      className="w-8 h-8 rounded-full bg-white border border-slate-500 relative cursor-pointer shrink-0 shadow-inner"
                    >
                      <div
                        className="absolute left-1/2 top-1/2 w-3.5 h-0.5 bg-blue-600 origin-left"
                        style={{
                          transform: `translateY(-50%) rotate(${selectedElement?.rotation ?? 0}deg)`,
                        }}
                      />
                    </div>

                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        disabled={!selectedElement}
                        value={selectedElement?.rotation ?? 0}
                        onChange={(e) =>
                          selectedElement &&
                          onUpdateElement(selectedElement.id, {
                            rotation: Number(e.target.value) || 0,
                          })
                        }
                        className="w-14 h-6 bg-white border border-slate-400 rounded-xs px-1 text-right tabular-nums disabled:opacity-50"
                      />
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        {t.angleLabel}°
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!isPanel}
                        onClick={() =>
                          selectedElement?.kind === 'panel' &&
                          onUpdateElement(selectedElement.id, {
                            flipX: !selectedElement.flipX,
                          })
                        }
                        title="Flip Image Horizontal"
                        className="p-1 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs disabled:opacity-40"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={!isPanel}
                        onClick={() =>
                          selectedElement?.kind === 'panel' &&
                          onUpdateElement(selectedElement.id, {
                            flipY: !selectedElement.flipY,
                          })
                        }
                        title="Flip Image Vertical"
                        className="p-1 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs disabled:opacity-40"
                      >
                        <FlipVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: TEXT & TYPOGRAPHY */}
            {inspectorTab === 'text' && (
              !(isBalloon || isLettering) ? (
                <div className="py-4 text-center space-y-2.5">
                  <p className="text-slate-500">{t.selectElementHint}</p>
                  <button
                    type="button"
                    onClick={onInsertTextBox}
                    className="px-3 py-1.5 bg-[#1d5ec4] text-white rounded-xs font-semibold hover:bg-blue-700"
                  >
                    {t.insertTextBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <label className="block font-semibold mb-1">{t.fonts}</label>
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          fontFamily: e.target.value,
                        })
                      }
                      className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2"
                    >
                      {allFonts.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-0.5">
                      <span className="text-[10px] text-slate-600">{t.fontSize}</span>
                      <input
                        type="number"
                        min={8}
                        max={160}
                        value={selectedElement.fontSize}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            fontSize: Math.max(8, Number(e.target.value)),
                          })
                        }
                        className="w-full h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                      />
                    </label>
                    {isBalloon && (
                      <label className="space-y-0.5">
                        <span className="text-[10px] text-slate-600">Color</span>
                        <input
                          type="color"
                          value={selectedElement.textColor}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              textColor: e.target.value,
                            })
                          }
                          className="w-full h-6 bg-white border border-slate-400 rounded-xs cursor-pointer"
                        />
                      </label>
                    )}
                  </div>

                  {isBalloon && (
                    <div className="grid grid-cols-2 gap-2">
                      <label className="space-y-0.5">
                        <span className="text-[10px] text-slate-600">
                          {t.lineHeight}
                        </span>
                        <input
                          type="number"
                          step={0.1}
                          min={0.8}
                          max={2.4}
                          value={selectedElement.lineHeight ?? 1.2}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              lineHeight: Math.max(0.8, Number(e.target.value)),
                            })
                          }
                          className="w-full h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                        />
                      </label>
                      <label className="space-y-0.5">
                        <span className="text-[10px] text-slate-600">
                          {t.letterSpacing}
                        </span>
                        <input
                          type="number"
                          step={0.5}
                          min={-2}
                          max={12}
                          value={selectedElement.letterSpacing ?? 0}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              letterSpacing: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                        />
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      {(['left', 'center', 'right', 'justify'] as const).map((al) => (
                        <button
                          key={al}
                          type="button"
                          onClick={() =>
                            onUpdateElement(selectedElement.id, { textAlign: al })
                          }
                          className={`p-1 border rounded-xs ${
                            selectedElement.textAlign === al
                              ? 'bg-blue-600 text-white border-blue-700'
                              : 'bg-white border-slate-400'
                          }`}
                        >
                          {al === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                          {al === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                          {al === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                          {al === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={onInsertTextBox}
                      className="px-2 py-1 bg-white border border-slate-400 rounded-xs text-[10px] font-semibold hover:bg-slate-50"
                    >
                      {t.insertTextBtn}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 2. COLORS WHEEL PICKER FLOATING WINDOW */}
      {showColors && (
        <ColorWheelPicker
          t={t}
          currentColor={activeColorValue}
          currentOpacity={selectedElement ? selectedElement.opacity : 100}
          target={colorTarget}
          onChangeTarget={setColorTarget}
          onApplyColor={applyColorValue}
          onChangeOpacity={(op) => {
            if (selectedElement) {
              onUpdateElement(selectedElement.id, { opacity: op });
            }
          }}
          onClose={onCloseColors}
          bringFrontSignal={bringFrontSignal}
        />
      )}

      {/* 3. FONTS & EXTERNAL FONT LOADER FLOATING WINDOW */}
      {showFonts && (
        <div
          style={{ left: `${fontsPos.x}px`, top: `${fontsPos.y}px` }}
          className="no-print fixed w-[276px] bg-[#eceef1] border border-slate-500 rounded shadow-2xl z-40 overflow-hidden text-[11px] select-none"
        >
          <div
            onPointerDown={(e) => {
              dragWinRef.current = {
                which: 'fonts',
                sx: e.clientX,
                sy: e.clientY,
                ox: fontsPos.x,
                oy: fontsPos.y,
              };
            }}
            className="h-7 bg-gradient-to-b from-[#f4f5f7] to-[#dadde2] border-b border-slate-400 px-2.5 flex items-center justify-between cursor-move"
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Type className="w-3.5 h-3.5 text-slate-700" />
              <span>{t.fonts}</span>
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onCloseFonts}
              className="p-0.5 hover:bg-slate-300 rounded text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2.5 space-y-2.5">
            {/* External Font Upload & Google Font (with Drop Zone) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setFontDropActive(true);
              }}
              onDragLeave={() => setFontDropActive(false)}
              onDrop={(e) => {
                setFontDropActive(false);
                if (e.dataTransfer.files?.length) {
                  e.preventDefault();
                  e.stopPropagation();
                  Array.from(e.dataTransfer.files).forEach((f) => {
                    if (/\.(ttf|otf|woff2?)$/i.test(f.name)) {
                      onAddCustomFontFile(f);
                    }
                  });
                }
              }}
              className={`bg-white border rounded p-2 space-y-2 transition-colors ${
                fontDropActive ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/40' : 'border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => fontFileInputRef.current?.click()}
                className="w-full py-1.5 bg-[#1d5ec4] hover:bg-blue-700 text-white rounded-xs font-semibold flex items-center justify-center gap-1.5 text-[10px]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.addFontFile}</span>
              </button>
              <input
                ref={fontFileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files?.length) {
                    Array.from(files).forEach((f) => onAddCustomFontFile(f));
                  }
                  e.target.value = '';
                }}
              />

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder={t.googleFontPlaceholder}
                  value={googleFontInput}
                  onChange={(e) => setGoogleFontInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && googleFontInput.trim()) {
                      onAddGoogleFont(googleFontInput.trim());
                      setGoogleFontInput('');
                    }
                  }}
                  className="flex-1 h-6 border border-slate-300 rounded-xs px-1.5 text-[10px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (googleFontInput.trim()) {
                      onAddGoogleFont(googleFontInput.trim());
                      setGoogleFontInput('');
                    }
                  }}
                  className="h-6 px-2 bg-slate-200 hover:bg-slate-300 rounded-xs font-semibold text-[10px]"
                >
                  {t.loadFontBtn}
                </button>
              </div>
            </div>

            {/* Font List (Click or Drag onto Text / Balloon / Lettering) */}
            <div className="max-h-40 overflow-y-auto border border-slate-300 rounded bg-white divide-y divide-slate-100">
              {allFonts.map((font) => {
                const isCustom = customFonts.some((cf) => cf.family === font);
                const active =
                  (isBalloon || isLettering) &&
                  selectedElement.fontFamily === font;
                return (
                  <button
                    key={font}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-comic-font', font);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => {
                      if (isBalloon || isLettering) {
                        onUpdateElement(selectedElement.id, { fontFamily: font });
                      }
                    }}
                    style={{ fontFamily: `"${font}", sans-serif` }}
                    title={`${font} (Click or drag onto text element)`}
                    className={`w-full text-left px-2.5 py-1.5 text-[13px] flex items-center justify-between cursor-grab active:cursor-grabbing ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <span className="truncate">{font}</span>
                    {isCustom && (
                      <span className="text-[9px] font-sans uppercase px-1 rounded bg-amber-100 text-amber-800 ml-1 shrink-0">
                        EXT
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2">
              {(isBalloon || isLettering) && (
                <label className="flex items-center gap-1">
                  <span className="font-semibold">{t.fontSize}</span>
                  <input
                    type="number"
                    min={8}
                    max={140}
                    value={selectedElement.fontSize}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        fontSize: Math.max(8, Number(e.target.value)),
                      })
                    }
                    className="w-14 h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-right tabular-nums"
                  />
                </label>
              )}

              <button
                type="button"
                onClick={onInsertTextBox}
                className="flex-1 h-6 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs font-semibold text-[10px]"
              >
                {t.insertTextBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SCRIPT EDITOR DRAWER */}
      {showScript && (
        <div className="no-print fixed left-[144px] bottom-[84px] w-[360px] max-h-[54vh] bg-[#fefefe] border border-slate-500 rounded shadow-2xl z-40 flex flex-col overflow-hidden text-[12px]">
          <div className="h-8 bg-gradient-to-b from-[#334155] to-[#1e293b] text-white px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.scriptDrawer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onApplyScriptToPage}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-[10px] font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Build to Page</span>
              </button>
              <button
                type="button"
                onClick={onCloseScript}
                className="p-0.5 hover:bg-white/15 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (e.dataTransfer.types.includes('Files')) {
                setScriptDropActive(true);
              }
            }}
            onDragLeave={() => setScriptDropActive(false)}
            onDrop={(e) => {
              setScriptDropActive(false);
              if (e.dataTransfer.files?.length && onImportScriptText) {
                const txtFile = Array.from(e.dataTransfer.files).find((f) =>
                  /\.(txt|md|script)$/i.test(f.name)
                );
                if (txtFile) {
                  e.preventDefault();
                  e.stopPropagation();
                  txtFile.text().then((raw) => onImportScriptText(raw));
                }
              }
            }}
            className={`p-2.5 overflow-y-auto space-y-2 flex-1 bg-slate-50 transition-colors ${
              scriptDropActive ? 'ring-2 ring-inset ring-emerald-500 bg-emerald-50/40' : ''
            }`}
          >
            {doc.script.map((entry, idx) => (
              <div
                key={entry.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-comic-script-index', String(idx));
                  e.dataTransfer.setData(
                    'application/x-comic-script-beat',
                    JSON.stringify(entry)
                  );
                  e.dataTransfer.effectAllowed = 'copyMove';
                }}
                onDragOver={(e) => {
                  if (e.dataTransfer.types.includes('application/x-comic-script-index')) {
                    e.preventDefault();
                    if (dragOverScriptIdx !== idx) setDragOverScriptIdx(idx);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverScriptIdx === idx) setDragOverScriptIdx(null);
                }}
                onDrop={(e) => {
                  setDragOverScriptIdx(null);
                  const srcStr = e.dataTransfer.getData('application/x-comic-script-index');
                  if (srcStr !== '') {
                    e.preventDefault();
                    e.stopPropagation();
                    const from = Number(srcStr);
                    if (!Number.isNaN(from) && from !== idx) {
                      const next = [...doc.script];
                      const [moved] = next.splice(from, 1);
                      next.splice(idx, 0, moved);
                      onUpdateScript(next);
                    }
                  }
                }}
                title="Drag to reorder or drop onto page"
                className={`bg-white border rounded p-2 space-y-1 shadow-2xs cursor-grab active:cursor-grabbing transition-all ${
                  dragOverScriptIdx === idx
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={entry.type}
                    onChange={(e) => {
                      const next = [...doc.script];
                      next[idx] = {
                        ...entry,
                        type: e.target.value as ScriptEntry['type'],
                      };
                      onUpdateScript(next);
                    }}
                    className="h-6 bg-slate-100 border border-slate-300 rounded px-1.5 text-[10px] font-bold uppercase text-slate-700"
                  >
                    <option value="page">Page</option>
                    <option value="panel">Panel</option>
                    <option value="dialogue">Dialogue</option>
                    <option value="caption">Caption</option>
                    <option value="sfx">SFX</option>
                  </select>

                  {entry.type === 'dialogue' && (
                    <input
                      type="text"
                      placeholder="SPEAKER"
                      value={entry.speaker || ''}
                      onChange={(e) => {
                        const next = [...doc.script];
                        next[idx] = { ...entry, speaker: e.target.value };
                        onUpdateScript(next);
                      }}
                      className="flex-1 h-6 border border-slate-300 rounded px-1.5 text-[11px] font-bold uppercase"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateScript(doc.script.filter((s) => s.id !== entry.id))
                    }
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={entry.text}
                  onChange={(e) => {
                    const next = [...doc.script];
                    next[idx] = { ...entry, text: e.target.value };
                    onUpdateScript(next);
                  }}
                  className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] resize-none outline-none focus:border-blue-500"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                onUpdateScript([
                  ...doc.script,
                  {
                    id: nextId('sc'),
                    type: 'dialogue',
                    speaker: 'HERO',
                    text: 'New comic dialogue line...',
                  },
                ])
              }
              className="w-full py-1.5 border border-dashed border-slate-400 rounded text-[11px] font-semibold text-slate-600 hover:bg-white flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Script Beat</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
