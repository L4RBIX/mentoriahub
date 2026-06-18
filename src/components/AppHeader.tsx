'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/BrandLogo';
import { PlatformControls } from '@/components/PlatformControls';

/**
 * Lightweight in-app header used across internal pages (dashboard, opportunities,
 * courses, calendar, leaderboard, certificates, mentor, admin, roadmap).
 * Always links the logo back to the homepage and exposes the theme/language
 * controls so they aren't only reachable from the marketing navbar.
 */
export function AppHeader({ className }: { className?: string }) {
  return (
    <header className={cn('sticky top-0 z-40 border-b border-white/10 bg-black', className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80 cursor-pointer"
        >
          <BrandLogo size="sm" variant="dark" />
        </Link>
        <PlatformControls />
      </div>
    </header>
  );
}
