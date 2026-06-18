'use client';

import { useMemo } from 'react';
import { Play } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface YouTubeEmbedProps {
  /** Bare 11-character YouTube video ID. Takes priority over videoUrl. */
  youtubeId?: string;
  /** Full YouTube URL (watch, youtu.be, embed, or shorts) — the ID is extracted safely. */
  videoUrl?: string;
  /** Accessible iframe title; falls back to the localized "Lesson video" label. */
  title?: string;
  className?: string;
}

/**
 * Pulls an 11-character YouTube video ID out of any common URL shape
 * (watch?v=, youtu.be/, /embed/, /shorts/) or passes through a bare ID.
 * Returns null for anything that doesn't resolve — callers render the
 * premium fallback placeholder in that case instead of a broken iframe.
 */
export function extractYouTubeId(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Already a bare YouTube ID (11 url-safe characters).
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return id || null;
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com') {
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.split('/embed/')[1]?.split('/')[0] || null;
      }
      if (url.pathname.startsWith('/shorts/')) {
        return url.pathname.split('/shorts/')[1]?.split('/')[0] || null;
      }
      const v = url.searchParams.get('v');
      if (v) return v;
    }
  } catch {
    // Not a parseable URL — fall through to "unresolved".
  }

  return null;
}

export function YouTubeEmbed({ youtubeId, videoUrl, title, className }: YouTubeEmbedProps) {
  const { tt } = useI18n();
  const resolvedId = useMemo(() => extractYouTubeId(youtubeId) || extractYouTubeId(videoUrl), [youtubeId, videoUrl]);

  if (!resolvedId) {
    return (
      <div
        className={`relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm ${className ?? ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#5941ff]/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#5941ff]/30 bg-[#5941ff]/20">
            <Play className="h-6 w-6 translate-x-0.5 text-[#5941ff]" />
          </div>
          <p className="text-sm text-white/40">{tt('videoLessonLabel')}</p>
          <p className="text-xs text-white/25">{tt('videoComingSoonLabel')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-lg shadow-black/25 ${className ?? ''}`}
    >
      <iframe
        key={resolvedId}
        src={`https://www.youtube-nocookie.com/embed/${resolvedId}`}
        title={title || tt('videoLessonLabel')}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
