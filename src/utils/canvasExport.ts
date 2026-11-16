import {
  BalloonElement,
  ComicDocument,
  ComicElement,
  ComicPage,
  LetteringElement,
  PanelElement,
} from '../types/comic';
import { processInstantAlpha } from './instantAlpha';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function buildFilterString(panel: PanelElement): string {
  const filters: string[] = [];
  if (panel.brightness !== 100) filters.push(`brightness(${panel.brightness}%)`);
  if (panel.contrast !== 100) filters.push(`contrast(${panel.contrast}%)`);
  if (panel.saturation !== 100) filters.push(`saturate(${panel.saturation}%)`);

  switch (panel.imageFilter) {
    case 'comic':
      filters.push('contrast(135%) saturate(135%)');
      break;
    case 'halftone':
      filters.push('contrast(145%) grayscale(25%)');
      break;
    case 'bw-ink':
      filters.push('grayscale(100%) contrast(175%) brightness(105%)');
      break;
    case 'sepia':
      filters.push('sepia(85%) contrast(110%)');
      break;
    case 'sketch':
      filters.push('grayscale(100%) contrast(210%) brightness(115%)');
      break;
    case 'posterize':
      filters.push('contrast(160%) saturate(150%)');
      break;
    case 'vivid':
      filters.push('saturate(175%) contrast(115%)');
      break;
    default:
      break;
  }
  return filters.length ? filters.join(' ') : 'none';
}

function tracePanelShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: PanelElement['shape'],
  radius: number
) {
  ctx.beginPath();
  if (shape === 'ellipse') {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === 'skew-left') {
    const skew = Math.min(28, w * 0.12);
    ctx.moveTo(x + skew, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - skew, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  } else if (shape === 'skew-right') {
    const skew = Math.min(28, w * 0.12);
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - skew, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + skew, y + h);
    ctx.closePath();
  } else if (shape === 'pentagon') {
    ctx.moveTo(x + w * 0.5, y);
    ctx.lineTo(x + w, y + h * 0.36);
    ctx.lineTo(x + w * 0.82, y + h);
    ctx.lineTo(x + w * 0.18, y + h);
    ctx.lineTo(x, y + h * 0.36);
    ctx.closePath();
  } else {
    const r = shape === 'rounded' ? Math.max(radius, 14) : radius;
    const clampedR = Math.min(r, w / 2, h / 2);
    if (clampedR > 0) {
      ctx.roundRect(x, y, w, h, clampedR);
    } else {
      ctx.rect(x, y, w, h);
    }
  }
}

function drawBurstPoints(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  spikes = 16,
  innerFactor = 0.78
) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const factor = i % 2 === 0 ? 1 : innerFactor;
    const px = cx + Math.cos(angle) * rx * factor;
    const py = cy + Math.sin(angle) * ry * factor;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawCloudPoints(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const bumps = 12;
  ctx.beginPath();
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
    if (i === 0) ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpX, cpY, x2, y2);
  }
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    lines.push(current);
  }
  return lines;
}

