import React, { useEffect, useRef, useState } from 'react';
import {
  BalloonElement,
  ComicElement,
  LetteringElement,
  PanelElement,
} from '../types/comic';
import { processInstantAlpha } from '../utils/instantAlpha';

interface Props {
  element: ComicElement;
  isSelected?: boolean;
  isEditing?: boolean;
  isAdjustingImage?: boolean;
  interactive?: boolean;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  onChangeText?: (text: string) => void;
  onDropImage?: (imageUrl: string) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onWheel?: (e: React.WheelEvent) => void;
}

function getPanelFilterCss(p: PanelElement): string {
  const parts: string[] = [];
  if (p.brightness !== 100) parts.push(`brightness(${p.brightness}%)`);
  if (p.contrast !== 100) parts.push(`contrast(${p.contrast}%)`);
  if (p.saturation !== 100) parts.push(`saturate(${p.saturation}%)`);
  switch (p.imageFilter) {
    case 'comic':
      parts.push('contrast(135%) saturate(135%)');
      break;
    case 'halftone':
      parts.push('contrast(145%) grayscale(25%)');
      break;
    case 'bw-ink':
      parts.push('grayscale(100%) contrast(175%) brightness(105%)');
      break;
    case 'sepia':
      parts.push('sepia(85%) contrast(110%)');
      break;
    case 'sketch':
      parts.push('grayscale(100%) contrast(210%) brightness(115%)');
      break;
    case 'posterize':
      parts.push('contrast(160%) saturate(150%)');
      break;
    case 'vivid':
      parts.push('saturate(175%) contrast(115%)');
      break;
    default:
      break;
  }
  return parts.join(' ') || 'none';
}

function getPanelPath(w: number, h: number, shape: PanelElement['shape'], r: number): string {
  if (shape === 'skew-left') {
    const sk = Math.min(28, w * 0.12);
    return `M ${sk},0 L ${w},0 L ${w - sk},${h} L 0,${h} Z`;
  }
  if (shape === 'skew-right') {
    const sk = Math.min(28, w * 0.12);
    return `M 0,0 L ${w - sk},0 L ${w},${h} L ${sk},${h} Z`;
  }
  if (shape === 'pentagon') {
    return `M ${w * 0.5},0 L ${w},${h * 0.36} L ${w * 0.82},${h} L ${w * 0.18},${h} L 0,${h * 0.36} Z`;
  }
  const rad = shape === 'rounded' ? Math.max(r, 14) : r;
  const cr = Math.min(rad, w / 2, h / 2);
  if (cr <= 0) {
    return `M 0,0 H ${w} V ${h} H 0 Z`;
  }
  return `M ${cr},0 H ${w - cr} Q ${w},0 ${w},${cr} V ${h - cr} Q ${w},${h} ${w - cr},${h} H ${cr} Q 0,${h} 0,${h - cr} V ${cr} Q 0,0 ${cr},0 Z`;
}

function buildBurstPath(w: number, h: number, spikes = 16, innerFactor = 0.78): string {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - 2;
  const ry = h / 2 - 2;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const f = i % 2 === 0 ? 1 : innerFactor;
    const x = cx + Math.cos(angle) * rx * f;
    const y = cy + Math.sin(angle) * ry * f;
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `${pts.join(' ')} Z`;
}

function buildCloudPath(w: number, h: number): string {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - 3;
  const ry = h / 2 - 3;
  const bumps = 12;
  let d = '';
  for (let i = 0; i < bumps; i++) {
    const a1 = (i / bumps) * Math.PI * 2;
    const a2 = ((i + 1) / bumps) * Math.PI * 2;
    const am = (a1 + a2) / 2;
    const x1 = cx + Math.cos(a1) * rx * 0.88;
    const y1 = cy + Math.sin(a1) * ry * 0.85;
    const x2 = cx + Math.cos(a2) * rx * 0.88;
    const y2 = cy + Math.sin(a2) * ry * 0.85;
    const cpX = cx + Math.cos(am) * rx * 1.12;
    const cpY = cy + Math.sin(am) * ry * 1.12;
    if (i === 0) d += `M ${x1.toFixed(1)},${y1.toFixed(1)} `;
    d += `Q ${cpX.toFixed(1)},${cpY.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} `;
  }
  return `${d}Z`;
}

