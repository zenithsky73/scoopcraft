'use client';

import * as React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RunAsset, RunContent } from '@/lib/run-status';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialIcon } from '@/components/social/social-icon';

export function PlatformPreview({
  content,
  assets,
  currentAsset,
  deck,
  activeSlide,
  onSelectSlide,
}: {
  content: RunContent;
  assets: RunAsset[];
  currentAsset: RunAsset;
  deck: RunAsset[];
  activeSlide: number;
  onSelectSlide: (idx: number) => void;
}) {
  const [platform, setPlatform] = React.useState<'FEED' | 'STORY'>('FEED');
  const [expandedCaption, setExpandedCaption] = React.useState(false);

  const prevSlide = () => onSelectSlide(Math.max(0, activeSlide - 1));
  const nextSlide = () => onSelectSlide(Math.min(deck.length - 1, activeSlide + 1));

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SocialIcon platform="INSTAGRAM" size={16} variant="rounded" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Pratinjau Mockup Instagram</h4>
        </div>
        <Tabs value={platform} onValueChange={(val) => setPlatform(val as 'FEED' | 'STORY')}>
          <TabsList className="h-8">
            <TabsTrigger value="FEED" className="text-xs px-3">Instagram Feed</TabsTrigger>
            <TabsTrigger value="STORY" className="text-xs px-3">Instagram Story</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {platform === 'FEED' ? (
        /* Instagram Feed Post Mockup */
        <div className="mx-auto max-w-[380px] overflow-hidden rounded-xl border border-border/80 bg-black text-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 p-[2px]">
                <div className="size-full rounded-full bg-black flex items-center justify-center text-2xs font-bold text-white uppercase">
                  {(content.headline[0] || 'I').toUpperCase()}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight">instadeck.id</p>
                <p className="text-[10px] text-zinc-400">Audio Asli · Trending</p>
              </div>
            </div>
            <MoreHorizontal className="size-4 text-zinc-400" />
          </div>

          {/* Canvas Image View with Swipe Buttons */}
          <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
            {currentAsset?.imageUrl ? (
              <Image
                src={currentAsset.imageUrl}
                alt="Instagram Preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-zinc-500">
                Memuat preview…
              </div>
            )}

            {/* Carousel Navigation Arrows */}
            {deck.length > 1 && (
              <>
                {activeSlide > 0 && (
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                )}
                {activeSlide < deck.length - 1 && (
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                )}

                {/* Counter Badge (e.g. 1/5) */}
                <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {activeSlide + 1}/{deck.length}
                </div>
              </>
            )}
          </div>

          {/* Action Bar */}
          <div className="px-3 pt-2.5 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <Heart className="size-5 text-white hover:text-rose-500 cursor-pointer transition-colors" />
                <MessageCircle className="size-5 text-white hover:text-zinc-300 cursor-pointer transition-colors" />
                <Send className="size-5 text-white hover:text-zinc-300 cursor-pointer transition-colors" />
              </div>
              {/* Dots indicator */}
              {deck.length > 1 && (
                <div className="flex items-center gap-1">
                  {deck.map((_, i) => (
                    <div
                      key={i}
                      className={`size-1.5 rounded-full transition-all ${
                        i === activeSlide ? 'w-2 bg-blue-500' : 'bg-zinc-600'
                      }`}
                    />
                  ))}
                </div>
              )}
              <Bookmark className="size-5 text-white hover:text-zinc-300 cursor-pointer transition-colors" />
            </div>

            {/* Likes */}
            <p className="mt-2 text-xs font-semibold">2.480 suka</p>

            {/* Caption Preview */}
            <div className="mt-1 text-xs text-zinc-200">
              <span className="font-semibold text-white mr-1.5">instadeck.id</span>
              <span>
                {expandedCaption ? content.caption : `${content.caption.slice(0, 80)}…`}
              </span>
              {content.caption.length > 80 && (
                <button
                  type="button"
                  onClick={() => setExpandedCaption(!expandedCaption)}
                  className="ml-1 text-zinc-400 hover:text-white"
                >
                  {expandedCaption ? 'sembunyikan' : 'selengkapnya'}
                </button>
              )}
            </div>

            {/* Hashtags */}
            <p className="mt-1 text-[11px] text-blue-400">
              {content.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
            </p>
          </div>
        </div>
      ) : (
        /* Instagram Story Mockup */
        <div className="mx-auto max-w-[340px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl relative aspect-[9/16] flex flex-col justify-between p-3">
          {/* Top Story Bars */}
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-1">
              {deck.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      idx < activeSlide
                        ? 'w-full bg-white'
                        : idx === activeSlide
                        ? 'w-full bg-white animate-pulse'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 p-[1.5px]">
                  <div className="size-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                    {(content.headline[0] || 'I').toUpperCase()}
                  </div>
                </div>
                <span className="text-xs font-semibold text-white drop-shadow">instadeck.id</span>
                <span className="text-[10px] text-white/70">1j</span>
              </div>
              <MoreHorizontal className="size-4 text-white/80" />
            </div>
          </div>

          {/* Background Visual Asset */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-900">
            {currentAsset?.imageUrl ? (
              <Image
                src={currentAsset.imageUrl}
                alt="Instagram Story Preview"
                fill
                className="object-contain"
                unoptimized
              />
            ) : (
              <div className="text-xs text-zinc-500">Memuat slide story…</div>
            )}

            {/* Tap Navigation Overlays */}
            <div
              onClick={prevSlide}
              className="absolute left-0 top-12 bottom-16 w-1/3 cursor-pointer z-10"
              title="Slide Sebelumnya"
            />
            <div
              onClick={nextSlide}
              className="absolute right-0 top-12 bottom-16 w-2/3 cursor-pointer z-10"
              title="Slide Berikutnya"
            />
          </div>

          {/* Story Footer */}
          <div className="z-10 flex items-center gap-2 pt-2">
            <div className="flex-1 rounded-full border border-white/40 bg-black/40 px-3.5 py-2 text-xs text-white/80 backdrop-blur-md">
              Kirim pesan...
            </div>
            <button className="p-1.5 text-white hover:text-rose-500 transition-colors">
              <Heart className="size-6" />
            </button>
            <button className="p-1.5 text-white hover:text-zinc-300 transition-colors">
              <Send className="size-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
