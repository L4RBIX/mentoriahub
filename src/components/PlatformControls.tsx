'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';
import { LANGUAGE_CHANGE_EVENT, LANGUAGES } from '@/lib/i18n';
import { storage } from '@/lib/storage';
import type { AppLanguage } from '@/types/mentoria';

export function applyTheme(theme: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('theme-light', theme === 'light');
}

interface PlatformControlsProps {
  /**
   * "hero"    — strong dark-glass pill for placement over the dark homepage
   *             hero/header. Uses inline styles so .theme-light broad overrides
   *             cannot touch text or background colours.
   * "default" — theme-aware: white/light pill in light mode, dark-glass in dark.
   */
  variant?: 'default' | 'hero';
}

export function PlatformControls({ variant = 'default' }: PlatformControlsProps) {
  const [language, setLanguage] = useState<AppLanguage>('ru');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedLanguage = storage.getLanguage();
    const savedTheme = storage.getTheme();
    setLanguage(savedLanguage);
    setTheme(savedTheme);
    applyTheme(savedTheme);
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: savedLanguage }));
  }, []);

  const changeLanguage = (next: AppLanguage) => {
    setLanguage(next);
    storage.setLanguage(next);
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: next }));
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    storage.setTheme(next);
    applyTheme(next);
  };

  // ─── Hero variant ────────────────────────────────────────────────────────
  // Strong dark-glass pill — all colours are inline styles so the global
  // .theme-light broad overrides (which turn text-white/* → dark slate) can
  // never reach them. Safe to use regardless of the user's light/dark toggle.
  if (variant === 'hero') {
    return (
      <div
        className="flex items-center gap-1.5 rounded-full p-1"
        style={{
          background: 'rgba(10, 10, 18, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="h-7 min-w-7 rounded-full px-2 text-xs transition-colors hover:bg-white/[0.10]"
          style={{ color: 'rgba(255,255,255,0.78)' }}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? '☾' : '☀'}
        </button>

        {/* Separator */}
        <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.16)' }} />

        {/* Language buttons */}
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`h-7 rounded-full px-2 text-[10px] font-semibold uppercase transition-colors ${
              language === lang
                ? 'bg-[#5941ff] text-white shadow-[0_0_12px_rgba(89,65,255,0.45)]'
                : 'hover:bg-white/[0.10]'
            }`}
            style={language !== lang ? { color: 'rgba(255,255,255,0.72)' } : undefined}
          >
            {lang}
          </button>
        ))}
      </div>
    );
  }

  // ─── Default variant ─────────────────────────────────────────────────────
  // Theme-aware: white/light pill in light mode, dark-glass in dark mode.
  const isLight = theme === 'light';

  return (
    <div
      className={
        isLight
          ? 'flex items-center gap-1.5 rounded-full border border-[#d0d8ea] bg-white p-1'
          : 'flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 p-1 backdrop-blur-md'
      }
      style={isLight ? { boxShadow: '0 2px 8px rgba(15,23,42,0.12), 0 1px 2px rgba(15,23,42,0.07)' } : undefined}
    >
      <button
        onClick={toggleTheme}
        className={
          isLight
            ? 'h-7 min-w-7 rounded-full px-2 text-xs text-[#334155] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]'
            : 'h-7 min-w-7 rounded-full px-2 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white'
        }
        aria-label="Toggle dark/light theme"
      >
        {theme === 'dark' ? '☾' : '☀'}
      </button>

      <div className={isLight ? 'h-4 w-px bg-[#dde3f0]' : 'h-4 w-px bg-white/10'} />

      {LANGUAGES.map(lang => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`h-7 rounded-full px-2 text-[10px] font-semibold uppercase transition-colors ${
            language === lang
              ? 'bg-[#5941ff] text-white shadow-[0_0_10px_rgba(89,65,255,0.30)]'
              : isLight
                ? 'text-[#475467] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                : 'text-white/55 hover:bg-white/10 hover:text-white'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