const PanelView: React.FC<{
  panel: PanelElement;
  interactive: boolean;
  onDropImage?: (url: string) => void;
}> = ({ panel, interactive, onDropImage }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(panel.imageUrl);
  const [natSize, setNatSize] = useState<{ w: number; h: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    let active = true;
    setNatSize(null);
    if (!panel.imageUrl) {
      setResolvedUrl(null);
      return;
    }
    if (panel.instantAlpha.enabled) {
      processInstantAlpha(
        panel.imageUrl,
        panel.instantAlpha.color,
        panel.instantAlpha.tolerance
      ).then((out) => {
        if (active) setResolvedUrl(out);
      });
    } else {
      setResolvedUrl(panel.imageUrl);
    }
    return () => {
      active = false;
    };
  }, [
    panel.imageUrl,
    panel.instantAlpha.enabled,
    panel.instantAlpha.color,
    panel.instantAlpha.tolerance,
  ]);

  const clipId = `clip-${panel.id}`;
  const pathD = getPanelPath(panel.width, panel.height, panel.shape, panel.cornerRadius);

  const hasImagePayload = (dt: DataTransfer) =>
    dt.types.includes('application/x-comic-asset') ||
    dt.types.includes('Files') ||
    dt.types.includes('text/uri-list');

  const handleDrop = (e: React.DragEvent) => {
    if (!interactive) return;
    const assetUrl = e.dataTransfer.getData('application/x-comic-asset');
    if (assetUrl && onDropImage) {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      onDropImage(assetUrl);
      return;
    }
    if (e.dataTransfer.files?.length === 1 && onDropImage) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') onDropImage(reader.result);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    const uri = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (uri && /^(https?:|data:image\/)/i.test(uri.trim()) && onDropImage) {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      onDropImage(uri.trim().split('\n')[0]);
      return;
    }
    setDragOver(false);
  };

  const boxW = Math.max(4, panel.width - panel.padding * 2);
  const boxH = Math.max(4, panel.height - panel.padding * 2);
  const fitMode = panel.imageFit || 'cover';
  let baseW = boxW;
  let baseH = boxH;
  if (natSize && natSize.w > 0 && natSize.h > 0) {
    if (fitMode === 'cover') {
      const s = Math.max(boxW / natSize.w, boxH / natSize.h);
      baseW = natSize.w * s;
      baseH = natSize.h * s;
    } else if (fitMode === 'contain') {
      const s = Math.min(boxW / natSize.w, boxH / natSize.h);
      baseW = natSize.w * s;
      baseH = natSize.h * s;
    }
  }
  const offsetPxX = (panel.imageOffsetX / 100) * boxW;
  const offsetPxY = (panel.imageOffsetY / 100) * boxH;

  return (
    <div
      className="w-full h-full relative"
      style={{
        filter: panel.shadow ? `drop-shadow(4px 5px 8px ${panel.shadowColor || 'rgba(0,0,0,0.45)'})` : undefined,
      }}
      onDragOver={(e) => {
        if (!interactive) return;
        e.preventDefault();
        if (hasImagePayload(e.dataTransfer)) {
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <svg
        width={panel.width}
        height={panel.height}
        viewBox={`0 0 ${panel.width} ${panel.height}`}
        className="w-full h-full block overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            {panel.shape === 'ellipse' ? (
              <ellipse
                cx={panel.width / 2}
                cy={panel.height / 2}
                rx={Math.max(2, panel.width / 2 - panel.padding)}
                ry={Math.max(2, panel.height / 2 - panel.padding)}
              />
            ) : (
              <path d={pathD} />
            )}
          </clipPath>
        </defs>

        {/* Background fill */}
        {panel.fillEnabled &&
          (panel.shape === 'ellipse' ? (
            <ellipse
              cx={panel.width / 2}
              cy={panel.height / 2}
              rx={panel.width / 2}
              ry={panel.height / 2}
              fill={panel.fillColor}
            />
          ) : (
            <path d={pathD} fill={panel.fillColor} />
          ))}

        {/* Clipped Photo */}
        {resolvedUrl && (
          <g clipPath={`url(#${clipId})`}>
            <foreignObject
              x={panel.padding}
              y={panel.padding}
              width={boxW}
              height={boxH}
            >
              <div className="w-full h-full overflow-hidden relative">
                <img
                  src={resolvedUrl}
                  alt="Comic panel"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onLoad={(e) => {
                    const nw = e.currentTarget.naturalWidth;
                    const nh = e.currentTarget.naturalHeight;
                    if (nw > 0 && nh > 0) {
                      setNatSize({ w: nw, h: nh });
                    }
                  }}
                  className={`pointer-events-none absolute ${
                    natSize
                      ? ''
                      : fitMode === 'contain'
                        ? 'object-contain'
                        : fitMode === 'fill'
                          ? 'object-fill'
                          : 'object-cover'
                  }`}
                  style={{
                    left: `${(boxW - baseW) / 2}px`,
                    top: `${(boxH - baseH) / 2}px`,
                    width: `${baseW}px`,
                    height: `${baseH}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `translate(${offsetPxX}px, ${offsetPxY}px) rotate(${panel.imageRotation || 0}deg) scale(${panel.imageScale * (panel.flipX ? -1 : 1)}, ${panel.imageScale * (panel.flipY ? -1 : 1)})`,
                    transformOrigin: 'center center',
                    filter: getPanelFilterCss(panel),
                  }}
                />
                {panel.imageFilter === 'halftone' && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
                      backgroundSize: '6px 6px',
                    }}
                  />
                )}
              </div>
            </foreignObject>
          </g>
        )}

        {/* Stroke */}
        {panel.strokeEnabled &&
          panel.strokeWidth > 0 &&
          (panel.shape === 'ellipse' ? (
            <ellipse
              cx={panel.width / 2}
              cy={panel.height / 2}
              rx={panel.width / 2}
              ry={panel.height / 2}
              fill="none"
              stroke={dragOver ? '#3b82f6' : panel.strokeColor}
              strokeWidth={dragOver ? 3 : panel.strokeWidth}
            />
          ) : (
            <path
              d={pathD}
              fill="none"
              stroke={dragOver ? '#3b82f6' : panel.strokeColor}
              strokeWidth={dragOver ? 3 : panel.strokeWidth}
            />
          ))}
      </svg>

      {interactive && !resolvedUrl && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${
            dragOver ? 'opacity-100 bg-blue-500/15' : 'opacity-0 hover:opacity-100'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 bg-white/85 px-2.5 py-1 rounded shadow-sm">
            Drop photo here
          </span>
        </div>
      )}
    </div>
  );
};

const BalloonView: React.FC<{
  balloon: BalloonElement;
  isEditing: boolean;
  onChangeText?: (t: string) => void;
  onEndEdit?: () => void;
}> = ({ balloon, isEditing, onChangeText, onEndEdit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const cx = balloon.width / 2;
  const cy = balloon.height / 2;

  // Tail vector in local balloon coordinates
  const tipLocalX = balloon.tail.tipX - balloon.x;
  const tipLocalY = balloon.tail.tipY - balloon.y;
  const dx = tipLocalX - cx;
  const dy = tipLocalY - cy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const halfBase = balloon.tail.width / 2;

  const base1X = cx + nx * halfBase;
  const base1Y = cy + ny * halfBase;
  const base2X = cx - nx * halfBase;
  const base2Y = cy - ny * halfBase;
  const ctrlX = (cx + tipLocalX) / 2 + nx * halfBase * 0.95;
  const ctrlY = (cy + tipLocalY) / 2 + ny * halfBase * 0.95;

  const showTail =
    balloon.tail.enabled &&
    balloon.tail.style !== 'none' &&
    balloon.balloonType !== 'caption' &&
    balloon.balloonType !== 'text';
  const isBubbleTail = showTail && (balloon.tail.style === 'bubbles' || balloon.balloonType === 'thought');
  const isPolygonTail = showTail && !isBubbleTail;

  const renderShape = (fill: string, stroke: string, strokeWidth: number) => {
    if (balloon.balloonType === 'text') {
      if (!balloon.fillEnabled && !balloon.strokeEnabled) return null;
      return (
        <rect
          x={1}
          y={1}
          width={Math.max(4, balloon.width - 2)}
          height={Math.max(4, balloon.height - 2)}
          rx={Math.min(balloon.cornerRadius, balloon.width / 2, balloon.height / 2)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    if (balloon.balloonType === 'speech' || balloon.balloonType === 'whisper') {
      return (
        <ellipse
          cx={cx}
          cy={cy}
          rx={Math.max(4, cx - 1)}
          ry={Math.max(4, cy - 1)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={balloon.balloonType === 'whisper' ? '5 4' : undefined}
        />
      );
    }
    if (balloon.balloonType === 'thought') {
      return (
        <path
          d={buildCloudPath(balloon.width, balloon.height)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    if (balloon.balloonType === 'burst') {
      return (
        <path
          d={buildBurstPath(balloon.width, balloon.height, 16, 0.78)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      );
    }
    if (balloon.balloonType === 'exclaim') {
      return (
        <path
          d={buildBurstPath(balloon.width, balloon.height, 12, 0.68)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      );
    }
    const r = balloon.balloonType === 'caption' ? balloon.cornerRadius : Math.max(8, balloon.cornerRadius);
    return (
      <rect
        x={1}
        y={1}
        width={Math.max(4, balloon.width - 2)}
        height={Math.max(4, balloon.height - 2)}
        rx={Math.min(r, balloon.width / 2, balloon.height / 2)}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  };

  const tailPathD =
    balloon.tail.style === 'curved'
      ? `M ${base1X},${base1Y} Q ${ctrlX},${ctrlY} ${tipLocalX},${tipLocalY} Q ${(cx + tipLocalX) / 2},${(cy + tipLocalY) / 2} ${base2X},${base2Y} Z`
      : `M ${base1X},${base1Y} L ${tipLocalX},${tipLocalY} L ${base2X},${base2Y} Z`;

  const fillVal = balloon.fillEnabled ? balloon.fillColor : 'transparent';
  const strokeVal = balloon.strokeEnabled ? balloon.strokeColor : 'none';
  const strokeW = balloon.strokeEnabled ? balloon.strokeWidth : 0;

  return (
    <div
      className="w-full h-full relative"
      style={{
        filter: balloon.shadow ? 'drop-shadow(2px 3px 5px rgba(0,0,0,0.32))' : undefined,
      }}
    >
      <svg
        width={balloon.width}
        height={balloon.height}
        viewBox={`0 0 ${balloon.width} ${balloon.height}`}
        className="w-full h-full block overflow-visible"
      >
        {isPolygonTail && (
          <path
            d={tailPathD}
            fill={fillVal}
            stroke={strokeVal}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        )}

        {isBubbleTail &&
          [1, 2, 3].map((step) => {
            const t = step / 3.5;
            const bx = cx + dx * (0.45 + t * 0.55);
            const by = cy + dy * (0.45 + t * 0.55);
            const r = Math.max(3, (1 - t * 0.6) * 8);
            return (
              <circle
                key={step}
                cx={bx}
                cy={by}
                r={r}
                fill={fillVal}
                stroke={strokeVal}
                strokeWidth={strokeW}
              />
            );
          })}

        {renderShape(fillVal, strokeVal, strokeW)}

        {/* Cover inner tail stroke seam */}
        {isPolygonTail && balloon.fillEnabled && (
          <path d={tailPathD} fill={balloon.fillColor} stroke="none" />
        )}
      </svg>

      {/* Text Layer */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          padding: `${balloon.padding + (balloon.balloonType === 'burst' ? 14 : 6)}px`,
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={balloon.text}
            onChange={(e) => onChangeText?.(e.target.value)}
            onBlur={() => onEndEdit?.()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onEndEdit?.();
              }
              e.stopPropagation();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent resize-none outline-none pointer-events-auto leading-tight"
            style={{
              fontFamily: `"${balloon.fontFamily}", sans-serif`,
              fontSize: `${balloon.fontSize}px`,
              fontWeight: balloon.fontWeight,
              fontStyle: balloon.italic ? 'italic' : 'normal',
              textDecoration: balloon.underline ? 'underline' : 'none',
              textAlign: balloon.textAlign,
              color: balloon.textColor,
              lineHeight: balloon.lineHeight ?? 1.2,
              letterSpacing: `${balloon.letterSpacing ?? 0}px`,
            }}
          />
        ) : (
          <div
            className="w-full whitespace-pre-wrap break-words"
            style={{
              fontFamily: `"${balloon.fontFamily}", sans-serif`,
              fontSize: `${balloon.fontSize}px`,
              fontWeight: balloon.fontWeight,
              fontStyle: balloon.italic ? 'italic' : 'normal',
              textDecoration: balloon.underline ? 'underline' : 'none',
              textAlign: balloon.textAlign,
              color: balloon.textColor,
              lineHeight: balloon.lineHeight ?? 1.2,
              letterSpacing: `${balloon.letterSpacing ?? 0}px`,
            }}
          >
            {balloon.text}
          </div>
        )}
      </div>
    </div>
  );
};

const LetteringView: React.FC<{
  lettering: LetteringElement;
  isEditing: boolean;
  onChangeText?: (t: string) => void;
  onEndEdit?: () => void;
}> = ({ lettering, isEditing, onChangeText, onEndEdit }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const gradId = `grad-${lettering.id}`;
  const pathId = `arc-${lettering.id}`;
  const w = lettering.width;
  const h = lettering.height;

  const isArcUp = lettering.warp === 'arc-up';
  const isArcDown = lettering.warp === 'arc-down';
  const isWave = lettering.warp === 'wave';
  const skewTransform = lettering.warp === 'slant' ? 'skewY(-4)' : undefined;
  const textDeco = lettering.underline ? 'underline' : 'none';
  const straightAnchor =
    lettering.textAlign === 'left'
      ? 'start'
      : lettering.textAlign === 'right'
        ? 'end'
        : 'middle';
  const straightX =
    lettering.textAlign === 'left'
      ? 8
      : lettering.textAlign === 'right'
        ? w - 8
        : w / 2;

  return (
    <div className="w-full h-full relative">
      {isEditing ? (
        <input
          ref={inputRef}
          value={lettering.text}
          onChange={(e) => onChangeText?.(e.target.value)}
          onBlur={() => onEndEdit?.()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') onEndEdit?.();
            e.stopPropagation();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full h-full bg-white/80 outline-2 outline-blue-500 rounded px-2"
          style={{
            fontFamily: `${lettering.fontFamily}, Impact, sans-serif`,
            fontSize: `${Math.min(lettering.fontSize, 44)}px`,
            fontWeight: lettering.fontWeight,
            fontStyle: lettering.italic ? 'italic' : 'normal',
            textDecoration: textDeco,
            textAlign: lettering.textAlign === 'justify' ? 'center' : lettering.textAlign,
            color: '#0f172a',
          }}
        />
      ) : (
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-full block overflow-visible"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lettering.fillTopColor} />
              <stop offset="100%" stopColor={lettering.fillBottomColor} />
            </linearGradient>
            {isArcUp && (
              <path id={pathId} d={`M 8,${h * 0.78} Q ${w / 2},${h * 0.1} ${w - 8},${h * 0.78}`} />
            )}
            {isArcDown && (
              <path id={pathId} d={`M 8,${h * 0.28} Q ${w / 2},${h * 0.92} ${w - 8},${h * 0.28}`} />
            )}
            {isWave && (
              <path
                id={pathId}
                d={`M 8,${h * 0.55} Q ${w * 0.25},${h * 0.15} ${w * 0.5},${h * 0.55} T ${w - 8},${h * 0.55}`}
              />
            )}
          </defs>

          <g transform={skewTransform}>
            {isArcUp || isArcDown || isWave ? (
              <>
                {lettering.shadow && (
                  <text
                    dx={lettering.shadowOffsetX}
                    dy={lettering.shadowOffsetY}
                    fill={lettering.shadowColor}
                    fontFamily={`${lettering.fontFamily}, Impact, sans-serif`}
                    fontSize={lettering.fontSize}
                    fontWeight={lettering.fontWeight}
                    fontStyle={lettering.italic ? 'italic' : 'normal'}
                    textDecoration={textDeco}
                    textAnchor="middle"
                  >
                    <textPath href={`#${pathId}`} startOffset="50%">
                      {lettering.text}
                    </textPath>
                  </text>
                )}
                <text
                  fill={`url(#${gradId})`}
                  stroke={lettering.strokeEnabled ? lettering.strokeColor : 'none'}
                  strokeWidth={lettering.strokeEnabled ? lettering.strokeWidth * 2 : 0}
                  paintOrder="stroke fill"
                  strokeLinejoin="round"
                  fontFamily={`${lettering.fontFamily}, Impact, sans-serif`}
                  fontSize={lettering.fontSize}
                  fontWeight={lettering.fontWeight}
                  fontStyle={lettering.italic ? 'italic' : 'normal'}
                  textDecoration={textDeco}
                  textAnchor="middle"
                >
                  <textPath href={`#${pathId}`} startOffset="50%">
                    {lettering.text}
                  </textPath>
                </text>
              </>
            ) : (
              <>
                {lettering.shadow && (
                  <text
                    x={straightX + lettering.shadowOffsetX}
                    y={h / 2 + lettering.shadowOffsetY}
                    dominantBaseline="central"
                    textAnchor={straightAnchor}
                    fill={lettering.shadowColor}
                    fontFamily={`${lettering.fontFamily}, Impact, sans-serif`}
                    fontSize={lettering.fontSize}
                    fontWeight={lettering.fontWeight}
                    fontStyle={lettering.italic ? 'italic' : 'normal'}
                    textDecoration={textDeco}
                  >
                    {lettering.text}
                  </text>
                )}
                <text
                  x={straightX}
                  y={h / 2}
                  dominantBaseline="central"
                  textAnchor={straightAnchor}
                  fill={`url(#${gradId})`}
                  stroke={lettering.strokeEnabled ? lettering.strokeColor : 'none'}
                  strokeWidth={lettering.strokeEnabled ? lettering.strokeWidth * 2 : 0}
                  paintOrder="stroke fill"
                  strokeLinejoin="round"
                  fontFamily={`${lettering.fontFamily}, Impact, sans-serif`}
                  fontSize={lettering.fontSize}
                  fontWeight={lettering.fontWeight}
                  fontStyle={lettering.italic ? 'italic' : 'normal'}
                  textDecoration={textDeco}
                >
                  {lettering.text}
                </text>
              </>
            )}
          </g>
        </svg>
      )}
    </div>
  );
};

