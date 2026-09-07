'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Linkedin,
  Facebook,
  ExternalLink,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignModal } from '@/components/campaign/campaign-modal';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { SocialPlatform, ScheduleStatus } from '@prisma/client';

export type ScheduledPostItem = {
  id: string;
  platform: SocialPlatform;
  status: ScheduleStatus;
  scheduledAt: string;
  publishedAt?: string | null;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  format: string;
  style?: string | null;
  externalPostId?: string | null;
  externalPostUrl?: string | null;
  errorMessage?: string | null;
  isSimulated: boolean;
  socialAccount?: {
    id: string;
    accountName: string;
    accountHandle?: string | null;
    avatarUrl?: string | null;
    platform: SocialPlatform;
  } | null;
  generatedContent?: {
    id: string;
    headline: string;
    visualUrl?: string | null;
  } | null;
};

interface ContentCalendarProps {
  initialPosts: ScheduledPostItem[];
}

export function ContentCalendar({ initialPosts }: ContentCalendarProps) {
  const [posts, setPosts] = React.useState<ScheduledPostItem[]>(initialPosts);
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'PUBLISHED' | 'FAILED'>('ALL');
  const [isLoading, setIsLoading] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [showCampaignModal, setShowCampaignModal] = React.useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishNow = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        notify.celebrate('Terbit! 🚀', 'Postingan berhasil dipublikasikan sekarang.');
        await fetchPosts();
      } else {
        notify.error('Gagal Menerbitkan', data?.error || 'Terjadi kesalahan');
      }
    } catch (e: any) {
      notify.error('Gagal', e?.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Batalkan dan hapus jadwal postingan ini?')) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify.success('Dihapus', 'Jadwal postingan berhasil dibatalkan.');
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        notify.error('Gagal', 'Tidak dapat menghapus jadwal.');
      }
    } catch (e: any) {
      notify.error('Gagal', e?.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPosts = React.useMemo(() => {
    if (statusFilter === 'ALL') return posts;
    return posts.filter((p) => p.status === statusFilter);
  }, [posts, statusFilter]);

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'INSTAGRAM':
        return <Instagram className="size-3.5 text-pink-500" />;
      case 'LINKEDIN':
        return <Linkedin className="size-3.5 text-blue-500" />;
      case 'FACEBOOK':
        return <Facebook className="size-3.5 text-indigo-500" />;
      default:
        return <CalendarIcon className="size-3.5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="size-2.5" /> Menunggu Jadwal
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 animate-pulse">
            <RefreshCw className="size-2.5 animate-spin" /> Sedang Mengunggah
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="size-2.5" /> Terpublikasi
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
            <AlertCircle className="size-2.5" /> Gagal
          </span>
        );
      default:
        return null;
    }
  };

  const formatScheduleDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar Ringkas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <CalendarIcon className="size-4" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white">
                Kalender & Auto-Schedule
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otomatisasi publikasi carousel ke Instagram & LinkedIn tepat waktu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchPosts}
            disabled={isLoading}
            className="text-xs font-bold border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={cn('size-3.5 mr-1.5', isLoading && 'animate-spin')} />
            Segarkan
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCampaignModal(true)}
            className="text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-md shadow-pink-600/20"
          >
            <Sparkles className="size-3.5 mr-1.5" />
            <span className="hidden sm:inline">Campaign 30 Hari (Auto-Pilot)</span>
            <span className="sm:hidden">Campaign 30H</span>
          </Button>

          <Link href="/dashboard">
            <Button
              size="sm"
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              <Plus className="size-3.5 mr-1.5" />
              Buat Konten Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Filter Ringkas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'Semua Jadwal', count: posts.length },
          {
            id: 'PENDING',
            label: 'Menunggu',
            count: posts.filter((p) => p.status === 'PENDING').length,
          },
          {
            id: 'PUBLISHED',
            label: 'Terpublikasi',
            count: posts.filter((p) => p.status === 'PUBLISHED').length,
          },
          {
            id: 'FAILED',
            label: 'Gagal',
            count: posts.filter((p) => p.status === 'FAILED').length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border',
              statusFilter === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                statusFilter === tab.id
                  ? 'bg-white/20 dark:bg-slate-900/20 text-inherit'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Post Grid / List */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8 text-center">
          <div className="mx-auto size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <CalendarIcon className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Belum ada jadwal postingan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Buka studio carousel, lalu klik tombol <span className="font-bold text-indigo-600 dark:text-indigo-400">"🗓️ Jadwalkan"</span> di pojok kanan atas untuk mempublikasikan konten otomatis.
          </p>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button size="sm" className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                Buka Carousel Studio
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPosts.map((post) => {
            const isProcessing = actionLoadingId === post.id;
            return (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Platform & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getPlatformIcon(post.platform)}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {post.platform}
                      </span>
                      {post.isSimulated && (
                        <span className="text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                          SIM
                        </span>
                      )}
                    </div>
                    {getStatusBadge(post.status)}
                  </div>

                  {/* Scheduled Time Banner */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 px-2.5 py-1.5 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mb-2.5">
                    <Clock className="size-3.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold">{formatScheduleDate(post.scheduledAt)}</span>
                  </div>

                  {/* Headline & Caption */}
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {post.generatedContent?.headline || 'Postingan Carousel'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>

                  {/* Media & Slide Info */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Layers className="size-3" />
                      {post.mediaUrls?.length || 5} Slide Carousel
                    </span>
                    <span>•</span>
                    <span>{post.format === 'FEED_PORTRAIT' ? 'Feed 4:5' : post.format}</span>
                  </div>

                  {/* Error Message if Failed */}
                  {post.errorMessage && (
                    <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/30 p-2 text-[11px] text-red-600 dark:text-red-400 mb-3">
                      {post.errorMessage}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {post.status === 'PENDING' && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handlePublishNow(post.id)}
                        className="text-[11px] h-7 px-2.5 font-bold border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                      >
                        <Zap className="size-3 mr-1 text-amber-500" />
                        Terbitkan Sekarang
                      </Button>
                    )}

                    {post.status === 'PUBLISHED' && post.externalPostUrl && (
                      <a
                        href={post.externalPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        Buka Postingan
                      </a>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleDelete(post.id)}
                    className="size-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Batalkan / Hapus"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 30-DAY CAMPAIGN AUTO-PILOT MODAL ─── */}
      <CampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCampaignSuccess={fetchPosts}
      />
    </div>
  );
}
