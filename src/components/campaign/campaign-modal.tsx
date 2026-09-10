'use client';

import * as React from 'react';
import {
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Facebook,
  AtSign,
  X,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { CampaignDayPost } from '@/server/ai/campaign-generator';

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCampaignSuccess?: () => void;
}

const TOPIC_PRESETS = [
  '☕ Menu spesial cafe & promo buy 1 get 1 (Coffee shop / Fore style)',
  '🍲 Kuliner legendaris, rahasia rendang & paket hemat Rumah Makan Padang',
  '🛍️ Promo flash sale gajian & racun outfit fashion / distro UMKM',
  '✨ Edukasi perawatan kulit & rekomendasi paket skincare glowing',
  '💼 Strategi scale-up UMKM & tips mengelola keuangan bisnis',
];

export function CampaignModal({ open, onClose, onCampaignSuccess }: CampaignModalProps) {
  const [topic, setTopic] = React.useState('');
  const [niche, setNiche] = React.useState('CULINARY_RESTO');
  const [contentType, setContentType] = React.useState('MIXED');
  const [duration, setDuration] = React.useState<7 | 14 | 30>(30);
  const [platform, setPlatform] = React.useState<'INSTAGRAM' | 'FACEBOOK' | 'THREADS'>('INSTAGRAM');

  // Default start date: besok
  const defaultStartDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [startDate, setStartDate] = React.useState(defaultStartDate);
  const [preferredTime, setPreferredTime] = React.useState('09:00');

  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [generatedDays, setGeneratedDays] = React.useState<CampaignDayPost[]>([]);
  const [expandedDay, setExpandedDay] = React.useState<number | null>(null);
  const [isCommitted, setIsCommitted] = React.useState(false);

  // Animasi langkah saat loading
  React.useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 3);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!open) return null;

  const handleGenerate = async (autoCommit = true) => {
    if (!topic.trim()) {
      notify.warning('Topik Diperlukan', 'Masukkan tema atau topik kampanye terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setGeneratedDays([]);
    setIsCommitted(false);

    try {
      const res = await fetch('/api/campaign/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          niche,
          contentType: contentType === 'MIXED' ? undefined : contentType,
          durationDays: duration,
          startDate,
          preferredTime,
          platform,
          autoCommit,
        }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = { error: 'Server mengalami timeout atau kendala teknis saat memproses 30 hari. Silakan coba kembali.' };
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Gagal menghasilkan kampanye konten.');
      }

      setGeneratedDays(data.days || []);
      setIsCommitted(autoCommit);

      if (autoCommit) {
        notify.celebrate(
          `Kampanye ${duration} Hari Siap! 🎉`,
          `Semua ${data.count} konten telah otomatis dijadwalkan ke Kalender Anda.`
        );
        onCampaignSuccess?.();
      } else {
        notify.success('Rencana Dibuat!', `${data.count} ide harian siap ditinjau.`);
      }
    } catch (err: any) {
      notify.error('Gagal Membuat Kampanye', err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadingMessages = [
    `AI sedang meriset 30 variasi topik unik untuk "${topic.slice(0, 25)}..."`,
    'Menyusun naskah carousel, hook headline, dan bumbu rahasia...',
    'Menghitung dan memetakan slot tanggal kalender 1 s/d 30...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Campaign Auto-Pilot 30 Hari
                </h3>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  AI Batch
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1 Prompt • 30 Carousel Berbeda • Terjadwal Otomatis 1 Bulan Penuh
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

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {generatedDays.length === 0 ? (
            /* FORM STATE */
            <>
                            {/* 1. Pilih Kategori / Niche Kampanye */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                  1. Kategori / Niche Kampanye
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <optgroup label="Bisnis & Keuangan">
                    <option value="BISNIS">💼 Bisnis & UMKM</option>
                    <option value="KEUANGAN_PRIBADI">💰 Keuangan Pribadi</option>
                    <option value="INVESTASI">📈 Investasi & Saham</option>
                    <option value="BISNIS_DIGITAL">🛒 Bisnis Digital & E-Commerce</option>
                    <option value="PENGEMBANGAN_KARIR">👔 Pengembangan Karir & HR</option>
                    <option value="MARKETING_BRANDING">📣 Marketing & Branding</option>
                  </optgroup>
                  <optgroup label="Kuliner & F&B">
                    <option value="KULINER_MAKANAN">🍲 Kuliner & Makanan (Resto/Padang)</option>
                    <option value="CAFE_MINUMAN">☕ Cafe, Kopi & Minuman (Fore style)</option>
                    <option value="RESEP_MASAKAN">🍳 Resep Masakan & Baking</option>
                  </optgroup>
                  <optgroup label="Kesehatan & Olahraga">
                    <option value="KESEHATAN">🩺 Kesehatan & Medis</option>
                    <option value="OLAHRAGA">🏋️ Olahraga & Fitness</option>
                    <option value="DIET_NUTRISI">🥗 Diet & Nutrisi</option>
                    <option value="KESEHATAN_MENTAL">🧘 Kesehatan Mental & Self-Care</option>
                  </optgroup>
                  <optgroup label="Teknologi & AI">
                    <option value="TEKNOLOGI_GADGET">📱 Teknologi & Gadget</option>
                    <option value="ULASAN_GADGET">📦 Ulasan & Review Gadget</option>
                    <option value="AI_OTOMASI">🤖 Kecerdasan Buatan (AI) & Tools</option>
                    <option value="PEMROGRAMAN">💻 Pemrograman & IT (Coding)</option>
                    <option value="GAMING">🎮 Gaming & Esports</option>
                  </optgroup>
                  <optgroup label="Fashion & Lifestyle">
                    <option value="KECANTIKAN">✨ Kecantikan & Skincare</option>
                    <option value="FASHION">🛍️ Fashion & Streetwear</option>
                    <option value="GAYA_HIDUP">🍿 Gaya Hidup & Hiburan</option>
                    <option value="WISATA_TRAVEL">✈️ Wisata (Travel) & Liburan</option>
                  </optgroup>
                  <optgroup label="Properti & Pengembangan Diri">
                    <option value="PROPERTI_RUMAH">🏠 Properti & Desain Rumah</option>
                    <option value="OTOMOTIF">🚗 Otomotif (Mobil & Motor)</option>
                    <option value="PENDIDIKAN">🎓 Pendidikan & Beasiswa</option>
                    <option value="PARENTING">👶 Parenting & Keluarga</option>
                    <option value="MOTIVASI_MINDSET">🖋️ Motivasi & Pengembangan Diri</option>
                  </optgroup>
                </select>
              </div>

              {/* 2. Input Tema Utama */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                  2. Topik / Detail Brand Kampanye
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Resep masakan rumahan sehari-hari yang simpel & hemat"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TOPIC_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(preset)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors font-medium border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Durasi Kampanye */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                  Pilih Durasi Jadwal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 7 as const, label: '7 Hari', sub: '1 Minggu' },
                    { days: 14 as const, label: '14 Hari', sub: '2 Minggu' },
                    { days: 30 as const, label: '30 Hari', sub: '1 Bulan Penuh' },
                  ].map((item) => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => setDuration(item.days)}
                      className={cn(
                        'py-2.5 px-3 rounded-2xl border text-center transition-all',
                        duration === item.days
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <div className="text-xs font-black">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Platform */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Platform Tujuan
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPlatform('INSTAGRAM')}
                      className={cn(
                        'flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-[11px] font-bold transition-all',
                        platform === 'INSTAGRAM'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                      )}
                    >
                      <Instagram className="size-3 text-pink-500" />
                      <span>Instagram</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('FACEBOOK')}
                      className={cn(
                        'flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-[11px] font-bold transition-all',
                        platform === 'FACEBOOK'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                      )}
                    >
                      <Facebook className="size-3 text-blue-600" />
                      <span>Facebook</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('THREADS')}
                      className={cn(
                        'flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-[11px] font-bold transition-all',
                        platform === 'THREADS'
                          ? 'border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-400/30'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                      )}
                    >
                      <AtSign className="size-3 text-slate-900 dark:text-white" />
                      <span>Threads</span>
                    </button>
                  </div>
                </div>

                {/* Tanggal Mulai & Jam */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Mulai &amp; Jam Tayang
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Value Proposition Box */}
              <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-300">
                <Flame className="size-4 shrink-0 text-amber-500 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold">Keajaiban 1-Klik:</span> AI akan langsung menyusun {duration} konten carousel berbeda, masing-masing dengan cover, isi, resep/poin, caption, dan hashtag. Semuanya langsung terisi di kalender harian Anda!
                </div>
              </div>
            </>
          ) : (
            /* PREVIEW STATE */
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      {isCommitted ? 'Semua Konten Berhasil Dijadwalkan!' : `${generatedDays.length} Konten Siap Dijadwalkan`}
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      {isCommitted
                        ? 'Cek Kalender Konten untuk melihat jadwal tayang harian Anda.'
                        : 'Tinjau judul naskah per hari di bawah ini.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar 30 Hari */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {generatedDays.map((item) => {
                  const isExpanded = expandedDay === item.day;
                  return (
                    <div
                      key={item.day}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 text-xs transition-all"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedDay(isExpanded ? null : item.day)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] flex items-center justify-center shrink-0">
                            H{item.day}
                          </span>
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              {item.date} • {item.time} WIB
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {item.slides.length} Slide
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="size-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="size-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Detail Expand */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 animate-in fade-in">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Headline Cover:</span>{' '}
                            {item.headline}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Caption:</span>{' '}
                            <p className="mt-0.5 text-slate-500 dark:text-slate-400 line-clamp-3">
                              {item.caption}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.hashtags.map((h, i) => (
                              <span key={i} className="text-[9px] text-indigo-500">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading Animation Bar */}
          {isLoading && (
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 p-4 text-center space-y-2 animate-in fade-in">
              <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="size-5 animate-spin" />
                <span className="text-xs font-bold">Sedang Menyusun Kampanye...</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 animate-pulse">
                {loadingMessages[loadingStep]}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-500"
          >
            {isCommitted ? 'Selesai' : 'Batal'}
          </Button>

          {generatedDays.length === 0 ? (
            <Button
              type="button"
              size="sm"
              disabled={isLoading || !topic.trim()}
              onClick={() => handleGenerate(true)}
              className="text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-md shadow-pink-600/20"
            >
              <Sparkles className="size-3.5 mr-1.5" />
              <span>{isLoading ? 'Menghasilkan Konten...' : `Generate & Jadwalkan ${duration} Hari`}</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <CheckCircle2 className="size-3.5 mr-1.5" />
              <span>Tutup &amp; Buka Kalender</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
