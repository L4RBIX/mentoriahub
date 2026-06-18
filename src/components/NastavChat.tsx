'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp, MessageCircle, Sparkles, Maximize2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { t } from '@/lib/i18n';
import type { AppLanguage, StudentProfile, Roadmap } from '@/types/mentoria';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: { label: string; href: string }[];
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

interface NastavChatProps {
  profile: StudentProfile | null;
  roadmap: Roadmap | null;
}

function isAssistantSuccess(data: AssistantData): data is AssistantSuccess {
  return 'answer' in data && typeof data.answer === 'string';
}

// Fallback/error text must follow the *detected* message language returned by
// the server, not the UI language — e.g. asking "hi" while the site is in RU
// should still show the English fallback if DeepSeek is unreachable.
function getAssistantErrorMessage(data: AssistantData | null, uiLanguage: AppLanguage): string {
  const lang = data?.responseLanguage ?? uiLanguage;
  if (data && 'error' in data && data.error === 'DeepSeek API key is missing') {
    return t(lang, 'assistantMissingKey');
  }

  return t(lang, 'assistantUnavailable');
}

export function NastavChat({ profile, roadmap }: NastavChatProps) {
  const { tt, language } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    tt('whatToday'),
    tt('firstCourse'),
    tt('suitableOpportunity'),
    tt('deadlinePrep'),
  ];

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // Last user message before this one — used server-side only to resolve
    // ambiguous follow-ups ("ok", "да") to the language of the real question.
    const previousUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
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
      if (!res.ok || !isAssistantSuccess(data)) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: getAssistantErrorMessage(data, language),
            actions: [],
          },
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          actions: data.suggestedActions ?? [],
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: getAssistantErrorMessage(null, language),
          actions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nastav-chat flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d12]/95 shadow-2xl shadow-black/30">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/8 px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/75">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{tt('chatTitle')}</p>
          <p className="text-xs text-white/55">{tt('chatSubtitle')}</p>
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

      {/* Messages */}
      <div className="min-h-[240px] max-h-[440px] space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div>
            <div className="nastav-intro-card mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/80">
                <Sparkles className="h-3.5 w-3.5 text-[#8b7fff]" />
                <p className="text-sm font-medium">{tt('chatIntroTitle')}</p>
              </div>
              <p className="text-xs leading-relaxed text-white/55">
                {tt('chatIntroText')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => void send(p)}
                  className="nastav-prompt-btn cursor-pointer rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-left text-xs text-white/65 transition-all duration-200 hover:border-white/18 hover:bg-white/[0.055] hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="nastav-msg-icon mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2.5 ${
                    msg.role === 'user'
                      ? 'rounded-2xl rounded-br-sm bg-[#5941ff]'
                      : 'nastav-assistant-bubble rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.055]'
                  }`}
                >
                  <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.actions.map(a => (
                        <Link
                          key={`${a.href}-${a.label}`}
                          href={a.href}
                          className="nastav-action-link inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/75 transition-colors hover:border-[#5941ff]/40 hover:text-white"
                        >
                          {a.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="nastav-msg-icon mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60">
                  <MessageCircle className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.055] px-4 py-3">
                  <div className="flex items-center gap-1.5">
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
                    <span className="text-white/40 text-xs ml-1.5">{tt('nastavThinking')}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Quick re-prompts after conversation starts */}
      {messages.length > 0 && !loading && (
        <div className="px-4 pb-2 pt-0 flex gap-2 flex-wrap">
          {[tt('quickWhatElse'), tt('quickOpenFirst')].map(p => (
            <button
              key={p}
              onClick={() => void send(p)}
              className="nastav-reprompt-btn cursor-pointer rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-white/8 px-4 py-3">
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
            placeholder={tt('askPlaceholder')}
            disabled={loading}
            className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-sm text-white transition-colors placeholder:text-white/30 focus:border-[#5941ff]/55 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#5941ff] transition-all duration-150 hover:bg-[#4730dd] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
