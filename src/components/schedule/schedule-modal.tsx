'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SocialIcon } from '@/components/social/social-icon';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { OutputFormat, DesignStyle } from '@prisma/client';

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  contentId?: string;
  headline: string;
  caption: string;
  hashtags: string[];
  slideImages?: string[];
  totalSlides: number;
  format?: OutputFormat;
  style?: DesignStyle;
  onScheduleSuccess?: (post: any) => void;
}

const PLATFORMS = [
  {
    id: 'INSTAGRAM',
    name: 'Instagram',
    gradient: 'from-pink-500 via-purple-500 to-amber-500',
    border: 'border-pink-500/30',
    color: 'text-pink-600 dark:text-pink-400',
    badge: 'Carousel & Feed',
  },
  {
    id: 'TIKTOK',
    name: 'TikTok',
    gradient: 'from-slate-950 via-slate-900 to-cyan-500',
    border: 'border-cyan-500/40',
    color: 'text-cyan-600 dark:text-cyan-400',
    badge: 'Photo Mode / FYP',
  },
  {
    id: 'THREADS',
    name: 'Threads',
    gradient: 'from-slate-800 to-black',
    border: 'border-slate-500/30',
    color: 'text-slate-800 dark:text-slate-200',
    badge: 'Meta Threads',
  },
] as const;

