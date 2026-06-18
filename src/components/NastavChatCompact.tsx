'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUp, MessageCircle, Maximize2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { t } from '@/lib/i18n';
import type { AppLanguage, StudentProfile, Roadmap } from '@/types/mentoria';

interface CompactAnswer {
  content: string;
  actions: { label: string; href: string }[];
}

interface AssistantSuccess {
  answer: string;
  suggestedActions: { label: string; href: string }[];
  responseLanguage?: AppLanguage;
}

interface AssistantError {
  error: string;
  details?: string;
  responseLanguage?: AppLanguage;
}

type AssistantData = AssistantSuccess | AssistantError;

interface NastavChatCompactProps {
  profile: StudentProfile | null;
  roadmap: Roadmap | null;
}

function isAssistantSuccess(data: AssistantData): data is AssistantSuccess {
  return 'answer' in data && typeof data.answer === 'string';
}

// Fallback/error text follows the *detected* message language from the
// server, not the UI language — see NastavChat.tsx for the same logic.
function getAssistantErrorMessage(data: AssistantData | null, uiLanguage: AppLanguage): string {
  const lang = data?.responseLanguage ?? uiLanguage;
  if (data && 'error' in data && data.error === 'DeepSeek API key is missing') {
    return t(lang, 'assistantMissingKey');
  }

  return t(lang, 'assistantUnavailable');
}

export function NastavChatCompact({ profile, roadmap }: NastavChatCompactProps) {
  const { tt, language } = useI18n();
  const [answer, setAnswer] = useState<CompactAnswer | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState<string | undefined>(undefined);
  const compactPrompts = [tt('compactPromptWeek'), tt('compactPromptFirst')];

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const previousUserMessage = lastSentMessage;
    setInput('');
    setLoading(true);

    try {
      const [{ MOCK_OPPORTUNITIES }, { COURSES }] = await Promise.all([
        import('@/lib/data/opportunities'),
        import('@/lib/data/courses'),
      ]);

      const savedIds = storage.getSavedOpportunities().map(s => s.opportunityId);
      const savedOpportunities = MOCK_OPPORTUNITIES.filter(o => savedIds.includes(o.id));

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language,
          previousUserMessage,
          profile,
          roadmap,
          savedOpportunities,
          courses: COURSES,
          opportunities: MOCK_OPPORTUNITIES,
        }),
      });

      const data = (await res.json()) as AssistantData;
      setLastSentMessage(trimmed);
      if (!res.ok || !isAssistantSuccess(data)) {
        setAnswer({
          content: getAssistantErrorMessage(data, language),
          actions: [],
        });
        return;
      }

      setAnswer({
        content: data.answer,
        actions: data.suggestedActions ?? [],
      });
    } catch {
      setLastSentMessage(trimmed);
      setAnswer({
        content: getAssistantErrorMessage(null, language),
        actions: [],
      });
    } finally {
      setLoading(false);
    }
  }

  const nextStep = roadmap?.steps.find(s => !s.completed);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d12]/95 shadow-xl shadow-black/25">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70">
          <MessageCircle className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-none text-white">{tt('chatTitle')}</p>
          <p className="mt-0.5 text-xs text-white/50">{tt('chatSubtitle')}</p>
        </div>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
        <Link
          href="/nastav"
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          title={tt('openFullChat')}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="p-4 space-y-3">
        {/* Next step hint — only when no answer yet */}
        {!answer && !loading && nextStep && (
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-xs">
            <span className="font-medium text-white/80">{tt('nextStepHint')} </span>
            <span className="text-white/58">{nextStep.title}</span>
          </div>
        )}

        {/* Loading dots */}
        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#5941ff] animate-pulse"
              style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#5941ff] animate-pulse"
              style={{ animationDelay: '280ms', animationDuration: '1.4s' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#5941ff] animate-pulse"
              style={{ animationDelay: '560ms', animationDuration: '1.4s' }}
            />
            <span className="text-white/40 text-xs ml-1">{tt('nastavThinking')}</span>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div className="rounded-xl border border-white/8 bg-white/[0.045] px-3 py-2.5">
            <p className="text-white/80 text-xs leading-relaxed">{answer.content}</p>
            {answer.actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {answer.actions.slice(0, 2).map(a => (
                  <Link
                    key={`${a.href}-${a.label}`}
                    href={a.href}
                    className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/70 transition-colors hover:border-[#5941ff]/40 hover:text-white"
                  >
                    {a.label} →
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick prompts */}
        {!loading && (
          <div className="flex gap-2">
            {compactPrompts.map(p => (
              <button
              key={p}
              onClick={() => void send(p)}
              className="flex-1 cursor-pointer truncate rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            void send(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={tt('askNastav')}
            disabled={loading}
            className="min-h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white transition-colors placeholder:text-white/30 focus:border-[#5941ff]/55 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#5941ff] transition-all duration-150 hover:bg-[#4730dd] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
