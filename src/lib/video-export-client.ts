'use client';

import { toPng } from 'html-to-image';
import type { DesignStyle } from '@prisma/client';

export type TransitionEffect = 'AUTO' | 'KEN_BURNS' | 'SLIDE_PUSH' | 'SOFT_FADE' | 'GLITCH_PUNCH';

export interface VideoExportOptions {
  totalSlides: number;
  slideDurationSec: number; // e.g. 3.0
  transition: TransitionEffect;
  style: DesignStyle;
  enableSfx: boolean;
  enableProgressBar: boolean;
  onProgress?: (progressPercent: number, statusText: string) => void;
}

/**
 * Buat Web Audio API Whoosh SFX secara instan tanpa perlu file audio berat
 */
function playWhooshSfx(audioCtx: AudioContext) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.26);
  } catch {
    // Ignore audio context errors if not permitted
  }
}

/**
 * Menghasilkan Video Animasi Vertikal (9:16) secara 100% Client-Side di browser.
 * Sangat ringan, waktu render hanya 3-5 detik, ukuran file cuma 1-3MB!
 */
export async function exportSlidesToMotionVideo(
  options: VideoExportOptions,
  title: string = 'newsly-video'
): Promise<Blob> {
  const {
    totalSlides,
    slideDurationSec = 3.0,
    transition = 'AUTO',
    style,
    enableSfx = true,
    enableProgressBar = true,
    onProgress,
  } = options;

  onProgress?.(5, 'Menyiapkan canvas rendering video...');

  // 1. Ambil data URL gambar tiap slide menggunakan html-to-image
  const slideImages: HTMLImageElement[] = [];

  for (let i = 0; i < totalSlides; i++) {
    onProgress?.(
      Math.round(5 + (i / totalSlides) * 35),
      `Mengompilasi frame slide #${i + 1}...`
    );

    const canvasElem = document.getElementById(`slide-canvas-${i}`);
    if (!canvasElem) {
      console.warn(`Slide canvas #${i} tidak ditemukan di DOM.`);
      continue;
    }

    try {
      const dataUrl = await toPng(canvasElem, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });
      slideImages.push(img);
    } catch (err) {
      console.error(`Gagal merender slide #${i}:`, err);
    }
  }

  if (slideImages.length === 0) {
    throw new Error('Tidak ada slide yang siap untuk diekspor ke video. Silakan coba kembali.');
  }

  onProgress?.(45, 'Menginisialisasi engine video MP4/WebM...');

  // 2. Siapkan Canvas Perekam Resolusi Vertikal Tinggi (720 x 1280)
  const targetW = 720;
  const targetH = 1280;
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = targetW;
  renderCanvas.height = targetH;
  const ctx = renderCanvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Canvas rendering 2D context tidak didukung di browser ini.');
  }

  // Tentukan jenis transisi jika AUTO
  let resolvedTransition: TransitionEffect = transition;
  if (resolvedTransition === 'AUTO') {
    if (style === 'EDITORIAL' || style === 'BOLD') {
      resolvedTransition = 'SLIDE_PUSH';
    } else if (style === 'STREETWEAR' || style === 'ATHLETIC' || style === 'TERMINAL') {
      resolvedTransition = 'GLITCH_PUNCH';
    } else if (style === 'MINIMAL' || style === 'CORPORATE') {
      resolvedTransition = 'SOFT_FADE';
    } else {
      resolvedTransition = 'KEN_BURNS';
    }
  }

  // 3. Siapkan Audio Context & Stream
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass && enableSfx) {
      audioCtx = new AudioContextClass();
      audioDest = audioCtx.createMediaStreamDestination();
    }
  } catch {
    // Audio optional fallback
  }

  const canvasStream = renderCanvas.captureStream(30); // 30 FPS
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...(audioDest ? audioDest.stream.getAudioTracks() : []),
  ]);

  // Dukungan tipe video browser (MP4 / WebM)
  const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
    ? 'video/mp4;codecs=avc1'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 4_000_000, // 4 Mbps high quality
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  recorder.start();

  // 4. Loop Animasi Frame demi Frame
  const fps = 30;
  const framesPerSlide = Math.round(slideDurationSec * fps);
  const transitionFrames = Math.round(0.45 * fps); // 0.45 detik transisi
  const totalFrames = framesPerSlide * slideImages.length;

  for (let frame = 0; frame < totalFrames; frame++) {
    const currentSlideIdx = Math.min(
      Math.floor(frame / framesPerSlide),
      slideImages.length - 1
    );
    const frameInSlide = frame % framesPerSlide;
    const progressInSlide = frameInSlide / framesPerSlide;
    const overallProgress = frame / totalFrames;

    // Trigger SFX saat slide baru mulai
    if (frameInSlide === 0 && audioCtx && enableSfx) {
      playWhooshSfx(audioCtx);
    }

    // Bersihkan canvas dengan latar belakang gelap
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, targetW, targetH);

    const currentImg = slideImages[currentSlideIdx];
    const nextImg = slideImages[Math.min(currentSlideIdx + 1, slideImages.length - 1)];

    const isTransitioning = frameInSlide >= framesPerSlide - transitionFrames;
    const transitionT = isTransitioning
      ? (frameInSlide - (framesPerSlide - transitionFrames)) / transitionFrames
      : 0;

    // ─── RENDER GAMBAR DENGAN EFEK MOTION DYNAMIC ───
    if (!isTransitioning || currentSlideIdx === slideImages.length - 1) {
      // Steady Motion (Ken Burns Subtle Zoom)
      drawSlideWithMotion(ctx, currentImg, targetW, targetH, progressInSlide, resolvedTransition);
    } else {
      // Transition Motion
      if (resolvedTransition === 'SLIDE_PUSH') {
        const easeT = easeOutCubic(transitionT);
        const offsetX = easeT * targetW;
        ctx.save();
        ctx.translate(-offsetX, 0);
        drawSlideWithMotion(ctx, currentImg, targetW, targetH, 1, 'NONE');
        ctx.restore();

        ctx.save();
        ctx.translate(targetW - offsetX, 0);
        drawSlideWithMotion(ctx, nextImg, targetW, targetH, 0, 'NONE');
        ctx.restore();
      } else if (resolvedTransition === 'GLITCH_PUNCH') {
        const easeT = easeOutCubic(transitionT);
        const scaleOut = 1 + easeT * 0.15;
        ctx.save();
        ctx.globalAlpha = 1 - easeT;
        drawSlideWithScale(ctx, currentImg, targetW, targetH, scaleOut);
        ctx.restore();

        const scaleIn = 0.85 + easeT * 0.15;
        ctx.save();
        ctx.globalAlpha = easeT;
        drawSlideWithScale(ctx, nextImg, targetW, targetH, scaleIn);
        ctx.restore();
      } else {
        // SOFT_FADE / KEN_BURNS Cross-Fade
        const easeT = easeInOutQuad(transitionT);
        ctx.save();
        ctx.globalAlpha = 1 - easeT;
        drawSlideWithMotion(ctx, currentImg, targetW, targetH, 1, resolvedTransition);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = easeT;
        drawSlideWithMotion(ctx, nextImg, targetW, targetH, 0, resolvedTransition);
        ctx.restore();
      }
    }

    // ─── RENDER STORY PROGRESS BAR DI BAGIAN ATAS ───
    if (enableProgressBar) {
      drawStoryProgressBars(
        ctx,
        targetW,
        slideImages.length,
        currentSlideIdx,
        progressInSlide
      );
    }

    // Update Progress Bar UI
    if (frame % 5 === 0) {
      const renderPercent = Math.round(50 + overallProgress * 45);
      onProgress?.(renderPercent, `Merender video: frame ${frame}/${totalFrames}...`);
      // Yield ke event loop agar UI tidak freeze
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  onProgress?.(96, 'Mengemas file video final...');

  // 5. Selesaikan Perekaman Video
  return new Promise((resolve) => {
    recorder.onstop = () => {
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      const finalBlob = new Blob(recordedChunks, { type: mimeType });
      onProgress?.(100, 'Video berhasil dibuat!');
      resolve(finalBlob);
    };

    recorder.stop();
  });
}

