import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  FlipHorizontal,
  FlipVertical,
  Move,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  ComicDocument,
  ComicElement,
  ComicPage,
  ImageFitMode,
  ScriptEntry,
} from '../types/comic';
import { Translations } from '../i18n/translations';
import { ComicElementView } from './ComicElementView';
import { DockItemType } from './BottomDock';

interface CanvasWorkspaceProps {
  t: Translations;
  doc: ComicDocument;
  page: ComicPage;
  pageIndex: number;
  zoom: number;
  onChangeZoom: (z: number) => void;
  onFitZoom: (viewportWidth: number, viewportHeight: number) => void;
  showRulers: boolean;
  showGuides: boolean;
  showGrid?: boolean;
  snapToGrid?: boolean;
  selectedElementId: string | null;
  editingElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: () => void;
  onUpdateElement: (id: string, patch: Record<string, unknown>, recordHistory?: boolean) => void;
  onCommitHistory: () => void;
  onDropDockItem: (itemType: DockItemType, x: number, y: number) => void;
  onDropAssetAt: (url: string, x: number, y: number, targetPanelId?: string) => void;
  onDropStampAt: (stampId: string, x: number, y: number) => void;
  onDropStyleAt: (styleId: string, x: number, y: number) => void;
  onDropFontAt: (fontFamily: string, x: number, y: number) => void;
  onDropColorAt: (hex: string, x: number, y: number) => void;
  onDropLayout: (layoutId: string) => void;
  onDropTemplate: (templateId: string) => void;
  onDropScriptBeatAt: (beat: ScriptEntry, x: number, y: number) => void;
  onDropExternalFilesAt: (files: FileList, x: number, y: number) => void;
}

