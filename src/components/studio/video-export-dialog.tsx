'use client';

import * as React from 'react';
import {
  X,
  Film,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Download,
  Layers,
  Clock,
  Sliders,
  CheckCircle2,
  Video,
  Zap,
} from 'lucide-react';
import type { DesignStyle } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  exportSlidesToMotionVideo,
  type TransitionEffect,
} from '@/lib/video-export-client';

interface VideoExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalSlides: number;
  style: DesignStyle;
  title: string;
}

export function VideoExportDialog({
  isOpen,
  onClose,
  totalSlides,
  style,
  title,
}: VideoExportDialogProps) {
  const [transition, setTransition] = React.useState<TransitionEffect>('AUTO');
  const [duration, setDuration] = React.useState<number>(3.0);
  const [enableSfx, setEnableSfx] = React.useState<boolean>(true);
  const [enableProgressBar, setEnableProgressBar] = React.useState<boolean>(true);

  const [rendering, setRendering] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [statusText, setStatusText] = React.useState<string>('');
  const [success, setSuccess] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const totalDurationSec = Math.round(totalSlides * duration);

  const handleExport = async () => {
    setRendering(true);
    setProgress(0);
    setStatusText('Memulai proses render video...');
    setSuccess(false);

    try {
      const videoBlob = await exportSlidesToMotionVideo({
        totalSlides,
        slideDurationSec: duration,
        transition,
        style,
        enableSfx,
        enableProgressBar,
        onProgress: (p, msg) => {
          setProgress(p);
          setStatusText(msg);
        },
      }, title);

      // Download file video
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      const extension = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-reels.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => {
        setRendering(false);
      }, 1500);
    } catch (err: any) {
      setRendering(false);
      alert(err.message || 'Terjadi kendala saat merender video.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[28px] bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl shadow-black/90 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
              <Film className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                Ekspor Video Animasi Vertikal (9:16)
              </h3>
              <p className="text-[10px] font-mono text-purple-300">
                Format Khusus TikTok, Instagram Reels &amp; YouTube Shorts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={rendering}
            className="size-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Video Overview Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                INFO OUTPUT VIDEO
              </span>
              <p className="text-sm font-black text-white">
                {totalSlides} Slide • Durasi Total ~{totalDurationSec} Detik
              </p>
              <p className="text-[11px] text-slate-400">
                Resolusi Vertikal 9:16 HD • Ringan &amp; Siap FYP
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold text-center shrink-0">
              1080 × 1920
            </div>
          </div>

          {/* 1. Pilih Efek Transisi Animasi */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pilih Gaya Transisi Animasi:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransition('AUTO')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-left border transition-all',
                  transition === 'AUTO'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="size-3 text-purple-400" />
                  <span className="truncate">Otomatis (Tema)</span>
                </div>
                <p className="text-[9px] text-slate-500 font-normal truncate">Sesuai gaya desain</p>
              </button>

              <button
                type="button"
                onClick={() => setTransition('KEN_BURNS')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-left border transition-all',
                  transition === 'KEN_BURNS'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Video className="size-3 text-cyan-400" />
                  <span className="truncate">Ken Burns Zoom</span>
                </div>
                <p className="text-[9px] text-slate-500 font-normal truncate">Zoom halus mewah</p>
              </button>

              <button
                type="button"
                onClick={() => setTransition('SLIDE_PUSH')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-left border transition-all',
                  transition === 'SLIDE_PUSH'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sliders className="size-3 text-amber-400" />
                  <span className="truncate">Dynamic Slide</span>
                </div>
                <p className="text-[9px] text-slate-500 font-normal truncate">Geser samping TV</p>
              </button>

              <button
                type="button"
                onClick={() => setTransition('SOFT_FADE')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-left border transition-all',
                  transition === 'SOFT_FADE'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Layers className="size-3 text-emerald-400" />
                  <span className="truncate">Soft Dissolve</span>
                </div>
                <p className="text-[9px] text-slate-500 font-normal truncate">Pudar lembut elegan</p>
              </button>

              <button
                type="button"
                onClick={() => setTransition('GLITCH_PUNCH')}
                className={cn(
                  'p-2.5 rounded-xl text-xs font-bold text-left border transition-all col-span-2 sm:col-span-2',
                  transition === 'GLITCH_PUNCH'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Zap className="size-3 text-fuchsia-400" />
                  <span className="truncate">Glitch Punch (Gen-Z)</span>
                </div>
                <p className="text-[9px] text-slate-500 font-normal truncate">Bertenaga, cepat, cocok streetwear &amp; meme</p>
              </button>
            </div>
          </div>

          {/* 2. Pilih Durasi per Slide */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tempo Durasi per Slide:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDuration(2.5)}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all',
                  duration === 2.5
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                ⚡ 2.5 Detik (Cepat)
              </button>

              <button
                type="button"
                onClick={() => setDuration(3.0)}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all',
                  duration === 3.0
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                ⭐ 3.0 Detik (Pas)
              </button>

              <button
                type="button"
                onClick={() => setDuration(4.5)}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all',
                  duration === 4.5
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                🌿 4.5 Detik (Santai)
              </button>
            </div>
          </div>

          {/* 3. Audio & UI Overlays */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEnableSfx(!enableSfx)}
              className={cn(
                'p-3 rounded-2xl border text-left flex items-center justify-between transition-all',
                enableSfx
                  ? 'bg-slate-950/80 border-purple-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              )}
            >
              <div className="flex items-center gap-2">
                {enableSfx ? <Volume2 className="size-4 text-purple-400" /> : <VolumeX className="size-4 text-slate-500" />}
                <div>
                  <p className="text-xs font-bold">Suara Transisi SFX</p>
                  <p className="text-[10px] text-slate-500">Efek Whoosh halus</p>
                </div>
              </div>
              <span className={cn('text-xs font-bold font-mono', enableSfx ? 'text-purple-400' : 'text-slate-600')}>
                {enableSfx ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setEnableProgressBar(!enableProgressBar)}
              className={cn(
                'p-3 rounded-2xl border text-left flex items-center justify-between transition-all',
                enableProgressBar
                  ? 'bg-slate-950/80 border-purple-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-purple-400" />
                <div>
                  <p className="text-xs font-bold">Story Progress Bar</p>
                  <p className="text-[10px] text-slate-500">Garis durasi atas</p>
                </div>
              </div>
              <span className={cn('text-xs font-bold font-mono', enableProgressBar ? 'text-purple-400' : 'text-slate-600')}>
                {enableProgressBar ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Rendering Progress View */}
          {rendering && (
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-purple-300">{statusText}</span>
                <span className="text-purple-400 font-mono">{progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Video berhasil diekspor dan diunduh ke perangkat Anda!</span>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-2 pt-1">
            <Button
              type="button"
              block
              disabled={rendering}
              loading={rendering}
              onClick={handleExport}
              className="h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40 transition-all hover:scale-[1.01]"
            >
              <Download className="size-4 mr-2" />
              <span>{rendering ? 'Merender Video (3-5 Detik)...' : '🎬 Buat & Unduh Video Reels/TikTok (MP4)'}</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              disabled={rendering}
              className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
