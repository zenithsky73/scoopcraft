'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface InstaDeckLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showProBadge?: boolean;
  textClassName?: string;
}

/**
 * Logo Resmi InstaDeck PRO:
 * Menampilkan ikon InstaDeck oranye/coral resmi dengan typography dan badge PRO.
 */
export function NewslyLogo({
  className,
  size = 28,
  showText = false,
  showProBadge = false,
  textClassName,
}: InstaDeckLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 select-none shrink-0', className)}>
      <div
        className="relative overflow-hidden rounded-xl bg-transparent shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/instadeck-logo.png"
          alt="InstaDeck"
          width={size}
          height={size}
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={cn('text-base font-black tracking-tight text-slate-900 dark:text-white', textClassName)}>
            InstaDeck
          </span>
          {showProBadge && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full bg-[#fff0ec] dark:bg-[#ff4526]/20 text-[#ff4526] text-[9px] font-black tracking-wider border border-[#ffd4ca] dark:border-[#ff4526]/40">
              PRO
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { NewslyLogo as InstaDeckLogo };
