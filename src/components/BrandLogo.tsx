'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg';
type LogoVariant = 'dark' | 'light';

interface SizeConfig {
  px: number;
  textClass: string;
  subClass: string;
  gap: string;
}

const SIZES: Record<LogoSize, SizeConfig> = {
  xs: { px: 24, textClass: 'text-[10px]', subClass: 'text-[7.5px]', gap: 'gap-2' },
  sm: { px: 32, textClass: 'text-[11px]', subClass: 'text-[8px]',   gap: 'gap-2' },
  md: { px: 40, textClass: 'text-[12px]', subClass: 'text-[9px]',   gap: 'gap-2.5' },
  lg: { px: 56, textClass: 'text-sm',     subClass: 'text-[10px]',  gap: 'gap-3' },
};

export interface BrandLogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  variant?: LogoVariant;
  textColor?: string;
  mutedColor?: string;
}

export function BrandLogo({
  size = 'md',
  showText = true,
  className,
  variant = 'dark',
  textColor,
  mutedColor,
}: BrandLogoProps) {
  const { px, textClass, subClass, gap } = SIZES[size];

  const resolvedText   = textColor  ?? (variant === 'dark' ? 'rgba(255,255,255,0.90)' : '#1e293b');
  const resolvedMuted  = mutedColor ?? (variant === 'dark' ? 'rgba(255,255,255,0.46)' : 'rgba(30,41,59,0.50)');
  const borderColor    = variant === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)';

  return (
    <div className={cn('flex items-center', gap, className)}>
      {/* Circular logo mark — always circular, never distorted */}
      <div
        className="relative shrink-0 overflow-hidden rounded-full"
        style={{
          width: px,
          height: px,
          border: `1.5px solid ${borderColor}`,
          boxShadow: '0 0 0 1px rgba(89,65,255,0.08), 0 2px 12px rgba(89,65,255,0.22)',
        }}
      >
        <Image
          src="/mentoria-logo.jpg"
          alt="Mentoria Hub"
          fill
          className="object-cover"
          sizes={`${px}px`}
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none" style={{ gap: '3px' }}>
          <span
            className={`font-semibold uppercase tracking-[0.16em] ${textClass}`}
            style={{ color: resolvedText }}
          >
            MENTORIA
          </span>
          <span
            className={`font-light uppercase tracking-[0.20em] ${subClass}`}
            style={{ color: resolvedMuted }}
          >
            HUB
          </span>
        </div>
      )}
    </div>
  );
}
