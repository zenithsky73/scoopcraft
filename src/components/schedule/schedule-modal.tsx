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
  Music,
  Play,
  Pause,
  Search,
  Volume2,
  Sparkles,
  Dices,
  Shuffle,
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

export interface TikTokMusicItem {
  id: string;
  name: string;
  artist: string;
  thumbnail?: string;
  url?: string;
  duration?: number;
}

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

  // TikTok Music State
  const [selectedMusic, setSelectedMusic] = React.useState<TikTokMusicItem | null>(null);
  const [musicList, setMusicList] = React.useState<TikTokMusicItem[]>([]);
  const [isLoadingMusic, setIsLoadingMusic] = React.useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = React.useState('');
  const [showMusicPicker, setShowMusicPicker] = React.useState(false);
  const [playingMusicId, setPlayingMusicId] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const togglePlayAudio = (music: TikTokMusicItem) => {
    if (!music.url) return;

    if (playingMusicId === music.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingMusicId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(music.url);
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setPlayingMusicId(null);
      setPlayingMusicId(music.id);
    }
  };

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch TikTok Trending Music
  React.useEffect(() => {
    if (open && selectedPlatform === 'TIKTOK' && musicList.length === 0) {
      setIsLoadingMusic(true);
      fetch('/api/social/tiktok-music?countryCode=ID&limit=15')
        .then((r) => r.json())
        .then((d) => {
          if (d.docs && Array.isArray(d.docs)) {
            setMusicList(d.docs);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingMusic(false));
    }
  }, [open, selectedPlatform, musicList.length]);

  const handleSearchMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicSearchQuery.trim()) return;
    setIsLoadingMusic(true);
    try {
      const r = await fetch(`/api/social/tiktok-music?countryCode=ID&search=${encodeURIComponent(musicSearchQuery.trim())}`);
      const d = await r.json();
      if (d.docs) {
        setMusicList(d.docs);
      }
    } catch {}
    setIsLoadingMusic(false);
  };

  const handleRandomizeMusic = async () => {
    setIsLoadingMusic(true);
    try {
      let pool = musicList;
      if (pool.length === 0) {
        const r = await fetch('/api/social/tiktok-music?countryCode=ID&limit=30');
        const d = await r.json();
        if (d.docs && Array.isArray(d.docs) && d.docs.length > 0) {
          pool = d.docs;
          setMusicList(pool);
        }
      }
      if (pool.length > 0) {
        // Filter out current selected if any, to ensure a new song
        const available = pool.filter((m) => m.id !== selectedMusic?.id);
        const candidates = available.length > 0 ? available : pool;
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
        setSelectedMusic(randomItem);
        setShowMusicPicker(false);
        if (randomItem.url) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          audioRef.current = new Audio(randomItem.url);
          audioRef.current.play().catch(() => {});
          audioRef.current.onended = () => setPlayingMusicId(null);
          setPlayingMusicId(randomItem.id);
        }
        notify.success('Lagu Viral Terpilih! 🎲', `"${randomItem.name}" oleh ${randomItem.artist || 'TikTok Sound'}`);
      }
    } catch (err: any) {
      notify.error('Gagal Mengacak Musik', err?.message);
    } finally {
      setIsLoadingMusic(false);
    }
  };

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
          tiktokMusic: selectedPlatform === 'TIKTOK' && selectedMusic ? {
            id: selectedMusic.id,
            name: selectedMusic.name,
            artist: selectedMusic.artist,
            thumbnail: selectedMusic.thumbnail,
            url: selectedMusic.url,
          } : null,
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
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentAccount?.avatarUrl ? (
                    <div className="relative shrink-0">
                      <img
                        src={currentAccount.avatarUrl}
                        alt=""
                        className="size-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow">
                        <SocialIcon platform={currentAccount.platform} size={10} variant="rounded" />
                      </div>
                    </div>
                  ) : (
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] truncate">
                      Akun Aktif: {currentAccount?.accountName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
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

            {/* TikTok Background Music (BGM) Selector */}
            {selectedPlatform === 'TIKTOK' && (
              <div className="mt-2.5 space-y-2 p-3 rounded-xl border border-cyan-500/30 bg-cyan-50/40 dark:bg-cyan-950/20 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Music className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                    <label className="text-[11px] font-bold text-slate-900 dark:text-white">
                      Musik / Audio TikTok (FYP Booster)
                    </label>
                  </div>
                  {selectedMusic && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMusic(null);
                        if (audioRef.current) {
                          audioRef.current.pause();
                          setPlayingMusicId(null);
                        }
                      }}
                      className="text-[10px] text-red-500 hover:underline font-semibold"
                    >
                      Hapus Musik
                    </button>
                  )}
                </div>

                {selectedMusic ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-cyan-500/40 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {selectedMusic.thumbnail ? (
                        <img
                          src={selectedMusic.thumbnail}
                          alt=""
                          className="size-8 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="size-8 rounded-md bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center shrink-0">
                          <Music className="size-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {selectedMusic.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {selectedMusic.artist || 'TikTok Sound'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedMusic.url && (
                        <button
                          type="button"
                          onClick={() => togglePlayAudio(selectedMusic)}
                          className="size-7 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center hover:scale-105 transition-transform"
                          title={playingMusicId === selectedMusic.id ? 'Pause' : 'Play Preview'}
                        >
                          {playingMusicId === selectedMusic.id ? (
                            <Pause className="size-3.5 fill-current" />
                          ) : (
                            <Play className="size-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRandomizeMusic}
                        disabled={isLoadingMusic}
                        className="text-[10px] px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors flex items-center gap-1"
                        title="Acak lagu viral lain"
                      >
                        <Dices className="size-3 text-amber-500" />
                        <span>Acak Lagi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMusicPicker(!showMusicPicker)}
                        className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Ganti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="size-4 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                          Sound Trending Otomatis (Default)
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          TikTok akan menyematkan audio FYP yang sesuai
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleRandomizeMusic}
                        disabled={isLoadingMusic}
                        className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[10px] font-bold shadow-sm transition-all flex items-center gap-1"
                      >
                        <Dices className="size-3" />
                        <span>Acak Viral 🎲</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMusicPicker(true)}
                        className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shadow-sm transition-colors"
                      >
                        Pilih Manual
                      </button>
                    </div>
                  </div>
                )}

                {/* Dropdown / Music Browser */}
                {showMusicPicker && (
                  <div className="mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 animate-in zoom-in-95 duration-150">
                    <form onSubmit={handleSearchMusic} className="relative">
                      <input
                        type="text"
                        value={musicSearchQuery}
                        onChange={(e) => setMusicSearchQuery(e.target.value)}
                        placeholder="Cari judul lagu / artis..."
                        className="w-full pl-7 pr-14 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                      <Search className="size-3.5 absolute left-2 top-2 text-slate-400" />
                      <button
                        type="submit"
                        className="absolute right-1 top-1 px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-bold hover:bg-cyan-500"
                      >
                        Cari
                      </button>
                    </form>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pr-1 space-y-1">
                      {isLoadingMusic ? (
                        <div className="py-4 text-center text-xs text-slate-400">
                          Memuat musik trending TikTok...
                        </div>
                      ) : musicList.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400">
                          Tidak ada lagu ditemukan.
                        </div>
                      ) : (
                        musicList.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between py-1.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {m.thumbnail ? (
                                <img src={m.thumbnail} alt="" className="size-7 rounded object-cover shrink-0" />
                              ) : (
                                <div className="size-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                  <Music className="size-3.5 text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                                  {m.name}
                                </span>
                                <span className="text-[9px] text-slate-400 block truncate">
                                  {m.artist} {m.duration ? `• ${m.duration}s` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {m.url && (
                                <button
                                  type="button"
                                  onClick={() => togglePlayAudio(m)}
                                  className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-slate-600 dark:text-slate-300 hover:text-cyan-600 flex items-center justify-center transition-colors"
                                >
                                  {playingMusicId === m.id ? (
                                    <Pause className="size-3 fill-current" />
                                  ) : (
                                    <Play className="size-3 fill-current ml-0.5" />
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMusic(m);
                                  setShowMusicPicker(false);
                                  if (audioRef.current) {
                                    audioRef.current.pause();
                                    setPlayingMusicId(null);
                                  }
                                }}
                                className="px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-bold hover:bg-cyan-500"
                              >
                                Pilih
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
