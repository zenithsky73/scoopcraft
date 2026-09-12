'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { SocialPlatform } from '@prisma/client';

export type PlatformType = SocialPlatform | 'INSTAGRAM' | 'TIKTOK' | 'THREADS' | 'FACEBOOK' | string;

interface SocialIconProps extends React.HTMLAttributes<HTMLDivElement> {
  platform: PlatformType;
  size?: number;
  className?: string;
  variant?: 'icon' | 'badge' | 'avatar' | 'rounded';
}

const PLATFORM_IMAGE_MAP: Record<string, { src: string; alt: string; label: string }> = {
  INSTAGRAM: {
    src: '/images/social/instagram.png',
    alt: 'Instagram',
    label: 'Instagram',
  },
  TIKTOK: {
    src: '/images/social/tiktok.png',
    alt: 'TikTok',
    label: 'TikTok',
  },
  THREADS: {
    src: '/images/social/threads.png',
    alt: 'Threads',
    label: 'Threads',
  },
};

export function SocialIcon({
  platform,
  size = 20,
  className,
  variant = 'icon',
  ...props
}: SocialIconProps) {
  const norm = (platform || 'INSTAGRAM').toString().toUpperCase();
  const info = PLATFORM_IMAGE_MAP[norm] || PLATFORM_IMAGE_MAP.INSTAGRAM;

  return (
    <div
      className={cn(
        'relative shrink-0 inline-flex items-center justify-center overflow-hidden select-none',
        variant === 'avatar' && 'rounded-full ring-1 ring-black/10 dark:ring-white/10 shadow-sm',
        variant === 'rounded' && 'rounded-xl shadow-sm',
        variant === 'badge' && 'rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm',
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <Image
        src={info.src}
        alt={info.alt}
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain pointer-events-none"
        priority
      />
    </div>
  );
}

export function getSocialPlatformBrand(platform: PlatformType) {
  const norm = (platform || 'INSTAGRAM').toString().toUpperCase();
  switch (norm) {
    case 'TIKTOK':
      return {
        id: 'TIKTOK' as const,
        label: 'TikTok Studio',
        shortName: 'TikTok',
        color: '#00F2FE',
        logoSrc: '/images/social/tiktok.png',
        badge: 'Photo & Video',
        themeClass: 'bg-black text-white border-slate-800',
        gradientClass: 'from-slate-900 via-neutral-900 to-black',
        buttonClass: 'bg-black hover:bg-neutral-900 text-cyan-300 border border-cyan-500/30 shadow-cyan-500/20',
      };
    case 'THREADS':
      return {
        id: 'THREADS' as const,
        label: 'Threads Meta',
        shortName: 'Threads',
        color: '#000000',
        logoSrc: '/images/social/threads.png',
        badge: 'Microblog Utas',
        themeClass: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
        gradientClass: 'from-slate-900 via-zinc-800 to-black dark:from-slate-100 dark:via-zinc-200 dark:to-white',
        buttonClass: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-95 shadow-slate-900/20',
      };
    case 'INSTAGRAM':
    default:
      return {
        id: 'INSTAGRAM' as const,
        label: 'Instagram Pro',
        shortName: 'Instagram',
        color: '#E1306C',
        logoSrc: '/images/social/instagram.png',
        badge: 'Feed & Carousel',
        themeClass: 'bg-gradient-to-tr from-pink-500 via-purple-600 to-orange-500 text-white',
        gradientClass: 'from-pink-500 via-purple-600 to-orange-500',
        buttonClass: 'bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 hover:opacity-95 shadow-pink-500/25',
      };
  }
}
