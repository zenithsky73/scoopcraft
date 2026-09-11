'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Facebook,
  AtSign,
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
  LayoutGrid,
  CalendarDays,
  List,
  SlidersHorizontal,
  X,
  Edit3,
  Share2,
  Check,
  ImageIcon,
  Link2,
  FileText,
  Palette,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignModal } from '@/components/campaign/campaign-modal';
import { ConnectAccountModal } from '@/components/schedule/connect-account-modal';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { SocialPlatform, ScheduleStatus, DesignStyle } from '@prisma/client';

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

export type SocialAccountItem = {
  id: string;
  accountName: string;
  accountHandle?: string | null;
  avatarUrl?: string | null;
  platform: SocialPlatform;
  isConnected: boolean;
};

export type RecentContentItem = {
  id: string;
  headline: string;
  coverUrl?: string | null;
  mediaUrls: string[];
  format: string;
  style?: string | null;
  totalSlides: number;
};

interface ContentCalendarProps {
  initialPosts: ScheduledPostItem[];
  socialAccounts?: SocialAccountItem[];
  recentContents?: RecentContentItem[];
}

type ViewMode = 'WEEK' | 'MONTH' | 'LIST';
type ContentSourceMode = 'AI_GENERATE' | 'EXISTING' | 'CUSTOM';

const AVAILABLE_STYLES_PRESET = [
  { id: 'CULINARY', label: '🍲 Kuliner & Resto (Padang, Cafe, F&B)', color: '#F59E0B' },
  { id: 'MINIMAL', label: '☕ Cafe & Fore Aesthetic Modern', color: '#10B981' },
  { id: 'SHOPEE_PROMO', label: '🔥 Promo & Flash Sale UMKM', color: '#EE4D2D' },
  { id: 'PRODUCT_CATALOG', label: '✨ Katalog Produk & Skincare', color: '#C5A880' },
  { id: 'TESTIMONIAL_CHAT', label: '💬 Bukti Chat WA & Testimoni', color: '#25D366' },
  { id: 'PRICE_TIER_TABLE', label: '📋 Daftar Menu & Paket Harga', color: '#6366F1' },
  { id: 'STEP_BY_STEP_GUIDE', label: '📚 Tips & Panduan Praktis Bisnis', color: '#8B5CF6' },
  { id: 'BREAKING_NEWS', label: '⚡ Pengumuman Penting & Info Bisnis', color: '#EF4444' },
];

export type NicheItem = {
  id: string;
  label: string;
  group: string;
  desc: string;
  defaultStyle: string;
  quickEmoji: string;
};

