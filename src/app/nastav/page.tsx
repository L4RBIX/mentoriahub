'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUp, MessageCircle, Plus, Trash2, Sparkles, Menu, X } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { t } from '@/lib/i18n';
import type { AppLanguage, NastavChatSession, NastavMessage, StudentProfile, Roadmap } from '@/types/mentoria';

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

function isAssistantSuccess(data: AssistantData): data is AssistantSuccess {
  return 'answer' in data && typeof data.answer === 'string';
}

function getErrorMessage(data: AssistantData | null, uiLanguage: AppLanguage): string {
  const lang = data?.responseLanguage ?? uiLanguage;
  if (data && 'error' in data && data.error === 'DeepSeek API key is missing') {
    return t(lang, 'assistantMissingKey');
  }
  return t(lang, 'assistantUnavailable');
}

function groupChatsByDate(chats: NastavChatSession[], language: AppLanguage) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const todayLabel = t(language, 'today') || 'Today';
  const yesterdayLabel = t(language, 'yesterday') || 'Yesterday';
  const thisWeekLabel = t(language, 'thisWeek') || 'This week';
  const earlierLabel = t(language, 'earlier') || 'Earlier';

  const groups: Record<string, NastavChatSession[]> = {
    [todayLabel]: [],
    [yesterdayLabel]: [],
    [thisWeekLabel]: [],
    [earlierLabel]: [],
  };

  for (const chat of [...chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())) {
    const d = new Date(chat.updatedAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= today) groups[todayLabel].push(chat);
    else if (day >= yesterday) groups[yesterdayLabel].push(chat);
    else if (day >= weekAgo) groups[thisWeekLabel].push(chat);
    else groups[earlierLabel].push(chat);
  }

  return [todayLabel, yesterdayLabel, thisWeekLabel, earlierLabel]
    .filter(label => groups[label].length > 0)
    .map(label => ({ label, chats: groups[label] }));
}

