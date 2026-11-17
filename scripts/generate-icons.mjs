import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const outDir = path.join(process.cwd(), 'electron', 'assets');
fs.mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(tag, data) {
  const tagBuf = Buffer.from(tag, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tagBuf, data])), 0);
  return Buffer.concat([lenBuf, tagBuf, data, crcBuf]);
}

function makePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function clampByte(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function mix(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
    c1[3] + (c2[3] - c1[3]) * t,
  ];
}

function sdRoundedRect(x, y, x0, y0, x1, y1, r) {
  const hx = (x1 - x0) * 0.5;
  const hy = (y1 - y0) * 0.5;
  const px = Math.abs(x - (x0 + hx)) - (hx - r);
  const py = Math.abs(y - (y0 + hy)) - (hy - r);
  const qx = Math.max(px, 0);
  const qy = Math.max(py, 0);
  return Math.hypot(qx, qy) + Math.min(Math.max(px, py), 0) - r;
}

function distSeg(x, y, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / l2)) : 0;
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function sdTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d = Math.min(
    distSeg(px, py, ax, ay, bx, by),
    distSeg(px, py, bx, by, cx, cy),
    distSeg(px, py, cx, cy, ax, ay)
  );
  const s1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  const s2 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
  const s3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
  const inside = (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
  return inside ? -d : d;
}

function renderIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size * 0.5;
  const cy = size * 0.47;
  const rx = size * 0.34;
  const ry = size * 0.25;
  const pad = size * 0.06;
  const rad = size * 0.2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5;
      const py = y + 0.5;

      const dBox = sdRoundedRect(px, py, pad, pad, size - pad, size - pad, rad);
      if (dBox > 1.5) continue;

      const nx = (px - cx) / size;
      const ny = (py - cy) / size;
      const ang = Math.atan2(ny, nx);
      const ray = 0.5 + 0.5 * Math.sin(ang * 12);
      const gradT = Math.min(1, Math.max(0, (py / size) * 0.85 + 0.1));
      let bg = mix([245, 158, 11, 255], [220, 38, 38, 255], gradT);
      if (ray > 0.55) {
        bg = mix(bg, [254, 240, 138, 255], 0.25);
      }

      const borderW = Math.max(2, size * 0.028);
      let col =
        dBox > -borderW
          ? mix(bg, [15, 23, 42, 255], Math.max(0, Math.min(1, (dBox + borderW) / 1.5)))
          : bg;

      const alpha = Math.max(0, Math.min(1, 1 - Math.max(0, dBox)));
      col = [col[0], col[1], col[2], col[3] * alpha];

      const dEll = (Math.hypot((px - cx) / rx, (py - cy) / ry) - 1) * Math.min(rx, ry);
      const dTri = sdTriangle(
        px,
        py,
        size * 0.36,
        size * 0.64,
        size * 0.48,
        size * 0.66,
        size * 0.31,
        size * 0.84
      );
      const dBalloon = Math.min(dEll, dTri);

      const dEllS =
        (Math.hypot((px - (cx + size * 0.025)) / rx, (py - (cy + size * 0.032)) / ry) - 1) *
        Math.min(rx, ry);
      const dTriS = sdTriangle(
        px,
        py,
        size * 0.385,
        size * 0.672,
        size * 0.505,
        size * 0.692,
        size * 0.335,
        size * 0.872
      );
      const dShadow = Math.min(dEllS, dTriS);
      if (dShadow < 2 && dBox < 0) {
        const shA = Math.max(0, Math.min(1, 1 - dShadow / 2)) * 0.45;
        col = mix(col, [15, 23, 42, col[3]], shA);
      }

      const stroke = Math.max(1.8, size * 0.034);
      if (dBalloon <= 1.5) {
        let fillCol = [255, 255, 255, 255];
        if (py > cy + size * 0.04 && dBalloon < -stroke) {
          const cell = Math.max(4, size * 0.045);
          const gx = ((px % cell) / cell) - 0.5;
          const gy = ((py % cell) / cell) - 0.5;
          if (Math.hypot(gx, gy) < 0.18) {
            fillCol = [224, 242, 254, 255];
          }
        }

        if (dBalloon < -stroke) {
          const lineH = Math.max(1.5, size * 0.022);
          const inBar =
            (Math.abs(py - (cy - size * 0.075)) < lineH && Math.abs(px - cx) < size * 0.16) ||
            (Math.abs(py - cy) < lineH && Math.abs(px - (cx - size * 0.02)) < size * 0.18) ||
            (Math.abs(py - (cy + size * 0.075)) < lineH &&
              Math.abs(px - (cx - size * 0.05)) < size * 0.11);
          if (inBar) {
            fillCol = [30, 41, 59, 255];
          }
        }

        if (dBalloon > -stroke) {
          const bCol = [15, 23, 42, 255];
          if (dBalloon > 0) {
            const tB = Math.max(0, Math.min(1, 1 - dBalloon / 1.5));
            col = mix(col, bCol, tB);
          } else {
            const tIn = Math.max(0, Math.min(1, (-dBalloon - stroke + 1.5) / 1.5));
            col = mix(bCol, fillCol, tIn);
          }
        } else {
          col = fillCol;
        }
      }

      const idx = (y * size + x) * 4;
      buf[idx] = clampByte(col[0]);
      buf[idx + 1] = clampByte(col[1]);
      buf[idx + 2] = clampByte(col[2]);
      buf[idx + 3] = clampByte(col[3]);
    }
  }

  return makePng(size, size, buf);
}

const pngPath = path.join(outDir, 'icon.png');
const icoPath = path.join(outDir, 'icon.ico');

const png512 = renderIcon(512);
fs.writeFileSync(pngPath, png512);

const icoSizes = [16, 32, 48, 256];
const icoPngs = icoSizes.map((s) => renderIcon(s));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);

let offset = 6 + 16 * icoSizes.length;
const entries = icoSizes.map((s, idx) => {
  const data = icoPngs[idx];
  const entry = Buffer.alloc(16);
  entry[0] = s === 256 ? 0 : s;
  entry[1] = s === 256 ? 0 : s;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += data.length;
  return entry;
});

fs.writeFileSync(icoPath, Buffer.concat([header, ...entries, ...icoPngs]));
console.log(`Icons ready: ${pngPath} (${png512.length} B), ${icoPath} (${fs.statSync(icoPath).size} B)`);
