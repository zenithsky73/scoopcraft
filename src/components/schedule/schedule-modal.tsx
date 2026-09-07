'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Linkedin,
  Facebook,
  Send,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
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
    icon: Instagram,
    gradient: 'from-pink-500 via-purple-500 to-amber-500',
    border: 'border-pink-500/30',
    color: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'LINKEDIN',
    name: 'LinkedIn',
    icon: Linkedin,
    gradient: 'from-blue-600 to-cyan-600',
    border: 'border-blue-500/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'FACEBOOK',
    name: 'Facebook',
    icon: Facebook,
    gradient: 'from-indigo-600 to-blue-500',
    border: 'border-indigo-500/30',
    color: 'text-indigo-600 dark:text-indigo-400',
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
  const [selectedPlatform, setSelectedPlatform] = React.useState<'INSTAGRAM' | 'LINKEDIN' | 'FACEBOOK'>('INSTAGRAM');

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
  const [isInstantTesting, setIsInstantTesting] = React.useState(false);
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

  const handleScheduleOrPublish = async (isPublishNow = false) => {
    try {
      if (isPublishNow) setIsInstantTesting(true);
      else setIsSubmitting(true);

      const targetIso = isPublishNow
        ? new Date().toISOString()
        : new Date(`${dateStr}T${timeStr}:00`).toISOString();

      // Buat URL placeholder slide jika slideImages kosong
      const finalMediaUrls =
        slideImages && slideImages.length > 0
          ? slideImages
          : Array.from({ length: totalSlides || 5 }, (_, i) =>
              `https://newsly.ai/placeholder/slide-${i + 1}.png`
            );

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generatedContentId: contentId || null,
          platform: selectedPlatform,
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
        throw new Error(data?.error || 'Gagal menyimpan jadwal postingan.');
      }

      const createdPost = data.post;

      if (isPublishNow) {
        // Eksekusi publikasi instan
        const pubRes = await fetch(`/api/schedule/${createdPost.id}`, {
          method: 'POST',
        });
        const pubData = await pubRes.json();
        if (pubRes.ok && pubData.success) {
          notify.celebrate(
            'Berhasil Dipublikasikan! 🚀',
            `Postingan carousel langsung terbit (${selectedPlatform}).`
          );
        } else {
          notify.info(
            'Jadwal Tersimpan',
            `Status: ${pubData?.result?.error || 'Menunggu antrean'}`
          );
        }
      } else {
        notify.celebrate(
          'Jadwal Berhasil Dibuat! 🗓️',
          `Carousel akan diposting otomatis pada ${dateStr} pukul ${timeStr}.`
        );
      }

      onScheduleSuccess?.(createdPost);
      onClose();
    } catch (err: any) {
      notify.error('Gagal Menjadwalkan', err?.message);
    } finally {
      setIsSubmitting(false);
      setIsInstantTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal Ringkas */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Jadwalkan & Auto-Post
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
        <div className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* 1. Platform Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Pilih Media Sosial Tujuan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((platform) => {
                const isSelected = selectedPlatform === platform.id;
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <Icon className={cn('size-4 shrink-0', platform.color)} />
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
                      Akun Asli: {currentAccount?.accountName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {currentAccount?.accountHandle} • Meta API Siap
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                      Mode Simulator Aktif
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Belum terhubung akun asli {selectedPlatform}
                    </span>
                  </div>
                </div>
              )}

              {isRealAccount ? (
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useRealPublish}
                    onChange={(e) => setUseRealPublish(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Post ke Akun Asli
                  </span>
                </label>
              ) : (
                <a
                  href="/settings"
                  target="_blank"
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Hubungkan Akun Asli
                </a>
              )}
            </div>
          </div>

          {/* 2. Tanggal & Jam Tayang */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Waktu Publikasi Otomatis
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="relative">
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Presets Chips */}
            <div className="flex items-center gap-1.5">
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

          {/* 3. Ringkasan Caption & Hashtag */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Caption & Hashtag Postingan
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

          {/* 4. Live Simulator Info Badge */}
          <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30 p-2.5 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <Zap className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold">Live Auto-Publisher Aktif:</span> Konten carousel akan diproses dan dipublikasikan otomatis pada waktu yang Anda jadwalkan. Anda juga bisa mengujinya langsung detik ini.
            </div>
          </div>
        </div>

        {/* Footer Actions Ringkas */}
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

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting || isInstantTesting}
              onClick={() => handleScheduleOrPublish(true)}
              className="text-xs font-bold border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              <Zap className="size-3.5 mr-1 text-amber-500" />
              <span>{isInstantTesting ? 'Menerbitkan...' : 'Tes Terbit Langsung'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || isInstantTesting}
              onClick={() => handleScheduleOrPublish(false)}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
            >
              <CalendarIcon className="size-3.5 mr-1" />
              <span>{isSubmitting ? 'Menjadwalkan...' : 'Konfirmasi Jadwal'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
