/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Bookmark, CalendarDays, Check, ExternalLink, Mail, Send } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import { createTelegramLink, sendTelegramReminder } from '@/lib/telegram';
import { daysUntil, formatDate, getAllOpportunities, getDeadlineOpportunities, getLocalizedOpportunityText, getRecommendedOpportunities } from '@/lib/mvp';
import type { Opportunity, Roadmap, SavedOpportunity, StudentProfile } from '@/types/mentoria';

type Filter = 'all' | 'saved' | 'month' | 'urgent';

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export default function CalendarPage() {
  const { tt, language } = useI18n();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [saved, setSaved] = useState<SavedOpportunity[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [preview, setPreview] = useState<Opportunity | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'loading' | 'sent' | 'preview' | 'connect'>('idle');
  const [telegramReason, setTelegramReason] = useState<string | null>(null);
  const [telegramBotUrl, setTelegramBotUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const custom = storage.getCustomOpportunities();
    setProfile(storage.getProfile());
    setRoadmap(storage.getRoadmap());
    setSaved(storage.getSavedOpportunities());
    setOpportunities(getAllOpportunities(custom));
    setMounted(true);
  }, []);

  const recommended = useMemo(
    () => getRecommendedOpportunities(profile, roadmap, opportunities, 6),
    [profile, roadmap, opportunities],
  );

  const deadlines = useMemo(() => {
    const base = getDeadlineOpportunities(saved, recommended, opportunities);
    return base.filter(opp => {
      const isSaved = saved.some(s => s.opportunityId === opp.id);
      const days = daysUntil(opp.deadline);
      if (filter === 'saved') return isSaved;
      if (filter === 'month') return isThisMonth(opp.deadline);
      if (filter === 'urgent') return days <= 14;
      return true;
    });
  }, [filter, opportunities, recommended, saved]);

  const saveOpportunity = (opp: Opportunity) => {
    storage.saveOpportunity(opp.id);
    setSaved(storage.getSavedOpportunities());
  };

  const openPreview = (opp: Opportunity) => {
    setPreview(opp);
    setTelegramStatus('idle');
    setTelegramReason(null);
    setTelegramBotUrl(null);
  };

  const sendTelegram = (opp: Opportunity) => {
    setTelegramStatus('loading');
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    sendTelegramReminder({
      opportunityId: opp.id,
      title: getLocalizedOpportunityText(opp, language, 'title'),
      deadline: formatDate(opp.deadline),
      deadlineDate: opp.deadline,
      category: opp.category,
      url: origin ? `${origin}/opportunities/${opp.id}` : undefined,
      studentName: profile?.name,
      lang: language,
    }).then(result => {
      if (result.ok && result.sent) {
        setTelegramStatus('sent');
        storage.setReminderStatus(opp.id, 'sent');
      } else if (result.needsTelegramConnect) {
        setTelegramStatus('connect');
        setTelegramBotUrl(result.botUrl ?? null);
        setTelegramReason(result.reason ?? null);
      } else {
        setTelegramStatus('preview');
        setTelegramReason(result.reason ?? null);
        storage.setReminderStatus(opp.id, 'preview');
      }
      setSaved(storage.getSavedOpportunities());
    });
  };

  const openTelegramConnect = () => {
    if (telegramBotUrl) {
      window.open(telegramBotUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    createTelegramLink(language).then(result => {
      if (result.ok && result.botUrl) {
        setTelegramBotUrl(result.botUrl);
        window.open(result.botUrl, '_blank', 'noopener,noreferrer');
      } else {
        setTelegramReason(result.error ?? 'Telegram link failed');
      }
    });
  };

  if (!mounted) {
    return <main className="min-h-screen bg-black text-white" />;
  }

  const filterTabs: [Filter, string][] = [
    ['all', tt('all')],
    ['saved', tt('savedFilter')],
    ['month', tt('thisMonth')],
    ['urgent', tt('urgent')],
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white">← {tt('backDashboard')}</Link>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8b7fff]">Deadline Calendar</p>
              <h1 className="text-3xl font-bold md:text-5xl">{tt('deadlineCalendar')}</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/55">
                {tt('calendarSubtitle')}
              </p>
            </div>
            <Link href="/opportunities" className="rounded-xl bg-[#5941ff] px-5 py-3 text-sm font-semibold text-white">
              {tt('findOpportunities')}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {filterTabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                filter === key ? 'border-[#5941ff] bg-[#5941ff] text-white' : 'border-white/10 bg-white/5 text-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {deadlines.map(opp => {
            const days = daysUntil(opp.deadline);
            const savedRecord = saved.find(s => s.opportunityId === opp.id);
            const isSaved = !!savedRecord;
            const urgent = days <= 14;
            const oppTitle = getLocalizedOpportunityText(opp, language, 'title');
            return (
              <div key={opp.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs text-white/55">{opp.category}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs ${urgent ? 'bg-red-500/15 text-red-300' : 'bg-[#5941ff]/15 text-[#8b7fff]'}`}>
                        {days >= 0 ? `${days} ${tt('daysLeft')}` : tt('deadlinePassed')}
                      </span>
                      {isSaved && (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">
                          {savedRecord?.reminderStatus === 'sent'
                            ? tt('telegramSentStatus')
                            : savedRecord?.reminderStatus === 'preview'
                              ? tt('telegramPreviewStatus')
                              : tt('reminderActive')}
                        </span>
                      )}
                    </div>
                    <h2 className="truncate text-lg font-semibold text-white">{oppTitle}</h2>
                    <p className="mt-1 text-sm text-white/45">{formatDate(opp.deadline)} · {opp.direction} · {opp.format}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => saveOpportunity(opp)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70"
                    >
                      <Bookmark className="h-4 w-4" /> {isSaved ? tt('saved') : tt('save')}
                    </button>
                    <button
                      onClick={() => openPreview(opp)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#5941ff]/30 bg-[#5941ff]/15 px-3 py-2 text-sm text-[#8b7fff]"
                    >
                      <Bell className="h-4 w-4" /> {tt('telegramReminder')}
                    </button>
                    <Link href="/opportunities" className="inline-flex items-center gap-2 rounded-xl bg-[#5941ff] px-3 py-2 text-sm font-semibold text-white">
                      {tt('openOpportunity')}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {deadlines.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-16 text-center">
            <CalendarDays className="mx-auto mb-4 h-10 w-10 text-white/25" />
            <p className="text-lg font-semibold text-white">{tt('deadlinesNotFound')}</p>
            <p className="mt-2 text-sm text-white/45">{tt('saveOppOrFilter')}</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#10131f] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">{tt('reminderModalTitle')}</h2>
            <p className="mt-1 text-sm text-white/50">{tt('reminderModalText')}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#17212B] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Send className="h-4 w-4 text-[#8b7fff]" /> Telegram
                </div>

                {telegramStatus === 'idle' && (
                  <button
                    onClick={() => sendTelegram(preview)}
                    className="w-full rounded-lg bg-[#5941ff] px-3 py-2 text-xs font-semibold text-white"
                  >
                    {tt('sendToTelegramBtn')}
                  </button>
                )}

                {telegramStatus === 'loading' && (
                  <p className="text-xs text-white/60">{tt('sendingToTelegram')}</p>
                )}

                {telegramStatus === 'sent' && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                    <Check className="h-3.5 w-3.5" /> {tt('telegramSentStatus')}
                  </div>
                )}

                {telegramStatus === 'preview' && (
                  <div className="space-y-2">
                    <p className="text-sm text-white/80">📌 {getLocalizedOpportunityText(preview, language, 'title')}</p>
                    <p className="text-xs text-white/45">{tt('deadline')}: {formatDate(preview.deadline)}</p>
                    <div className="flex items-center gap-1 text-xs text-[#8b7fff]">
                      <ExternalLink className="h-3 w-3" /> {tt('openMentoriaHubBtn')}
                    </div>
                    <p className="text-xs text-white/30">
                      {tt('previewModeLabel')}{telegramReason ? ` · ${telegramReason}` : ''}
                    </p>
                  </div>
                )}

                {telegramStatus === 'connect' && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">{tt('telegramConnectTitle')}</p>
                    <p className="text-xs leading-relaxed text-white/50">{tt('telegramConnectText')}</p>
                    {telegramReason && <p className="text-xs text-amber-300">{telegramReason}</p>}
                    <button
                      onClick={openTelegramConnect}
                      className="w-full rounded-lg bg-[#5941ff] px-3 py-2 text-xs font-semibold text-white"
                    >
                      {tt('openTelegramBot')}
                    </button>
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-white p-4 text-black">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4 text-[#5941ff]" /> {tt('emailPreview')}
                </div>
                <p className="text-xs text-black/45">Subject</p>
                <p className="text-sm font-semibold">{tt('emailSubjectPrefix')} {getLocalizedOpportunityText(preview, language, 'title')}</p>
                <button className="mt-3 rounded-lg bg-[#5941ff] px-3 py-2 text-xs font-semibold text-white">{tt('openMentoriaHubBtn')}</button>
              </div>
            </div>
            <button onClick={() => setPreview(null)} className="mt-5 w-full rounded-xl bg-[#5941ff] py-3 text-sm font-semibold text-white">
              {tt('ready')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
