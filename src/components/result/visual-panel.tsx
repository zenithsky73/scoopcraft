'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Download,
  ImageOff,
  Loader2,
  RotateCw,
  Sparkles,
  Crown,
  FileText,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
} from 'lucide-react';
import type { DesignStyle, OutputFormat } from '@prisma/client';
import type { RunAsset, RunContent } from '@/lib/run-status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { FORMAT_SPECS } from '@/config/formats';
import { STYLES, isProStyle } from '@/config/styles';
import { cn } from '@/lib/utils';
import { PlatformPreview } from '@/components/result/platform-preview';
import { UpgradeDialog } from '@/components/billing/upgrade-dialog';

export function VisualPanel({
  contentId,
  content,
  assets,
  stale,
  rerendering,
  onRerender,
}: {
  contentId: string;
  content?: RunContent;
  assets: RunAsset[];
  /** Teks sudah diedit tapi PNG belum dirender ulang. */
  stale: boolean;
  rerendering: boolean;
  onRerender: () => void;
}) {
  const styles = unique(assets.map((asset) => asset.style));
  const formats = unique(assets.map((asset) => asset.format));

  const [style, setStyle] = React.useState<DesignStyle>(styles[0] ?? 'MINIMAL');
  const [format, setFormat] = React.useState<OutputFormat>(formats[0] ?? 'FEED_SQUARE');
  const [slide, setSlide] = React.useState(0);

  // Modal states
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<'PRO_STYLE' | 'PDF_EXPORT' | null>(null);
  const [showPreviewMockup, setShowPreviewMockup] = React.useState(false);
  const [replaceImageOpen, setReplaceImageOpen] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [customImageUrl, setCustomImageUrl] = React.useState('');
  const [imageUploadError, setImageUploadError] = React.useState<string | null>(null);

  // Aset bisa berubah saat render ulang selesai; jaga pilihan tetap sah.
  React.useEffect(() => {
    if (styles.length > 0 && !styles.includes(style)) setStyle(styles[0]);
    if (formats.length > 0 && !formats.includes(format)) setFormat(formats[0]);
  }, [styles, formats, style, format]);

  const deck = assets
    .filter((asset) => asset.style === style && asset.format === format)
    .sort((a, b) => a.slideIndex - b.slideIndex);

  const current = deck[Math.min(slide, deck.length - 1)] ?? deck[0];

  React.useEffect(() => {
    if (slide > deck.length - 1) setSlide(0);
  }, [deck.length, slide]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageUploadError(null);

    const formData = new FormData();
    formData.append('slideIndex', String(slide));
    formData.append('file', file);

    try {
      const res = await fetch(`/api/content/${contentId}/slide-image`, {
        method: 'POST',
        body: formData,
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Gagal mengunggah foto.');
      }

      setReplaceImageOpen(false);
      onRerender();
    } catch (err: any) {
      setImageUploadError(err.message || 'Gagal mengunggah foto.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customImageUrl.trim()) return;

    setUploadingImage(true);
    setImageUploadError(null);

    try {
      const res = await fetch(`/api/content/${contentId}/slide-image`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slideIndex: slide, imageUrl: customImageUrl.trim() }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Gagal menyimpan URL gambar.');
      }

      setReplaceImageOpen(false);
      setCustomImageUrl('');
      onRerender();
    } catch (err: any) {
      setImageUploadError(err.message || 'Gagal menyimpan URL gambar.');
    } finally {
      setUploadingImage(false);
    }
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface py-14 text-center">
        <ImageOff className="size-6 text-muted" aria-hidden />
        <p className="text-sm text-muted">Belum ada gambar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template selector tabs with Pro badges */}
      {styles.length > 1 && (
        <Tabs value={style} onValueChange={(value) => setStyle(value as DesignStyle)}>
          <TabsList className="w-full overflow-x-auto justify-start h-auto p-1 gap-1">
            {styles.map((item) => {
              const def = STYLES.find((entry) => entry.id === item);
              const isPro = isProStyle(item);
              return (
                <TabsTrigger key={item} value={item} className="whitespace-nowrap text-xs py-1.5 px-2.5">
                  {def?.label ?? item}
                  {isPro && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-500">
                      PRO
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Format tabs */}
      <Tabs value={format} onValueChange={(value) => setFormat(value as OutputFormat)}>
        <TabsList className="w-full overflow-x-auto">
          {formats.map((item) => (
            <TabsTrigger key={item} value={item} className="flex-1 whitespace-nowrap">
              {FORMAT_SPECS[item].label}
              <span className="ml-1 text-2xs opacity-70">{FORMAT_SPECS[item].short}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {stale && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
          <AlertCircle className="size-4 shrink-0 text-warning" aria-hidden />
          <p className="min-w-0 flex-1 text-sm">Konten berubah — gambar belum diperbarui.</p>
          <Button size="sm" onClick={onRerender} loading={rerendering}>
            <RotateCw aria-hidden /> Render ulang
          </Button>
        </div>
      )}

      <AssetFrame asset={current} />

      {/* Slide Tools: Thumbnail Strip & Replace Photo */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setReplaceImageOpen(true)}
          className="text-xs"
        >
          <ImageIcon className="size-3.5 mr-1" /> Ganti Foto Slide Ini
        </Button>

        {content && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreviewMockup(!showPreviewMockup)}
            className="text-xs"
          >
            <Eye className="size-3.5 mr-1" />
            {showPreviewMockup ? 'Sembunyikan Mockup' : 'Pratinjau IG / LinkedIn'}
          </Button>
        )}
      </div>

      {deck.length > 1 && <SlideStrip deck={deck} active={slide} onSelect={setSlide} />}

      {/* Interactive Platform Mockup Section */}
      {showPreviewMockup && content && (
        <PlatformPreview
          content={content}
          assets={assets}
          currentAsset={current}
          deck={deck}
          activeSlide={slide}
          onSelectSlide={setSlide}
        />
      )}

      {/* Download Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button asChild variant="secondary" className="w-full">
          <a href={`/api/assets/${current.id}/download`} download>
            <Download className="size-4 mr-1.5" /> Slide Ini (PNG)
          </a>
        </Button>

        <Button asChild className="w-full">
          <a href={`/api/content/${contentId}/download?style=${style}&format=${format}`} download>
            <Download className="size-4 mr-1.5" /> Semua Slide (ZIP)
          </a>
        </Button>
      </div>

      {/* LinkedIn Carousel PDF Export */}
      <Button asChild variant="secondary" className="w-full border-blue-500/30 hover:bg-blue-500/10 text-blue-400">
        <a href={`/api/content/${contentId}/pdf?style=${style}&format=${format}`} download>
          <FileText className="size-4 mr-1.5 text-blue-500" /> Unduh Dokumen Carousel LinkedIn (PDF)
        </a>
      </Button>

      {/* Modal Ganti Foto */}
      {replaceImageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-fg">
                Ganti Foto Slide #{slide + 1}
              </h4>
              <button
                onClick={() => setReplaceImageOpen(false)}
                className="text-muted hover:text-fg text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted">
              Unggah foto baru dari komputer Anda atau masukkan link gambar web untuk slide ini.
            </p>

            {imageUploadError && (
              <p className="text-xs text-danger">{imageUploadError}</p>
            )}

            {/* Opsi Upload File */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-fg">Unggah dari Komputer</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-accent rounded-lg p-5 cursor-pointer bg-surface-2 transition-colors">
                <Upload className="size-6 text-muted mb-1" />
                <span className="text-xs text-muted font-medium">Klik untuk memilih file foto (PNG, JPG, WebP)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            <div className="flex items-center gap-2 text-2xs text-muted uppercase">
              <div className="flex-1 h-px bg-border" />
              <span>atau</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Opsi Paste URL */}
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-fg">Tempel Link / URL Gambar</label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  disabled={uploadingImage}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplaceImageOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" loading={uploadingImage}>
                  Simpan Foto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Paywall Dialog */}
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason={upgradeReason}
      />
    </div>
  );
}

/** Bingkai berukuran rasio asli — mencegah layout melompat saat gambar dimuat. */
function AssetFrame({ asset }: { asset: RunAsset }) {
  const spec = FORMAT_SPECS[asset.format];

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-md border border-border bg-surface-2 shadow-sm"
      style={{ aspectRatio: spec.ratio, maxWidth: asset.format === 'STORY' ? 320 : 460 }}
    >
      {asset.status === 'READY' && asset.imageUrl ? (
        <Image
          src={asset.imageUrl}
          alt={`Pratinjau ${spec.label}`}
          fill
          sizes="(max-width: 1024px) 90vw, 460px"
          className="object-contain"
          priority
          unoptimized
        />
      ) : asset.status === 'FAILED' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <AlertCircle className="size-5 text-danger" aria-hidden />
          <p className="text-sm font-medium text-danger">Render gagal</p>
          {asset.error && <p className="text-xs text-muted">{asset.error}</p>}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-5 animate-spin text-muted" aria-hidden />
          <p className="text-xs text-muted">{asset.status === 'RENDERING' ? 'Merender…' : 'Menunggu antrean'}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Deretan thumbnail slide. Di layar kecil bisa digeser (snap), di desktop
 * cukup dilihat sekilas — keduanya memakai kontrol yang sama.
 */
function SlideStrip({
  deck,
  active,
  onSelect,
}: {
  deck: RunAsset[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
      {deck.map((asset, index) => {
        const spec = FORMAT_SPECS[asset.format];
        return (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={index === active}
            className={cn(
              'relative w-16 shrink-0 snap-start overflow-hidden rounded-sm border-2 bg-surface-2 transition-colors',
              index === active ? 'border-accent' : 'border-transparent hover:border-border',
            )}
            style={{ aspectRatio: spec.ratio }}
          >
            {asset.status === 'READY' && asset.imageUrl ? (
              <Image src={asset.imageUrl} alt="" fill sizes="64px" className="object-cover" unoptimized />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-2xs text-muted">{index + 1}</span>
            )}
            <span className="absolute bottom-0 right-0 bg-fg/70 px-1 text-2xs font-semibold text-bg">{index + 1}</span>
          </button>
        );
      })}
      <div className="flex shrink-0 items-center pl-1">
        <Badge variant="neutral">{deck.length} slide</Badge>
      </div>
    </div>
  );
}

function unique<T>(list: T[]): T[] {
  return Array.from(new Set(list));
}
