'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NewslyLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Logo Resmi Newsly AI: Monogram Ribbon "N" dengan Gradien Cyan-Purple-Coral dan Bintang AI Spark.
 * 100% Transparan (Zero White Box Background), Tajam di Retina Display.
 */
export function NewslyLogo({ className, size = 28, ...props }: NewslyLogoProps) {
  const id = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none drop-shadow-sm', className)}
      {...props}
    >
      <defs>
        {/* Left Ribbon Leg: Electric Cyan to Neon Blue */}
        <linearGradient id={`nl-left-${id}`} x1="20" y1="80" x2="48" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Diagonal Ribbon Fold: Neon Blue to Purple to Magenta */}
        <linearGradient id={`nl-mid-${id}`} x1="45" y1="24" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Right Ribbon Leg: Magenta to Sunset Coral */}
        <linearGradient id={`nl-right-${id}`} x1="56" y1="78" x2="80" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>

        {/* Subtle Ambient Glow */}
        <filter id={`nl-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.3" />
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#EC4899" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#nl-glow-${id})`}>
        {/* Left Leg of N */}
        <path
          d="M20 78L40 26C41.5 22 47 22 48.5 26L49 28L29 80C27.5 84 22 84 20.5 80L20 78Z"
          fill={`url(#nl-left-${id})`}
        />

        {/* Middle Diagonal Ribbon Fold */}
        <path
          d="M40 26C42 22 47 22 49 26L63 76C64.5 80 60 83 56 81L39 30C39.5 28.5 40 27 40 26Z"
          fill={`url(#nl-mid-${id})`}
        />

        {/* Right Leg of N */}
        <path
          d="M56 78L75 26C76.5 22 82 22 83.5 26L84 28L65 80C63.5 84 58 84 56.5 80L56 78Z"
          fill={`url(#nl-right-${id})`}
        />

        {/* AI Sparkle Diamond Star at Top Right */}
        <path
          d="M77 18C77 21.5 74.5 24 71 24C74.5 24 77 26.5 77 30C77 26.5 79.5 24 83 24C79.5 24 77 21.5 77 18Z"
          fill="#FFFFFF"
        />
        <circle cx="77" cy="24" r="1.5" fill="#FFFFFF" opacity="0.95" />
      </g>
    </svg>
  );
}
