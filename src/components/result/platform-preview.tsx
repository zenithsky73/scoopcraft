'use client';

import * as React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, Share2, ThumbsUp } from 'lucide-react';
import type { RunAsset, RunContent } from '@/lib/run-status';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [platform, setPlatform] = React.useState<'INSTAGRAM' | 'LINKEDIN'>('INSTAGRAM');
  const [expandedCaption, setExpandedCaption] = React.useState(false);

  const prevSlide = () => onSelectSlide(Math.max(0, activeSlide - 1));
  const nextSlide = () => onSelectSlide(Math.min(deck.length - 1, activeSlide + 1));

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Platform Mockup Preview</h4>
        <Tabs value={platform} onValueChange={(val) => setPlatform(val as 'INSTAGRAM' | 'LINKEDIN')}>
          <TabsList className="h-8">
            <TabsTrigger value="INSTAGRAM" className="text-xs px-3">Instagram</TabsTrigger>
            <TabsTrigger value="LINKEDIN" className="text-xs px-3">LinkedIn</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {platform === 'INSTAGRAM' ? (
        /* Instagram Feed Post Mockup */
        <div className="mx-auto max-w-[380px] overflow-hidden rounded-xl border border-border/80 bg-black text-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 p-[2px]">
                <div className="size-full rounded-full bg-black flex items-center justify-center text-2xs font-bold text-white uppercase">
                  {(content.headline[0] || 'S').toUpperCase()}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight">scoopcraft.news</p>
                <p className="text-[10px] text-zinc-400">Sponsored</p>
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
                <Heart className="size-5 text-white hover:text-rose-500 cursor-pointer" />
                <MessageCircle className="size-5 text-white hover:text-zinc-300 cursor-pointer" />
                <Send className="size-5 text-white hover:text-zinc-300 cursor-pointer" />
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
              <Bookmark className="size-5 text-white hover:text-zinc-300 cursor-pointer" />
            </div>

            {/* Likes */}
            <p className="mt-2 text-xs font-semibold">1.420 suka</p>

            {/* Caption Preview */}
            <div className="mt-1 text-xs text-zinc-200">
              <span className="font-semibold text-white mr-1.5">scoopcraft.news</span>
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
        /* LinkedIn Document Post Mockup */
        <div className="mx-auto max-w-[380px] overflow-hidden rounded-xl border border-border bg-white text-zinc-900 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">
                IN
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Redaksi Scoopcraft</p>
                <p className="text-[10px] text-zinc-500">2.840 pengikut · 1 jam yang lalu</p>
              </div>
            </div>
            <MoreHorizontal className="size-4 text-zinc-400" />
          </div>

          {/* Post Text */}
          <div className="px-3 py-2 text-xs text-zinc-700 leading-relaxed">
            <p className="font-semibold text-zinc-900 mb-1">{content.headline}</p>
            <p>{expandedCaption ? content.caption : `${content.caption.slice(0, 95)}…`}</p>
          </div>

          {/* Document Carousel Container */}
          <div className="relative aspect-square w-full bg-zinc-100 border-y border-zinc-200 overflow-hidden">
            {currentAsset?.imageUrl ? (
              <Image
                src={currentAsset.imageUrl}
                alt="LinkedIn Document Preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-zinc-400">
                Memuat dokumen…
              </div>
            )}

            {/* Document page indicator bar */}
            <div className="absolute bottom-2 inset-x-3 flex items-center justify-between rounded-md bg-black/75 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              <span className="text-[11px] font-medium truncate max-w-[200px]">{content.headline}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  disabled={activeSlide === 0}
                  className="disabled:opacity-30 hover:text-blue-300"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-[11px] font-bold">
                  {activeSlide + 1} / {deck.length}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={activeSlide === deck.length - 1}
                  className="disabled:opacity-30 hover:text-blue-300"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* LinkedIn Action Bar */}
          <div className="flex items-center justify-around border-t border-zinc-100 py-2 text-zinc-600 text-xs font-semibold">
            <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <ThumbsUp className="size-4" /> Suka
            </div>
            <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <MessageCircle className="size-4" /> Komentar
            </div>
            <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <Share2 className="size-4" /> Bagikan
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
