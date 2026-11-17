import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Link as LinkIcon, X } from 'lucide-react';
import {
  ComicDocument,
  ComicElement,
  ComicPage,
  ComicTemplate,
  CustomFontAsset,
  MediaAsset,
  PageLayoutPreset,
  PageSizeKey,
  PanelShape,
  ScriptEntry,
  StylePreset,
} from './types/comic';
import {
  BUILTIN_MEDIA_ASSETS,
  COMIC_TEMPLATES,
  PAGE_LAYOUT_PRESETS,
  PAGE_SIZES,
  STYLE_PRESETS,
  buildPageFromLayout,
  createBalloon,
  createInitialDocument,
  createLettering,
  createPanel,
  nextId,
} from './data/presets';
import {
  LanguageCode,
  TRANSLATIONS,
  detectInitialLanguage,
} from './i18n/translations';
import { renderPageToDataUrl, triggerDownload } from './utils/canvasExport';
import { MenuBar } from './components/MenuBar';
import { MainToolbar } from './components/MainToolbar';
import { FormatBar } from './components/FormatBar';
import { LeftSidebar } from './components/LeftSidebar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { BottomDock, DockItemType } from './components/BottomDock';
import { RightSidebar } from './components/RightSidebar';
import { FloatingPanels } from './components/FloatingPanels';
import { TemplateChooserModal } from './components/TemplateChooserModal';
import { PageSetupModal } from './components/PageSetupModal';
import { ExportModal, ExportMode } from './components/ExportModal';
import { PreviewModal } from './components/PreviewModal';
import { COMIC_STAMPS, ComicStampDef, StampsModal } from './components/StampsModal';

const STORAGE_DOC_KEY = 'comic4life_doc_v1';
const STORAGE_RECENT_KEY = 'comic4life_recent_v1';
const STORAGE_MEDIA_KEY = 'comic4life_media_v1';
const STORAGE_FONTS_KEY = 'comic4life_fonts_v1';
const STORAGE_LANG_KEY = 'comic4life_lang_v1';
const STORAGE_STARTUP_CHOOSER_KEY = 'comic4life_show_templates_on_start';
const STORAGE_USER_TEMPLATES_KEY = 'comic4life_user_templates_v1';

interface RecentItem {
  id: string;
  title: string;
  updatedAt: number;
}

function loadInitialDocument(): ComicDocument {
  try {
    const raw = localStorage.getItem(STORAGE_DOC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ComicDocument;
      if (parsed?.pages?.length) return parsed;
    }
  } catch {
    // Fallback to initial voyage demo
  }
  return createInitialDocument();
}

function loadInitialMedia(): MediaAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_MEDIA_KEY);
    if (raw) {
      const custom = JSON.parse(raw) as MediaAsset[];
      if (Array.isArray(custom)) {
        const ids = new Set(BUILTIN_MEDIA_ASSETS.map((a) => a.id));
        return [
          ...BUILTIN_MEDIA_ASSETS,
          ...custom.filter((c) => !ids.has(c.id)),
        ];
      }
    }
  } catch {
    // ignore
  }
  return BUILTIN_MEDIA_ASSETS;
}