export const ComicElementView: React.FC<Props> = ({
  element,
  isEditing = false,
  isAdjustingImage = false,
  interactive = true,
  onStartEdit,
  onEndEdit,
  onChangeText,
  onDropImage,
  onPointerDown,
  onWheel,
}) => {
  return (
    <div
      onPointerDown={onPointerDown}
      onWheel={onWheel}
      onDoubleClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        if (
          element.kind === 'balloon' ||
          element.kind === 'lettering' ||
          (element.kind === 'panel' && element.imageUrl)
        ) {
          onStartEdit?.();
        }
      }}
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity / 100,
        zIndex: element.zIndex,
        cursor: interactive ? (isAdjustingImage ? 'grab' : 'move') : 'default',
      }}
    >
      {element.kind === 'panel' && (
        <PanelView
          panel={element}
          interactive={interactive}
          onDropImage={onDropImage}
        />
      )}
      {element.kind === 'balloon' && (
        <BalloonView
          balloon={element}
          isEditing={isEditing}
          onChangeText={onChangeText}
          onEndEdit={onEndEdit}
        />
      )}
      {element.kind === 'lettering' && (
        <LetteringView
          lettering={element}
          isEditing={isEditing}
          onChangeText={onChangeText}
          onEndEdit={onEndEdit}
        />
      )}
    </div>
  );
};