export function ScheduleModal({
  open,
  onClose,
  contentId,
  headline,
  caption,
  hashtags,
  slideImages = [],
  totalSlides,
  format = 'FEED_PORTRAIT',
  style,
  onScheduleSuccess,
}: ScheduleModalProps) {
  const [publishMode, setPublishMode] = React.useState<'now' | 'schedule'>('schedule');
  const [selectedPlatform, setSelectedPlatform] = React.useState<'INSTAGRAM' | 'TIKTOK' | 'THREADS'>('INSTAGRAM');

  // Default waktu: 2 jam dari sekarang
  const defaultDate = React.useMemo(() => {
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  }, []);

  const defaultTime = React.useMemo(() => {
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    return d.toTimeString().slice(0, 5);
  }, []);

  const [dateStr, setDateStr] = React.useState(defaultDate);
  const [timeStr, setTimeStr] = React.useState(defaultTime);
  const [editableCaption, setEditableCaption] = React.useState(caption);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [accounts, setAccounts] = React.useState<any[]>([]);
  const [useRealPublish, setUseRealPublish] = React.useState(false);

  React.useEffect(() => {
    setEditableCaption(caption);
  }, [caption]);

  React.useEffect(() => {
    if (open) {
      fetch('/api/social-accounts')
        .then((r) => r.json())
        .then((d) => {
          const list = d.accounts || [];
          setAccounts(list);
          const current = list.find((a: any) => a.platform === selectedPlatform);
          const isReal = current && current.accessToken && !current.accessToken.startsWith('demo_');
          setUseRealPublish(Boolean(isReal));
        })
        .catch(() => {});
    }
  }, [open, selectedPlatform]);

  const currentAccount = accounts.find((a) => a.platform === selectedPlatform);
  const isRealAccount = Boolean(
    currentAccount && currentAccount.accessToken && !currentAccount.accessToken.startsWith('demo_')
  );

  if (!open) return null;

  // Shortcut preset waktu
  const setPreset = (type: '1h' | 'tomorrow_morning' | 'tomorrow_evening') => {
    const now = new Date();
    if (type === '1h') {
      const d = new Date(now.getTime() + 60 * 60 * 1000);
      setDateStr(d.toISOString().slice(0, 10));
      setTimeStr(d.toTimeString().slice(0, 5));
    } else if (type === 'tomorrow_morning') {
      const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setDateStr(d.toISOString().slice(0, 10));
      setTimeStr('09:00');
    } else if (type === 'tomorrow_evening') {
      const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setDateStr(d.toISOString().slice(0, 10));
      setTimeStr('19:30');
    }
  };

  const handleExecute = async () => {
    try {
      setIsSubmitting(true);

      const isNow = publishMode === 'now';
      const targetIso = isNow
        ? new Date().toISOString()
        : new Date(`${dateStr}T${timeStr}:00`).toISOString();

      // Buat URL placeholder slide jika slideImages kosong
      const finalMediaUrls =
        slideImages && slideImages.length > 0
          ? slideImages
          : Array.from({ length: totalSlides || 5 }, (_, i) =>
              `/placeholder/slide-${i + 1}.png`
            );

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generatedContentId: contentId || null,
          platform: selectedPlatform,
          publishMode,
          scheduledAt: targetIso,
          caption: editableCaption,
          hashtags,
          mediaUrls: finalMediaUrls,
          format,
          style: style || null,
          isSimulated: isRealAccount ? !useRealPublish : true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Gagal memproses postingan.');
      }

      if (isNow) {
        notify.celebrate(
          'Berhasil Dipublikasikan! 🚀',
          `Konten berhasil dikirim ke ${selectedPlatform}.`
        );
      } else {
        notify.celebrate(
          'Jadwal Berhasil Dibuat! 🗓️',
          `Konten akan diposting otomatis pada ${dateStr} pukul ${timeStr}.`
        );
      }

      onScheduleSuccess?.(data.post);
      onClose();
    } catch (err: any) {
      notify.error('Gagal Memproses', err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Auto-Publish & Penjadwalan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalSlides} Slide Carousel • Siap Dipublikasikan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Mode Switcher: Post Sekarang vs Jadwalkan */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPublishMode('now')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all',
                publishMode === 'now'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Zap className="size-3.5 text-amber-500" />
              <span>Post Sekarang</span>
            </button>
            <button
              type="button"
              onClick={() => setPublishMode('schedule')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all',
                publishMode === 'schedule'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <CalendarIcon className="size-3.5 text-indigo-500" />
              <span>Jadwalkan Waktu</span>
            </button>
          </div>

          {/* 1. Platform Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Pilih Media Sosial Tujuan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((platform) => {
                const isSelected = selectedPlatform === platform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.id as any)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <SocialIcon platform={platform.id} size={22} variant="rounded" />
                    <span>{platform.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Account Status Card */}
            <div className="mt-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs">
              {isRealAccount ? (
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                      Akun Aktif: {currentAccount?.accountName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {currentAccount?.accountHandle || currentAccount?.accountName} • Auto-Post Siap
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                      Belum Ada Akun {selectedPlatform}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Hubungkan akun Anda untuk posting otomatis
                    </span>
                  </div>
                </div>
              )}

              {isRealAccount ? (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Siap Terbit
                </span>
              ) : (
                <a
                  href="/settings"
                  target="_blank"
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                  Hubungkan Sekarang ➔
                </a>
              )}
            </div>
          </div>

          {/* 2. Tanggal & Jam Tayang (Hanya jika mode schedule) */}
          {publishMode === 'schedule' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Waktu Publikasi Otomatis
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Presets Chips */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Pintas:</span>
                <button
                  type="button"
                  onClick={() => setPreset('1h')}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  +1 Jam Lagi
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('tomorrow_morning')}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Besok Pagi (09:00)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('tomorrow_evening')}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Besok Malam (19:30)
                </button>
              </div>
            </div>
          )}

          {/* 3. Ringkasan Caption & Hashtag */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Caption & Hashtag
              </label>
              <span className="text-[10px] text-slate-400">
                {editableCaption.length} karakter • {hashtags.length} tag
              </span>
            </div>
            <textarea
              value={editableCaption}
              onChange={(e) => setEditableCaption(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
              placeholder="Tulis caption postingan..."
            />
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {hashtags.slice(0, 5).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 font-medium"
                  >
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
                {hashtags.length > 5 && (
                  <span className="text-[9px] text-slate-400 self-center">
                    +{hashtags.length - 5} lainnya
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 px-4 py-3 bg-slate-50/70 dark:bg-slate-950/40 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            Batal
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={handleExecute}
            className={cn(
              'text-xs font-bold text-white shadow-md transition-all',
              publishMode === 'now'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 shadow-orange-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
            )}
          >
            {isSubmitting ? (
              publishMode === 'now' ? 'Mempublikasikan...' : 'Menyimpan Jadwal...'
            ) : publishMode === 'now' ? (
              <>
                <Zap className="size-3.5 mr-1.5" />
                <span>Publikasikan Sekarang</span>
              </>
            ) : (
              <>
                <CalendarIcon className="size-3.5 mr-1.5" />
                <span>Simpan ke Kalender</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