export const NICHE_PRESETS: NicheItem[] = [
  // ─── BISNIS & KEUANGAN ───
  { id: 'BISNIS', label: 'Bisnis & UMKM', group: 'Bisnis & Keuangan', desc: 'Strategi bisnis, operasional & scale-up', defaultStyle: 'PRICE_TIER_TABLE', quickEmoji: '💼' },
  { id: 'KEUANGAN_PRIBADI', label: 'Keuangan Pribadi', group: 'Bisnis & Keuangan', desc: 'Money management, tips hemat & budgeting', defaultStyle: 'FINANCE', quickEmoji: '💰' },
  { id: 'INVESTASI', label: 'Investasi & Saham', group: 'Bisnis & Keuangan', desc: 'Pasar modal, reksadana, crypto & trading', defaultStyle: 'TECH', quickEmoji: '📈' },
  { id: 'BISNIS_DIGITAL', label: 'Bisnis Digital & E-Commerce', group: 'Bisnis & Keuangan', desc: 'Toko online, affiliate, dropship & olshop', defaultStyle: 'SHOPEE_PROMO', quickEmoji: '🛒' },
  { id: 'PENGEMBANGAN_KARIR', label: 'Pengembangan Karir & HR', group: 'Bisnis & Keuangan', desc: 'Tips interview, resume CV & produktivitas kerja', defaultStyle: 'CORPORATE', quickEmoji: '👔' },
  { id: 'MARKETING_BRANDING', label: 'Marketing & Branding', group: 'Bisnis & Keuangan', desc: 'Digital marketing, social media ads & copywriting', defaultStyle: 'SPOTLIGHT', quickEmoji: '📣' },

  // ─── KULINER & F&B ───
  { id: 'KULINER_MAKANAN', label: 'Kuliner & Makanan (Padang / Resto)', group: 'Kuliner & F&B', desc: 'Restoran, warung makan, masakan nusantara', defaultStyle: 'CULINARY', quickEmoji: '🍲' },
  { id: 'CAFE_MINUMAN', label: 'Cafe, Kopi & Minuman (Fore style)', group: 'Kuliner & F&B', desc: 'Coffee shop, bakery, minuman kekinian & boba', defaultStyle: 'MINIMAL', quickEmoji: '☕' },
  { id: 'RESEP_MASAKAN', label: 'Resep Masakan & Baking', group: 'Kuliner & F&B', desc: 'Resep rumahan, kue, bumbu dapur & tutorial masak', defaultStyle: 'STEP_BY_STEP_GUIDE', quickEmoji: '🍳' },

  // ─── KESEHATAN & OLAHRAGA ───
  { id: 'KESEHATAN', label: 'Kesehatan & Medis', group: 'Kesehatan & Olahraga', desc: 'Informasi medis, pola hidup sehat & imun', defaultStyle: 'BEFORE_AFTER', quickEmoji: '🩺' },
  { id: 'OLAHRAGA', label: 'Olahraga & Fitness', group: 'Kesehatan & Olahraga', desc: 'Gym workout, lari, sepeda & latihan di rumah', defaultStyle: 'ATHLETIC', quickEmoji: '🏋️' },
  { id: 'DIET_NUTRISI', label: 'Diet & Nutrisi', group: 'Kesehatan & Olahraga', desc: 'Pola makan sehat, defisit kalori & meal prep', defaultStyle: 'BEFORE_AFTER', quickEmoji: '🥗' },
  { id: 'KESEHATAN_MENTAL', label: 'Kesehatan Mental & Self-Care', group: 'Kesehatan & Olahraga', desc: 'Mindfulness, stress relief, afirmasi & meditasi', defaultStyle: 'LIFESTYLE', quickEmoji: '🧘' },

  // ─── TEKNOLOGI & GADGET ───
  { id: 'TEKNOLOGI_GADGET', label: 'Teknologi & Gadget', group: 'Teknologi & AI', desc: 'Smartphone, laptop, hardware & inovasi tech', defaultStyle: 'TERMINAL', quickEmoji: '📱' },
  { id: 'ULASAN_GADGET', label: 'Ulasan & Review Gadget', group: 'Teknologi & AI', desc: 'Spesifikasi, unboxing & perbandingan gadget', defaultStyle: 'UNBOXING_POLAROID', quickEmoji: '📦' },
  { id: 'AI_OTOMASI', label: 'Kecerdasan Buatan (AI) & Tools', group: 'Teknologi & AI', desc: 'Prompt AI, ChatGPT, automation & produktivitas', defaultStyle: 'TERMINAL', quickEmoji: '🤖' },
  { id: 'PEMROGRAMAN', label: 'Pemrograman & IT (Coding)', group: 'Teknologi & AI', desc: 'Web development, coding tutorial & tech career', defaultStyle: 'TERMINAL', quickEmoji: '💻' },
  { id: 'GAMING', label: 'Gaming & Esports', group: 'Teknologi & AI', desc: 'Game review, tips gameplay, setup & berita game', defaultStyle: 'BOLD', quickEmoji: '🎮' },

  // ─── LIFESTYLE, FASHION & BEAUTY ───
  { id: 'KECANTIKAN', label: 'Kecantikan & Skincare', group: 'Fashion & Lifestyle', desc: 'Perawatan kulit glowing, makeup & kosmetik', defaultStyle: 'PRODUCT_CATALOG', quickEmoji: '✨' },
  { id: 'FASHION', label: 'Fashion & Streetwear', group: 'Fashion & Lifestyle', desc: 'Outfit ideas, distro, tren busana & aksesoris', defaultStyle: 'BRUTALIST_SALE', quickEmoji: '🛍️' },
  { id: 'GAYA_HIDUP', label: 'Gaya Hidup & Hiburan', group: 'Fashion & Lifestyle', desc: 'Pop culture, film, musik & hobi seru', defaultStyle: 'SPOTLIGHT', quickEmoji: '🍿' },
  { id: 'WISATA_TRAVEL', label: 'Wisata (Travel) & Liburan', group: 'Fashion & Lifestyle', desc: 'Rekomendasi destinasi, hotel & itinerary jalan-jalan', defaultStyle: 'RED_COLLAGE', quickEmoji: '✈️' },

  // ─── PROPERTI, PENDIDIKAN & LAINNYA ───
  { id: 'PROPERTI_RUMAH', label: 'Properti & Desain Rumah', group: 'Properti & Hunian', desc: 'Dekorasi interior, rumah impian, arsitektur & kost', defaultStyle: 'MINIMAL', quickEmoji: '🏠' },
  { id: 'OTOMOTIF', label: 'Otomotif (Mobil & Motor)', group: 'Otomotif & Servis', desc: 'Review mobil/motor, tips servis & modifikasi', defaultStyle: 'BOLD', quickEmoji: '🚗' },
  { id: 'PENDIDIKAN', label: 'Pendidikan & Beasiswa', group: 'Edukasi & Pengembangan', desc: 'Tips belajar, info kampus, beasiswa & bahasa asing', defaultStyle: 'LIFESTYLE', quickEmoji: '🎓' },
  { id: 'PARENTING', label: 'Parenting & Keluarga', group: 'Edukasi & Pengembangan', desc: 'Pola asuh anak, ibu & bayi, keharmonisan keluarga', defaultStyle: 'UNBOXING_POLAROID', quickEmoji: '👶' },
  { id: 'MOTIVASI_MINDSET', label: 'Motivasi & Pengembangan Diri', group: 'Edukasi & Pengembangan', desc: 'Quotes inspiratif, buku filosofis & habit positif', defaultStyle: 'QUOTE_MINIMAL', quickEmoji: '🖋️' },
];

export const CONTENT_TYPE_PRESETS = [
  { id: 'PROMOTION', label: '📢 Promosi & Jualan', desc: 'Diskon, menu baru, promo kilat' },
  { id: 'EDUCATION', label: '📚 Edukasi & Tips', desc: 'Tutorial, tips praktis & panduan' },
  { id: 'STORYTELLING', label: '💡 Cerita Brand / BTS', desc: 'Behind the scenes & proses pembuatan' },
  { id: 'INTERACTION', label: '💬 Interaksi & Polling', desc: 'Pancing komentar & voting A vs B' },
  { id: 'ENTERTAINMENT', label: '🎭 Hiburan & Relatable', desc: 'Meme & situasi lucu pelanggan' },
  { id: 'TESTIMONIAL', label: '⭐ Testimoni Pembeli', desc: 'Bukti chat WA & review bintang 5' },
];