export default function NastavPage() {
  const { tt, language } = useI18n();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [chats, setChats] = useState<NastavChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(storage.getProfile());
    setRoadmap(storage.getRoadmap());
    const saved = storage.getNastavChats();
    setChats(saved);
    const lastId = storage.getActiveNastavChatId();
    if (lastId && saved.some(c => c.id === lastId)) {
      setActiveId(lastId);
    }
  }, []);

  const activeChat = chats.find(c => c.id === activeId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, loading]);

  const persistChats = useCallback((updated: NastavChatSession[]) => {
    setChats(updated);
    storage.saveNastavChats(updated);
  }, []);

  const createNewChat = useCallback(() => {
    const id = `nastav-${Date.now()}`;
    const session: NastavChatSession = {
      id,
      title: tt('newChat'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      language,
    };
    const updated = [session, ...chats];
    persistChats(updated);
    setActiveId(id);
    storage.setActiveNastavChatId(id);
    setSidebarOpen(false);
  }, [chats, language, persistChats, tt]);

  const deleteChat = useCallback((id: string) => {
    const updated = chats.filter(c => c.id !== id);
    persistChats(updated);
    if (activeId === id) {
      const next = updated[0]?.id ?? null;
      setActiveId(next);
      storage.setActiveNastavChatId(next);
    }
    setDeleteConfirm(null);
  }, [chats, activeId, persistChats]);

  const selectChat = useCallback((id: string) => {
    setActiveId(id);
    storage.setActiveNastavChatId(id);
    setSidebarOpen(false);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    let currentId = activeId;
    let currentChats = chats;

    if (!currentId) {
      const id = `nastav-${Date.now()}`;
      const title = trimmed.slice(0, 50);
      const session: NastavChatSession = {
        id,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        language,
      };
      currentChats = [session, ...chats];
      persistChats(currentChats);
      setActiveId(id);
      storage.setActiveNastavChatId(id);
      currentId = id;
    }

    const userMsg: NastavMessage = {
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const previousUserMessage = currentChats
      .find(c => c.id === currentId)
      ?.messages.slice().reverse()
      .find(m => m.role === 'user')?.content;

    const withUser = currentChats.map(c =>
      c.id === currentId
        ? {
            ...c,
            messages: [...c.messages, userMsg],
            updatedAt: new Date().toISOString(),
            title: c.messages.length === 0 ? trimmed.slice(0, 50) : c.title,
          }
        : c
    );
    persistChats(withUser);
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

      const assistantMsg: NastavMessage = isAssistantSuccess(data)
        ? { role: 'assistant', content: data.answer, actions: data.suggestedActions ?? [], createdAt: new Date().toISOString() }
        : { role: 'assistant', content: getErrorMessage(data, language), actions: [], createdAt: new Date().toISOString() };

      const withAssistant = withUser.map(c =>
        c.id === currentId
          ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() }
          : c
      );
      persistChats(withAssistant);
    } catch {
      const errMsg: NastavMessage = {
        role: 'assistant',
        content: getErrorMessage(null, language),
        actions: [],
        createdAt: new Date().toISOString(),
      };
      const withErr = withUser.map(c =>
        c.id === currentId
          ? { ...c, messages: [...c.messages, errMsg], updatedAt: new Date().toISOString() }
          : c
      );
      persistChats(withErr);
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    tt('whatToday'),
    tt('firstCourse'),
    tt('suitableOpportunity'),
    tt('deadlinePrep'),
  ];

  const groups = groupChatsByDate(chats, language);

  return (
    <div className="nastav-page flex h-screen flex-col bg-[#060608] text-white overflow-hidden">
      <AppHeader />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/8 bg-[#09090f] pt-[57px]
            transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:pt-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col gap-2 border-b border-white/8 p-3">
            <button
              onClick={createNewChat}
              className="flex w-full items-center gap-2.5 rounded-xl bg-[#5941ff] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#4730dd] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              {tt('newChat')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {chats.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-white/35">{tt('noChatsYet')}</p>
            ) : (
              groups.map(group => (
                <div key={group.label} className="mb-4">
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    {group.label}
                  </p>
                  {group.chats.map(chat => (
                    <div key={chat.id} className="group relative flex items-center">
                      <button
                        onClick={() => selectChat(chat.id)}
                        className={`flex-1 min-w-0 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          activeId === chat.id
                            ? 'bg-white/10 text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <p className="truncate leading-snug">{chat.title}</p>
                      </button>
                      {deleteConfirm === chat.id ? (
                        <div className="absolute right-1 flex gap-1 bg-[#09090f] rounded-lg p-0.5">
                          <button
                            onClick={() => deleteChat(chat.id)}
                            className="rounded-lg bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(chat.id)}
                          className="absolute right-1 rounded-lg p-1.5 text-white/0 transition-colors group-hover:text-white/35 hover:!text-white hover:bg-white/10"
                          title={tt('deleteChat')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main chat area */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Chat topbar */}
          <div className="flex shrink-0 items-center gap-3 border-b border-white/8 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <MessageCircle className="h-3.5 w-3.5 text-[#8b7fff]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {activeChat?.title ?? tt('chatTitle')}
              </p>
              <p className="text-xs text-white/40">{tt('chatSubtitle')}</p>
            </div>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="mx-auto max-w-2xl">
                <div className="mb-6 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-[#8b7fff]" />
                    <p className="font-semibold text-white">{tt('chatIntroTitle')}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-white/55">{tt('chatIntroText')}</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {quickPrompts.map(p => (
                    <button
                      key={p}
                      onClick={() => void send(p)}
                      className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-left text-sm text-white/60 transition-all hover:border-white/18 hover:bg-white/[0.055] hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-4">
                {activeChat.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                        <MessageCircle className="h-3.5 w-3.5 text-white/60" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'rounded-br-sm bg-[#5941ff]'
                          : 'rounded-bl-sm border border-white/8 bg-white/[0.055]'
                      }`}
                    >
                      <p className="text-sm leading-relaxed text-white">{msg.content}</p>
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {msg.actions.map(a => (
                            <Link
                              key={`${a.href}-${a.label}`}
                              href={a.href}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/75 transition-colors hover:border-[#5941ff]/40 hover:text-white"
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
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                      <MessageCircle className="h-3.5 w-3.5 text-white/60" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.055] px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {[0, 280, 560].map(delay => (
                          <span
                            key={delay}
                            className="h-1.5 w-1.5 rounded-full bg-[#5941ff] animate-pulse"
                            style={{ animationDelay: `${delay}ms`, animationDuration: '1.4s' }}
                          />
                        ))}
                        <span className="ml-1.5 text-xs text-white/40">{tt('nastavThinking')}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-white/8 bg-[#060608] px-4 py-4">
            <div className="mx-auto max-w-2xl">
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
                  placeholder={tt('chatInputPlaceholder')}
                  disabled={loading}
                  className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white transition-colors placeholder:text-white/30 focus:border-[#5941ff]/55 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#5941ff] transition-all duration-150 hover:bg-[#4730dd] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowUp className="h-5 w-5 text-white" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
