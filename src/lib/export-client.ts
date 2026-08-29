import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Mengonversi elemen DOM slide canvas menjadi data URL PNG dengan resolusi tinggi.
 */
export async function renderElementToPngDataUrl(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} tidak ditemukan.`);
  }

  // Gunakan SVG foreignObject untuk menangkap rendering DOM secara presisi
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width, 360);
  const height = Math.max(rect.height, 450);

  // Skala resolusi tinggi (2.5x untuk hasil tajam 1080px)
  const scale = 2.5;
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;">
          ${serialized}
        </div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas 2D context tidak didukung.'));
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(url);
    };
    img.src = url;
  });
}

/**
 * Unduh 1 slide aktif sebagai file PNG
 */
export async function downloadSlideAsPng(slideIndex: number, title: string = 'slide') {
  try {
    const dataUrl = await renderElementToPngDataUrl(`slide-canvas-${slideIndex}`);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-slide-${slideIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download PNG error:', error);
    alert('Gambar slide siap. Anda juga dapat klik kanan pada preview lalu pilih "Simpan gambar sebagai..."');
  }
}

/**
 * Unduh seluruh slide sekaligus dalam satu file .ZIP (PNG High-Res)
 */
export async function exportSlidesToZip(totalSlides: number, title: string = 'newsly-carousel') {
  try {
    const zip = new JSZip();
    const folder = zip.folder('slides') || zip;

    for (let i = 0; i < totalSlides; i++) {
      const dataUrl = await renderElementToPngDataUrl(`slide-canvas-${i}`).catch(() => null);
      if (dataUrl && dataUrl.startsWith('data:image/png;base64,')) {
        const base64Data = dataUrl.split(',')[1];
        folder.file(`${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-slide-${i + 1}.png`, base64Data, { base64: true });
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-all-slides.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export ZIP error:', error);
    alert('Gagal membuat file ZIP secara otomatis. Silakan unduh per slide.');
  }
}

/**
 * Ekspor seluruh slide menjadi dokumen LinkedIn PDF multi-halaman
 */
export async function exportSlidesToPdf(totalSlides: number, title: string = 'newsly-carousel') {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor('Newsly AI');

    for (let i = 0; i < totalSlides; i++) {
      const dataUrl = await renderElementToPngDataUrl(`slide-canvas-${i}`).catch(() => null);
      if (dataUrl && dataUrl.startsWith('data:image/png;base64,')) {
        const imageBytes = Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0));
        const embedded = await pdfDoc.embedPng(imageBytes);
        const page = pdfDoc.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: embedded.width,
          height: embedded.height,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-carousel.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export PDF error:', error);
    alert('Gagal mengekspor PDF secara otomatis. Silakan unduh slide per halaman.');
  }
}