export function ContentCalendar({
  initialPosts,
  socialAccounts = [],
  recentContents = [],
}: ContentCalendarProps) {
  const [posts, setPosts] = React.useState<ScheduledPostItem[]>(initialPosts);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [viewMode, setViewMode] = React.useState<ViewMode>('WEEK');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'PUBLISHED' | 'FAILED'>('ALL');
  const [platformFilter, setPlatformFilter] = React.useState<'ALL' | 'INSTAGRAM' | 'TIKTOK' | 'THREADS'>('ALL');
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  
  // Modals
  const [showCampaignModal, setShowCampaignModal] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedPostToEdit, setSelectedPostToEdit] = React.useState<ScheduledPostItem | null>(null);
  const [accountsList, setAccountsList] = React.useState<SocialAccountItem[]>(socialAccounts);
  const [showConnectModal, setShowConnectModal] = React.useState(false);
  const [connectDefaultPlatform, setConnectDefaultPlatform] = React.useState<SocialPlatform>('INSTAGRAM');
  
  // Create Modal Form State
  const [formDate, setFormDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = React.useState<string>('10:00');
  const [formPlatform, setFormPlatform] = React.useState<SocialPlatform>('INSTAGRAM');
  const [formSocialAccountId, setFormSocialAccountId] = React.useState<string>('');
  
  // Content Generation Modes
  const [contentSourceMode, setContentSourceMode] = React.useState<ContentSourceMode>('AI_GENERATE');
  const [aiInputType, setAiInputType] = React.useState<'PROMPT' | 'URL'>('PROMPT');
  const [aiPromptOrUrl, setAiPromptOrUrl] = React.useState<string>('');
  const [aiNiche, setAiNiche] = React.useState<string>('KULINER_MAKANAN');
  const [aiContentType, setAiContentType] = React.useState<string>('PROMOTION');
  const [aiSelectedStyle, setAiSelectedStyle] = React.useState<string>('CULINARY');
  const [aiSlidesCount, setAiSlidesCount] = React.useState<number>(5);

  const [selectedContentId, setSelectedContentId] = React.useState<string>(recentContents[0]?.id || '');
  const [customHeadline, setCustomHeadline] = React.useState<string>('');
  const [customCaption, setCustomCaption] = React.useState<string>('');
  const [customMediaUrl, setCustomMediaUrl] = React.useState<string>('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = React.useState(false);
  const [generatingProgressMessage, setGeneratingProgressMessage] = React.useState<string>('');

  // Edit Modal Form State
  const [editDate, setEditDate] = React.useState<string>('');
  const [editTime, setEditTime] = React.useState<string>('');
  const [editCaption, setEditCaption] = React.useState<string>('');
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);

  // Handle OAuth callback notifications from URL params
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const handleParam = params.get('handle');
    const canceled = params.get('canceled');
    const errorParam = params.get('error');

    if (connected) {
      const platformName = connected.toUpperCase();
      notify.celebrate(
        `Akun ${platformName} Berhasil Terhubung! 🎉`,
        `${handleParam ? `${handleParam} ` : ''}resmi tersambung dan siap digunakan untuk Auto-Post jadwal carousel.`
      );
      fetchAccounts();
      window.history.replaceState({}, '', '/calendar');
    } else if (canceled) {
      notify.info('Otorisasi Dibatalkan', 'Proses otorisasi akun media sosial dibatalkan.');
      window.history.replaceState({}, '', '/calendar');
    } else if (errorParam) {
      notify.error('Gagal Menghubungkan', `Kendala otorisasi: ${errorParam}`);
      window.history.replaceState({}, '', '/calendar');
    }
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/social-accounts');
      if (res.ok) {
        const data = await res.json();
        setAccountsList(data.accounts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async () => {
    fetchAccounts();
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
      const res = await fetch(`/api/schedule/${id}/publish-now`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        notify.celebrate('Terbit! 🚀', 'Postingan berhasil dipublikasikan sekarang.');
        await fetchPosts();
        if (showEditModal) setShowEditModal(false);
      } else {
        notify.error('Gagal Menerbitkan', data?.error || data?.message || data?.result?.error || 'Terjadi kesalahan');
        await fetchPosts();
      }
    } catch (e: any) {
      notify.error('Gagal', e?.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRetry = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/schedule/${id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        notify.celebrate('Terbit! 🚀', 'Postingan berhasil dipublikasikan ulang.');
        await fetchPosts();
      } else {
        notify.error('Gagal Mengulang', data?.error || data?.message || data?.result?.error || 'Terjadi kesalahan');
        await fetchPosts();
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
        if (showEditModal) setShowEditModal(false);
      } else {
        notify.error('Gagal', 'Tidak dapat menghapus jadwal.');
      }
    } catch (e: any) {
      notify.error('Gagal', e?.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open create modal with preselected date
  const openCreateForDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setFormDate(`${yyyy}-${mm}-${dd}`);
    setFormTime('10:00');
    setContentSourceMode('AI_GENERATE');
    setAiPromptOrUrl('');
    setShowCreateModal(true);
  };

  // Open edit modal for post
  const openEditPost = (post: ScheduledPostItem) => {
    setSelectedPostToEdit(post);
    const d = new Date(post.scheduledAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    setEditDate(`${yyyy}-${mm}-${dd}`);
    setEditTime(`${hh}:${min}`);
    setEditCaption(post.caption || '');
    setShowEditModal(true);
  };

  // Handle Save New Scheduled Post (Direct Schedule OR Auto-Generate AI & Schedule)
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSchedule(true);
    setGeneratingProgressMessage('Menyiapkan jadwal...');

    try {
      let finalMediaUrls: string[] = [];
      let finalCaption = customCaption.trim();
      let generatedContentId: string | null = null;
      let outputFormat = 'FEED_PORTRAIT';
      let designStyle: string | null = aiSelectedStyle;

      // MODE 1: AUTO-GENERATE AI DARI LINK ATAU PROMPT
      if (contentSourceMode === 'AI_GENERATE') {
        if (!aiPromptOrUrl.trim()) {
          notify.warning('Input Diperlukan', 'Masukkan link artikel atau prompt topik konten.');
          setIsSubmittingSchedule(false);
          return;
        }

        setGeneratingProgressMessage('✨ AI sedang merangkum materi & mendesain slide carousel...');

        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: aiInputType === 'URL' ? 'url' : 'prompt',
            url: aiInputType === 'URL' ? aiPromptOrUrl.trim() : undefined,
            prompt: aiInputType === 'PROMPT' ? aiPromptOrUrl.trim() : undefined,
            niche: aiNiche,
            contentType: aiContentType,
            style: aiSelectedStyle as DesignStyle,
            format: 'FEED_PORTRAIT',
            slides: aiSlidesCount,
          }),
        });

        const genData = await genRes.json();
        if (!genRes.ok || !genData.success) {
          throw new Error(genData?.error || 'Gagal menghasilkan carousel dengan AI.');
        }

        setGeneratingProgressMessage('📅 Menyimpan hasil carousel ke jadwal kalender...');

        const contentObj = genData.content || genData.generatedContent;
        generatedContentId = contentObj?.id || null;
        
        if (contentObj?.assets && contentObj.assets.length > 0) {
          finalMediaUrls = contentObj.assets.map((a: any) => a.imageUrl).filter(Boolean);
        } else if (contentObj?.visualUrl) {
          finalMediaUrls = [contentObj.visualUrl];
        }

        if (!finalCaption) {
          finalCaption = contentObj?.feedCopy || contentObj?.caption || `${contentObj?.headline}\\n\\n#newsly #carousel #ai`;
        }
      } 
      // MODE 2: PILIH DARI RIWAYAT CAROUSEL YANG SUDAH ADA
      else if (contentSourceMode === 'EXISTING') {
        const selectedContentObj = recentContents.find((c) => c.id === selectedContentId) || recentContents[0] || null;
        if (selectedContentObj) {
          generatedContentId = selectedContentObj.id;
          finalMediaUrls = selectedContentObj.mediaUrls.length > 0
            ? selectedContentObj.mediaUrls
            : (selectedContentObj.coverUrl ? [selectedContentObj.coverUrl] : []);
          if (!finalCaption) {
            finalCaption = `${selectedContentObj.headline}\\n\\n#newsly #carousel #ai`;
          }
          outputFormat = selectedContentObj.format || 'FEED_PORTRAIT';
          designStyle = selectedContentObj.style || null;
        }
      } 
      // MODE 3: KUSTOM MANUAL
      else {
        if (customMediaUrl.trim()) {
          finalMediaUrls = [customMediaUrl.trim()];
        }
        if (!finalCaption) {
          finalCaption = customHeadline ? `${customHeadline}\\n\\n#newsly #content` : 'Konten Carousel Baru';
        }
      }

      if (finalMediaUrls.length === 0) {
        finalMediaUrls = ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80'];
      }

      const scheduledDateTime = new Date(`${formDate}T${formTime}:00`);

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: formPlatform,
          scheduledAt: scheduledDateTime.toISOString(),
          publishMode: 'schedule',
          caption: finalCaption,
          hashtags: ['newsly', formPlatform.toLowerCase()],
          mediaUrls: finalMediaUrls,
          format: outputFormat,
          style: designStyle,
          generatedContentId: generatedContentId || undefined,
          socialAccountId: formSocialAccountId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify.celebrate('Jadwal Berhasil Dibuat! 🚀', `Konten siap tayang otomatis pada ${formDate} pukul ${formTime} WIB.`);
        setShowCreateModal(false);
        await fetchPosts();
      } else {
        notify.error('Gagal Menjadwalkan', data?.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      notify.error('Gagal', err?.message);
    } finally {
      setIsSubmittingSchedule(false);
      setGeneratingProgressMessage('');
    }
  };

  // Handle Save Edit Post
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostToEdit) return;

    setIsSubmittingEdit(true);
    try {
      const scheduledDateTime = new Date(`${editDate}T${editTime}:00`);

      const res = await fetch(`/api/schedule/${selectedPostToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: scheduledDateTime.toISOString(),
          caption: editCaption.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify.success('Jadwal Diperbarui! ✅', `Waktu jadwal diubah ke ${editDate} ${editTime} WIB.`);
        setShowEditModal(false);
        await fetchPosts();
      } else {
        notify.error('Gagal', data?.error || 'Gagal mengubah jadwal');
      }
    } catch (err: any) {
      notify.error('Gagal', err?.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Filter posts
  const filteredPosts = React.useMemo(() => {
    return posts.filter((p) => {
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchPlatform = platformFilter === 'ALL' || p.platform === platformFilter;
      return matchStatus && matchPlatform;
    });
  }, [posts, statusFilter, platformFilter]);

  // Calendar Math: Calculate Week Days (Monday to Sunday)
  const weekDays = React.useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Calendar Math: Calculate Month Days (Grid of 35 or 42 days)
  const monthDays = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() + distanceToMonday);

    const days: Date[] = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }
    return { days, currentMonth: month };
  }, [currentDate]);

  // Check if two dates are same day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  // Get posts for a specific date
  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter((p) => {
      const postDate = new Date(p.scheduledAt);
      return isSameDay(postDate, date);
    });
  };

  // Navigations
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'WEEK') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'WEEK') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthYearLabel = React.useMemo(() => {
    return currentDate.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate]);

  const getPlatformIcon = (platform: SocialPlatform, className = "size-3.5") => {
    switch (platform) {
      case 'INSTAGRAM':
        return <Instagram className={cn(className, "text-pink-500")} />;
      case 'TIKTOK':
        return <Sparkles className={cn(className, "text-cyan-400")} />;
      case 'THREADS':
        return <AtSign className={cn(className, "text-slate-900 dark:text-white")} />;
      default:
        return <Share2 className={cn(className, "text-primary")} />;
    }
  };

  const getStatusIcon = (status: ScheduleStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle2 className="size-3.5 text-emerald-500" />;
      case 'PENDING':
        return <Clock className="size-3.5 text-amber-500" />;
      case 'PROCESSING':
        return <RefreshCw className="size-3.5 text-blue-500 animate-spin" />;
      case 'FAILED':
        return <AlertCircle className="size-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatPostTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '10:00';
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── 1. TOP HEADER & NAVIGATION BAR ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
        {/* Navigation & Month Selector */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToday}
            className="h-9 px-3.5 text-xs font-black rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Hari Ini
          </Button>

          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Berikutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white capitalize tracking-tight flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <span>{monthYearLabel}</span>
          </h2>
        </div>

        {/* View Switchers & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle: WEEK | MONTH | LIST */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('WEEK')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'WEEK'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>Mingguan</span>
            </button>

            <button
              onClick={() => setViewMode('MONTH')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'MONTH'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <CalendarDays className="size-3.5" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={() => setViewMode('LIST')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <List className="size-3.5" />
              <span>Daftar</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setShowCampaignModal(true)}
            className="h-9 text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-xl shadow-sm"
          >
            <Sparkles className="size-3.5 mr-1" />
            Campaign 30H
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setFormDate(new Date().toISOString().split('T')[0]);
              setFormTime('10:00');
              setContentSourceMode('AI_GENERATE');
              setAiPromptOrUrl('');
              setShowCreateModal(true);
            }}
            className="h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm"
          >
            <Plus className="size-3.5 mr-1" />
            + Jadwalkan Post
          </Button>
        </div>
      </div>

      {/* ─── 1.5. CONNECTED ACCOUNTS STATUS BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
            <Share2 className="size-4 text-[#ff4526]" />
            <span>Akun Medsos Terhubung ({accountsList.length}):</span>
          </div>

          {accountsList.length === 0 ? (
            <span className="text-xs text-slate-500 italic">
              Belum ada akun terhubung (Instagram / TikTok / Threads).
            </span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {accountsList.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {getPlatformIcon(acc.platform, "size-3.5")}
                  <span>{acc.accountHandle || acc.accountName}</span>
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block ml-0.5" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => {
            setConnectDefaultPlatform('INSTAGRAM');
            setShowConnectModal(true);
          }}
          className="h-8 px-3 text-xs font-bold rounded-xl bg-gradient-to-r from-[#ff4526] to-amber-500 hover:opacity-95 text-white shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-3.5 mr-1" />
          + Hubungkan Akun Medsos
        </Button>
      </div>

      {/* ─── 2. FILTER CHIPS (PLATFORM & STATUS) ─── */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 text-xs">
        {/* Platform filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="size-3" /> Platform:
          </span>
          {(['ALL', 'INSTAGRAM', 'TIKTOK', 'THREADS'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 border',
                platformFilter === p
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              )}
            >
              {p === 'INSTAGRAM' && <Instagram className="size-3 text-pink-500" />}
              {p === 'TIKTOK' && <Sparkles className="size-3 text-cyan-400" />}
              {p === 'THREADS' && <AtSign className="size-3 text-slate-800 dark:text-white" />}
              <span>{p === 'ALL' ? 'Semua Platform' : p}</span>
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(['ALL', 'PENDING', 'PUBLISHED', 'FAILED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold transition-all border',
                statusFilter === st
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              )}
            >
              {st === 'ALL' ? 'Semua Status' : st === 'PENDING' ? '⏳ Menunggu' : st === 'PUBLISHED' ? '✅ Terbit' : '❌ Gagal'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. VIEW MODE A: MINGGUAN (7-COLUMN BOARD IDENTIK DENGAN REFERENSI GAMBAR) ─── */}
      {viewMode === 'WEEK' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 items-start overflow-x-auto pb-4">
          {weekDays.map((day) => {
            const dayPosts = getPostsForDate(day);
            const isDayToday = isToday(day);
            const dayName = day.toLocaleDateString('id-ID', { weekday: 'long' });
            const dayNum = day.getDate();
            const monthShort = day.toLocaleDateString('id-ID', { month: 'short' });

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'rounded-2xl border flex flex-col min-h-[500px] transition-all',
                  isDayToday
                    ? 'border-primary/80 bg-orange-50/20 dark:bg-indigo-950/20 shadow-md ring-1 ring-primary/30'
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40'
                )}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-t-2xl">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white capitalize">
                      {dayName}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-black px-1.5 py-0.2 rounded-md',
                        isDayToday
                          ? 'bg-primary text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {dayNum} {monthShort}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      ({dayPosts.length})
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateForDate(day)}
                    className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors"
                    title={`Tambah jadwal untuk ${dayName} ${dayNum}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                {/* Column Body: Post Cards */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[680px]">
                  {dayPosts.length === 0 ? (
                    <div
                      onClick={() => openCreateForDate(day)}
                      className="h-32 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center p-3 text-slate-400 hover:border-primary hover:bg-white dark:hover:bg-slate-900 cursor-pointer transition-all group"
                    >
                      <Plus className="size-4 mb-1 text-slate-300 group-hover:text-primary group-hover:scale-110 transition-all" />
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                        + Tambah Post
                      </span>
                    </div>
                  ) : (
                    dayPosts.map((post) => {
                      const isProcessing = actionLoadingId === post.id;
                      const coverImg = post.mediaUrls?.[0] || post.generatedContent?.visualUrl;

                      return (
                        <div
                          key={post.id}
                          onClick={() => openEditPost(post)}
                          className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-primary dark:hover:border-primary transition-all cursor-pointer overflow-hidden flex flex-col"
                        >
                          {/* Card Top: Platform & Handle */}
                          <div className="p-2.5 pb-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {getPlatformIcon(post.platform, "size-3")}
                              </div>
                              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                {post.socialAccount?.accountName || post.platform}
                              </span>
                            </div>
                            {getStatusIcon(post.status)}
                          </div>

                          {/* Card Thumbnail Preview (Carousel Cover) */}
                          <div className="relative w-full aspect-[4/3] bg-slate-950/10 dark:bg-slate-950 overflow-hidden">
                            {coverImg ? (
                              <img
                                src={coverImg}
                                alt={post.caption || 'Preview'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-100 dark:bg-slate-950">
                                <ImageIcon className="size-6 mb-1 opacity-40" />
                                <span className="text-[9px] line-clamp-2">
                                  {post.caption || 'Slide Carousel'}
                                </span>
                              </div>
                            )}

                            {/* Overlay Badge */}
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[9px] font-mono font-bold flex items-center gap-1">
                              <Layers className="size-2.5" />
                              <span>{post.mediaUrls?.length || 5}</span>
                            </div>
                          </div>

                          {/* Card Content Snippet */}
                          <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">
                              {post.generatedContent?.headline || post.caption}
                            </p>

                            {/* Card Footer: Status & Time */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono font-bold">
                                <Clock className="size-3 text-primary" />
                                <span>{formatPostTime(post.scheduledAt)}</span>
                              </div>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {post.status === 'PENDING' && (
                                  <button
                                    onClick={() => handlePublishNow(post.id)}
                                    disabled={isProcessing}
                                    className="p-1 rounded-md text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
                                    title="Terbitkan Sekarang"
                                  >
                                    <Zap className="size-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  disabled={isProcessing}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                  title="Hapus Jadwal"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 3. VIEW MODE B: BULANAN (MONTHLY GRID) ─── */}
      {viewMode === 'MONTH' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center py-2.5 text-xs font-black text-slate-700 dark:text-slate-300">
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span>Sabtu</span>
            <span>Minggu</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-800">
            {monthDays.days.map((day) => {
              const dayPosts = getPostsForDate(day);
              const isCurrentMonth = day.getMonth() === monthDays.currentMonth;
              const isDayToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => openCreateForDate(day)}
                  className={cn(
                    'min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/40',
                    !isCurrentMonth && 'opacity-40 bg-slate-50/50 dark:bg-slate-950/20',
                    isDayToday && 'bg-orange-50/40 dark:bg-indigo-950/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'size-6 flex items-center justify-center rounded-full text-xs font-black',
                        isDayToday
                          ? 'bg-primary text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {day.getDate()}
                    </span>

                    {dayPosts.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  {/* Mini Cards / Dots */}
                  <div className="space-y-1 mt-1">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPost(post);
                        }}
                        className="px-1.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 truncate flex items-center gap-1 hover:ring-1 hover:ring-primary"
                      >
                        {getPlatformIcon(post.platform, "size-2.5")}
                        <span className="truncate">{post.generatedContent?.headline || post.caption}</span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block text-right">
                        +{dayPosts.length - 2} lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 3. VIEW MODE C: LIST VIEW ─── */}
      {viewMode === 'LIST' && (
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-400">Tidak ada jadwal postingan yang sesuai filter.</p>
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
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                            {getPlatformIcon(post.platform)}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {post.platform}
                          </span>
                        </div>
                        {getStatusIcon(post.status)}
                      </div>

                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 px-2.5 py-1.5 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mb-2.5">
                        <Clock className="size-3.5 text-primary shrink-0" />
                        <span className="font-semibold">
                          {new Date(post.scheduledAt).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                        {post.generatedContent?.headline || 'Postingan Carousel'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {post.caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditPost(post)}
                        className="text-xs h-8 px-3 font-bold"
                      >
                        <Edit3 className="size-3 mr-1" />
                        Edit Jadwal
                      </Button>

                      <div className="flex items-center gap-1">
                        {post.status === 'PENDING' && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handlePublishNow(post.id)}
                            className="text-xs h-8 px-3 font-bold bg-primary text-white"
                          >
                            <Zap className="size-3 mr-1" />
                            Terbitkan
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="size-8 p-0 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── 4. MODAL: JADWALKAN POSTINGAN BARU (DENGAN DUKUNGAN LINK / PROMPT AI OTOMATIS) ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md">
                  <CalendarIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Jadwalkan Postingan Baru
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih tanggal &amp; jam, lalu masukkan Link Artikel atau Prompt AI untuk auto-generate carousel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateSchedule} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Tanggal & Jam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <CalendarIcon className="size-3.5 text-primary" />
                    <span>Tanggal Publikasi *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <Clock className="size-3.5 text-primary" />
                    <span>Jam Publikasi *</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Quick Time Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">Jam Populer:</span>
                {[
                  { time: '09:00', label: '🌅 09:00 Pagi' },
                  { time: '12:30', label: '☀️ 12:30 Siang' },
                  { time: '16:30', label: '🌆 16:30 Sore' },
                  { time: '19:30', label: '🌙 19:30 Malam' },
                ].map((chip) => (
                  <button
                    key={chip.time}
                    type="button"
                    onClick={() => setFormTime(chip.time)}
                    className={cn(
                      'px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border',
                      formTime === chip.time
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Pilih Platform & Akun */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Platform Tujuan
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setConnectDefaultPlatform(formPlatform);
                      setShowConnectModal(true);
                    }}
                    className="text-[11px] font-bold text-[#ff4526] hover:underline flex items-center gap-1"
                  >
                    <Plus className="size-3" /> + Hubungkan Akun {formPlatform}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['INSTAGRAM', 'TIKTOK', 'THREADS'] as const).map((plt) => {
                    const isSelected = formPlatform === plt;
                    return (
                      <button
                        key={plt}
                        type="button"
                        onClick={() => {
                          setFormPlatform(plt);
                          const matchingAcc = accountsList.find((a) => a.platform === plt);
                          if (matchingAcc) {
                            setFormSocialAccountId(matchingAcc.id);
                          } else {
                            setFormSocialAccountId('');
                          }
                        }}
                        className={cn(
                          'flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all',
                          isSelected
                            ? 'border-[#ff4526] bg-orange-50/60 dark:bg-orange-950/40 text-[#ff4526] ring-2 ring-[#ff4526]/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        )}
                      >
                        {getPlatformIcon(plt, "size-3.5")}
                        <span>{plt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Akun Pengirim */}
                {(() => {
                  const platformAccounts = accountsList.filter((a) => a.platform === formPlatform);
                  if (platformAccounts.length === 0) {
                    return (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="size-4 shrink-0 text-amber-600" />
                          <span>Belum ada akun <strong>{formPlatform}</strong> yang terhubung.</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setConnectDefaultPlatform(formPlatform);
                            setShowConnectModal(true);
                          }}
                          className="h-7 text-[10px] font-bold rounded-lg bg-[#ff4526] text-white shrink-0"
                        >
                          + Hubungkan
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Pilih Akun {formPlatform} Pengirim:
                      </label>
                      <select
                        value={formSocialAccountId}
                        onChange={(e) => setFormSocialAccountId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff4526]"
                      >
                        <option value="">-- Gunakan Akun Default Repliz Gold --</option>
                        {platformAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.accountHandle || acc.accountName} ({acc.accountName})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              </div>

              {/* ─── TAB SUMBER KONTEN: AI GENERATE DARI LINK/PROMPT vs RIWAYAT vs MANUAL ─── */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Wand2 className="size-3.5 text-primary" />
                    <span>Sumber Konten Carousel</span>
                  </label>
                </div>

                {/* Switcher 3 Mode */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setContentSourceMode('AI_GENERATE')}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1',
                      contentSourceMode === 'AI_GENERATE'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    )}
                  >
                    <Sparkles className="size-3" />
                    <span>Generate AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContentSourceMode('EXISTING')}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1',
                      contentSourceMode === 'EXISTING'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    )}
                  >
                    <Layers className="size-3" />
                    <span>Riwayat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContentSourceMode('CUSTOM')}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1',
                      contentSourceMode === 'CUSTOM'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    )}
                  >
                    <FileText className="size-3" />
                    <span>Manual</span>
                  </button>
                </div>

                {/* ─── KONTEN A: GENERATE OTOMATIS DARI LINK ARTIKEL ATAU PROMPT AI ─── */}
                {contentSourceMode === 'AI_GENERATE' && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-orange-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAiInputType('PROMPT')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                          aiInputType === 'PROMPT'
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        )}
                      >
                        💡 Prompt / Ide Topik
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiInputType('URL')}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                          aiInputType === 'URL'
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        )}
                      >
                        🔗 Link Berita / Artikel Web
                      </button>
                    </div>

                    {/* 1. Pilih Kategori / Niche Lengkap */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          1. Kategori / Niche Konten:
                        </label>
                        <span className="text-[11px] font-semibold text-primary dark:text-indigo-400 truncate max-w-[200px]">
                          {NICHE_PRESETS.find(n => n.id === aiNiche)?.desc}
                        </span>
                      </div>

                      {/* Dropdown Select Lengkap dengan Pengelompokan Kategori */}
                      <select
                        value={aiNiche}
                        onChange={(e) => {
                          const found = NICHE_PRESETS.find(n => n.id === e.target.value);
                          setAiNiche(e.target.value);
                          if (found) setAiSelectedStyle(found.defaultStyle);
                        }}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                      >
                        {Array.from(new Set(NICHE_PRESETS.map(n => n.group))).map(groupName => (
                          <optgroup key={groupName} label={groupName} className="font-bold text-slate-500 dark:text-slate-400">
                            {NICHE_PRESETS.filter(n => n.group === groupName).map(n => (
                              <option key={n.id} value={n.id} className="text-slate-900 dark:text-white font-medium py-1">
                                {n.quickEmoji} {n.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      {/* Quick Popular Shortcut Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        {[
                          'KULINER_MAKANAN',
                          'CAFE_MINUMAN',
                          'BISNIS',
                          'KEUANGAN_PRIBADI',
                          'KECANTIKAN',
                          'FASHION',
                          'OLAHRAGA',
                          'TEKNOLOGI_GADGET',
                          'AI_OTOMASI',
                          'WISATA_TRAVEL'
                        ].map((nId) => {
                          const item = NICHE_PRESETS.find(n => n.id === nId);
                          if (!item) return null;
                          const isSel = aiNiche === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setAiNiche(item.id);
                                setAiSelectedStyle(item.defaultStyle);
                              }}
                              className={cn(
                                'shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1',
                                isSel
                                  ? 'bg-primary text-white border-primary shadow-sm ring-1 ring-primary'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                              )}
                            >
                              <span>{item.quickEmoji}</span>
                              <span>{item.label.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Pilih Tipe / Pilar Konten */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                        <span>2. Tipe / Pilar Konten:</span>
                        <span className="text-[10px] font-normal text-primary dark:text-indigo-400">
                          {CONTENT_TYPE_PRESETS.find(c => c.id === aiContentType)?.desc}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {CONTENT_TYPE_PRESETS.map((ct) => {
                          const isSel = aiContentType === ct.id;
                          return (
                            <button
                              key={ct.id}
                              type="button"
                              onClick={() => {
                                setAiContentType(ct.id);
                                if (ct.id === 'TESTIMONIAL') setAiSelectedStyle('TESTIMONIAL_CHAT');
                                else if (ct.id === 'EDUCATION') setAiSelectedStyle('STEP_BY_STEP_GUIDE');
                                else if (ct.id === 'PROMOTION' && aiNiche === 'GENERAL_BUSINESS') setAiSelectedStyle('SHOPEE_PROMO');
                              }}
                              className={cn(
                                'px-2 py-1.5 rounded-xl border text-[10px] font-bold transition-all text-left truncate flex items-center gap-1',
                                isSel
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                              )}
                            >
                              <span className="truncate">{ct.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Input Prompt / URL Topik */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                        {aiInputType === 'PROMPT' ? '3. Ketik Ide Topik / Produk / Menu Konten:' : '3. Tempelkan Link Berita / Artikel Web:'}
                      </label>
                      <input
                        type={aiInputType === 'URL' ? 'url' : 'text'}
                        required={contentSourceMode === 'AI_GENERATE'}
                        value={aiPromptOrUrl}
                        onChange={(e) => setAiPromptOrUrl(e.target.value)}
                        placeholder={
                          aiInputType === 'URL'
                            ? 'https://web-artikel.com/...'
                            : ['KULINER_MAKANAN', 'CAFE_MINUMAN', 'RESEP_MASAKAN'].includes(aiNiche)
                              ? (aiContentType === 'PROMOTION' ? 'Contoh: Promo Buy 1 Get 1 Menu Kopi Pandan Creamy / Paket Nasi Rendang Hemat' : 'Contoh: 3 Alasan kenapa bumbu rempah asli bikin masakan jauh lebih gurih & empuk')
                              : ['BISNIS', 'BISNIS_DIGITAL', 'MARKETING_BRANDING'].includes(aiNiche)
                                ? 'Contoh: 5 Strategi scale-up omset penjualan UMKM di media sosial'
                                : ['KEUANGAN_PRIBADI', 'INVESTASI'].includes(aiNiche)
                                  ? 'Contoh: Cara mengatur gaji 5 juta biar bisa nabung & investasi 30%'
                                  : ['OLAHRAGA', 'DIET_NUTRISI', 'KESEHATAN'].includes(aiNiche)
                                    ? 'Contoh: Panduan menu diet defisit kalori kenyang tanpa lemas'
                                    : ['TEKNOLOGI_GADGET', 'AI_OTOMASI', 'ULASAN_GADGET'].includes(aiNiche)
                                      ? 'Contoh: 5 Tools AI gratis yang wajib dicoba untuk otomatisasi kerjaan'
                                      : ['KECANTIKAN', 'FASHION'].includes(aiNiche)
                                        ? 'Contoh: Urutan skincare malam yang benar biar bangun tidur glowing'
                                        : 'Contoh: Masukkan ide atau topik konten yang ingin dibuat...'
                        }
                        className="w-full rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Template Gaya & Jumlah Slide */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                          Template Gaya Desain
                        </label>
                        <select
                          value={aiSelectedStyle}
                          onChange={(e) => setAiSelectedStyle(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                        >
                          {AVAILABLE_STYLES_PRESET.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                          Jumlah Slide Carousel
                        </label>
                        <select
                          value={aiSlidesCount}
                          onChange={(e) => setAiSlidesCount(parseInt(e.target.value, 10))}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                        >
                          <option value={3}>3 Slide Ringkas</option>
                          <option value={5}>5 Slide Standar</option>
                          <option value={7}>7 Slide Mendalam</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── KONTEN B: PILIH DARI RIWAYAT CAROUSEL ─── */}
                {contentSourceMode === 'EXISTING' && (
                  <div className="space-y-2">
                    {recentContents.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        {recentContents.map((content) => {
                          const isSelected = selectedContentId === content.id;
                          return (
                            <div
                              key={content.id}
                              onClick={() => setSelectedContentId(content.id)}
                              className={cn(
                                'p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all',
                                isSelected
                                  ? 'border-primary bg-orange-50 dark:bg-indigo-950/60 ring-2 ring-primary/20'
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              )}
                            >
                              <div className="size-10 rounded-lg bg-slate-950 overflow-hidden shrink-0">
                                {content.coverUrl ? (
                                  <img src={content.coverUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-[9px]">
                                    {content.totalSlides}S
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                  {content.headline}
                                </h5>
                                <span className="text-[9px] text-slate-400">
                                  {content.totalSlides} Slide • {content.format}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        Belum ada riwayat carousel. Pilih opsi "Generate AI" di atas untuk membuat yang baru.
                      </div>
                    )}
                  </div>
                )}

                {/* ─── KONTEN C: KUSTOM MANUAL ─── */}
                {contentSourceMode === 'CUSTOM' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                        Headline / Judul
                      </label>
                      <input
                        type="text"
                        value={customHeadline}
                        onChange={(e) => setCustomHeadline(e.target.value)}
                        placeholder="Ketik judul postingan..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                        URL Gambar Cover (Opsional)
                      </label>
                      <input
                        type="url"
                        value={customMediaUrl}
                        onChange={(e) => setCustomMediaUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Caption & Hashtag Kustom */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                  Caption &amp; Hashtag (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="Ketik caption pengiring postingan (atau biarkan kosong untuk memakai caption otomatis AI)..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Progress Indicator */}
              {isSubmittingSchedule && (
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-center gap-2 text-primary dark:text-indigo-400 text-xs font-bold">
                    <RefreshCw className="size-4 animate-spin" />
                    <span>{generatingProgressMessage || 'Memproses AI & Menjadwalkan...'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Mohon tunggu beberapa detik...</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmittingSchedule}
                className="w-full h-11 text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white rounded-xl shadow-md transition-all"
              >
                {isSubmittingSchedule ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="size-3.5 animate-spin" /> Memproses...
                  </span>
                ) : contentSourceMode === 'AI_GENERATE' ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> 🚀 Buat Konten AI &amp; Pasang Jadwal
                  </span>
                ) : (
                  '💾 Simpan &amp; Jadwalkan Postingan'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. MODAL: EDIT / DETAIL POSTINGAN TERJADWAL ─── */}
      {showEditModal && selectedPostToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedPostToEdit.platform, "size-4")}
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Detail &amp; Ubah Jadwal ({selectedPostToEdit.platform})
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {/* Media Thumbnail */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="size-14 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                  {selectedPostToEdit.mediaUrls?.[0] ? (
                    <img src={selectedPostToEdit.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">IMG</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {selectedPostToEdit.generatedContent?.headline || selectedPostToEdit.caption}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedPostToEdit.mediaUrls?.length || 5} Slide Carousel • Status: {selectedPostToEdit.status}
                  </p>
                </div>
              </div>

              {/* Tanggal & Jam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                    Jam
                  </label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                  Caption Postingan
                </label>
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm"
                >
                  {isSubmittingEdit ? 'Menyimpan...' : '💾 Simpan Perubahan Jadwal'}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  {selectedPostToEdit.status === 'PENDING' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePublishNow(selectedPostToEdit.id)}
                      className="text-xs font-bold text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                    >
                      <Zap className="size-3 mr-1 text-amber-500" />
                      Terbitkan Sekarang
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(selectedPostToEdit.id)}
                    className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="size-3 mr-1" />
                    Hapus Jadwal
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. 30-DAY CAMPAIGN AUTO-PILOT MODAL ─── */}
      <CampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCampaignSuccess={fetchPosts}
      />

      {/* ─── 7. CONNECT SOCIAL ACCOUNT MODAL ─── */}
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        defaultPlatform={connectDefaultPlatform}
        onAccountConnected={(newAcc) => {
          setAccountsList((prev) => [newAcc, ...prev.filter((a) => a.id !== newAcc.id)]);
          if (newAcc.platform === formPlatform) {
            setFormSocialAccountId(newAcc.id);
          }
        }}
      />
    </div>
  );
}