function loadRecentList(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function loadCustomFonts(): CustomFontAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_FONTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

async function registerCustomFontInDocument(font: CustomFontAsset) {
  try {
    if (font.source === 'file') {
      const face = new FontFace(font.family, `url(${font.url})`);
      const loaded = await face.load();
      document.fonts.add(loaded);
    } else if (font.source === 'google') {
      const linkId = `gfont-${font.family.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = font.url;
        document.head.appendChild(link);
      }
    }
  } catch {
    // ignore invalid font load
  }
}

function cloneElementWithNewId(
  el: ComicElement,
  shiftX = 0,
  shiftY = 0
): ComicElement {
  if (el.kind === 'panel') {
    return {
      ...el,
      id: nextId('panel'),
      x: el.x + shiftX,
      y: el.y + shiftY,
      instantAlpha: { ...el.instantAlpha },
    };
  }
  if (el.kind === 'balloon') {
    return {
      ...el,
      id: nextId('balloon'),
      x: el.x + shiftX,
      y: el.y + shiftY,
      tail: {
        ...el.tail,
        tipX: el.tail.tipX + shiftX,
        tipY: el.tail.tipY + shiftY,
      },
    };
  }
  return {
    ...el,
    id: nextId('let'),
    x: el.x + shiftX,
    y: el.y + shiftY,
  };
}

function extractStyleFromElement(el: ComicElement): Record<string, unknown> {
  if (el.kind === 'panel') {
    return {
      fillColor: el.fillColor,
      fillEnabled: el.fillEnabled,
      strokeColor: el.strokeColor,
      strokeWidth: el.strokeWidth,
      strokeEnabled: el.strokeEnabled,
      shadow: el.shadow,
      cornerRadius: el.cornerRadius,
      opacity: el.opacity,
    };
  }
  if (el.kind === 'balloon') {
    return {
      fillColor: el.fillColor,
      fillEnabled: el.fillEnabled,
      strokeColor: el.strokeColor,
      strokeWidth: el.strokeWidth,
      strokeEnabled: el.strokeEnabled,
      textColor: el.textColor,
      fontFamily: el.fontFamily,
      fontSize: el.fontSize,
      cornerRadius: el.cornerRadius,
      shadow: el.shadow,
      opacity: el.opacity,
    };
  }
  return {
    fillTopColor: el.fillTopColor,
    fillBottomColor: el.fillBottomColor,
    strokeColor: el.strokeColor,
    strokeWidth: el.strokeWidth,
    strokeEnabled: el.strokeEnabled,
    fontFamily: el.fontFamily,
    fontSize: el.fontSize,
    shadow: el.shadow,
    opacity: el.opacity,
  };
}

export default function App() {
  const [lang, setLang] = useState<LanguageCode>(detectInitialLanguage);
  const t = TRANSLATIONS[lang];

  const [doc, setDoc] = useState<ComicDocument>(loadInitialDocument);
  const [past, setPast] = useState<ComicDocument[]>([]);
  const [future, setFuture] = useState<ComicDocument[]>([]);

  const [selectedPageId, setSelectedPageId] = useState<string>(
    () => doc.pages[0]?.id || 'page-1'
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(loadInitialMedia);
  const [recentDocs, setRecentDocs] = useState<RecentItem[]>(loadRecentList);
  const [customFonts, setCustomFonts] = useState<CustomFontAsset[]>(loadCustomFonts);

  const [zoom, setZoom] = useState<number>(0.78);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showBottomDock, setShowBottomDock] = useState(true);
  const [showFormatBar, setShowFormatBar] = useState(true);

  const [showInspector, setShowInspector] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [showStamps, setShowStamps] = useState(false);

  const [clipboardEl, setClipboardEl] = useState<ComicElement | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<Record<string, unknown> | null>(null);
  const [userTemplates, setUserTemplates] = useState<ComicTemplate[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_TEMPLATES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [showTemplatesOnStartup, setShowTemplatesOnStartup] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_STARTUP_CHOOSER_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [showTemplates, setShowTemplates] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_STARTUP_CHOOSER_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [showExport, setShowExport] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState<ExportMode>('pdf');
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [findMatchCase, setFindMatchCase] = useState(false);
  const [findCursor, setFindCursor] = useState(0);
  const [bringFrontSignal, setBringFrontSignal] = useState(0);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [imageUrlModalVal, setImageUrlModalVal] = useState('');

  const [saveFeedback, setSaveFeedback] = useState(false);
  const [printDataUrls, setPrintDataUrls] = useState<string[]>([]);

  const fileOpenRef = useRef<HTMLInputElement>(null);
  const imageInsertFileRef = useRef<HTMLInputElement>(null);
  const scriptImportRef = useRef<HTMLInputElement>(null);
  const historySnapshotRef = useRef<ComicDocument | null>(null);

  const activePageIndex = Math.max(
    0,
    doc.pages.findIndex((p) => p.id === selectedPageId)
  );
  const activePage = doc.pages[activePageIndex] || doc.pages[0];
  const selectedElement =
    activePage.elements.find((el) => el.id === selectedElementId) ?? null;

  // Register stored external fonts on mount
  useEffect(() => {
    customFonts.forEach((font) => {
      void registerCustomFontInDocument(font);
    });
  }, []);

  const handleChangeLang = useCallback((nextLang: LanguageCode) => {
    setLang(nextLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, nextLang);
    } catch {
      // ignore
    }
  }, []);

  // Persist current document gently on change
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_DOC_KEY, JSON.stringify(doc));
      } catch {
        // Ignore quota exceeded if large embedded photos
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [doc]);

  useEffect(() => {
    const cleanTitle = doc.title.replace(/\.comic4life$/i, '') || 'Untitled';
    const fullTitle = `${cleanTitle} — Comic4Life`;
    document.title = fullTitle;
    window.comic4lifeDesktop?.setTitle(fullTitle);
  }, [doc.title]);

  const mutateDoc = useCallback(
    (updater: (prev: ComicDocument) => ComicDocument, recordHistory = true) => {
      setDoc((prev) => {
        const next = updater(prev);
        if (recordHistory) {
          setPast((p) => [...p.slice(-39), prev]);
          setFuture([]);
          historySnapshotRef.current = null;
        } else if (!historySnapshotRef.current) {
          historySnapshotRef.current = prev;
        }
        return { ...next, updatedAt: Date.now() };
      });
    },
    []
  );

  const commitPendingHistory = useCallback(() => {
    if (historySnapshotRef.current) {
      const snap = historySnapshotRef.current;
      historySnapshotRef.current = null;
      setPast((p) => [...p.slice(-39), snap]);
      setFuture([]);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (!past.length) return;
    const previous = past[past.length - 1];
    historySnapshotRef.current = null;
    setPast(past.slice(0, -1));
    setFuture([doc, ...future.slice(0, 39)]);
    setDoc(previous);
    if (!previous.pages.some((p) => p.id === selectedPageId)) {
      setSelectedPageId(previous.pages[0]?.id || '');
    }
    setSelectedElementId(null);
    setEditingElementId(null);
  }, [past, future, doc, selectedPageId]);

  const handleRedo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    historySnapshotRef.current = null;
    setFuture(future.slice(1));
    setPast([...past.slice(-39), doc]);
    setDoc(next);
    if (!next.pages.some((p) => p.id === selectedPageId)) {
      setSelectedPageId(next.pages[0]?.id || '');
    }
    setSelectedElementId(null);
    setEditingElementId(null);
  }, [past, future, doc, selectedPageId]);

  const handleSave = useCallback(() => {
    const saved = { ...doc, updatedAt: Date.now() };
    try {
      localStorage.setItem(STORAGE_DOC_KEY, JSON.stringify(saved));
    } catch {
      // ignore main quota
    }
    try {
      localStorage.setItem(`comic4life_doc_${saved.id}`, JSON.stringify(saved));
    } catch {
      // ignore per-id quota if huge images
    }
    try {
      const nextRecents: RecentItem[] = [
        { id: saved.id, title: saved.title, updatedAt: saved.updatedAt },
        ...recentDocs.filter((r) => r.id !== saved.id),
      ].slice(0, 8);
      setRecentDocs(nextRecents);
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(nextRecents));
    } catch {
      // ignore
    }
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1600);
  }, [doc, recentDocs]);

  const handlePrint = useCallback(async () => {
    const rendered = await Promise.all(
      doc.pages.map((p) => renderPageToDataUrl(doc, p, 2, 'image/png', 0.95))
    );
    setPrintDataUrls(rendered.filter(Boolean));
    setTimeout(() => {
      window.print();
    }, 120);
  }, [doc]);

  const updateActivePage = useCallback(
    (patch: Partial<ComicPage>, recordHistory = true) => {
      mutateDoc(
        (prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === activePage.id ? { ...p, ...patch } : p
          ),
        }),
        recordHistory
      );
    },
    [activePage.id, mutateDoc]
  );

  const updateElement = useCallback(
    (id: string, patch: Record<string, unknown>, recordHistory = true) => {
      mutateDoc(
        (prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === activePage.id
              ? {
                  ...p,
                  elements: p.elements.map((el) =>
                    el.id === id ? ({ ...el, ...patch } as ComicElement) : el
                  ),
                }
              : p
          ),
        }),
        recordHistory
      );
    },
    [activePage.id, mutateDoc]
  );

  const insertDockItemAt = useCallback(
    (itemType: DockItemType, targetX?: number, targetY?: number) => {
      const cx = targetX ?? Math.round(doc.pageWidth / 2);
      const cy = targetY ?? Math.round(doc.pageHeight / 2);
      const maxZ = activePage.elements.reduce(
        (m, e) => Math.max(m, e.zIndex),
        10
      );

      let newEl: ComicElement;
      if (itemType === 'panel') {
        newEl = createPanel({
          x: Math.max(16, cx - 120),
          y: Math.max(16, cy - 110),
          width: 240,
          height: 220,
          strokeColor:
            activePage.backgroundColor === '#000000' ? '#ffffff' : '#000000',
          strokeWidth: 2,
          zIndex: Math.min(15, maxZ + 1),
        });
      } else if (itemType === 'lettering') {
        newEl = createLettering({
          x: Math.max(16, cx - 130),
          y: Math.max(16, cy - 45),
          width: 260,
          height: 90,
          zIndex: maxZ + 1,
        });
      } else {
        const w =
          itemType === 'caption' ? 230 : itemType === 'text' ? 220 : 165;
        const h = itemType === 'caption' ? 68 : itemType === 'text' ? 56 : 88;
        newEl = createBalloon({
          balloonType: itemType,
          x: Math.max(16, cx - w / 2),
          y: Math.max(16, cy - h / 2),
          width: w,
          height: h,
          textColor:
            itemType === 'text' && activePage.backgroundColor === '#000000'
              ? '#ffffff'
              : '#111827',
          zIndex: maxZ + 1,
        });
      }

      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === activePage.id
            ? { ...p, elements: [...p.elements, newEl] }
            : p
        ),
      }));
      setSelectedElementId(newEl.id);
    },
    [activePage, doc.pageWidth, doc.pageHeight, mutateDoc]
  );

  const handleDropAssetAt = useCallback(
    (url: string, x: number, y: number, explicitPanelId?: string) => {
      const panels = activePage.elements
        .filter((e) => e.kind === 'panel')
        .sort((a, b) => b.zIndex - a.zIndex);

      const hitPanel = explicitPanelId
        ? panels.find((p) => p.id === explicitPanelId)
        : panels.find(
            (p) =>
              x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height
          );

      if (hitPanel) {
        updateElement(hitPanel.id, {
          imageUrl: url,
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0,
          imageRotation: 0,
          imageFit: 'cover',
        });
        setSelectedElementId(hitPanel.id);
        return;
      }

      const newPanel = createPanel({
        x: Math.max(16, x - 130),
        y: Math.max(16, y - 100),
        width: 260,
        height: 200,
        strokeColor:
          activePage.backgroundColor === '#000000' ? '#ffffff' : '#000000',
        strokeWidth: 2,
        imageUrl: url,
        zIndex: 5,
      });
      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === activePage.id
            ? { ...p, elements: [...p.elements, newPanel] }
            : p
        ),
      }));
      setSelectedElementId(newPanel.id);
    },
    [activePage, mutateDoc, updateElement]
  );

  const handleSelectMediaAsset = useCallback(
    (url: string) => {
      if (selectedElement?.kind === 'panel') {
        updateElement(selectedElement.id, {
          imageUrl: url,
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0,
        });
      } else {
        const emptyPanel = activePage.elements.find(
          (e) => e.kind === 'panel' && !e.imageUrl
        );
        if (emptyPanel) {
          updateElement(emptyPanel.id, { imageUrl: url });
          setSelectedElementId(emptyPanel.id);
        } else {
          handleDropAssetAt(url, doc.pageWidth / 2, doc.pageHeight / 2);
        }
      }
    },
    [
      selectedElement,
      activePage.elements,
      doc.pageWidth,
      doc.pageHeight,
      updateElement,
      handleDropAssetAt,
    ]
  );

  const handleUploadMedia = useCallback((newAssets: MediaAsset[]) => {
    setMediaAssets((prev) => {
      const merged = [...newAssets, ...prev];
      try {
        const customOnly = merged.filter(
          (a) => !BUILTIN_MEDIA_ASSETS.some((b) => b.id === a.id)
        );
        localStorage.setItem(STORAGE_MEDIA_KEY, JSON.stringify(customOnly));
      } catch {
        // ignore quota
      }
      return merged;
    });
  }, []);

  const handleAddCustomFontFile = useCallback(
    (file: File) => {
      const family = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9 _-]/g, '');
      if (!family) return;
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result !== 'string') return;
        const entry: CustomFontAsset = {
          id: nextId('font'),
          family,
          source: 'file',
          url: reader.result,
        };
        await registerCustomFontInDocument(entry);
        setCustomFonts((prev) => {
          const next = [entry, ...prev.filter((f) => f.family !== family)];
          try {
            localStorage.setItem(STORAGE_FONTS_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
        if (
          selectedElement &&
          (selectedElement.kind === 'balloon' ||
            selectedElement.kind === 'lettering')
        ) {
          updateElement(selectedElement.id, { fontFamily: family });
        }
      };
      reader.readAsDataURL(file);
    },
    [selectedElement, updateElement]
  );

  const handleAddGoogleFont = useCallback(
    async (familyName: string) => {
      const clean = familyName.trim();
      if (!clean) return;
      const encoded = encodeURIComponent(clean).replace(/%20/g, '+');
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,400;0,700;1,400&display=swap`;
      const entry: CustomFontAsset = {
        id: nextId('gfont'),
        family: clean,
        source: 'google',
        url: cssUrl,
      };
      await registerCustomFontInDocument(entry);
      setCustomFonts((prev) => {
        const next = [entry, ...prev.filter((f) => f.family !== clean)];
        try {
          localStorage.setItem(STORAGE_FONTS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      if (
        selectedElement &&
        (selectedElement.kind === 'balloon' ||
          selectedElement.kind === 'lettering')
      ) {
        updateElement(selectedElement.id, { fontFamily: clean });
      }
    },
    [selectedElement, updateElement]
  );

  const handleDuplicateSelected = useCallback(() => {
    if (!selectedElement) return;
    const maxZ = activePage.elements.reduce((m, e) => Math.max(m, e.zIndex), 1);
    const copy = cloneElementWithNewId(selectedElement, 22, 22);
    copy.zIndex = maxZ + 1;

    mutateDoc((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePage.id
          ? { ...p, elements: [...p.elements, copy] }
          : p
      ),
    }));
    setSelectedElementId(copy.id);
  }, [selectedElement, activePage.id, activePage.elements, mutateDoc]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedElement || selectedElement.locked) return;
    const targetId = selectedElement.id;
    mutateDoc((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePage.id
          ? {
              ...p,
              elements: p.elements.filter((el) => el.id !== targetId),
            }
          : p
      ),
    }));
    setSelectedElementId(null);
    setEditingElementId(null);
  }, [selectedElement, activePage.id, mutateDoc]);

  const reorderSelectedZ = useCallback(
    (mode: 'forward' | 'backward' | 'front' | 'back') => {
      if (!selectedElement) return;
      const ordered = activePage.elements
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex);
      const idx = ordered.findIndex((e) => e.id === selectedElement.id);
      if (idx === -1) return;

      if (mode === 'forward' && idx < ordered.length - 1) {
        [ordered[idx], ordered[idx + 1]] = [ordered[idx + 1], ordered[idx]];
      } else if (mode === 'backward' && idx > 0) {
        [ordered[idx], ordered[idx - 1]] = [ordered[idx - 1], ordered[idx]];
      } else if (mode === 'front' && idx < ordered.length - 1) {
        const [item] = ordered.splice(idx, 1);
        ordered.push(item);
      } else if (mode === 'back' && idx > 0) {
        const [item] = ordered.splice(idx, 1);
        ordered.unshift(item);
      } else {
        return;
      }

      const zMap = new Map<string, number>();
      ordered.forEach((el, i) => zMap.set(el.id, i + 1));

      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === activePage.id
            ? {
                ...p,
                elements: p.elements.map((el) => ({
                  ...el,
                  zIndex: zMap.get(el.id) ?? el.zIndex,
                })),
              }
            : p
        ),
      }));
    },
    [selectedElement, activePage.id, activePage.elements, mutateDoc]
  );

  const handleBringForward = useCallback(
    () => reorderSelectedZ('forward'),
    [reorderSelectedZ]
  );

  const handleSendBackward = useCallback(
    () => reorderSelectedZ('backward'),
    [reorderSelectedZ]
  );

  const handleBringToFront = useCallback(
    () => reorderSelectedZ('front'),
    [reorderSelectedZ]
  );

  const handleSendToBack = useCallback(
    () => reorderSelectedZ('back'),
    [reorderSelectedZ]
  );

  const handleAddBlankPage = useCallback(() => {
    const newPage: ComicPage = {
      id: nextId('page'),
      backgroundColor: activePage.backgroundColor,
      backgroundPattern: 'none',
      margin: activePage.margin,
      margins: activePage.margins ? { ...activePage.margins } : undefined,
      gutter: activePage.gutter,
      elements: [],
    };
    mutateDoc((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));
    setSelectedPageId(newPage.id);
    setSelectedElementId(null);
    setEditingElementId(null);
  }, [activePage, mutateDoc]);

  const handleAddPage = useCallback(
    (layout?: PageLayoutPreset) => {
      const preset = layout || PAGE_LAYOUT_PRESETS[3];
      const newPage = buildPageFromLayout(preset, doc.pageWidth, doc.pageHeight, {
        backgroundColor: activePage.backgroundColor,
        strokeColor:
          activePage.backgroundColor === '#000000' ? '#ffffff' : '#000000',
        strokeWidth: 2,
      });
      mutateDoc((prev) => ({
        ...prev,
        pages: [...prev.pages, newPage],
      }));
      setSelectedPageId(newPage.id);
      setSelectedElementId(null);
    },
    [doc.pageWidth, doc.pageHeight, activePage.backgroundColor, mutateDoc]
  );

  const handleDuplicatePage = useCallback(
    (pageId: string) => {
      const target = doc.pages.find((p) => p.id === pageId);
      if (!target) return;
      const cloned: ComicPage = {
        ...target,
        id: nextId('page'),
        margins: target.margins ? { ...target.margins } : undefined,
        elements: target.elements.map((el) => cloneElementWithNewId(el)),
      };
      const idx = doc.pages.findIndex((p) => p.id === pageId);
      mutateDoc((prev) => {
        const nextPages = [...prev.pages];
        nextPages.splice(idx + 1, 0, cloned);
        return { ...prev, pages: nextPages };
      });
      setSelectedPageId(cloned.id);
    },
    [doc.pages, mutateDoc]
  );

  const handleDeletePage = useCallback(
    (pageId: string) => {
      if (doc.pages.length <= 1) return;
      const idx = doc.pages.findIndex((p) => p.id === pageId);
      const remaining = doc.pages.filter((p) => p.id !== pageId);
      mutateDoc((prev) => ({
        ...prev,
        pages: remaining,
      }));
      if (selectedPageId === pageId) {
        setSelectedPageId(remaining[Math.max(0, idx - 1)].id);
      }
      setSelectedElementId(null);
    },
    [doc.pages, selectedPageId, mutateDoc]
  );

  const handleMovePage = useCallback(
    (pageId: string, dir: -1 | 1) => {
      const idx = doc.pages.findIndex((p) => p.id === pageId);
      const targetIdx = idx + dir;
      if (idx < 0 || targetIdx < 0 || targetIdx >= doc.pages.length) return;
      mutateDoc((prev) => {
        const next = [...prev.pages];
        const [item] = next.splice(idx, 1);
        next.splice(targetIdx, 0, item);
        return { ...prev, pages: next };
      });
    },
    [doc.pages, mutateDoc]
  );

  const handleReorderPage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= doc.pages.length ||
        toIndex >= doc.pages.length
      ) {
        return;
      }
      mutateDoc((prev) => {
        const next = [...prev.pages];
        const [item] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, item);
        return { ...prev, pages: next };
      });
    },
    [doc.pages.length, mutateDoc]
  );

  const handleApplyLayout = useCallback(
    (layout: PageLayoutPreset, targetPageId?: string) => {
      const targetPage =
        (targetPageId ? doc.pages.find((p) => p.id === targetPageId) : null) ||
        activePage;
      const existingImages = targetPage.elements
        .filter((e) => e.kind === 'panel')
        .map((p) => p.imageUrl);
      const nonPanels = targetPage.elements.filter((e) => e.kind !== 'panel');
      const rebuilt = buildPageFromLayout(layout, doc.pageWidth, doc.pageHeight, {
        backgroundColor: targetPage.backgroundColor,
        strokeColor:
          targetPage.backgroundColor === '#000000' ? '#ffffff' : '#000000',
        strokeWidth: 2,
        existingImages,
      });
      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === targetPage.id
            ? { ...p, elements: [...rebuilt.elements, ...nonPanels] }
            : p
        ),
      }));
      setSelectedPageId(targetPage.id);
      setSelectedElementId(null);
    },
    [doc.pages, activePage, doc.pageWidth, doc.pageHeight, mutateDoc]
  );

  const handleApplyTemplateToPage = useCallback(
    (tpl: ComicTemplate, targetPageId?: string) => {
      const targetPage =
        (targetPageId ? doc.pages.find((p) => p.id === targetPageId) : null) ||
        activePage;

      if (tpl.savedPages?.length) {
        const srcPage = tpl.savedPages[0];
        const clonedElements = srcPage.elements.map((el) => cloneElementWithNewId(el));
        mutateDoc((prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === targetPage.id
              ? {
                  ...p,
                  backgroundColor: srcPage.backgroundColor,
                  backgroundPattern: srcPage.backgroundPattern,
                  margin: srcPage.margin,
                  margins: srcPage.margins ? { ...srcPage.margins } : p.margins,
                  gutter: srcPage.gutter,
                  elements: clonedElements,
                }
              : p
          ),
        }));
        setSelectedPageId(targetPage.id);
        setSelectedElementId(null);
        return;
      }

      const layout =
        PAGE_LAYOUT_PRESETS.find((l) => l.id === tpl.layoutId) ||
        PAGE_LAYOUT_PRESETS[0];
      const existingImages = targetPage.elements
        .filter((e) => e.kind === 'panel')
        .map((p) => p.imageUrl);
      const rebuilt = buildPageFromLayout(layout, doc.pageWidth, doc.pageHeight, {
        backgroundColor: tpl.pageBg,
        strokeColor: tpl.defaultPanelStroke,
        strokeWidth: tpl.defaultPanelWidth,
        existingImages,
        headerBanner: tpl.headerBanner,
      });
      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === targetPage.id
            ? {
                ...p,
                backgroundColor: tpl.pageBg,
                backgroundPattern: tpl.pagePattern ?? p.backgroundPattern,
                elements: rebuilt.elements,
              }
            : p
        ),
      }));
      setSelectedPageId(targetPage.id);
      setSelectedElementId(null);
    },
    [doc.pages, activePage, doc.pageWidth, doc.pageHeight, mutateDoc]
  );

  const handleChooseTemplate = useCallback(
    (tpl: ComicTemplate) => {
      if (tpl.savedPages?.length) {
        const clonedPages: ComicPage[] = tpl.savedPages.map((sp) => ({
          ...sp,
          id: nextId('page'),
          margins: sp.margins ? { ...sp.margins } : undefined,
          elements: sp.elements.map((el) => cloneElementWithNewId(el)),
        }));
        const newDoc: ComicDocument = {
          id: nextId('doc'),
          title: `${tpl.name.toLowerCase().replace(/\s+/g, '-')}.comic4life`,
          pageSize: doc.pageSize,
          pageWidth: doc.pageWidth,
          pageHeight: doc.pageHeight,
          pages: clonedPages,
          script: tpl.scriptLines?.length
            ? tpl.scriptLines.map((s) => ({ ...s, id: nextId('sc') }))
            : [{ id: nextId('sc'), type: 'page', text: 'PAGE 1' }],
          updatedAt: Date.now(),
        };
        mutateDoc(() => newDoc);
        setSelectedPageId(clonedPages[0].id);
        setSelectedElementId(null);
        setShowTemplates(false);
        return;
      }

      const layout =
        PAGE_LAYOUT_PRESETS.find((l) => l.id === tpl.layoutId) ||
        PAGE_LAYOUT_PRESETS[0];
      const page = buildPageFromLayout(layout, doc.pageWidth, doc.pageHeight, {
        backgroundColor: tpl.pageBg,
        backgroundPattern: tpl.pagePattern,
        fontFamily: tpl.defaultFontFamily,
        strokeColor: tpl.defaultPanelStroke,
        strokeWidth: tpl.defaultPanelWidth,
        headerBanner: tpl.headerBanner,
      });

      if (tpl.sampleElements?.length) {
        tpl.sampleElements.forEach((se, i) => {
          if (se.kind === 'lettering') {
            page.elements.push(
              createLettering({
                text: se.text,
                fontFamily: tpl.defaultFontFamily || 'Bangers',
                x: se.x,
                y: se.y,
                width: se.w,
                height: se.h,
                zIndex: 30 + i,
              })
            );
          } else {
            page.elements.push(
              createBalloon({
                balloonType: se.balloonType || 'speech',
                fontFamily: tpl.defaultFontFamily || 'Comic Neue',
                text: se.text,
                x: se.x,
                y: se.y,
                width: se.w,
                height: se.h,
                fillColor: tpl.defaultBalloonFill,
                zIndex: 25 + i,
              })
            );
          }
        });
      }

      const newDoc: ComicDocument = {
        id: nextId('doc'),
        title: `${tpl.name.toLowerCase().replace(/\s+/g, '-')}.comic4life`,
        pageSize: doc.pageSize,
        pageWidth: doc.pageWidth,
        pageHeight: doc.pageHeight,
        pages: [page],
        script: tpl.scriptLines || [
          { id: nextId('sc'), type: 'page', text: 'PAGE 1' },
          { id: nextId('sc'), type: 'panel', text: 'PANEL 1 - Opening scene.' },
          { id: nextId('sc'), type: 'dialogue', speaker: 'HERO', text: 'Let the story begin!' },
        ],
        updatedAt: Date.now(),
      };

      mutateDoc(() => newDoc);
      setSelectedPageId(page.id);
      setSelectedElementId(null);
      setShowTemplates(false);
      if (tpl.group === 'Scripts') {
        setShowScript(true);
      }
    },
    [doc.pageSize, doc.pageWidth, doc.pageHeight, mutateDoc]
  );

  const handleApplyStylePreset = useCallback(
    (preset: StylePreset) => {
      if (preset.target === 'page') {
        const applyPage = preset.apply as Partial<ComicPage>;
        const nextBg = applyPage.backgroundColor;
        mutateDoc((prev) => ({
          ...prev,
          pages: prev.pages.map((p) => {
            if (p.id !== activePage.id) return p;
            const nextStroke =
              nextBg === '#000000' || nextBg === '#1e293b'
                ? '#ffffff'
                : nextBg
                  ? '#000000'
                  : null;
            return {
              ...p,
              ...applyPage,
              elements: nextStroke
                ? p.elements.map((el) =>
                    el.kind === 'panel' && !el.locked && (el.strokeColor === '#000000' || el.strokeColor === '#ffffff')
                      ? { ...el, strokeColor: nextStroke }
                      : el
                  )
                : p.elements,
            };
          }),
        }));
        return;
      }

      if (selectedElement && !selectedElement.locked) {
        if (selectedElement.kind === preset.target) {
          updateElement(selectedElement.id, preset.apply);
          return;
        }
        if (selectedElement.kind === 'panel') {
          const a = preset.apply as Record<string, unknown>;
          const mapped: Record<string, unknown> = {};
          if (typeof a.fillColor === 'string') mapped.fillColor = a.fillColor;
          else if (typeof a.fillTopColor === 'string') mapped.fillColor = a.fillTopColor;
          if (typeof a.strokeColor === 'string') mapped.strokeColor = a.strokeColor;
          if (typeof a.strokeWidth === 'number') {
            mapped.strokeWidth = a.strokeWidth;
            mapped.strokeEnabled = a.strokeWidth > 0;
          }
          if (typeof a.shadow === 'boolean') mapped.shadow = a.shadow;
          if (typeof a.shadowColor === 'string') mapped.shadowColor = a.shadowColor;
          if (Object.keys(mapped).length > 0) {
            updateElement(selectedElement.id, mapped);
            return;
          }
        }
      }

      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === activePage.id
            ? {
                ...p,
                elements: p.elements.map((el) =>
                  el.kind === preset.target && !el.locked
                    ? ({ ...el, ...preset.apply } as ComicElement)
                    : el
                ),
              }
            : p
        ),
      }));
    },
    [selectedElement, activePage.id, updateElement, mutateDoc]
  );

  const handleCyclePageStyle = useCallback(() => {
    const bgCycle = ['#000000', '#ffffff', '#f8fafc', '#fef3c7', '#1e293b'];
    const idx = bgCycle.indexOf(activePage.backgroundColor);
    const nextBg = bgCycle[(idx + 1) % bgCycle.length];
    const nextStroke =
      nextBg === '#000000' || nextBg === '#1e293b' ? '#ffffff' : '#000000';
    mutateDoc((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePage.id
          ? {
              ...p,
              backgroundColor: nextBg,
              elements: p.elements.map((el) =>
                el.kind === 'panel' ? { ...el, strokeColor: nextStroke } : el
              ),
            }
          : p
      ),
    }));
  }, [activePage, mutateDoc]);

  const handleApplyScriptToPage = useCallback(() => {
    const dialogueLines = doc.script.filter(
      (s) => s.type === 'dialogue' || s.type === 'caption' || s.type === 'sfx'
    );
    if (!dialogueLines.length) return;
    const created: ComicElement[] = dialogueLines.map((line, i) => {
      const y = 54 + i * 115;
      if (line.type === 'sfx') {
        return createLettering({
          text: line.text.toUpperCase(),
          x: 200,
          y,
          width: 260,
          height: 82,
          zIndex: 30 + i,
        });
      }
      if (line.type === 'caption') {
        return createBalloon({
          balloonType: 'caption',
          text: line.text,
          x: 48,
          y,
          width: 260,
          height: 64,
          zIndex: 20 + i,
        });
      }
      return createBalloon({
        balloonType: 'speech',
        text: line.speaker ? `${line.speaker}: ${line.text}` : line.text,
        x: 110 + (i % 2) * 180,
        y,
        width: 190,
        height: 82,
        zIndex: 20 + i,
      });
    });

    updateActivePage({
      elements: [...activePage.elements, ...created],
    });
  }, [doc.script, activePage.elements, updateActivePage]);

  const handleOpenRecent = useCallback(
    (id: string) => {
      try {
        const raw = localStorage.getItem(`comic4life_doc_${id}`);
        if (raw) {
          const loaded = JSON.parse(raw) as ComicDocument;
          if (loaded?.pages?.length) {
            mutateDoc(() => loaded);
            setSelectedPageId(loaded.pages[0].id);
            setSelectedElementId(null);
            setEditingElementId(null);
            setShowTemplates(false);
            return;
          }
        }
        // Clean stale recent item if payload was not persisted or evicted
        const cleaned = recentDocs.filter((r) => r.id !== id);
        setRecentDocs(cleaned);
        localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(cleaned));
      } catch {
        // ignore
      }
    },
    [mutateDoc, recentDocs]
  );

  const handleOpenComicJsonText = useCallback(
    (rawText: string) => {
      try {
        const parsed = JSON.parse(rawText) as ComicDocument;
        if (parsed?.pages?.length) {
          mutateDoc(() => parsed);
          setSelectedPageId(parsed.pages[0].id);
          setSelectedElementId(null);
          setShowTemplates(false);
        }
      } catch {
        // ignore invalid json
      }
    },
    [mutateDoc]
  );

  const handleOpenFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleOpenComicJsonText(String(reader.result));
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportSingleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const asset: MediaAsset = {
        id: nextId('img'),
        name: file.name.replace(/\.[^.]+$/, '').toUpperCase(),
        url: reader.result,
        folder: 'My Photos',
        createdAt: Date.now(),
      };
      handleUploadMedia([asset]);
      handleSelectMediaAsset(asset.url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleZoomFit = useCallback(() => {
    const area = document.getElementById('canvas-scroll-area');
    if (area && area.clientWidth > 100 && area.clientHeight > 100) {
      const fit = Math.min(
        (area.clientWidth - 80) / doc.pageWidth,
        (area.clientHeight - 80) / doc.pageHeight
      );
      setZoom(Math.max(0.25, Math.min(1.5, Number(fit.toFixed(2)))));
    } else {
      setZoom(0.78);
    }
  }, [doc.pageWidth, doc.pageHeight]);

  const handleSaveAsFile = useCallback(() => {
    const clean = doc.title.replace(/\.comic4life$/i, '') || 'comic';
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${clean}.comic4life`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [doc]);

  const handleSelectFirstOrAll = useCallback(() => {
    if (!activePage.elements.length) return;
    const idx = activePage.elements.findIndex((e) => e.id === selectedElementId);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % activePage.elements.length;
    setSelectedElementId(activePage.elements[nextIdx].id);
    setEditingElementId(null);
  }, [activePage.elements, selectedElementId]);

  const handleCopyStyle = useCallback(() => {
    if (!selectedElement) return;
    setCopiedStyle(extractStyleFromElement(selectedElement));
  }, [selectedElement]);

  const handleCutSelected = useCallback(() => {
    if (!selectedElement || selectedElement.locked) return;
    setClipboardEl(cloneElementWithNewId(selectedElement));
    setCopiedStyle(extractStyleFromElement(selectedElement));
    handleDeleteSelected();
  }, [selectedElement, handleDeleteSelected]);

  const handleCopySelected = useCallback(() => {
    if (!selectedElement) return;
    setClipboardEl(cloneElementWithNewId(selectedElement));
    setCopiedStyle(extractStyleFromElement(selectedElement));
  }, [selectedElement]);

  const handlePasteSelected = useCallback(() => {
    if (!clipboardEl) return;
    const maxZ = activePage.elements.reduce((m, e) => Math.max(m, e.zIndex), 1);
    const copy = cloneElementWithNewId(clipboardEl, 20, 20);
    copy.zIndex = maxZ + 1;
    mutateDoc((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePage.id ? { ...p, elements: [...p.elements, copy] } : p
      ),
    }));
    setSelectedElementId(copy.id);
  }, [clipboardEl, activePage.id, activePage.elements, mutateDoc]);

  const handlePasteStyle = useCallback(() => {
    if (!selectedElement || !copiedStyle) return;
    const s = copiedStyle;
    const filtered: Record<string, unknown> = {};
    if (selectedElement.kind === 'panel') {
      const keys = ['fillColor', 'fillEnabled', 'strokeColor', 'strokeWidth', 'strokeEnabled', 'shadow', 'cornerRadius', 'opacity'];
      keys.forEach((k) => {
        if (s[k] !== undefined) filtered[k] = s[k];
      });
      if (filtered.fillColor === undefined && typeof s.fillTopColor === 'string') {
        filtered.fillColor = s.fillTopColor;
      }
    } else if (selectedElement.kind === 'balloon') {
      const keys = ['fillColor', 'fillEnabled', 'strokeColor', 'strokeWidth', 'strokeEnabled', 'textColor', 'fontFamily', 'fontSize', 'cornerRadius', 'shadow', 'opacity'];
      keys.forEach((k) => {
        if (s[k] !== undefined) filtered[k] = s[k];
      });
      if (filtered.fillColor === undefined && typeof s.fillTopColor === 'string') {
        filtered.fillColor = s.fillTopColor;
      }
    } else {
      const keys = ['fillTopColor', 'fillBottomColor', 'strokeColor', 'strokeWidth', 'strokeEnabled', 'fontFamily', 'fontSize', 'shadow', 'opacity'];
      keys.forEach((k) => {
        if (s[k] !== undefined) filtered[k] = s[k];
      });
      if (filtered.fillTopColor === undefined && typeof s.fillColor === 'string') {
        filtered.fillTopColor = s.fillColor;
      }
    }
    if (Object.keys(filtered).length > 0) {
      updateElement(selectedElement.id, filtered);
    }
  }, [selectedElement, copiedStyle, updateElement]);

  const textStep = useCallback(
    (delta: number) => {
      if (!selectedElement || selectedElement.locked) return;
      if (selectedElement.kind === 'balloon' || selectedElement.kind === 'lettering') {
        const nextSize = Math.max(8, Math.min(144, selectedElement.fontSize + delta));
        updateElement(selectedElement.id, { fontSize: nextSize });
      } else if (selectedElement.kind === 'panel' && selectedElement.imageUrl) {
        const step = delta > 0 ? 0.1 : -0.1;
        const nextScale = Number(
          Math.max(0.2, Math.min(5, (selectedElement.imageScale || 1) + step)).toFixed(2)
        );
        updateElement(selectedElement.id, { imageScale: nextScale });
      }
    },
    [selectedElement, updateElement]
  );

  const handleNewBlankComic = useCallback(() => {
    const page = buildPageFromLayout(PAGE_LAYOUT_PRESETS[5], doc.pageWidth, doc.pageHeight, {
      backgroundColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
    });
    const newDoc: ComicDocument = {
      id: nextId('doc'),
      title: 'untitled.comic4life',
      pageSize: doc.pageSize,
      pageWidth: doc.pageWidth,
      pageHeight: doc.pageHeight,
      pages: [page],
      script: [{ id: nextId('sc'), type: 'page', text: 'PAGE 1' }],
      updatedAt: Date.now(),
    };
    mutateDoc(() => newDoc);
    setSelectedPageId(page.id);
    setSelectedElementId(null);
    setEditingElementId(null);
  }, [doc.pageSize, doc.pageWidth, doc.pageHeight, mutateDoc]);

  const handleAutoFillImages = useCallback(() => {
    if (!mediaAssets.length) return;
    let imgCursor = 0;
    mutateDoc((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === activePage.id
          ? {
              ...p,
              elements: p.elements.map((el) => {
                if (el.kind === 'panel' && !el.imageUrl) {
                  const asset = mediaAssets[imgCursor % mediaAssets.length];
                  imgCursor += 1;
                  return {
                    ...el,
                    imageUrl: asset.url,
                    imageScale: 1,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    imageRotation: 0,
                    imageFit: 'cover',
                  };
                }
                return el;
              }),
            }
          : p
      ),
    }));
  }, [mediaAssets, activePage.id, mutateDoc]);

  const handleImportScriptText = useCallback(
    (rawText: string) => {
      const lines = rawText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const entries: ScriptEntry[] = lines.map((line) => {
        if (/^page\s+\d+/i.test(line)) return { id: nextId('sc'), type: 'page', text: line };
        if (/^panel\s+\d+/i.test(line)) return { id: nextId('sc'), type: 'panel', text: line };
        if (/^sfx:/i.test(line)) return { id: nextId('sc'), type: 'sfx', text: line.replace(/^sfx:\s*/i, '') };
        if (/^caption:/i.test(line)) return { id: nextId('sc'), type: 'caption', text: line.replace(/^caption:\s*/i, '') };
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0 && colonIdx < 24) {
          return {
            id: nextId('sc'),
            type: 'dialogue',
            speaker: line.slice(0, colonIdx).trim(),
            text: line.slice(colonIdx + 1).trim(),
          };
        }
        return { id: nextId('sc'), type: 'dialogue', text: line };
      });
      if (entries.length) {
        mutateDoc((prev) => ({ ...prev, script: entries }));
        setShowScript(true);
      }
    },
    [mutateDoc]
  );

  const handleImportScriptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleImportScriptText(String(reader.result));
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveAsTemplate = useCallback(() => {
    const clean = doc.title.replace(/\.comic4life$/i, '') || 'Mi plantilla';
    const clonedPages: ComicPage[] = doc.pages.map((p) => ({
      ...p,
      id: nextId('tplpage'),
      margins: p.margins ? { ...p.margins } : undefined,
      elements: p.elements.map((el) => cloneElementWithNewId(el)),
    }));
    const tpl: ComicTemplate = {
      id: nextId('usertpl'),
      name: `${clean} (${doc.pages.length}p)`,
      category: 'Various',
      group: 'My Templates',
      accentColor: '#2563eb',
      pageBg: activePage.backgroundColor || '#ffffff',
      pagePattern: activePage.backgroundPattern,
      layoutId: PAGE_LAYOUT_PRESETS[0].id,
      defaultPanelStroke: '#000000',
      defaultPanelWidth: 2,
      defaultBalloonFill: '#ffffff',
      scriptLines: doc.script.map((s) => ({ ...s })),
      savedPages: clonedPages,
    };
    const next = [tpl, ...userTemplates].slice(0, 12);
    setUserTemplates(next);
    try {
      localStorage.setItem(STORAGE_USER_TEMPLATES_KEY, JSON.stringify(next));
    } catch {
      // Fallback: strip embedded base64 photos so structure still persists in localStorage
      try {
        const lightweight = next.map((item) => ({
          ...item,
          savedPages: item.savedPages?.map((sp) => ({
            ...sp,
            elements: sp.elements.map((el) =>
              el.kind === 'panel' && el.imageUrl?.startsWith('data:')
                ? { ...el, imageUrl: null }
                : el
            ),
          })),
        }));
        localStorage.setItem(STORAGE_USER_TEMPLATES_KEY, JSON.stringify(lightweight));
      } catch {
        // ignore
      }
    }
    setShowTemplates(true);
  }, [doc.title, doc.pages, doc.script, activePage.backgroundColor, activePage.backgroundPattern, userTemplates]);

  const handleDeleteUserTemplate = useCallback(
    (id: string) => {
      const next = userTemplates.filter((ut) => ut.id !== id);
      setUserTemplates(next);
      try {
        localStorage.setItem(STORAGE_USER_TEMPLATES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [userTemplates]
  );

  const handleAlignSelected = useCallback(
    (dir: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (!selectedElement || selectedElement.locked) return;
      const mLeft = activePage.margins?.left ?? activePage.margin;
      const mRight = activePage.margins?.right ?? activePage.margin;
      const mTop = activePage.margins?.top ?? activePage.margin;
      const mBottom = activePage.margins?.bottom ?? activePage.margin;

      if (dir === 'left') updateElement(selectedElement.id, { x: mLeft });
      if (dir === 'center')
        updateElement(selectedElement.id, {
          x: Math.round((doc.pageWidth - selectedElement.width) / 2),
        });
      if (dir === 'right')
        updateElement(selectedElement.id, {
          x: Math.max(0, doc.pageWidth - mRight - selectedElement.width),
        });
      if (dir === 'top') updateElement(selectedElement.id, { y: mTop });
      if (dir === 'middle')
        updateElement(selectedElement.id, {
          y: Math.round((doc.pageHeight - selectedElement.height) / 2),
        });
      if (dir === 'bottom')
        updateElement(selectedElement.id, {
          y: Math.max(0, doc.pageHeight - mBottom - selectedElement.height),
        });
    },
    [selectedElement, activePage.margin, activePage.margins, doc.pageWidth, doc.pageHeight, updateElement]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (e.key === 'F5') {
        e.preventDefault();
        setShowPreview((v) => !v);
        return;
      }

      if (mod && !e.altKey && key === 's') {
        e.preventDefault();
        if (e.shiftKey) handleSaveAsFile();
        else handleSave();
        return;
      }
      if (mod && !e.altKey && key === 'o') {
        e.preventDefault();
        fileOpenRef.current?.click();
        return;
      }
      if (mod && !e.altKey && key === 'p') {
        e.preventDefault();
        void handlePrint();
        return;
      }
      if (mod && !e.shiftKey && !e.altKey && key === 'q' && window.comic4lifeDesktop?.isElectron) {
        e.preventDefault();
        window.comic4lifeDesktop.quit();
        return;
      }
      if (mod && !e.altKey && key === 'f') {
        e.preventDefault();
        setShowFindModal(true);
        return;
      }
      if (mod && e.shiftKey && key === 'n') {
        e.preventDefault();
        setShowTemplates(true);
        return;
      }
      if (mod && e.shiftKey && key === 'b') {
        e.preventDefault();
        handleAddBlankPage();
        return;
      }
      if (mod && e.shiftKey && key === 'c') {
        e.preventDefault();
        setShowColors((v) => !v);
        return;
      }
      if (mod && !e.shiftKey && key === 'i' && !isInputFocused && !editingElementId) {
        e.preventDefault();
        setShowInspector((v) => !v);
        return;
      }
      if (mod && e.key === '1') {
        e.preventDefault();
        setShowLeftSidebar((v) => !v);
        return;
      }
      if (mod && e.key === '2') {
        e.preventDefault();
        setShowRightSidebar((v) => !v);
        return;
      }
      if (mod && e.key === '3') {
        e.preventDefault();
        setShowBottomDock((v) => !v);
        return;
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(2))));
        return;
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))));
        return;
      }
      if (mod && e.key === '0') {
        e.preventDefault();
        if (e.shiftKey) {
          if (selectedElement?.kind === 'panel' && selectedElement.imageUrl) {
            updateElement(selectedElement.id, {
              imageScale: 1,
              imageOffsetX: 0,
              imageOffsetY: 0,
              imageRotation: 0,
              imageFit: 'cover',
            });
          }
        } else {
          handleZoomFit();
        }
        return;
      }

      if (e.key === 'Escape') {
        setEditingElementId(null);
        setSelectedElementId(null);
        setShowShortcuts(false);
        setShowImageUrlModal(false);
        setShowFindModal(false);
        return;
      }

      if (isInputFocused || editingElementId) return;

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (mod && key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (mod && key === 'x') {
        e.preventDefault();
        handleCutSelected();
      } else if (mod && key === 'c' && !e.shiftKey) {
        e.preventDefault();
        handleCopySelected();
      } else if (mod && key === 'v') {
        e.preventDefault();
        if (e.shiftKey) handlePasteStyle();
        else handlePasteSelected();
      } else if (mod && key === 'd') {
        e.preventDefault();
        if (e.shiftKey) {
          if (doc.pages.length > 1) handleDeletePage(activePage.id);
        } else {
          handleDuplicateSelected();
        }
      } else if (mod && key === 'a') {
        e.preventDefault();
        handleSelectFirstOrAll();
      } else if (mod && key === 'l') {
        e.preventDefault();
        if (selectedElement) {
          updateElement(selectedElement.id, { locked: !e.shiftKey });
        }
      } else if (mod && e.key === '[') {
        e.preventDefault();
        handleBringToFront();
      } else if (mod && e.key === ']') {
        e.preventDefault();
        handleSendToBack();
      } else if (mod && e.altKey && key === 'f') {
        e.preventDefault();
        handleBringForward();
      } else if (mod && e.altKey && key === 'b') {
        e.preventDefault();
        handleSendBackward();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        handleDeleteSelected();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleSave,
    handleSaveAsFile,
    handlePrint,
    handleAddBlankPage,
    handleZoomFit,
    handleCutSelected,
    handleCopySelected,
    handlePasteSelected,
    handlePasteStyle,
    handleDuplicateSelected,
    handleDeleteSelected,
    handleDeletePage,
    handleSelectFirstOrAll,
    handleBringToFront,
    handleSendToBack,
    handleBringForward,
    handleSendBackward,
    updateElement,
    activePage.id,
    doc.pages.length,
    editingElementId,
    selectedElement,
    selectedElementId,
  ]);

  const handleInsertStamp = useCallback(
    (stamp: ComicStampDef, targetX?: number, targetY?: number) => {
      const maxZ = activePage.elements.reduce((m, e) => Math.max(m, e.zIndex), 15);
      const cx = targetX ?? Math.round(doc.pageWidth / 2);
      const cy = targetY ?? Math.round(doc.pageHeight / 2);
      const newEl =
        stamp.kind === 'lettering'
          ? createLettering({
              text: stamp.text,
              fontFamily: stamp.fontFamily,
              fillTopColor: stamp.fillTop,
              fillBottomColor: stamp.fillBottom,
              strokeColor: stamp.stroke,
              x: Math.max(8, cx - 120),
              y: Math.max(8, cy - 45),
              width: 240,
              height: 90,
              zIndex: maxZ + 1,
            })
          : createBalloon({
              balloonType: stamp.kind,
              text: stamp.text,
              fontFamily: stamp.fontFamily,
              fillColor: stamp.fillTop,
              strokeColor: stamp.stroke,
              textColor: stamp.textColor || '#111827',
              x: Math.max(8, cx - 95),
              y: Math.max(8, cy - 50),
              width: 190,
              height: 100,
              zIndex: maxZ + 1,
            });

      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === activePage.id ? { ...p, elements: [...p.elements, newEl] } : p
        ),
      }));
      setSelectedElementId(newEl.id);
    },
    [activePage.id, activePage.elements, doc.pageWidth, doc.pageHeight, mutateDoc]
  );

  const hitTestElementAt = useCallback(
    (x: number, y: number, kinds?: ComicElement['kind'][]) => {
      const sorted = activePage.elements
        .slice()
        .sort((a, b) => b.zIndex - a.zIndex);
      return sorted.find(
        (el) =>
          (!kinds || kinds.includes(el.kind)) &&
          x >= el.x &&
          x <= el.x + el.width &&
          y >= el.y &&
          y <= el.y + el.height
      );
    },
    [activePage.elements]
  );

  const handleDropStyleAt = useCallback(
    (styleId: string, x: number, y: number, explicitPageId?: string) => {
      const preset = STYLE_PRESETS.find((s) => s.id === styleId);
      if (!preset) return;
      if (preset.target === 'page') {
        const targetId = explicitPageId || activePage.id;
        const applyPage = preset.apply as Partial<ComicPage>;
        const nextBg = applyPage.backgroundColor;
        const nextStroke =
          nextBg === '#000000' || nextBg === '#1e293b'
            ? '#ffffff'
            : nextBg
              ? '#000000'
              : null;
        mutateDoc((prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === targetId
              ? {
                  ...p,
                  ...applyPage,
                  elements: nextStroke
                    ? p.elements.map((el) =>
                        el.kind === 'panel' && !el.locked && (el.strokeColor === '#000000' || el.strokeColor === '#ffffff')
                          ? { ...el, strokeColor: nextStroke }
                          : el
                      )
                    : p.elements,
                }
              : p
          ),
        }));
        return;
      }
      if (explicitPageId) {
        mutateDoc((prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === explicitPageId
              ? {
                  ...p,
                  elements: p.elements.map((el) =>
                    el.kind === preset.target && !el.locked
                      ? ({ ...el, ...preset.apply } as ComicElement)
                      : el
                  ),
                }
              : p
          ),
        }));
        return;
      }
      const hitSame = hitTestElementAt(x, y, [preset.target]);
      if (hitSame && !hitSame.locked) {
        updateElement(hitSame.id, preset.apply);
        setSelectedElementId(hitSame.id);
        return;
      }
      const hitAny = hitTestElementAt(x, y, ['lettering', 'balloon', 'panel']);
      if (hitAny && !hitAny.locked && hitAny.kind === 'panel') {
        const a = preset.apply as Record<string, unknown>;
        const mapped: Record<string, unknown> = {};
        if (typeof a.fillColor === 'string') mapped.fillColor = a.fillColor;
        else if (typeof a.fillTopColor === 'string') mapped.fillColor = a.fillTopColor;
        if (typeof a.strokeColor === 'string') mapped.strokeColor = a.strokeColor;
        if (typeof a.strokeWidth === 'number') {
          mapped.strokeWidth = a.strokeWidth;
          mapped.strokeEnabled = a.strokeWidth > 0;
        }
        if (typeof a.shadow === 'boolean') mapped.shadow = a.shadow;
        if (Object.keys(mapped).length > 0) {
          updateElement(hitAny.id, mapped);
          setSelectedElementId(hitAny.id);
          return;
        }
      }
      handleApplyStylePreset(preset);
    },
    [activePage.id, mutateDoc, hitTestElementAt, updateElement, handleApplyStylePreset]
  );

  const handleDropFontAt = useCallback(
    (fontFamily: string, x: number, y: number) => {
      const hit = hitTestElementAt(x, y, ['balloon', 'lettering']);
      if (hit) {
        updateElement(hit.id, { fontFamily });
        setSelectedElementId(hit.id);
      } else if (
        selectedElement &&
        (selectedElement.kind === 'balloon' || selectedElement.kind === 'lettering')
      ) {
        updateElement(selectedElement.id, { fontFamily });
      }
    },
    [hitTestElementAt, updateElement, selectedElement]
  );

  const handleDropColorAt = useCallback(
    (hex: string, x: number, y: number) => {
      const hit = hitTestElementAt(x, y);
      if (!hit) {
        updateActivePage({ backgroundColor: hex });
        return;
      }
      if (hit.kind === 'lettering') {
        updateElement(hit.id, { fillTopColor: hex });
      } else {
        updateElement(hit.id, { fillColor: hex, fillEnabled: true });
      }
      setSelectedElementId(hit.id);
    },
    [hitTestElementAt, updateActivePage, updateElement]
  );

  const handleDropColorOnPage = useCallback(
    (hex: string, pageId: string) => {
      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === pageId ? { ...p, backgroundColor: hex } : p
        ),
      }));
    },
    [mutateDoc]
  );

  const handleDropImageOnPage = useCallback(
    (url: string, pageId: string) => {
      setSelectedPageId(pageId);
      const targetPage = doc.pages.find((p) => p.id === pageId);
      if (!targetPage) return;
      const emptyPanel = targetPage.elements.find(
        (e) => e.kind === 'panel' && !e.imageUrl
      );
      if (emptyPanel) {
        mutateDoc((prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === pageId
              ? {
                  ...p,
                  elements: p.elements.map((el) =>
                    el.id === emptyPanel.id
                      ? ({
                          ...el,
                          imageUrl: url,
                          imageScale: 1,
                          imageOffsetX: 0,
                          imageOffsetY: 0,
                        } as ComicElement)
                      : el
                  ),
                }
              : p
          ),
        }));
        setSelectedElementId(emptyPanel.id);
      } else {
        const newPanel = createPanel({
          x: Math.round(doc.pageWidth / 2 - 130),
          y: Math.round(doc.pageHeight / 2 - 100),
          width: 260,
          height: 200,
          strokeColor:
            targetPage.backgroundColor === '#000000' ? '#ffffff' : '#000000',
          strokeWidth: 2,
          imageUrl: url,
          zIndex: 5,
        });
        mutateDoc((prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === pageId ? { ...p, elements: [...p.elements, newPanel] } : p
          ),
        }));
        setSelectedElementId(newPanel.id);
      }
    },
    [doc.pages, doc.pageWidth, doc.pageHeight, mutateDoc]
  );

  const handleDropScriptBeatAt = useCallback(
    (beat: ScriptEntry, x: number, y: number) => {
      const maxZ = activePage.elements.reduce((m, e) => Math.max(m, e.zIndex), 15);
      let newEl: ComicElement;
      if (beat.type === 'sfx') {
        newEl = createLettering({
          text: beat.text.toUpperCase(),
          x: Math.max(12, x - 125),
          y: Math.max(12, y - 40),
          width: 250,
          height: 82,
          zIndex: maxZ + 1,
        });
      } else if (beat.type === 'caption') {
        newEl = createBalloon({
          balloonType: 'caption',
          text: beat.text,
          x: Math.max(12, x - 120),
          y: Math.max(12, y - 32),
          width: 240,
          height: 64,
          zIndex: maxZ + 1,
        });
      } else {
        newEl = createBalloon({
          balloonType: 'speech',
          text: beat.speaker ? `${beat.speaker}: ${beat.text}` : beat.text,
          x: Math.max(12, x - 95),
          y: Math.max(12, y - 42),
          width: 190,
          height: 84,
          zIndex: maxZ + 1,
        });
      }
      mutateDoc((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === activePage.id ? { ...p, elements: [...p.elements, newEl] } : p
        ),
      }));
      setSelectedElementId(newEl.id);
    },
    [activePage.id, activePage.elements, mutateDoc]
  );

  const handleDropExternalFilesAt = useCallback(
    (files: FileList, x: number, y: number) => {
      const arr = Array.from(files);
      const imageFiles: File[] = [];

      arr.forEach((file) => {
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        } else if (/\.(comic4life|json)$/i.test(file.name)) {
          file.text().then(handleOpenComicJsonText);
        } else if (/\.(ttf|otf|woff2?)$/i.test(file.name)) {
          handleAddCustomFontFile(file);
        } else if (/\.(txt|md|script)$/i.test(file.name)) {
          file.text().then(handleImportScriptText);
        }
      });

      if (!imageFiles.length) return;
      Promise.all(
        imageFiles.map(
          (file) =>
            new Promise<MediaAsset>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  id: nextId('dropimg'),
                  name: file.name.replace(/\.[^.]+$/, '').toUpperCase(),
                  url: typeof reader.result === 'string' ? reader.result : '',
                  folder: 'My Photos',
                  createdAt: Date.now(),
                });
              };
              reader.readAsDataURL(file);
            })
        )
      ).then((loaded) => {
        const valid = loaded.filter((a) => Boolean(a.url));
        if (!valid.length) return;
        handleUploadMedia(valid);
        valid.forEach((asset, idx) => {
          handleDropAssetAt(asset.url, x + idx * 24, y + idx * 24);
        });
      });
    },
    [
      handleOpenComicJsonText,
      handleAddCustomFontFile,
      handleImportScriptText,
      handleUploadMedia,
      handleDropAssetAt,
    ]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        if (e.dataTransfer.files?.length) {
          e.preventDefault();
          handleDropExternalFilesAt(
            e.dataTransfer.files,
            Math.round(doc.pageWidth / 2),
            Math.round(doc.pageHeight / 2)
          );
        }
      }}
      className="h-screen w-screen flex flex-col overflow-hidden bg-[#1e2734]"
    >
      <input
        ref={fileOpenRef}
        type="file"
        accept=".comic4life,.json"
        className="hidden"
        onChange={handleOpenFileInput}
      />
      <input
        ref={imageInsertFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImportSingleImageFile}
      />
      <input
        ref={scriptImportRef}
        type="file"
        accept=".txt,.md,.script"
        className="hidden"
        onChange={handleImportScriptFile}
      />

      {/* Top Desktop Menu Bar */}
      <MenuBar
        t={t}
        lang={lang}
        onChangeLang={handleChangeLang}
        docTitle={doc.title}
        onRenameDoc={(title) => mutateDoc((prev) => ({ ...prev, title }))}
        recentDocs={recentDocs}
        onNewBlankComic={handleNewBlankComic}
        onStartComic={() => setShowTemplates(true)}
        onOpenFile={() => fileOpenRef.current?.click()}
        onOpenRecent={handleOpenRecent}
        onCloseDoc={() => setShowTemplates(true)}
        onSave={handleSave}
        onSaveAsFile={handleSaveAsFile}
        canAutoFill={
          mediaAssets.length > 0 &&
          activePage.elements.some((e) => e.kind === 'panel' && !e.imageUrl)
        }
        onAutoFillImages={handleAutoFillImages}
        onImportScript={() => scriptImportRef.current?.click()}
        onSaveAsTemplate={handleSaveAsTemplate}
        onImportImageFile={() => imageInsertFileRef.current?.click()}
        onInsertImageUrl={() => setShowImageUrlModal(true)}
        onPageSetup={() => setShowPageSetup(true)}
        onExport={(tab) => {
          setExportInitialTab(tab || 'pdf');
          setShowExport(true);
        }}
        onPrint={handlePrint}
        onQuitApp={
          window.comic4lifeDesktop?.isElectron
            ? () => window.comic4lifeDesktop?.quit()
            : undefined
        }
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onCutSelected={handleCutSelected}
        onCopySelected={handleCopySelected}
        onPasteSelected={handlePasteSelected}
        canPaste={Boolean(clipboardEl)}
        onPasteWithStyle={handlePasteStyle}
        onDuplicateSelected={handleDuplicateSelected}
        onDeleteSelected={handleDeleteSelected}
        onDeleteCurrentPage={() => handleDeletePage(activePage.id)}
        canDeletePage={doc.pages.length > 1}
        onSelectFirstOrAll={handleSelectFirstOrAll}
        onDeselect={() => {
          setSelectedElementId(null);
          setEditingElementId(null);
        }}
        onOpenFind={() => setShowFindModal(true)}
        hasSelection={Boolean(selectedElement)}
        showLeftSidebar={showLeftSidebar}
        onToggleLeftSidebar={() => setShowLeftSidebar((v) => !v)}
        showRightSidebar={showRightSidebar}
        onToggleRightSidebar={() => setShowRightSidebar((v) => !v)}
        showBottomDock={showBottomDock}
        onToggleBottomDock={() => setShowBottomDock((v) => !v)}
        showFormatBar={showFormatBar}
        onToggleFormatBar={() => setShowFormatBar((v) => !v)}
        onZoomIn={() => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(2))))}
        onZoomOut={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
        onZoomFit={handleZoomFit}
        onSetZoom={(z) => setZoom(z)}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers((v) => !v)}
        showGuides={showGuides}
        onToggleGuides={() => setShowGuides((v) => !v)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        snapToGrid={snapToGrid}
        onToggleSnapGrid={() => setSnapToGrid((v) => !v)}
        canPrevPage={activePageIndex > 0}
        canNextPage={activePageIndex < doc.pages.length - 1}
        onPrevPage={() => {
          if (activePageIndex > 0) setSelectedPageId(doc.pages[activePageIndex - 1].id);
        }}
        onNextPage={() => {
          if (activePageIndex < doc.pages.length - 1) {
            setSelectedPageId(doc.pages[activePageIndex + 1].id);
          }
        }}
        onAddBlankPage={handleAddBlankPage}
        onAddPage={() => handleAddPage()}
        onDuplicateCurrentPage={() => handleDuplicatePage(activePage.id)}
        onAddPageWithCurrentPanels={() => {
          const panelsOnly = activePage.elements
            .filter((e) => e.kind === 'panel')
            .map((p) => cloneElementWithNewId({ ...p, imageUrl: null }));
          const clonedPage: ComicPage = {
            ...activePage,
            id: nextId('page'),
            margins: activePage.margins ? { ...activePage.margins } : undefined,
            elements: panelsOnly,
          };
          mutateDoc((prev) => ({ ...prev, pages: [...prev.pages, clonedPage] }));
          setSelectedPageId(clonedPage.id);
        }}
        onInsertPageNumber={() => {
          const numEl = createBalloon({
            balloonType: 'text',
            text: String(activePageIndex + 1),
            x: doc.pageWidth - 76,
            y: doc.pageHeight - 54,
            width: 52,
            height: 36,
            fontSize: 16,
            textColor: activePage.backgroundColor === '#000000' ? '#ffffff' : '#111827',
          });
          mutateDoc((prev) => ({
            ...prev,
            pages: prev.pages.map((p) =>
              p.id === activePage.id ? { ...p, elements: [...p.elements, numEl] } : p
            ),
          }));
          setSelectedElementId(numEl.id);
        }}
        onInsertPageCount={() => {
          const cntEl = createBalloon({
            balloonType: 'text',
            text: `${activePageIndex + 1} / ${doc.pages.length}`,
            x: doc.pageWidth - 96,
            y: doc.pageHeight - 54,
            width: 72,
            height: 36,
            fontSize: 15,
            textColor: activePage.backgroundColor === '#000000' ? '#ffffff' : '#111827',
          });
          mutateDoc((prev) => ({
            ...prev,
            pages: prev.pages.map((p) =>
              p.id === activePage.id ? { ...p, elements: [...p.elements, cntEl] } : p
            ),
          }));
          setSelectedElementId(cntEl.id);
        }}
        onAddPanel={(shape?: PanelShape) => {
          if (!shape) {
            insertDockItemAt('panel');
            return;
          }
          const newEl = createPanel({
            x: Math.round(doc.pageWidth / 2) - 120,
            y: Math.round(doc.pageHeight / 2) - 110,
            width: 240,
            height: 220,
            shape,
            cornerRadius: shape === 'rounded' ? 18 : 0,
            strokeColor: activePage.backgroundColor === '#000000' ? '#ffffff' : '#000000',
            strokeWidth: 2,
          });
          mutateDoc((prev) => ({
            ...prev,
            pages: prev.pages.map((p) =>
              p.id === activePage.id ? { ...p, elements: [...p.elements, newEl] } : p
            ),
          }));
          setSelectedElementId(newEl.id);
        }}
        onAddSpeech={() => insertDockItemAt('speech')}
        onAddThought={() => insertDockItemAt('thought')}
        onAddCaption={() => insertDockItemAt('caption')}
        onAddTextBox={() => insertDockItemAt('text')}
        onAddLettering={() => insertDockItemAt('lettering')}
        isTextElementSelected={
          selectedElement?.kind === 'balloon' || selectedElement?.kind === 'lettering'
        }
        isPanelSelected={selectedElement?.kind === 'panel'}
        hasPanelImage={
          selectedElement?.kind === 'panel' && Boolean(selectedElement.imageUrl)
        }
        onToggleBold={() => {
          if (selectedElement && (selectedElement.kind === 'balloon' || selectedElement.kind === 'lettering')) {
            updateElement(selectedElement.id, {
              fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold',
            });
          }
        }}
        onToggleItalic={() => {
          if (selectedElement && (selectedElement.kind === 'balloon' || selectedElement.kind === 'lettering')) {
            updateElement(selectedElement.id, { italic: !selectedElement.italic });
          }
        }}
        onToggleUnderline={() => {
          if (selectedElement && (selectedElement.kind === 'balloon' || selectedElement.kind === 'lettering')) {
            updateElement(selectedElement.id, { underline: !selectedElement.underline });
          }
        }}
        onTextLarger={() => textStep(2)}
        onTextSmaller={() => textStep(-2)}
        onSetTextAlign={(textAlign) => {
          if (selectedElement && (selectedElement.kind === 'balloon' || selectedElement.kind === 'lettering')) {
            updateElement(selectedElement.id, { textAlign });
          }
        }}
        onSetPanelShape={(shape) => {
          if (selectedElement?.kind === 'panel') {
            updateElement(selectedElement.id, {
              shape,
              cornerRadius: shape === 'rounded' ? 18 : 0,
            });
          }
        }}
        onCopyStyle={handleCopyStyle}
        onPasteStyle={handlePasteStyle}
        canPasteStyle={Boolean(copiedStyle)}
        onActualImageSize={() => {
          if (selectedElement?.kind === 'panel') {
            updateElement(selectedElement.id, {
              imageScale: 1,
              imageOffsetX: 0,
              imageOffsetY: 0,
              imageRotation: 0,
              imageFit: 'cover',
            });
          }
        }}
        onEnableInstantAlpha={() => {
          if (selectedElement?.kind === 'panel') {
            updateElement(selectedElement.id, {
              instantAlpha: { ...selectedElement.instantAlpha, enabled: true },
            });
          }
        }}
        onDisableInstantAlpha={() => {
          if (selectedElement?.kind === 'panel') {
            updateElement(selectedElement.id, {
              instantAlpha: { ...selectedElement.instantAlpha, enabled: false },
            });
          }
        }}
        onBringForward={handleBringForward}
        onBringToFront={handleBringToFront}
        onSendBackward={handleSendBackward}
        onSendToBack={handleSendToBack}
        onAlignSelected={handleAlignSelected}
        isSelectedLocked={Boolean(selectedElement?.locked)}
        onToggleLock={(locked) => {
          if (selectedElement) updateElement(selectedElement.id, { locked });
        }}
        showInspector={showInspector}
        showColors={showColors}
        showFonts={showFonts}
        showScript={showScript}
        showStamps={showStamps}
        onToggleInspector={() => setShowInspector((v) => !v)}
        onToggleColors={() => setShowColors((v) => !v)}
        onToggleFonts={() => setShowFonts((v) => !v)}
        onToggleScript={() => setShowScript((v) => !v)}
        onToggleStamps={() => setShowStamps((v) => !v)}
        onBringAllToFront={() => {
          setBringFrontSignal((s) => s + 1);
          if (!showInspector && !showColors && !showFonts && !showScript && !showStamps) {
            setShowInspector(true);
          }
        }}
        onTogglePreview={() => setShowPreview(true)}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      {/* Dark Slate Main Toolbar */}
      <MainToolbar
        t={t}
        onSave={handleSave}
        saveFeedback={saveFeedback}
        onPrint={handlePrint}
        onPreview={() => setShowPreview(true)}
        onStartComic={() => setShowTemplates(true)}
        onNewPage={() => handleAddPage()}
        onZoomIn={() => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(2))))}
        onZoomOut={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
        onZoomFit={handleZoomFit}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        hasSelection={Boolean(selectedElement)}
        onCyclePageStyle={handleCyclePageStyle}
        onTextLarger={() => textStep(2)}
        onTextSmaller={() => textStep(-2)}
        canStepSize={
          selectedElement?.kind === 'balloon' ||
          selectedElement?.kind === 'lettering' ||
          (selectedElement?.kind === 'panel' && Boolean(selectedElement.imageUrl))
        }
        isPanelSelected={selectedElement?.kind === 'panel'}
        hasPanelImage={
          selectedElement?.kind === 'panel' && Boolean(selectedElement.imageUrl)
        }
        instantAlphaActive={
          selectedElement?.kind === 'panel' && selectedElement.instantAlpha.enabled
        }
        onToggleInstantAlpha={() => {
          if (selectedElement?.kind === 'panel') {
            updateElement(selectedElement.id, {
              instantAlpha: {
                ...selectedElement.instantAlpha,
                enabled: !selectedElement.instantAlpha.enabled,
              },
            });
            setShowInspector(true);
          }
        }}
        onExport={() => setShowExport(true)}
        showInspector={showInspector}
        onToggleInspector={() => setShowInspector((v) => !v)}
        showColors={showColors}
        onToggleColors={() => setShowColors((v) => !v)}
        showFonts={showFonts}
        onToggleFonts={() => setShowFonts((v) => !v)}
        showScript={showScript}
        onToggleScript={() => setShowScript((v) => !v)}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Secondary Context Format Bar */}
      {showFormatBar && (
        <FormatBar
          t={t}
          selectedElement={selectedElement}
          pageBgColor={activePage.backgroundColor}
          onChangePageBg={(color) => updateActivePage({ backgroundColor: color })}
          onUpdateElement={(patch) => {
            if (selectedElement) updateElement(selectedElement.id, patch);
          }}
        />
      )}

      {/* Core 3-Column Studio Body */}
      <div className="no-print flex-1 flex min-h-0 overflow-hidden">
        {showLeftSidebar && (
          <LeftSidebar
            t={t}
            doc={doc}
            selectedPageId={activePage.id}
            selectedElement={selectedElement}
            onSelectPage={(id) => {
              setSelectedPageId(id);
              setSelectedElementId(null);
              setEditingElementId(null);
            }}
            onAddPage={() => handleAddPage()}
            onDuplicatePage={handleDuplicatePage}
            onDeletePage={handleDeletePage}
            onMovePage={handleMovePage}
            onReorderPage={handleReorderPage}
            onDropLayoutOnPage={(layoutId, pageId) => {
              const found = PAGE_LAYOUT_PRESETS.find((l) => l.id === layoutId);
              if (found) handleApplyLayout(found, pageId);
            }}
            onDropTemplateOnPage={(templateId, pageId) => {
              const found = [...userTemplates, ...COMIC_TEMPLATES].find(
                (tpl) => tpl.id === templateId
              );
              if (found) handleApplyTemplateToPage(found, pageId);
            }}
            onDropStyleOnPage={(styleId, pageId) => {
              handleDropStyleAt(styleId, 0, 0, pageId);
            }}
            onDropColorOnPage={handleDropColorOnPage}
            onDropImageOnPage={handleDropImageOnPage}
            onApplyStyle={handleApplyStylePreset}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <CanvasWorkspace
            t={t}
            doc={doc}
            page={activePage}
            pageIndex={activePageIndex}
            zoom={zoom}
            onChangeZoom={setZoom}
            onFitZoom={(vw, vh) => {
              const fit = Math.min(
                (vw - 80) / doc.pageWidth,
                (vh - 80) / doc.pageHeight
              );
              setZoom(Math.max(0.25, Math.min(1.5, Number(fit.toFixed(2)))));
            }}
            showRulers={showRulers}
            showGuides={showGuides}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            selectedElementId={selectedElementId}
            editingElementId={editingElementId}
            onSelectElement={setSelectedElementId}
            onStartEdit={(id) => {
              setSelectedElementId(id);
              setEditingElementId(id);
            }}
            onEndEdit={() => {
              setEditingElementId(null);
              commitPendingHistory();
            }}
            onUpdateElement={updateElement}
            onCommitHistory={commitPendingHistory}
            onDropDockItem={insertDockItemAt}
            onDropAssetAt={handleDropAssetAt}
            onDropStampAt={(stampId, x, y) => {
              const stamp = COMIC_STAMPS.find((s) => s.id === stampId);
              if (stamp) handleInsertStamp(stamp, x, y);
            }}
            onDropStyleAt={(styleId, x, y) => handleDropStyleAt(styleId, x, y)}
            onDropFontAt={handleDropFontAt}
            onDropColorAt={handleDropColorAt}
            onDropLayout={(layoutId) => {
              const found = PAGE_LAYOUT_PRESETS.find((l) => l.id === layoutId);
              if (found) handleApplyLayout(found);
            }}
            onDropTemplate={(templateId) => {
              const found = [...userTemplates, ...COMIC_TEMPLATES].find(
                (tpl) => tpl.id === templateId
              );
              if (found) handleApplyTemplateToPage(found);
            }}
            onDropScriptBeatAt={handleDropScriptBeatAt}
            onDropExternalFilesAt={handleDropExternalFilesAt}
          />

          {showBottomDock && (
            <BottomDock t={t} onInsertItem={(item) => insertDockItemAt(item)} />
          )}
        </div>

        {showRightSidebar && (
          <RightSidebar
            t={t}
            mediaAssets={mediaAssets}
            userTemplates={userTemplates}
            onApplyLayout={(layout) => handleApplyLayout(layout)}
            onAddPageWithLayout={(layout) => handleAddPage(layout)}
            onApplyTemplateToPage={(tpl) => handleApplyTemplateToPage(tpl)}
            onSelectMediaAsset={handleSelectMediaAsset}
            onUploadMedia={handleUploadMedia}
          />
        )}
      </div>

      {/* Floating Inspector / Colors Wheel / Fonts & External Fonts / Script */}
      <FloatingPanels
        t={t}
        doc={doc}
        page={activePage}
        selectedElement={selectedElement}
        customFonts={customFonts}
        showInspector={showInspector}
        showColors={showColors}
        showFonts={showFonts}
        showScript={showScript}
        onCloseInspector={() => setShowInspector(false)}
        onCloseColors={() => setShowColors(false)}
        onCloseFonts={() => setShowFonts(false)}
        onCloseScript={() => setShowScript(false)}
        onUpdateElement={(id, patch) => updateElement(id, patch)}
        onUpdatePage={(patch) => updateActivePage(patch)}
        onChangePageSize={(sizeKey: PageSizeKey, customW?: number, customH?: number) => {
          const info = PAGE_SIZES[sizeKey];
          mutateDoc((prev) => ({
            ...prev,
            pageSize: sizeKey,
            pageWidth: customW ?? info.width,
            pageHeight: customH ?? info.height,
          }));
        }}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onAddCustomFontFile={handleAddCustomFontFile}
        onAddGoogleFont={handleAddGoogleFont}
        onInsertTextBox={() => insertDockItemAt('text')}
        onInsertImageToSelected={handleSelectMediaAsset}
        onUpdateScript={(entries: ScriptEntry[]) =>
          mutateDoc((prev) => ({ ...prev, script: entries }))
        }
        onApplyScriptToPage={handleApplyScriptToPage}
        onImportScriptText={handleImportScriptText}
        bringFrontSignal={bringFrontSignal}
      />

      {/* Floating Stamps & Onomatopoeia Window */}
      <StampsModal
        t={t}
        isOpen={showStamps}
        onClose={() => setShowStamps(false)}
        onInsertStamp={handleInsertStamp}
        bringFrontSignal={bringFrontSignal}
      />

      {/* Template Chooser Modal */}
      <TemplateChooserModal
        t={t}
        isOpen={showTemplates}
        recentDocs={recentDocs}
        userTemplates={userTemplates}
        showOnStartup={showTemplatesOnStartup}
        onToggleShowOnStartup={(val) => {
          setShowTemplatesOnStartup(val);
          try {
            localStorage.setItem(STORAGE_STARTUP_CHOOSER_KEY, String(val));
          } catch {
            // ignore
          }
        }}
        onClose={() => setShowTemplates(false)}
        onChooseTemplate={handleChooseTemplate}
        onDeleteUserTemplate={handleDeleteUserTemplate}
        onOpenRecent={handleOpenRecent}
        onOpenExistingFile={() => fileOpenRef.current?.click()}
      />

      {/* Page Setup Modal */}
      <PageSetupModal
        t={t}
        isOpen={showPageSetup}
        doc={doc}
        activePage={activePage}
        onClose={() => setShowPageSetup(false)}
        onApply={({ pageSize, pageWidth, pageHeight, margins }) => {
          const avgMargin = Math.round(
            (margins.top + margins.right + margins.bottom + margins.left) / 4
          );
          mutateDoc((prev) => ({
            ...prev,
            pageSize,
            pageWidth,
            pageHeight,
            pages: prev.pages.map((p) => ({
              ...p,
              margin: avgMargin,
              margins,
            })),
          }));
        }}
      />

      {/* Export Modal */}
      <ExportModal
        t={t}
        isOpen={showExport}
        initialTab={exportInitialTab}
        doc={doc}
        activePageIndex={activePageIndex}
        onClose={() => setShowExport(false)}
        onPrint={handlePrint}
      />

      {/* Find & Replace Modal */}
      {showFindModal && (() => {
        const q = findQuery;
        const matches: Array<{ pageId: string; elementId: string }> = [];
        if (q) {
          doc.pages.forEach((p) => {
            p.elements.forEach((el) => {
              if (el.kind === 'balloon' || el.kind === 'lettering') {
                const hit = findMatchCase
                  ? el.text.includes(q)
                  : el.text.toLowerCase().includes(q.toLowerCase());
                if (hit) matches.push({ pageId: p.id, elementId: el.id });
              }
            });
          });
        }
        const jumpNext = () => {
          if (!matches.length) return;
          const m = matches[findCursor % matches.length];
          setSelectedPageId(m.pageId);
          setSelectedElementId(m.elementId);
          setFindCursor((c) => (c + 1) % matches.length);
        };
        const replaceAll = () => {
          if (!q || !matches.length) return;
          const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escaped, findMatchCase ? 'g' : 'gi');
          mutateDoc((prev) => ({
            ...prev,
            pages: prev.pages.map((p) => ({
              ...p,
              elements: p.elements.map((el) => {
                if (el.kind === 'balloon' || el.kind === 'lettering') {
                  const nextText = el.text.replace(regex, replaceQuery);
                  if (nextText !== el.text) return { ...el, text: nextText };
                }
                return el;
              }),
            })),
          }));
          setFindCursor(0);
        };

        return (
          <div className="no-print fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#f4f5f7] border border-slate-500 rounded shadow-2xl overflow-hidden text-[12px]">
              <div className="h-8 bg-white border-b border-slate-300 px-3 flex items-center justify-between font-semibold">
                <span>{t.findMenu}</span>
                <button
                  type="button"
                  onClick={() => setShowFindModal(false)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <input
                  autoFocus
                  type="text"
                  placeholder={t.findPlaceholder}
                  value={findQuery}
                  onChange={(e) => {
                    setFindQuery(e.target.value);
                    setFindCursor(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') jumpNext();
                  }}
                  className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2 outline-none"
                />
                <input
                  type="text"
                  placeholder={t.replacePlaceholder}
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  className="w-full h-7 bg-white border border-slate-400 rounded-xs px-2 outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={findMatchCase}
                      onChange={(e) => setFindMatchCase(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>{t.matchCaseLabel}</span>
                  </label>
                  <span className="tabular-nums font-medium">
                    {q ? t.matchesFound.replace('{count}', String(matches.length)) : ''}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFindModal(false)}
                    className="px-2.5 py-1 bg-white border border-slate-400 rounded-xs"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={!matches.length}
                    onClick={jumpNext}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-45 border border-slate-400 rounded-xs font-medium"
                  >
                    {t.findNextBtn}
                  </button>
                  <button
                    type="button"
                    disabled={!matches.length}
                    onClick={replaceAll}
                    className="px-3 py-1 bg-[#1d5ec4] hover:bg-blue-700 disabled:opacity-45 text-white font-semibold rounded-xs"
                  >
                    {t.replaceAllBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Fullscreen Reader Preview Modal */}
      <PreviewModal
        t={t}
        isOpen={showPreview}
        doc={doc}
        initialPageIndex={activePageIndex}
        onClose={() => setShowPreview(false)}
      />

      {/* Insert Image from URL Modal */}
      {showImageUrlModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#f4f5f7] border border-slate-500 rounded shadow-2xl overflow-hidden text-[12px]">
            <div className="h-9 bg-gradient-to-b from-[#2c3849] to-[#1e2734] text-white px-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <LinkIcon className="w-4 h-4 text-sky-300" />
                <span>{t.imageFromUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowImageUrlModal(false)}
                className="p-1 hover:bg-white/15 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                autoFocus
                type="url"
                placeholder="https://example.com/comic-art.jpg"
                value={imageUrlModalVal}
                onChange={(e) => setImageUrlModalVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && imageUrlModalVal.trim()) {
                    const url = imageUrlModalVal.trim();
                    handleUploadMedia([
                      {
                        id: nextId('url'),
                        name: 'WEB IMAGE',
                        url,
                        folder: 'My Photos',
                        createdAt: Date.now(),
                      },
                    ]);
                    handleSelectMediaAsset(url);
                    setImageUrlModalVal('');
                    setShowImageUrlModal(false);
                  }
                }}
                className="w-full h-8 bg-white border border-slate-400 rounded-xs px-2 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageUrlModal(false)}
                  className="px-3 py-1 bg-white border border-slate-400 rounded-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!imageUrlModalVal.trim()) return;
                    const url = imageUrlModalVal.trim();
                    handleUploadMedia([
                      {
                        id: nextId('url'),
                        name: 'WEB IMAGE',
                        url,
                        folder: 'My Photos',
                        createdAt: Date.now(),
                      },
                    ]);
                    handleSelectMediaAsset(url);
                    setImageUrlModalVal('');
                    setShowImageUrlModal(false);
                  }}
                  className="px-4 py-1 bg-[#1d5ec4] text-white font-semibold rounded-xs"
                >
                  {t.loadFontBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="no-print fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#f4f5f7] border border-slate-500 rounded shadow-2xl overflow-hidden text-[12px]">
            <div className="h-9 bg-gradient-to-b from-[#2c3849] to-[#1e2734] text-white px-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Keyboard className="w-4 h-4 text-sky-300" />
                <span>{t.shortcutsGuide}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="p-1 hover:bg-white/15 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2 bg-white text-slate-700">
              {[
                ['Double-Click Balloon / Text', 'Edit comic text inline'],
                ['Double-Click Panel Photo', 'Resize, rotate & pan image inside panel'],
                ['Drag Amber Diamond Handle', 'Move speech balloon tail tip'],
                ['Alt + Drag Panel', 'Pan & re-frame image inside panel'],
                ['Ctrl/Cmd + Z / Shift+Ctrl+Z', 'Undo / Redo changes'],
                ['Ctrl/Cmd + C / X / V / D', 'Copy / Cut / Paste / Duplicate element'],
                ['Ctrl/Cmd + O / S / Shift+S / P', 'Open / Save / Save As / Print'],
                ['Ctrl/Cmd + F / I / 1 / 2 / 3', 'Find / Inspector / Toggle Panels'],
                ['Ctrl/Cmd + L / Shift+L', 'Lock / Unlock selected element'],
                ['Delete / Backspace', 'Remove selected element'],
                ['Ctrl/Cmd + + / - / 0', 'Zoom In / Out / Fit'],
              ].map(([k, desc]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-slate-100 pb-1.5"
                >
                  <span className="font-mono text-[11px] font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                    {k}
                  </span>
                  <span className="text-[11px] text-slate-600">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clean Print-Only Container */}
      <div className="print-only-container hidden">
        {printDataUrls.map((src, i) => (
          <div key={i} className="print-page-sheet">
            <img
              src={src}
              alt={`Printed comic page ${i + 1}`}
              style={{ maxWidth: '100%', maxHeight: '100vh', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