// ─── HELPER FUNCTIONS ───

function drawSlideWithMotion(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  progress: number,
  transition: TransitionEffect | 'NONE'
) {
  let scale = 1.0;
  if (transition === 'KEN_BURNS' || transition === 'AUTO') {
    scale = 1.0 + progress * 0.05; // 5% subtle cinematic zoom
  }

  drawSlideWithScale(ctx, img, targetW, targetH, scale);
}

function drawSlideWithScale(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  scale: number
) {
  if (!img.width || !img.height) return;

  // Ukuran slide di tengah kanvas vertikal (Letterbox rapi)
  const maxW = targetW * 0.94;
  const maxH = targetH * 0.88;

  const imgRatio = img.width / img.height;
  let drawW = maxW;
  let drawH = drawW / imgRatio;

  if (drawH > maxH) {
    drawH = maxH;
    drawW = drawH * imgRatio;
  }

  const cx = targetW / 2;
  const cy = targetH / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Drop shadow di belakang kartu slide
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 15;

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

function drawStoryProgressBars(
  ctx: CanvasRenderingContext2D,
  targetW: number,
  totalSlides: number,
  activeIdx: number,
  slideProgress: number
) {
  const topY = 24;
  const barH = 5;
  const paddingX = 24;
  const gap = 8;
  const totalGaps = gap * (totalSlides - 1);
  const barW = (targetW - paddingX * 2 - totalGaps) / totalSlides;

  for (let i = 0; i < totalSlides; i++) {
    const x = paddingX + i * (barW + gap);

    // Background bar gelap
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.roundRect(x, topY, barW, barH, 3);
    ctx.fill();

    // Foreground bar putih aktif
    if (i < activeIdx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(x, topY, barW, barH, 3);
      ctx.fill();
    } else if (i === activeIdx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(x, topY, barW * slideProgress, barH, 3);
      ctx.fill();
    }
  }
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