type DragAction =
  | {
      type: 'move';
      id: string;
      startX: number;
      startY: number;
      origX: number;
      origY: number;
      origTipX?: number;
      origTipY?: number;
    }
  | {
      type: 'resize';
      id: string;
      handle: string;
      startX: number;
      startY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    }
  | {
      type: 'rotate';
      id: string;
      centerX: number;
      centerY: number;
      startAngle: number;
      origRotation: number;
    }
  | {
      type: 'tail';
      id: string;
      startX: number;
      startY: number;
      origTipX: number;
      origTipY: number;
    }
  | {
      type: 'pan-image';
      id: string;
      startX: number;
      startY: number;
      origOffX: number;
      origOffY: number;
      boxW: number;
      boxH: number;
      panelRot: number;
    }
  | {
      type: 'resize-image';
      id: string;
      handle: 'nw' | 'ne' | 'sw' | 'se';
      startX: number;
      startY: number;
      origScale: number;
      origOffX: number;
      origOffY: number;
      baseW: number;
      baseH: number;
      boxW: number;
      boxH: number;
      imageRot: number;
      panelRot: number;
    }
  | {
      type: 'rotate-image';
      id: string;
      centerX: number;
      centerY: number;
      startAngle: number;
      origImgRot: number;
    };

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  t,
  doc,
  page,
  pageIndex,
  zoom,
  onChangeZoom,
  onFitZoom,
  showRulers,
  showGuides,
  showGrid = false,
  snapToGrid = false,
  selectedElementId,
  editingElementId,
  onSelectElement,
  onStartEdit,
  onEndEdit,
  onUpdateElement,
  onCommitHistory,
  onDropDockItem,
  onDropAssetAt,
  onDropStampAt,
  onDropStyleAt,
  onDropFontAt,
  onDropColorAt,
  onDropLayout,
  onDropTemplate,
  onDropScriptBeatAt,
  onDropExternalFilesAt,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageSheetRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  const [pageScreenOffset, setPageScreenOffset] = useState({ left: 0, top: 0 });
  const [adjustingPanelId, setAdjustingPanelId] = useState<string | null>(null);
  const [adjustImgNatSize, setAdjustImgNatSize] = useState<{ w: number; h: number } | null>(null);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
  const dragRef = useRef<DragAction | null>(null);

  const selectedElement =
    page.elements.find((el) => el.id === selectedElementId) ?? null;

  const adjustingPanel =
    adjustingPanelId &&
    selectedElement?.id === adjustingPanelId &&
    selectedElement.kind === 'panel' &&
    selectedElement.imageUrl
      ? selectedElement
      : null;

  useEffect(() => {
    if (!adjustingPanel?.imageUrl) {
      setAdjustImgNatSize(null);
      return;
    }
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active && img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAdjustImgNatSize({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };
    img.onerror = () => {
      if (active) setAdjustImgNatSize(null);
    };
    img.src = adjustingPanel.imageUrl;
    return () => {
      active = false;
    };
  }, [adjustingPanel?.id, adjustingPanel?.imageUrl]);

  const getPanelImageGeom = (
    panel: Extract<ComicElement, { kind: 'panel' }>,
    nat: { w: number; h: number } | null
  ) => {
    const boxW = Math.max(4, panel.width - panel.padding * 2);
    const boxH = Math.max(4, panel.height - panel.padding * 2);
    const fitMode = panel.imageFit || 'cover';
    let baseW = boxW;
    let baseH = boxH;
    if (nat && nat.w > 0 && nat.h > 0) {
      if (fitMode === 'cover') {
        const s = Math.max(boxW / nat.w, boxH / nat.h);
        baseW = nat.w * s;
        baseH = nat.h * s;
      } else if (fitMode === 'contain') {
        const s = Math.min(boxW / nat.w, boxH / nat.h);
        baseW = nat.w * s;
        baseH = nat.h * s;
      }
    }
    const curW = baseW * panel.imageScale;
    const curH = baseH * panel.imageScale;
    const offsetPxX = (panel.imageOffsetX / 100) * boxW;
    const offsetPxY = (panel.imageOffsetY / 100) * boxH;
    const imgCx = panel.padding + boxW / 2 + offsetPxX;
    const imgCy = panel.padding + boxH / 2 + offsetPxY;
    return { boxW, boxH, baseW, baseH, curW, curH, offsetPxX, offsetPxY, imgCx, imgCy };
  };

  useEffect(() => {
    if (adjustingPanelId && adjustingPanelId !== selectedElementId) {
      setAdjustingPanelId(null);
    }
  }, [selectedElementId, adjustingPanelId]);

  useEffect(() => {
    if (!adjustingPanelId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        setAdjustingPanelId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [adjustingPanelId]);

  const updateRulerOffset = () => {
    if (!scrollRef.current || !pageSheetRef.current) return;
    const sRect = scrollRef.current.getBoundingClientRect();
    const pRect = pageSheetRef.current.getBoundingClientRect();
    setPageScreenOffset({
      left: pRect.left - sRect.left,
      top: pRect.top - sRect.top,
    });
  };

  useEffect(() => {
    updateRulerOffset();
  }, [zoom, doc.pageWidth, doc.pageHeight, page.id, scrollPos]);

  useEffect(() => {
    const onResize = () => updateRulerOffset();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const act = dragRef.current;
      if (!act) return;

      if (act.type === 'move') {
        const dx = (e.clientX - act.startX) / zoom;
        const dy = (e.clientY - act.startY) / zoom;
        const snap = (v: number) => (snapToGrid ? Math.round(v / 10) * 10 : Math.round(v));
        const nextX = snap(act.origX + dx);
        const nextY = snap(act.origY + dy);
        const deltaX = nextX - act.origX;
        const deltaY = nextY - act.origY;
        const patch: Record<string, unknown> = {
          x: nextX,
          y: nextY,
        };
        if (act.origTipX !== undefined && act.origTipY !== undefined) {
          const el = page.elements.find((item) => item.id === act.id);
          if (el?.kind === 'balloon') {
            patch.tail = {
              ...el.tail,
              tipX: Math.round(act.origTipX + deltaX),
              tipY: Math.round(act.origTipY + deltaY),
            };
          }
        }
        onUpdateElement(act.id, patch, false);
      } else if (act.type === 'resize') {
        const dx = (e.clientX - act.startX) / zoom;
        const dy = (e.clientY - act.startY) / zoom;
        const snap = (v: number) => (snapToGrid ? Math.round(v / 10) * 10 : Math.round(v));
        let x = act.origX;
        let y = act.origY;
        let w = act.origW;
        let h = act.origH;
        const minSize = 28;

        if (act.handle.includes('e')) w = Math.max(minSize, snap(act.origW + dx));
        if (act.handle.includes('s')) h = Math.max(minSize, snap(act.origH + dy));
        if (act.handle.includes('w')) {
          const nextW = Math.max(minSize, snap(act.origW - dx));
          x = act.origX + (act.origW - nextW);
          w = nextW;
        }
        if (act.handle.includes('n')) {
          const nextH = Math.max(minSize, snap(act.origH - dy));
          y = act.origY + (act.origH - nextH);
          h = nextH;
        }

        onUpdateElement(
          act.id,
          {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(w),
            height: Math.round(h),
          },
          false
        );
      } else if (act.type === 'rotate') {
        const angle =
          (Math.atan2(e.clientY - act.centerY, e.clientX - act.centerX) * 180) /
          Math.PI;
        let nextRot = Math.round(act.origRotation + (angle - act.startAngle));
        if (e.shiftKey) nextRot = Math.round(nextRot / 15) * 15;
        onUpdateElement(act.id, { rotation: nextRot }, false);
      } else if (act.type === 'tail') {
        const dx = (e.clientX - act.startX) / zoom;
        const dy = (e.clientY - act.startY) / zoom;
        const el = page.elements.find((item) => item.id === act.id);
        if (el?.kind === 'balloon') {
          onUpdateElement(
            act.id,
            {
              tail: {
                ...el.tail,
                tipX: Math.round(act.origTipX + dx),
                tipY: Math.round(act.origTipY + dy),
              },
            },
            false
          );
        }
      } else if (act.type === 'pan-image') {
        const rawDx = (e.clientX - act.startX) / zoom;
        const rawDy = (e.clientY - act.startY) / zoom;
        const rad = (act.panelRot * Math.PI) / 180;
        const localDx = rawDx * Math.cos(rad) + rawDy * Math.sin(rad);
        const localDy = -rawDx * Math.sin(rad) + rawDy * Math.cos(rad);
        const dx = (localDx / Math.max(40, act.boxW)) * 100;
        const dy = (localDy / Math.max(40, act.boxH)) * 100;
        onUpdateElement(
          act.id,
          {
            imageOffsetX: Math.max(-250, Math.min(250, Math.round(act.origOffX + dx))),
            imageOffsetY: Math.max(-250, Math.min(250, Math.round(act.origOffY + dy))),
          },
          false
        );
      } else if (act.type === 'resize-image') {
        const rawDx = (e.clientX - act.startX) / zoom;
        const rawDy = (e.clientY - act.startY) / zoom;
        const radTotal = ((act.panelRot + act.imageRot) * Math.PI) / 180;
        const localDx = rawDx * Math.cos(radTotal) + rawDy * Math.sin(radTotal);
        const localDy = -rawDx * Math.sin(radTotal) + rawDy * Math.cos(radTotal);
        const dirX = act.handle.includes('e') ? 1 : -1;
        const dirY = act.handle.includes('s') ? 1 : -1;
        const origCurW = Math.max(12, act.baseW * act.origScale);
        const origCurH = Math.max(12, act.baseH * act.origScale);
        const scaleX = (origCurW + dirX * localDx) / origCurW;
        const scaleY = (origCurH + dirY * localDy) / origCurH;
        const factor =
          Math.abs(localDx / origCurW) >= Math.abs(localDy / origCurH) ? scaleX : scaleY;
        const nextScale = Math.max(
          0.15,
          Math.min(5, Number((act.origScale * Math.max(0.05, factor)).toFixed(3)))
        );

        const patch: Record<string, unknown> = {
          imageScale: Number(nextScale.toFixed(2)),
        };

        if (!e.altKey) {
          const shiftLocalX = (dirX * (nextScale - act.origScale) * act.baseW) / 2;
          const shiftLocalY = (dirY * (nextScale - act.origScale) * act.baseH) / 2;
          const radImg = (act.imageRot * Math.PI) / 180;
          const shiftPanelX =
            shiftLocalX * Math.cos(radImg) - shiftLocalY * Math.sin(radImg);
          const shiftPanelY =
            shiftLocalX * Math.sin(radImg) + shiftLocalY * Math.cos(radImg);
          patch.imageOffsetX = Math.max(
            -250,
            Math.min(250, Math.round(act.origOffX + (shiftPanelX / Math.max(40, act.boxW)) * 100))
          );
          patch.imageOffsetY = Math.max(
            -250,
            Math.min(250, Math.round(act.origOffY + (shiftPanelY / Math.max(40, act.boxH)) * 100))
          );
        }

        onUpdateElement(act.id, patch, false);
      } else if (act.type === 'rotate-image') {
        const angle =
          (Math.atan2(e.clientY - act.centerY, e.clientX - act.centerX) * 180) /
          Math.PI;
        let nextImgRot = Math.round(act.origImgRot + (angle - act.startAngle));
        if (e.shiftKey) nextImgRot = Math.round(nextImgRot / 15) * 15;
        onUpdateElement(act.id, { imageRotation: nextImgRot }, false);
      }
    };

    const onPointerUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        onCommitHistory();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [zoom, snapToGrid, page.elements, onUpdateElement, onCommitHistory]);

  const startMove = (el: ComicElement, e: React.PointerEvent) => {
    if (editingElementId === el.id) return;
    e.stopPropagation();
    onSelectElement(el.id);
    if (el.locked) return;

    if (
      el.kind === 'panel' &&
      el.imageUrl &&
      (e.altKey || adjustingPanelId === el.id)
    ) {
      dragRef.current = {
        type: 'pan-image',
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        origOffX: el.imageOffsetX,
        origOffY: el.imageOffsetY,
        boxW: Math.max(40, el.width - el.padding * 2),
        boxH: Math.max(40, el.height - el.padding * 2),
        panelRot: el.rotation,
      };
      return;
    }

    dragRef.current = {
      type: 'move',
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origTipX: el.kind === 'balloon' ? el.tail.tipX : undefined,
      origTipY: el.kind === 'balloon' ? el.tail.tipY : undefined,
    };
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(false);
    if (!pageSheetRef.current) return;
    const rect = pageSheetRef.current.getBoundingClientRect();
    const px = Math.round((e.clientX - rect.left) / zoom);
    const py = Math.round((e.clientY - rect.top) / zoom);

    const dockType = e.dataTransfer.getData('application/x-comic-dock') as DockItemType;
    if (dockType) {
      onDropDockItem(dockType, px, py);
      return;
    }

    const stampId = e.dataTransfer.getData('application/x-comic-stamp');
    if (stampId) {
      onDropStampAt(stampId, px, py);
      return;
    }

    const scriptBeatRaw = e.dataTransfer.getData('application/x-comic-script-beat');
    if (scriptBeatRaw) {
      try {
        const beat = JSON.parse(scriptBeatRaw) as ScriptEntry;
        onDropScriptBeatAt(beat, px, py);
      } catch {
        // ignore invalid script beat payload
      }
      return;
    }

    const assetUrl = e.dataTransfer.getData('application/x-comic-asset');
    if (assetUrl) {
      onDropAssetAt(assetUrl, px, py);
      return;
    }

    const styleId = e.dataTransfer.getData('application/x-comic-style');
    if (styleId) {
      onDropStyleAt(styleId, px, py);
      return;
    }

    const fontFamily = e.dataTransfer.getData('application/x-comic-font');
    if (fontFamily) {
      onDropFontAt(fontFamily, px, py);
      return;
    }

    const colorHex = e.dataTransfer.getData('application/x-comic-color');
    if (colorHex) {
      onDropColorAt(colorHex, px, py);
      return;
    }

    const layoutId = e.dataTransfer.getData('application/x-comic-layout');
    if (layoutId) {
      onDropLayout(layoutId);
      return;
    }

    const templateId = e.dataTransfer.getData('application/x-comic-template');
    if (templateId) {
      onDropTemplate(templateId);
      return;
    }

    if (e.dataTransfer.files?.length) {
      onDropExternalFilesAt(e.dataTransfer.files, px, py);
      return;
    }

    const uri =
      e.dataTransfer.getData('text/uri-list') ||
      e.dataTransfer.getData('text/plain');
    if (uri && /^(https?:|data:image\/)/i.test(uri.trim())) {
      onDropAssetAt(uri.trim().split('\n')[0], px, py);
    }
  };

  const rulerStep = 50;
  const hTicks = Math.ceil(doc.pageWidth / rulerStep) + 4;
  const vTicks = Math.ceil(doc.pageHeight / rulerStep) + 4;

  const getPatternBackground = () => {
    if (page.backgroundPattern === 'halftone') {
      return {
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.14) 1.5px, transparent 1.5px)',
        backgroundSize: '10px 10px',
      };
    }
    if (page.backgroundPattern === 'grid') {
      return {
        backgroundImage:
          'linear-gradient(to right, rgba(59,130,246,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.14) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      };
    }
    if (page.backgroundPattern === 'burst') {
      return {
        backgroundImage:
          'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.12) 0deg 10deg, transparent 10deg 20deg)',
      };
    }
    return {};
  };

  const resizeHandles = [
    { key: 'nw', cursor: 'nwse-resize', style: { left: -4, top: -4 } },
    { key: 'n', cursor: 'ns-resize', style: { left: '50%', top: -4, transform: 'translateX(-50%)' } },
    { key: 'ne', cursor: 'nesw-resize', style: { right: -4, top: -4 } },
    { key: 'e', cursor: 'ew-resize', style: { right: -4, top: '50%', transform: 'translateY(-50%)' } },
    { key: 'se', cursor: 'nwse-resize', style: { right: -4, bottom: -4 } },
    { key: 's', cursor: 'ns-resize', style: { left: '50%', bottom: -4, transform: 'translateX(-50%)' } },
    { key: 'sw', cursor: 'nesw-resize', style: { left: -4, bottom: -4 } },
    { key: 'w', cursor: 'ew-resize', style: { left: -4, top: '50%', transform: 'translateY(-50%)' } },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#9da3ad] relative select-none">
      {/* Top Horizontal Ruler */}
      {showRulers && (
        <div className="no-print h-5 bg-[#eceef1] border-b border-slate-400 flex shrink-0 overflow-hidden relative">
          <div className="w-5 h-5 border-r border-slate-400 bg-[#dfe2e7] shrink-0" />
          <div className="flex-1 relative overflow-hidden">
            {Array.from({ length: hTicks }).map((_, i) => {
              const unitVal = i * rulerStep;
              const px = pageScreenOffset.left - 20 + unitVal * zoom;
              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-slate-400/80 text-[9px] text-slate-600 tabular-nums pl-0.5"
                  style={{ left: `${px}px` }}
                >
                  {i % 2 === 0 ? Math.round(unitVal / 25) : ''}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Middle Row: Vertical Ruler + Scrollable Pasteboard */}
      <div className="flex-1 flex min-h-0 relative">
        {showRulers && (
          <div className="no-print w-5 bg-[#eceef1] border-r border-slate-400 shrink-0 relative overflow-hidden">
            {Array.from({ length: vTicks }).map((_, i) => {
              const unitVal = i * rulerStep;
              const py = pageScreenOffset.top + unitVal * zoom;
              return (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-slate-400/80 text-[8px] text-slate-600 tabular-nums leading-none pl-0.5 pt-0.5"
                  style={{ top: `${py}px` }}
                >
                  {i % 2 === 0 ? Math.round(unitVal / 25) : ''}
                </div>
              );
            })}
          </div>
        )}

        {/* Scrollable Workspace */}
        <div
          id="canvas-scroll-area"
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
          }}
          onPointerDown={() => {
            onSelectElement(null);
            onEndEdit();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isCanvasDragOver) setIsCanvasDragOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsCanvasDragOver(false);
            }
          }}
          onDrop={handleCanvasDrop}
          className="flex-1 overflow-auto flex items-start justify-center p-10 bg-[#9da3ad]"
        >
          {/* Scaled Page Sheet Container */}
          <div
            className={`relative shrink-0 shadow-[0_10px_28px_rgba(0,0,0,0.42)] transition-shadow ${
              isCanvasDragOver ? 'ring-4 ring-sky-400/80 shadow-sky-900/30' : ''
            }`}
            style={{
              width: `${doc.pageWidth * zoom}px`,
              height: `${doc.pageHeight * zoom}px`,
            }}
          >
            <div
              ref={pageSheetRef}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelectElement(null);
                onEndEdit();
              }}
              style={{
                width: `${doc.pageWidth}px`,
                height: `${doc.pageHeight}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                backgroundColor: page.backgroundColor,
                ...getPatternBackground(),
              }}
              className="relative overflow-hidden"
            >
              {/* Snap / Alignment Grid Overlay */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none z-30 opacity-35"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(59,130,246,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.35) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
              )}

              {/* Margin / Bleed Guides */}
              {showGuides && (
                <div
                  className="absolute inset-0 pointer-events-none z-40"
                  style={{
                    borderTopWidth: `${page.margins?.top ?? page.margin}px`,
                    borderRightWidth: `${page.margins?.right ?? page.margin}px`,
                    borderBottomWidth: `${page.margins?.bottom ?? page.margin}px`,
                    borderLeftWidth: `${page.margins?.left ?? page.margin}px`,
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                  }}
                >
                  <div className="w-full h-full border border-fuchsia-500/45" />
                </div>
              )}

              {/* Elements */}
              {page.elements
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((el) => (
                  <ComicElementView
                    key={el.id}
                    element={el}
                    isSelected={el.id === selectedElementId}
                    isEditing={el.id === editingElementId}
                    isAdjustingImage={adjustingPanelId === el.id}
                    interactive
                    onPointerDown={(e) => startMove(el, e)}
                    onStartEdit={() => {
                      if (el.locked) return;
                      if (el.kind === 'panel' && el.imageUrl) {
                        onSelectElement(el.id);
                        setAdjustingPanelId((prev) => (prev === el.id ? null : el.id));
                      } else {
                        onStartEdit(el.id);
                      }
                    }}
                    onWheel={(e) => {
                      if (
                        !el.locked &&
                        el.kind === 'panel' &&
                        el.imageUrl &&
                        (adjustingPanelId === el.id ||
                          (selectedElementId === el.id && e.altKey))
                      ) {
                        e.preventDefault();
                        e.stopPropagation();
                        const delta = e.deltaY < 0 ? 0.08 : -0.08;
                        const nextScale = Math.max(
                          0.15,
                          Math.min(5, Number((el.imageScale + delta).toFixed(2)))
                        );
                        onUpdateElement(el.id, { imageScale: nextScale });
                      }
                    }}
                    onEndEdit={onEndEdit}
                    onChangeText={(txt) =>
                      onUpdateElement(el.id, { text: txt }, false)
                    }
                    onDropImage={(url) => onDropAssetAt(url, el.x + 10, el.y + 10, el.id)}
                  />
                ))}

              {/* Active Selection Handles Overlay */}
              {selectedElement && editingElementId !== selectedElement.id && (
                <>
                  <div
                    className={`absolute pointer-events-none z-50 border-[1.5px] ${
                      selectedElement.locked
                        ? 'border-rose-500 border-dashed'
                        : adjustingPanelId === selectedElement.id
                          ? 'border-amber-500 border-dashed'
                          : 'border-sky-500'
                    }`}
                    style={{
                      left: `${selectedElement.x}px`,
                      top: `${selectedElement.y}px`,
                      width: `${selectedElement.width}px`,
                      height: `${selectedElement.height}px`,
                      transform: `rotate(${selectedElement.rotation}deg)`,
                    }}
                  >
                    {selectedElement.locked && (
                      <div className="pointer-events-none absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wide shadow">
                        {t.lockMenu}
                      </div>
                    )}
                    {/* Translucent Full-Image Ghost Preview & Direct Resize Handles when Adjusting Image */}
                    {selectedElement.kind === 'panel' &&
                      selectedElement.imageUrl &&
                      adjustingPanelId === selectedElement.id &&
                      (() => {
                        const geom = getPanelImageGeom(selectedElement, adjustImgNatSize);
                        const imgCornerHandles: Array<{
                          key: 'nw' | 'ne' | 'sw' | 'se';
                          cursor: string;
                          style: React.CSSProperties;
                        }> = [
                          { key: 'nw', cursor: 'nwse-resize', style: { left: -6, top: -6 } },
                          { key: 'ne', cursor: 'nesw-resize', style: { right: -6, top: -6 } },
                          { key: 'se', cursor: 'nwse-resize', style: { right: -6, bottom: -6 } },
                          { key: 'sw', cursor: 'nesw-resize', style: { left: -6, bottom: -6 } },
                        ];
                        return (
                          <>
                            {/* Translucent uncropped ghost preview */}
                            <img
                              src={selectedElement.imageUrl}
                              alt=""
                              draggable={false}
                              referrerPolicy="no-referrer"
                              className="pointer-events-none absolute opacity-25"
                              style={{
                                left: `${geom.imgCx - geom.baseW / 2}px`,
                                top: `${geom.imgCy - geom.baseH / 2}px`,
                                width: `${geom.baseW}px`,
                                height: `${geom.baseH}px`,
                                maxWidth: 'none',
                                maxHeight: 'none',
                                transform: `rotate(${selectedElement.imageRotation || 0}deg) scale(${selectedElement.imageScale * (selectedElement.flipX ? -1 : 1)}, ${selectedElement.imageScale * (selectedElement.flipY ? -1 : 1)})`,
                                transformOrigin: 'center center',
                              }}
                            />

                            {/* Interactive Amber Image Bounding Box + Corner Resize & Rotate Handles */}
                            <div
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                if (selectedElement.locked) return;
                                dragRef.current = {
                                  type: 'pan-image',
                                  id: selectedElement.id,
                                  startX: e.clientX,
                                  startY: e.clientY,
                                  origOffX: selectedElement.imageOffsetX,
                                  origOffY: selectedElement.imageOffsetY,
                                  boxW: geom.boxW,
                                  boxH: geom.boxH,
                                  panelRot: selectedElement.rotation,
                                };
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setAdjustingPanelId(null);
                              }}
                              onWheel={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const delta = e.deltaY < 0 ? 0.08 : -0.08;
                                const nextScale = Math.max(
                                  0.15,
                                  Math.min(
                                    5,
                                    Number((selectedElement.imageScale + delta).toFixed(2))
                                  )
                                );
                                onUpdateElement(selectedElement.id, { imageScale: nextScale });
                              }}
                              style={{
                                left: `${geom.imgCx - geom.curW / 2}px`,
                                top: `${geom.imgCy - geom.curH / 2}px`,
                                width: `${geom.curW}px`,
                                height: `${geom.curH}px`,
                                transform: `rotate(${selectedElement.imageRotation || 0}deg)`,
                                transformOrigin: 'center center',
                              }}
                              title="Arrastra para mover la foto · Arrastra las esquinas para cambiar su tamaño · Doble clic para terminar"
                              className="pointer-events-auto absolute border-2 border-amber-400 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing"
                            >
                              {/* Size & Scale Badge */}
                              <div className="pointer-events-none absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-amber-300 text-[9px] font-semibold tabular-nums">
                                {Math.round(selectedElement.imageScale * 100)}%
                              </div>

                              {/* Image Rotation Handle */}
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  if (!pageSheetRef.current || selectedElement.locked) return;
                                  const rect = pageSheetRef.current.getBoundingClientRect();
                                  const panelCx = selectedElement.width / 2;
                                  const panelCy = selectedElement.height / 2;
                                  const relX = geom.imgCx - panelCx;
                                  const relY = geom.imgCy - panelCy;
                                  const pRad = (selectedElement.rotation * Math.PI) / 180;
                                  const pageCx =
                                    selectedElement.x +
                                    panelCx +
                                    (relX * Math.cos(pRad) - relY * Math.sin(pRad));
                                  const pageCy =
                                    selectedElement.y +
                                    panelCy +
                                    (relX * Math.sin(pRad) + relY * Math.cos(pRad));
                                  const centerX = rect.left + pageCx * zoom;
                                  const centerY = rect.top + pageCy * zoom;
                                  const startAngle =
                                    (Math.atan2(e.clientY - centerY, e.clientX - centerX) *
                                      180) /
                                    Math.PI;
                                  dragRef.current = {
                                    type: 'rotate-image',
                                    id: selectedElement.id,
                                    centerX,
                                    centerY,
                                    startAngle,
                                    origImgRot: selectedElement.imageRotation || 0,
                                  };
                                }}
                                title="Arrastra para rotar la imagen dentro de la viñeta (Shift = 15°)"
                                className="pointer-events-auto absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-400 border border-slate-900 shadow flex items-center justify-center cursor-grab text-slate-950 hover:bg-amber-300"
                              >
                                <RotateCw className="w-3 h-3" />
                              </div>

                              {/* 4 Corner Handles to Resize Image Inside Panel */}
                              {imgCornerHandles.map((ih) => (
                                <div
                                  key={ih.key}
                                  onPointerDown={(e) => {
                                    e.stopPropagation();
                                    if (selectedElement.locked) return;
                                    dragRef.current = {
                                      type: 'resize-image',
                                      id: selectedElement.id,
                                      handle: ih.key,
                                      startX: e.clientX,
                                      startY: e.clientY,
                                      origScale: selectedElement.imageScale,
                                      origOffX: selectedElement.imageOffsetX,
                                      origOffY: selectedElement.imageOffsetY,
                                      baseW: geom.baseW,
                                      baseH: geom.baseH,
                                      boxW: geom.boxW,
                                      boxH: geom.boxH,
                                      imageRot: selectedElement.imageRotation || 0,
                                      panelRot: selectedElement.rotation,
                                    };
                                  }}
                                  style={{
                                    ...ih.style,
                                    cursor: ih.cursor,
                                  }}
                                  title="Arrastra para hacer la imagen más pequeña o grande"
                                  className="pointer-events-auto absolute w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-900 shadow-md hover:scale-110 transition-transform"
                                />
                              ))}
                            </div>
                          </>
                        );
                      })()}

                    {/* Top Rotation Handle */}
                    {adjustingPanelId !== selectedElement.id && !selectedElement.locked && (
                      <div
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (!pageSheetRef.current || selectedElement.locked) return;
                          const rect = pageSheetRef.current.getBoundingClientRect();
                          const centerX =
                            rect.left +
                            (selectedElement.x + selectedElement.width / 2) * zoom;
                          const centerY =
                            rect.top +
                            (selectedElement.y + selectedElement.height / 2) * zoom;
                          const startAngle =
                            (Math.atan2(e.clientY - centerY, e.clientX - centerX) *
                              180) /
                            Math.PI;
                          dragRef.current = {
                            type: 'rotate',
                            id: selectedElement.id,
                            centerX,
                            centerY,
                            startAngle,
                            origRotation: selectedElement.rotation,
                          };
                        }}
                        title="Drag to rotate (Hold Shift to snap 15°)"
                        className="pointer-events-auto absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border border-sky-600 shadow flex items-center justify-center cursor-grab text-sky-700 hover:bg-sky-50"
                      >
                        <RotateCw className="w-3 h-3" />
                      </div>
                    )}

                    {/* 8 Panel Frame Resize Handles (dimmed & disabled while resizing image inside or locked) */}
                    {resizeHandles.map((h) => (
                      <div
                        key={h.key}
                        onPointerDown={(e) => {
                          if (adjustingPanelId === selectedElement.id || selectedElement.locked) return;
                          e.stopPropagation();
                          dragRef.current = {
                            type: 'resize',
                            id: selectedElement.id,
                            handle: h.key,
                            startX: e.clientX,
                            startY: e.clientY,
                            origX: selectedElement.x,
                            origY: selectedElement.y,
                            origW: selectedElement.width,
                            origH: selectedElement.height,
                          };
                        }}
                        style={{
                          ...h.style,
                          cursor:
                            adjustingPanelId === selectedElement.id || selectedElement.locked
                              ? 'default'
                              : h.cursor,
                        }}
                        className={`absolute w-2.5 h-2.5 bg-white border rounded-[1px] shadow-xs ${
                          selectedElement.locked
                            ? 'pointer-events-none border-rose-500 opacity-50'
                            : adjustingPanelId === selectedElement.id
                              ? 'pointer-events-none border-sky-600 opacity-25'
                              : 'pointer-events-auto border-sky-600'
                        }`}
                      />
                    ))}

                    {/* Panel Image Adjustment Controls */}
                    {selectedElement.kind === 'panel' &&
                      selectedElement.imageUrl &&
                      (adjustingPanelId !== selectedElement.id ? (
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustingPanelId(selectedElement.id);
                          }}
                          title="Ajustar encuadre, tamaño y rotación de la imagen (o doble clic en la viñeta)"
                          className="pointer-events-auto absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow whitespace-nowrap bg-white hover:bg-amber-50 text-slate-700 border border-slate-400"
                        >
                          <Move className="w-2.5 h-2.5 text-amber-600" />
                          <span>{t.panPhoto}</span>
                        </button>
                      ) : (
                        <div
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="pointer-events-auto absolute -bottom-16 left-1/2 -translate-x-1/2 bg-[#1e293b]/95 text-white border border-slate-600 rounded-md shadow-xl px-2 py-1.5 flex flex-col gap-1 z-50 whitespace-nowrap text-[10px]"
                        >
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
                              className="p-0.5 rounded hover:bg-slate-700"
                              title="Hacer más pequeña"
                            >
                              <ZoomOut className="w-3 h-3" />
                            </button>
                            <input
                              type="range"
                              min={0.15}
                              max={5}
                              step={0.05}
                              value={selectedElement.imageScale}
                              onChange={(e) =>
                                onUpdateElement(
                                  selectedElement.id,
                                  { imageScale: Number(e.target.value) },
                                  false
                                )
                              }
                              onPointerUp={() => onCommitHistory()}
                              className="w-24 accent-amber-400 cursor-pointer"
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
                              className="p-0.5 rounded hover:bg-slate-700"
                              title="Hacer más grande"
                            >
                              <ZoomIn className="w-3 h-3" />
                            </button>
                            <span className="tabular-nums w-9 text-right text-amber-300 font-semibold">
                              {Math.round(selectedElement.imageScale * 100)}%
                            </span>

                            <div className="h-3 w-px bg-slate-600 mx-0.5" />

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateElement(selectedElement.id, {
                                  imageRotation: (selectedElement.imageRotation || 0) - 90,
                                })
                              }
                              className="p-0.5 rounded hover:bg-slate-700"
                              title="-90°"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateElement(selectedElement.id, {
                                  imageRotation: (selectedElement.imageRotation || 0) + 90,
                                })
                              }
                              className="p-0.5 rounded hover:bg-slate-700"
                              title="+90°"
                            >
                              <RotateCw className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateElement(selectedElement.id, {
                                  flipX: !selectedElement.flipX,
                                })
                              }
                              className={`p-0.5 rounded hover:bg-slate-700 ${
                                selectedElement.flipX ? 'bg-amber-600' : ''
                              }`}
                              title="Flip H"
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
                              className={`p-0.5 rounded hover:bg-slate-700 ${
                                selectedElement.flipY ? 'bg-amber-600' : ''
                              }`}
                              title="Flip V"
                            >
                              <FlipVertical className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center bg-slate-800 rounded overflow-hidden border border-slate-600">
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
                                  className={`px-1.5 py-0.5 text-[9px] font-medium ${
                                    (selectedElement.imageFit || 'cover') === fitKey
                                      ? 'bg-amber-500 text-slate-950 font-bold'
                                      : 'text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                  {fitLabel}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1">
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
                                className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[9px]"
                              >
                                {t.resetImageAdjust}
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdjustingPanelId(null)}
                                className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-0.5 text-[9px]"
                              >
                                <Check className="w-2.5 h-2.5" />
                                <span>{t.doneAdjustImage}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Draggable Speech Balloon Tail Tip Handle */}
                  {selectedElement.kind === 'balloon' &&
                    selectedElement.tail.enabled &&
                    selectedElement.tail.style !== 'none' &&
                    selectedElement.balloonType !== 'caption' &&
                    selectedElement.balloonType !== 'text' &&
                    !selectedElement.locked && (
                      <div
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (selectedElement.locked) return;
                          dragRef.current = {
                            type: 'tail',
                            id: selectedElement.id,
                            startX: e.clientX,
                            startY: e.clientY,
                            origTipX: selectedElement.tail.tipX,
                            origTipY: selectedElement.tail.tipY,
                          };
                        }}
                        title="Drag speech balloon tail tip"
                        style={{
                          left: `${selectedElement.tail.tipX - 6}px`,
                          top: `${selectedElement.tail.tipY - 6}px`,
                        }}
                        className="absolute z-50 w-3 h-3 bg-amber-400 border-2 border-slate-900 rotate-45 cursor-crosshair shadow"
                      />
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Zoom & Status Strip */}
      <div className="no-print h-6 bg-[#e2e5ea] border-t border-slate-400/80 flex items-center justify-between px-3 text-[11px] text-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <select
            value={Math.round(zoom * 100)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'fit' && scrollRef.current) {
                onFitZoom(
                  scrollRef.current.clientWidth,
                  scrollRef.current.clientHeight
                );
              } else {
                onChangeZoom(Number(v) / 100);
              }
            }}
            className="h-4.5 bg-white border border-slate-400 rounded-2xs px-1 text-[10px] font-medium tabular-nums outline-none"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={90}>90%</option>
            <option value={100}>100%</option>
            <option value={105}>105%</option>
            <option value={125}>125%</option>
            <option value={150}>150%</option>
            <option value={200}>200%</option>
            <option value="fit">{t.fit}</option>
          </select>
          <span className="text-[10px] text-slate-600 tabular-nums">
            {t.currentZoom.replace('{pct}', String(Math.round(zoom * 100)))}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-600">
          <span>{t.canvasHint}</span>
          <span className="font-semibold text-slate-800 tabular-nums">
            {t.pageOf
              .replace('{current}', String(pageIndex + 1))
              .replace('{total}', String(doc.pages.length))}
          </span>
        </div>
      </div>
    </div>
  );
};
