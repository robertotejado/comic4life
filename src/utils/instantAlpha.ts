const alphaCache = new Map<string, string>();

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  const r = parseInt(clean.slice(0, 2), 16) || 255;
  const g = parseInt(clean.slice(2, 4), 16) || 255;
  const b = parseInt(clean.slice(4, 6), 16) || 255;
  return [r, g, b];
}

export async function processInstantAlpha(
  imageUrl: string,
  targetHex: string,
  tolerance: number
): Promise<string> {
  const key = `${imageUrl}::${targetHex}::${tolerance}`;
  const cached = alphaCache.get(key);
  if (cached) return cached;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxDim = 900;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const [tr, tg, tb] = hexToRgb(targetHex);
        // Maximum Euclidean RGB distance is ~441.67
        const maxDist = (tolerance / 100) * 260;
        const feather = Math.max(12, maxDist * 0.2);

        for (let i = 0; i < data.length; i += 4) {
          const dr = data[i] - tr;
          const dg = data[i + 1] - tg;
          const db = data[i + 2] - tb;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          if (dist <= maxDist) {
            data[i + 3] = 0;
          } else if (dist <= maxDist + feather) {
            const ratio = (dist - maxDist) / feather;
            data[i + 3] = Math.round(data[i + 3] * ratio);
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const result = canvas.toDataURL('image/png');
        alphaCache.set(key, result);
        resolve(result);
      } catch {
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
