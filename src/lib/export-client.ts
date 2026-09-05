import { toPng } from 'html-to-image';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { notify } from '@/lib/notify';

/**
 * Mengonversi elemen DOM slide canvas menjadi data URL PNG dengan resolusi tinggi (100% presisi menggunakan html-to-image).
 */
export async function renderElementToPngDataUrl(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} tidak ditemukan.`);
  }

  return toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    cacheBust: true,
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
    notify.error('Gagal Mengunduh Slide', 'Silakan coba beberapa saat lagi.');
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
    notify.error('Gagal Membuat File ZIP', 'Silakan unduh per slide atau coba lagi.');
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
    notify.error('Gagal Mengekspor PDF', 'Silakan coba lagi atau unduh slide per halaman.');
  }
}
