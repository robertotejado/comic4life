import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { ComicDocument, ComicPage } from '../types/comic';
import { renderPageToDataUrl } from './canvasExport';

function dataUrlToBase64(dataUrl: string): string {
  const idx = dataUrl.indexOf(',');
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function exportPagesToPdf(
  doc: ComicDocument,
  pages: ComicPage[],
  scale: number,
  baseName: string,
  onProgress?: (pct: number) => void
) {
  if (!pages.length) return;
  const orientation =
    doc.pageWidth > doc.pageHeight ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [doc.pageWidth, doc.pageHeight],
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      pdf.addPage([doc.pageWidth, doc.pageHeight], orientation);
    }
    const dataUrl = await renderPageToDataUrl(
      doc,
      pages[i],
      scale,
      'image/jpeg',
      0.92
    );
    pdf.addImage(dataUrl, 'JPEG', 0, 0, doc.pageWidth, doc.pageHeight);
    onProgress?.(Math.round(((i + 1) / pages.length) * 100));
  }

  pdf.save(`${baseName}.pdf`);
}

export async function exportPagesToImages(
  doc: ComicDocument,
  pages: ComicPage[],
  startNumber: number,
  scale: number,
  format: 'image/jpeg' | 'image/png',
  quality: number,
  baseName: string,
  onProgress?: (pct: number) => void
) {
  if (!pages.length) return;
  const ext = format === 'image/png' ? 'png' : 'jpg';

  if (pages.length === 1) {
    const dataUrl = await renderPageToDataUrl(
      doc,
      pages[0],
      scale,
      format,
      quality
    );
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, `${baseName}-page-${startNumber}.${ext}`);
    onProgress?.(100);
    return;
  }

  const zip = new JSZip();
  for (let i = 0; i < pages.length; i++) {
    const num = String(startNumber + i).padStart(3, '0');
    const dataUrl = await renderPageToDataUrl(
      doc,
      pages[i],
      scale,
      format,
      quality
    );
    zip.file(`${baseName}-page-${num}.${ext}`, dataUrlToBase64(dataUrl), {
      base64: true,
    });
    onProgress?.(Math.round(((i + 1) / pages.length) * 100));
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${baseName}-images.zip`);
}

export async function exportPagesToCbz(
  doc: ComicDocument,
  pages: ComicPage[],
  scale: number,
  format: 'image/jpeg' | 'image/png',
  quality: number,
  title: string,
  author: string,
  baseName: string,
  onProgress?: (pct: number) => void
) {
  if (!pages.length) return;
  const zip = new JSZip();
  const ext = format === 'image/png' ? 'png' : 'jpg';

  const comicInfoXml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Title>${escapeXml(title)}</Title>
  <Writer>${escapeXml(author)}</Writer>
  <PageCount>${pages.length}</PageCount>
</ComicInfo>`;
  zip.file('ComicInfo.xml', comicInfoXml);

  for (let i = 0; i < pages.length; i++) {
    const num = String(i + 1).padStart(3, '0');
    const dataUrl = await renderPageToDataUrl(
      doc,
      pages[i],
      scale,
      format,
      quality
    );
    zip.file(`${num}.${ext}`, dataUrlToBase64(dataUrl), { base64: true });
    onProgress?.(Math.round(((i + 1) / pages.length) * 100));
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.comicbook+zip',
  });
  downloadBlob(blob, `${baseName}.cbz`);
}

export async function exportPagesToEpub(
  doc: ComicDocument,
  pages: ComicPage[],
  scale: number,
  title: string,
  author: string,
  baseName: string,
  onProgress?: (pct: number) => void
) {
  if (!pages.length) return;
  const zip = new JSZip();
  const uuid = `urn:uuid:comic4life-${Date.now()}`;
  const w = Math.round(doc.pageWidth * scale);
  const h = Math.round(doc.pageHeight * scale);

  // Required uncompressed mimetype as first entry in EPUB spec
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const manifestItems: string[] = [];
  const spineRefs: string[] = [];
  const navItems: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    const num = String(i + 1).padStart(3, '0');
    const imgName = `images/page-${num}.jpg`;
    const xhtmlName = `page-${num}.xhtml`;

    const dataUrl = await renderPageToDataUrl(
      doc,
      pages[i],
      scale,
      'image/jpeg',
      0.9
    );
    zip.file(`OEBPS/${imgName}`, dataUrlToBase64(dataUrl), { base64: true });

    zip.file(
      `OEBPS/${xhtmlName}`,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=${w}, height=${h}"/>
  <title>${escapeXml(title)} - Page ${i + 1}</title>
  <style>
    html, body { margin: 0; padding: 0; width: ${w}px; height: ${h}px; overflow: hidden; background: #000; }
    img { display: block; width: 100%; height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <img src="${imgName}" alt="Page ${i + 1}"/>
</body>
</html>`
    );

    manifestItems.push(
      `    <item id="img-${num}" href="${imgName}" media-type="image/jpeg"/>`,
      `    <item id="page-${num}" href="${xhtmlName}" media-type="application/xhtml+xml"/>`
    );
    spineRefs.push(`    <itemref idref="page-${num}"/>`);
    navItems.push(`      <li><a href="${xhtmlName}">Page ${i + 1}</a></li>`);
    onProgress?.(Math.round(((i + 1) / pages.length) * 100));
  }

  zip.file(
    'OEBPS/nav.xhtml',
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="utf-8"/><title>${escapeXml(title)}</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${escapeXml(title)}</h1>
    <ol>
${navItems.join('\n')}
    </ol>
  </nav>
</body>
</html>`
  );

  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" prefix="rendition: http://www.idpf.org/vocab/rendition/#">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author || 'Comic4Life Author')}</dc:creator>
    <dc:language>es</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
    <meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:orientation">auto</meta>
    <meta property="rendition:spread">auto</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
${manifestItems.join('\n')}
  </manifest>
  <spine>
${spineRefs.join('\n')}
  </spine>
</package>`
  );

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
  });
  downloadBlob(blob, `${baseName}.epub`);
}
