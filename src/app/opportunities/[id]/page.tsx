/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Send,
  Sparkles,
} from 'lucide-react';
import { getAllOpportunities, getLocalizedOpportunityText, getMentorAdvice } from '@/lib/mvp';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import { TelegramConnectCard } from '@/components/TelegramConnectCard';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  FORMAT_COLORS,
  TelegramModal,
  formatDeadline,
} from '@/app/opportunities/page';
import type { Opportunity } from '@/types/mentoria';

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tt, language } = useI18n();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [saved, setSaved] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<'sent' | 'preview' | undefined>(undefined);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const custom = storage.getCustomOpportunities();
    const all = getAllOpportunities(custom);
    setOpportunity(all.find(o => o.id === id) ?? null);

    const savedList = storage.getSavedOpportunities();
    const record = savedList.find(s => s.opportunityId === id);
    setSaved(!!record);
    setReminderStatus(record?.reminderStatus);
    setMounted(true);
  }, [id]);

  const refreshSavedState = () => {
    if (!opportunity) return;
    setSaved(storage.isOpportunitySaved(opportunity.id));
    const record = storage.getSavedOpportunities().find(s => s.opportunityId === opportunity.id);
    setReminderStatus(record?.reminderStatus);
  };

  const handleToggleSave = () => {
    if (!opportunity) return;
    if (saved) {
      storage.unsaveOpportunity(opportunity.id);
      setSaved(false);
      setReminderStatus(undefined);
    } else {
      storage.saveOpportunity(opportunity.id);
      setSaved(true);
      setTelegramModalOpen(true);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#5941ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!opportunity) {
    return (
      <main className="min-h-screen bg-black text-white">
        <AppHeader />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">{tt('opportunityNotFound')}</h1>
          <p className="text-white/50 text-sm mb-6">{tt('opportunityNotFoundSub')}</p>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5941ff] hover:bg-[#4730dd] rounded-xl text-sm font-semibold text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {tt('backToOpportunities')}
          </Link>
        </div>
      </main>
    );
  }

  const title = getLocalizedOpportunityText(opportunity, language, 'title');
  const description = getLocalizedOpportunityText(opportunity, language, 'description');
  const requirements = getLocalizedOpportunityText(opportunity, language, 'requirements');
  const benefits = getLocalizedOpportunityText(opportunity, language, 'benefits');
  const advice = getMentorAdvice(opportunity, language);
  const { label: deadlineLabel, isUrgent } = formatDeadline(opportunity.deadline, language);
  const gradeRange = opportunity.grades.length === 1
    ? `${opportunity.grades[0]}`
    : `${Math.min(...opportunity.grades)}–${Math.max(...opportunity.grades)}`;
  const isDemoLink = opportunity.applyUrl?.includes('example.com');

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />

      {/* Hero */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {tt('backToOpportunities')}
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[opportunity.category]}`}>
              {CATEGORY_LABELS[opportunity.category]}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
              {opportunity.direction}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${FORMAT_COLORS[opportunity.format]}`}>
              {opportunity.format}
            </span>
            {opportunity.sourceLabel && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/50 border border-white/10">
                <Send className="h-3 w-3" /> {opportunity.sourceLabel}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 max-w-3xl leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-white/55">{gradeRange} {tt('grade')}</span>
            <span className="text-white/20">·</span>
            <span className={isUrgent ? 'font-medium text-red-300' : 'text-white/55'}>
              {tt('deadline')}: {deadlineLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-8 min-w-0">
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">{tt('fieldDescription')}</h2>
            <p className="text-white/65 leading-relaxed">{description}</p>
          </section>

          {requirements.length > 0 && (
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">{tt('fieldRequirements')}</h2>
              <ul className="space-y-2.5">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/65">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#5941ff]" /> {req}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {benefits.length > 0 && (
            <section>
              <h2 className="text-white font-semibold text-lg mb-3">{tt('benefitsHeading')}</h2>
              <ul className="space-y-2.5">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/65">
                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" /> {b}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* AI Mentor advice — doubles as the preparation checklist */}
          <section className="rounded-2xl border border-[#5941ff]/25 bg-[#5941ff]/[0.06] p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#5941ff]/30 bg-[#5941ff]/20">
                <Sparkles className="w-4 h-4 text-[#8b7fff]" />
              </div>
              <h2 className="text-white font-semibold text-lg">{tt('mentorAdviceHeading')}</h2>
            </div>
            <ul className="space-y-2.5 mb-5">
              {advice.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#5941ff]/40 text-[10px] font-semibold text-[#8b7fff]">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/roadmap" className="inline-flex items-center gap-1.5 text-sm text-[#8b7fff] hover:text-white transition-colors">
              {tt('askMentorAboutOpp')} <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </section>

          {opportunity.tags.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">{tt('tagsHeading')}</h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/45 border border-white/8">
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            {opportunity.applyUrl && (
              <>
                <a
                  href={opportunity.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5941ff] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4730dd]"
                >
                  {tt('apply')} <ExternalLink className="w-4 h-4" />
                </a>
                {isDemoLink && (
                  <p className="text-center text-[11px] text-white/25">{tt('demoLinkNote')}</p>
                )}
              </>
            )}
            <button
              onClick={handleToggleSave}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                saved
                  ? 'border-[#5941ff]/40 bg-[#5941ff]/20 text-[#8b7fff]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />} {saved ? tt('saved') : tt('save')}
            </button>
            <button
              onClick={() => setTelegramModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              <Bell className="w-4 h-4" /> {tt('telegramReminder')}
            </button>
            {reminderStatus && (
              <p className={`text-center text-xs ${reminderStatus === 'sent' ? 'text-emerald-400' : 'text-amber-300'}`}>
                {reminderStatus === 'sent' ? tt('telegramSentStatus') : tt('telegramPreviewStatus')}
              </p>
            )}
          </div>

          <TelegramConnectCard variant="compact" />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">{tt('sourceHeading')}</h3>
            <p className="text-sm text-white/65">{opportunity.sourceLabel ?? tt('sourceCatalogLabel')}</p>
          </div>
        </aside>
      </div>

      {telegramModalOpen && (
        <TelegramModal
          opportunity={opportunity}
          onClose={() => {
            setTelegramModalOpen(false);
            refreshSavedState();
          }}
        />
      )}
    </main>
  );
}