async function renderPanelToCanvas(
  ctx: CanvasRenderingContext2D,
  panel: PanelElement
) {
  ctx.save();
  const cx = panel.x + panel.width / 2;
  const cy = panel.y + panel.height / 2;
  ctx.translate(cx, cy);
  ctx.rotate((panel.rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  ctx.globalAlpha = panel.opacity / 100;

  if (panel.shadow) {
    ctx.save();
    ctx.shadowColor = panel.shadowColor || 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 5;
    tracePanelShape(
      ctx,
      panel.x,
      panel.y,
      panel.width,
      panel.height,
      panel.shape,
      panel.cornerRadius
    );
    ctx.fillStyle = panel.fillEnabled ? panel.fillColor : '#ffffff';
    ctx.fill();
    ctx.restore();
  }

  // Fill background
  if (panel.fillEnabled) {
    tracePanelShape(
      ctx,
      panel.x,
      panel.y,
      panel.width,
      panel.height,
      panel.shape,
      panel.cornerRadius
    );
    ctx.fillStyle = panel.fillColor;
    ctx.fill();
  }

  // Draw clipped image
  if (panel.imageUrl) {
    const src = panel.instantAlpha.enabled
      ? await processInstantAlpha(
          panel.imageUrl,
          panel.instantAlpha.color,
          panel.instantAlpha.tolerance
        )
      : panel.imageUrl;
    const img = await loadImage(src);
    if (img) {
      ctx.save();
      tracePanelShape(
        ctx,
        panel.x + panel.padding,
        panel.y + panel.padding,
        Math.max(4, panel.width - panel.padding * 2),
        Math.max(4, panel.height - panel.padding * 2),
        panel.shape,
        Math.max(0, panel.cornerRadius - panel.padding)
      );
      ctx.clip();

      ctx.filter = buildFilterString(panel);

      const boxW = Math.max(4, panel.width - panel.padding * 2);
      const boxH = Math.max(4, panel.height - panel.padding * 2);
      const fitMode = panel.imageFit || 'cover';
      let baseW = boxW;
      let baseH = boxH;
      if (fitMode === 'cover') {
        const s = Math.max(boxW / img.width, boxH / img.height);
        baseW = img.width * s;
        baseH = img.height * s;
      } else if (fitMode === 'contain') {
        const s = Math.min(boxW / img.width, boxH / img.height);
        baseW = img.width * s;
        baseH = img.height * s;
      }
      const offsetX = (panel.imageOffsetX / 100) * boxW;
      const offsetY = (panel.imageOffsetY / 100) * boxH;
      const boxCx = panel.x + panel.padding + boxW / 2;
      const boxCy = panel.y + panel.padding + boxH / 2;
      ctx.save();
      ctx.translate(boxCx + offsetX, boxCy + offsetY);
      ctx.rotate(((panel.imageRotation || 0) * Math.PI) / 180);
      ctx.scale(
        panel.imageScale * (panel.flipX ? -1 : 1),
        panel.imageScale * (panel.flipY ? -1 : 1)
      );
      ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
      ctx.restore();
      ctx.filter = 'none';

      if (panel.imageFilter === 'halftone') {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        for (let hx = panel.x; hx < panel.x + panel.width; hx += 6) {
          for (let hy = panel.y; hy < panel.y + panel.height; hy += 6) {
            ctx.beginPath();
            ctx.arc(hx, hy, 1.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }

  // Draw stroke
  if (panel.strokeEnabled && panel.strokeWidth > 0) {
    tracePanelShape(
      ctx,
      panel.x,
      panel.y,
      panel.width,
      panel.height,
      panel.shape,
      panel.cornerRadius
    );
    ctx.strokeStyle = panel.strokeColor;
    ctx.lineWidth = panel.strokeWidth;
    ctx.stroke();
  }

  ctx.restore();
}

function renderBalloonToCanvas(
  ctx: CanvasRenderingContext2D,
  b: BalloonElement
) {
  ctx.save();
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  ctx.translate(cx, cy);
  ctx.rotate((b.rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  ctx.globalAlpha = b.opacity / 100;

  if (b.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
  }

  const drawBody = () => {
    if (b.balloonType === 'speech' || b.balloonType === 'whisper') {
      ctx.beginPath();
      ctx.ellipse(cx, cy, b.width / 2, b.height / 2, 0, 0, Math.PI * 2);
    } else if (b.balloonType === 'thought') {
      drawCloudPoints(ctx, b.x, b.y, b.width, b.height);
    } else if (b.balloonType === 'burst') {
      drawBurstPoints(ctx, cx, cy, b.width / 2, b.height / 2, 16, 0.78);
    } else if (b.balloonType === 'exclaim') {
      drawBurstPoints(ctx, cx, cy, b.width / 2, b.height / 2, 12, 0.68);
    } else {
      ctx.beginPath();
      const r = b.balloonType === 'caption' ? b.cornerRadius : Math.max(8, b.cornerRadius);
      ctx.roundRect(b.x, b.y, b.width, b.height, Math.min(r, b.width / 2, b.height / 2));
    }
  };

  // Tail geometry for speech/rect-speech/whisper/burst
  const drawTailPolygon = () => {
    if (
      !b.tail.enabled ||
      b.tail.style === 'none' ||
      b.balloonType === 'caption' ||
      b.balloonType === 'text'
    )
      return;
    if (b.tail.style === 'bubbles' || b.balloonType === 'thought') {
      const steps = 3;
      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 0.5);
        const bx = cx + (b.tail.tipX - cx) * (0.45 + t * 0.55);
        const by = cy + (b.tail.tipY - cy) * (0.45 + t * 0.55);
        const r = Math.max(3, (1 - t * 0.6) * 8);
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        if (b.fillEnabled) {
          ctx.fillStyle = b.fillColor;
          ctx.fill();
        }
        if (b.strokeEnabled && b.strokeWidth > 0) {
          ctx.strokeStyle = b.strokeColor;
          ctx.lineWidth = b.strokeWidth;
          ctx.stroke();
        }
      }
      return;
    }

    const dx = b.tail.tipX - cx;
    const dy = b.tail.tipY - cy;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const halfBase = b.tail.width / 2;
    const base1X = cx + nx * halfBase;
    const base1Y = cy + ny * halfBase;
    const base2X = cx - nx * halfBase;
    const base2Y = cy - ny * halfBase;
    const ctrlX = (cx + b.tail.tipX) / 2 + nx * halfBase * 0.9;
    const ctrlY = (cy + b.tail.tipY) / 2 + ny * halfBase * 0.9;

    ctx.beginPath();
    ctx.moveTo(base1X, base1Y);
    if (b.tail.style === 'curved') {
      ctx.quadraticCurveTo(ctrlX, ctrlY, b.tail.tipX, b.tail.tipY);
      ctx.quadraticCurveTo(
        (cx + b.tail.tipX) / 2,
        (cy + b.tail.tipY) / 2,
        base2X,
        base2Y
      );
    } else {
      ctx.lineTo(b.tail.tipX, b.tail.tipY);
      ctx.lineTo(base2X, base2Y);
    }
    ctx.closePath();
    if (b.fillEnabled) {
      ctx.fillStyle = b.fillColor;
      ctx.fill();
    }
    if (b.strokeEnabled && b.strokeWidth > 0) {
      ctx.strokeStyle = b.strokeColor;
      ctx.lineWidth = b.strokeWidth;
      ctx.stroke();
    }
  };

  if (b.tail.enabled && (b.tail.style === 'bubbles' || b.balloonType === 'thought')) {
    drawTailPolygon();
  } else if (b.tail.enabled) {
    // Draw tail stroke first, then body fill covers base seam
    drawTailPolygon();
  }

  drawBody();
  if (b.fillEnabled) {
    ctx.fillStyle = b.fillColor;
    ctx.fill();
  }
  ctx.shadowColor = 'transparent';
  if (b.strokeEnabled && b.strokeWidth > 0) {
    if (b.balloonType === 'whisper') {
      ctx.setLineDash([5, 4]);
    }
    ctx.strokeStyle = b.strokeColor;
    ctx.lineWidth = b.strokeWidth;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Re-fill tail interior cleanly on top of body stroke seam if solid tail
  if (
    b.tail.enabled &&
    b.tail.style !== 'none' &&
    b.tail.style !== 'bubbles' &&
    b.balloonType !== 'thought' &&
    b.balloonType !== 'caption' &&
    b.balloonType !== 'text' &&
    b.fillEnabled
  ) {
    const dx = b.tail.tipX - cx;
    const dy = b.tail.tipY - cy;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const halfBase = Math.max(2, b.tail.width / 2 - b.strokeWidth * 0.6);
    ctx.beginPath();
    ctx.moveTo(cx + nx * halfBase, cy + ny * halfBase);
    ctx.lineTo(b.tail.tipX, b.tail.tipY);
    ctx.lineTo(cx - nx * halfBase, cy - ny * halfBase);
    ctx.closePath();
    ctx.fillStyle = b.fillColor;
    ctx.fill();
  }

  // Text rendering
  const fontStyle = `${b.italic ? 'italic ' : ''}${b.fontWeight === 'bold' ? 'bold ' : ''}${b.fontSize}px "${b.fontFamily}", sans-serif`;
  ctx.font = fontStyle;
  ctx.fillStyle = b.textColor;
  ctx.textBaseline = 'middle';
  const pad = b.padding + (b.balloonType === 'burst' ? 14 : 6);
  const availW = Math.max(20, b.width - pad * 2);
  const lines = wrapTextLines(ctx, b.text, availW);
  const lineH = b.fontSize * (b.lineHeight ?? 1.2);
  const totalH = lines.length * lineH;
  const startY = cy - totalH / 2 + lineH / 2;

  lines.forEach((line, idx) => {
    const ly = startY + idx * lineH;
    let lx = cx;
    if (b.textAlign === 'left') {
      ctx.textAlign = 'left';
      lx = b.x + pad;
    } else if (b.textAlign === 'right') {
      ctx.textAlign = 'right';
      lx = b.x + b.width - pad;
    } else {
      ctx.textAlign = 'center';
      lx = cx;
    }
    ctx.fillText(line, lx, ly);
    if (b.underline) {
      const m = ctx.measureText(line);
      const ux =
        b.textAlign === 'left'
          ? lx
          : b.textAlign === 'right'
            ? lx - m.width
            : lx - m.width / 2;
      ctx.beginPath();
      ctx.moveTo(ux, ly + b.fontSize * 0.48);
      ctx.lineTo(ux + m.width, ly + b.fontSize * 0.48);
      ctx.strokeStyle = b.textColor;
      ctx.lineWidth = Math.max(1, b.fontSize * 0.07);
      ctx.stroke();
    }
  });

  ctx.restore();
}

function renderLetteringToCanvas(
  ctx: CanvasRenderingContext2D,
  l: LetteringElement
) {
  ctx.save();
  const cx = l.x + l.width / 2;
  const cy = l.y + l.height / 2;
  ctx.translate(cx, cy);
  ctx.rotate((l.rotation * Math.PI) / 180);
  if (l.warp === 'slant') {
    ctx.transform(1, -0.14, -0.12, 1, 0, 0);
  }
  ctx.globalAlpha = l.opacity / 100;

  ctx.font = `${l.italic ? 'italic ' : ''}${l.fontWeight === 'bold' ? 'bold ' : ''}${l.fontSize}px ${l.fontFamily}, Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const grad = ctx.createLinearGradient(0, -l.height / 2, 0, l.height / 2);
  grad.addColorStop(0, l.fillTopColor);
  grad.addColorStop(1, l.fillBottomColor);

  if (l.shadow) {
    ctx.fillStyle = l.shadowColor;
    ctx.fillText(l.text, l.shadowOffsetX, l.shadowOffsetY);
  }

  if (l.strokeEnabled && l.strokeWidth > 0) {
    ctx.lineJoin = 'round';
    ctx.strokeStyle = l.strokeColor;
    ctx.lineWidth = l.strokeWidth * 2;
    ctx.strokeText(l.text, 0, 0);
  }

  ctx.fillStyle = grad;
  ctx.fillText(l.text, 0, 0);

  ctx.restore();
}

export async function renderPageToDataUrl(
  doc: ComicDocument,
  page: ComicPage,
  scale = 1,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.92
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(doc.pageWidth * scale);
  canvas.height = Math.round(doc.pageHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // Page background
  ctx.fillStyle = page.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, doc.pageWidth, doc.pageHeight);

  if (page.backgroundPattern === 'halftone') {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let x = 8; x < doc.pageWidth; x += 12) {
      for (let y = 8; y < doc.pageHeight; y += 12) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (page.backgroundPattern === 'grid') {
    ctx.strokeStyle = 'rgba(59,130,246,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < doc.pageWidth; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, doc.pageHeight);
      ctx.stroke();
    }
    for (let y = 0; y < doc.pageHeight; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(doc.pageWidth, y);
      ctx.stroke();
    }
  } else if (page.backgroundPattern === 'burst') {
    const pcx = doc.pageWidth / 2;
    const pcy = doc.pageHeight / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 24; i++) {
      const a1 = (i / 24) * Math.PI * 2;
      const a2 = ((i + 0.5) / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(pcx, pcy);
      ctx.lineTo(pcx + Math.cos(a1) * 1500, pcy + Math.sin(a1) * 1500);
      ctx.lineTo(pcx + Math.cos(a2) * 1500, pcy + Math.sin(a2) * 1500);
      ctx.closePath();
      ctx.fill();
    }
  }

  const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
  for (const el of sorted) {
    if (el.kind === 'panel') {
      await renderPanelToCanvas(ctx, el);
    } else if (el.kind === 'balloon') {
      renderBalloonToCanvas(ctx, el);
    } else if (el.kind === 'lettering') {
      renderLetteringToCanvas(ctx, el);
    }
  }

  return canvas.toDataURL(format, quality);
}

export function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
