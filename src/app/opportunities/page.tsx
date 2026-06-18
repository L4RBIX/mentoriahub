/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Bookmark, BookmarkCheck, X, Send, ExternalLink, Mail, Bell, Check, ClipboardList, ArrowRight } from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '@/lib/data/opportunities';
import { getRecommendedOpportunities, getLocalizedOpportunityText } from '@/lib/mvp';
import { storage } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { AppHeader } from '@/components/AppHeader';
import { createTelegramLink, sendTelegramReminder } from '@/lib/telegram';
import type { AppLanguage, Opportunity, OpportunityCategory, OpportunityDirection, Format, Grade, StudentProfile, Roadmap } from '@/types/mentoria';

const CATEGORIES: OpportunityCategory[] = ['Olympiad', 'Hackathon', 'Summer School', 'Research', 'Scholarship', 'Volunteering', 'Internship', 'University Prep'];
const DIRECTIONS: OpportunityDirection[] = ['STEM', 'Business', 'Social Impact', 'Finance', 'Programming', 'Science', 'English', 'University Admissions'];
const FORMATS: Format[] = ['Online', 'Offline', 'Hybrid'];
const GRADES: Grade[] = [8, 9, 10, 11];

export const CATEGORY_COLORS: Record<OpportunityCategory, string> = {
  Olympiad: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Hackathon: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Summer School': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Research: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Scholarship: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Volunteering: 'bg-green-500/20 text-green-300 border-green-500/30',
  Internship: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'University Prep': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  Olympiad: 'Olympiad',
  Hackathon: 'Hackathon',
  'Summer School': 'Summer School',
  Research: 'Research',
  Scholarship: 'Scholarship',
  Volunteering: 'Volunteering',
  Internship: 'Internship',
  'University Prep': 'University Prep',
};

export const FORMAT_COLORS: Record<Format, string> = {
  Online: 'bg-sky-500/20 text-sky-300',
  Offline: 'bg-rose-500/20 text-rose-300',
  Hybrid: 'bg-purple-500/20 text-purple-300',
};

export function formatDeadline(dateStr: string, language: AppLanguage = 'ru'): { label: string; isUrgent: boolean } {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const locale = language === 'en' ? 'en-US' : language === 'kz' ? 'kk-KZ' : 'ru-RU';
  const formatted = deadline.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const label = language === 'en' ? `by ${formatted}` : language === 'kz' ? `${formatted} дейін` : `до ${formatted}`;
  return { label, isUrgent: diffDays <= 30 };
}

export interface TelegramModalProps {
  opportunity: Opportunity;
  onClose: () => void;
}

export function TelegramModal({ opportunity, onClose }: TelegramModalProps) {
  const { tt, language } = useI18n();
  const [channel, setChannel] = useState<'choice' | 'telegram' | 'email'>('choice');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'preview' | 'connect'>('idle');
  const [reason, setReason] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const { label } = formatDeadline(opportunity.deadline, language);
  const title = getLocalizedOpportunityText(opportunity, language, 'title');

  const openTelegramConnect = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    createTelegramLink(language).then(result => {
      if (result.ok && result.botUrl) {
        setBotUrl(result.botUrl);
        window.open(result.botUrl, '_blank', 'noopener,noreferrer');
      } else {
        setReason(result.error ?? 'Telegram link failed');
      }
    });
  };

  const sendToTelegram = () => {
    setChannel('telegram');
    setStatus('loading');
    setReason(null);
    const profile = storage.getProfile();
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    sendTelegramReminder({
      opportunityId: opportunity.id,
      title,
      deadline: label,
      deadlineDate: opportunity.deadline,
      category: opportunity.category,
      url: origin ? `${origin}/opportunities/${opportunity.id}` : undefined,
      studentName: profile?.name,
      lang: language,
    }).then(result => {
      if (result.ok && result.sent) {
        setStatus('sent');
        storage.setReminderStatus(opportunity.id, 'sent');
      } else if (result.needsTelegramConnect) {
        setStatus('connect');
        setBotUrl(result.botUrl ?? null);
        setReason(result.reason ?? null);
      } else {
        setStatus('preview');
        setReason(result.reason ?? null);
        storage.setReminderStatus(opportunity.id, 'preview');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📌</div>
          <h2 className="text-xl font-bold text-white">{tt('reminderModalTitle')}</h2>
          <p className="text-white/50 text-sm mt-1">{tt('reminderModalText')}</p>
        </div>

        {channel === 'choice' && (
          <div className="space-y-2">
            <button
              onClick={sendToTelegram}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#5941ff] hover:bg-[#4730dd] text-white font-semibold rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" /> {tt('sendToTelegramBtn')}
            </button>
            <button
              onClick={() => setChannel('email')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 font-medium rounded-xl transition-colors"
            >
              <Mail className="w-4 h-4" /> {tt('emailPreview')}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-white/40 hover:text-white/70 text-sm font-medium transition-colors"
            >
              {tt('notNowBtn')}
            </button>
          </div>
        )}

        {channel === 'telegram' && (
          <>
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-8 h-8 border-2 border-[#5941ff] border-t-transparent rounded-full animate-spin" />
                <p className="text-white/60 text-sm">{tt('sendingToTelegram')}</p>
              </div>
            )}

            {status === 'sent' && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-semibold text-sm">{tt('telegramSentStatus')}</p>
                <p className="text-white text-sm font-medium">{title}</p>
                <p className="text-white/50 text-xs">{label}</p>
              </div>
            )}

            {status === 'preview' && (
              <div>
                <div className="bg-[#17212B] rounded-2xl p-4 mb-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#5941ff] flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-sm block leading-none">Mentoria Hub Reminder</span>
                      <span className="text-white/40 text-xs">bot</span>
                    </div>
                  </div>
                  <div className="bg-[#2B5278] rounded-xl rounded-tl-sm p-3 space-y-1 mb-3">
                    <p className="text-white text-sm font-medium">📌 {title}</p>
                    <p className="text-white/80 text-sm">📅 {tt('deadline')}: {label}</p>
                    <p className="text-white/80 text-sm">🏷 {tt('category')}: {opportunity.category}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="rounded-lg bg-white/8 px-3 py-2 text-center text-xs text-[#8b7fff] flex items-center justify-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {tt('openMentoriaHubBtn')}
                    </div>
                    <div className="rounded-lg bg-white/8 px-3 py-2 text-center text-xs text-white/60">
                      {tt('remind3DaysBtn')}
                    </div>
                  </div>
                </div>
                <p className="text-center text-white/35 text-xs">
                  {tt('previewModeLabel')}{reason ? ` · ${reason}` : ''}
                </p>
              </div>
            )}

            {status === 'connect' && (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#5941ff]/30 bg-[#5941ff]/20">
                  <Send className="h-5 w-5 text-[#8b7fff]" />
                </div>
                <p className="text-white font-semibold text-sm">{tt('telegramConnectTitle')}</p>
                <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/50">{tt('telegramConnectText')}</p>
                {reason && <p className="mt-2 text-xs text-amber-300">{reason}</p>}
                <button
                  onClick={() => openTelegramConnect(botUrl)}
                  className="mt-4 w-full rounded-xl bg-[#5941ff] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4730dd]"
                >
                  {tt('openTelegramBot')}
                </button>
              </div>
            )}
          </>
        )}

        {channel === 'email' && (
          <div className="bg-white rounded-2xl p-4 mb-2 border border-white/10 text-black">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#5941ff] flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-sm block leading-none">Mentoria Hub</span>
                <span className="text-black/40 text-xs">deadline@mentoria.kz</span>
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-black/35">Subject</p>
            <p className="font-semibold text-sm">{tt('emailSubjectPrefix')} {title}</p>
            <p className="mt-3 text-sm text-black/70">{tt('deadline')}: {label}. {tt('emailBodyText')}</p>
            <button className="mt-4 rounded-lg bg-[#5941ff] px-3 py-2 text-xs font-semibold text-white">{tt('openMentoriaHubBtn')}</button>
          </div>
        )}

        {channel !== 'choice' && (
          <button
            onClick={onClose}
            className="mt-5 w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors"
          >
            {tt('ready')}
          </button>
        )}
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  saved: boolean;
  onToggleSave: (opp: Opportunity) => void;
  aiMatch?: boolean;
}

function OpportunityCard({ opportunity, saved, onToggleSave, aiMatch }: OpportunityCardProps) {
  const { tt, language } = useI18n();
  const { label, isUrgent } = formatDeadline(opportunity.deadline, language);
  const title = getLocalizedOpportunityText(opportunity, language, 'title');
  const description = getLocalizedOpportunityText(opportunity, language, 'description');
  const requirements = getLocalizedOpportunityText(opportunity, language, 'requirements');
  const gradeRange = opportunity.grades.length === 1
    ? `${opportunity.grades[0]}`
    : `${Math.min(...opportunity.grades)}–${Math.max(...opportunity.grades)}`;

  return (
    <div className={`group flex h-full flex-col gap-3.5 rounded-2xl border p-5 transition-all duration-200 ${
      aiMatch
        ? 'border-[#5941ff]/35 bg-[#5941ff]/[0.04] hover:border-[#5941ff]/55'
        : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
    }`}>
      {/* Category + direction + AI match */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[opportunity.category]}`}>
          {CATEGORY_LABELS[opportunity.category]}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
          {opportunity.direction}
        </span>
        {aiMatch && (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border bg-[#5941ff]/15 border-[#5941ff]/35 text-[#8b7fff]">
            <span className="w-1 h-1 rounded-full bg-[#5941ff]" />
            {tt('nastavRecommendsBadge')}
          </span>
        )}
      </div>

      {/* Title + summary */}
      <Link href={`/opportunities/${opportunity.id}`} className="block">
        <h3 className="text-white font-bold text-lg leading-snug mb-1.5 group-hover:text-[#8b7fff] transition-colors">
          {title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
      </Link>

      {/* Grade / format / deadline */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70">
          {gradeRange} {tt('grade')}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full ${FORMAT_COLORS[opportunity.format]}`}>
          {opportunity.format}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isUrgent ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/60'}`}>
          {label}
        </span>
      </div>

      {/* Requirements preview */}
      {requirements.length > 0 && (
        <p className="flex items-start gap-1.5 text-xs text-white/45 line-clamp-1">
          <ClipboardList className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/30" />
          {requirements[0]}
        </p>
      )}

      {/* Tags */}
      {opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opportunity.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/8">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Source / reminder status — single row, only when there's something to say */}
      {(opportunity.sourceLabel || saved) && (
        <div className="flex items-center gap-3 text-xs text-white/45">
          {opportunity.sourceLabel && (
            <span className="flex items-center gap-1">
              <Send className="h-3 w-3 text-[#8b7fff]" /> {opportunity.sourceLabel}
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1 text-emerald-300">
              <Bell className="h-3 w-3" /> {tt('reminderActive')}
            </span>
          )}
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onToggleSave(opportunity)}
          className={`p-2.5 rounded-xl border transition-all duration-200 ${
            saved
              ? 'bg-[#5941ff]/20 border-[#5941ff]/40 text-[#8b7fff]'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
          }`}
          aria-label={saved ? tt('saved') : tt('save')}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        <Link
          href={`/opportunities/${opportunity.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium text-center hover:bg-white/10 hover:text-white transition-colors"
        >
          {tt('viewDetails')} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {opportunity.applyUrl && (
          <a
            href={opportunity.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#5941ff] text-white text-sm font-semibold text-center hover:bg-[#4730dd] transition-colors"
          >
            {tt('apply')} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

type FilterToggleProps<T extends string> = {
  value: T | null;
  options: T[];
  labels?: Partial<Record<T, string>>;
  onChange: (v: T | null) => void;
  allLabel?: string;
};

function FilterToggle<T extends string>({ value, options, labels, onChange, allLabel = 'All' }: FilterToggleProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
          value === null
            ? 'bg-[#5941ff] border-[#5941ff] text-white'
            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
        }`}
      >
        {allLabel}
      </button>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? null : opt)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            value === opt
              ? 'bg-[#5941ff] border-[#5941ff] text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
          }`}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

export default function OpportunitiesPage() {
  const { tt, language } = useI18n();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<OpportunityCategory | null>(null);
  const [directionFilter, setDirectionFilter] = useState<OpportunityDirection | null>(null);
  const [gradeFilter, setGradeFilter] = useState<Grade | null>(null);
  const [formatFilter, setFormatFilter] = useState<Format | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [telegramModal, setTelegramModal] = useState<Opportunity | null>(null);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    setMounted(true);
    const custom = storage.getCustomOpportunities();
    setAllOpportunities([...MOCK_OPPORTUNITIES, ...custom]);
    const saved = storage.getSavedOpportunities();
    setSavedIds(new Set(saved.map(s => s.opportunityId)));
    setProfile(storage.getProfile());
    setRoadmap(storage.getRoadmap());
  }, []);

  const handleToggleSave = (opp: Opportunity) => {
    if (savedIds.has(opp.id)) {
      storage.unsaveOpportunity(opp.id);
      setSavedIds(prev => { const next = new Set(prev); next.delete(opp.id); return next; });
    } else {
      storage.saveOpportunity(opp.id);
      setSavedIds(prev => new Set(prev).add(opp.id));
      setTelegramModal(opp);
    }
  };

  const aiRecommendations = useMemo(
    () => getRecommendedOpportunities(profile, roadmap, allOpportunities, 3),
    [allOpportunities, profile, roadmap],
  );

  const aiRecommendationIds = useMemo(
    () => new Set(aiRecommendations.map(opp => opp.id)),
    [aiRecommendations],
  );

  const filtered = useMemo(() => {
    const recommendationRank = new Map(aiRecommendations.map((opp, index) => [opp.id, index]));
    return allOpportunities
      .filter(opp => {
        if (search) {
          const q = search.toLowerCase();
          // Match against every language variant, not just the currently displayed
          // one — otherwise typing/clicking a localized title or description (EN/KZ)
          // would silently filter out the very opportunity it came from.
          const haystack = [
            opp.title, opp.titleEn, opp.titleKz,
            opp.description, opp.descriptionEn, opp.descriptionKz,
            opp.category,
            opp.direction,
            opp.format,
            ...opp.tags,
            ...opp.requirements,
            ...(opp.requirementsEn ?? []),
            ...(opp.requirementsKz ?? []),
          ].filter(Boolean).join(' ').toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (categoryFilter && opp.category !== categoryFilter) return false;
        if (directionFilter && opp.direction !== directionFilter) return false;
        if (gradeFilter && !opp.grades.includes(gradeFilter)) return false;
        if (formatFilter && opp.format !== formatFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const rankA = recommendationRank.get(a.id) ?? Number.POSITIVE_INFINITY;
        const rankB = recommendationRank.get(b.id) ?? Number.POSITIVE_INFINITY;
        if (rankA !== rankB) return rankA - rankB;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [aiRecommendations, allOpportunities, search, categoryFilter, directionFilter, gradeFilter, formatFilter]);

  const quickSearches = ['STEM', 'IELTS', 'SAT', 'Scholarships', 'Hackathons', 'Research', 'Volunteering'];

  const applyQuickSearch = (chip: string) => {
    const map: Record<string, string> = {
      Scholarships: 'Scholarship',
      Hackathons: 'Hackathon',
    };
    setSearch(map[chip] ?? chip);
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter(null);
    setDirectionFilter(null);
    setGradeFilter(null);
    setFormatFilter(null);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#5941ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <AppHeader />
      {/* Hero header */}
      <div className="border-b border-white/10 bg-white/2">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">{tt('home')}</Link>
            <span className="text-white/20">/</span>
            <span className="text-white/60 text-sm">{tt('opportunities')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {tt('catalogTitle')}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {tt('catalogSubtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI recommendations */}
        {profile && aiRecommendations.length > 0 && (
          <section className="mb-8 rounded-3xl border border-[#5941ff]/25 bg-[#5941ff]/10 p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8b7fff]">{tt('nastavRecommends')}</p>
                <h2 className="mt-1 text-xl font-bold text-white">3 {tt('opportunities')}</h2>
              </div>
              <Link href="/roadmap" className="text-sm text-[#8b7fff] hover:text-white">{tt('roadmap')} →</Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {aiRecommendations.map(opp => {
                const oppTitle = getLocalizedOpportunityText(opp, language, 'title');
                return (
                  <button
                    key={opp.id}
                    onClick={() => setSearch(oppTitle)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:border-[#5941ff]/40"
                  >
                    <p className="text-sm font-semibold text-white line-clamp-2">{oppTitle}</p>
                    <p className="mt-2 text-xs text-white/45">{tt('whyFits')} {opp.direction}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={tt('searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#5941ff]/60 transition-colors text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickSearches.map(chip => (
              <button
                key={chip}
                onClick={() => applyQuickSearch(chip)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55 hover:border-[#5941ff]/35 hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{tt('category')}</p>
            <FilterToggle<OpportunityCategory>
              value={categoryFilter}
              options={CATEGORIES}
              labels={CATEGORY_LABELS}
              onChange={setCategoryFilter}
              allLabel={tt('all')}
            />
          </div>

          {/* Direction filter */}
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{tt('direction')}</p>
            <FilterToggle<OpportunityDirection>
              value={directionFilter}
              options={DIRECTIONS}
              onChange={setDirectionFilter}
              allLabel={tt('all')}
            />
          </div>

          {/* Grade and Format row */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{tt('grade')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setGradeFilter(null)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    gradeFilter === null
                      ? 'bg-[#5941ff] border-[#5941ff] text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {tt('all')}
                </button>
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      gradeFilter === g
                        ? 'bg-[#5941ff] border-[#5941ff] text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{tt('format')}</p>
              <FilterToggle<Format>
                value={formatFilter}
                options={FORMATS}
                onChange={setFormatFilter}
                allLabel={tt('all')}
              />
            </div>
          </div>

          {(search || categoryFilter || directionFilter || gradeFilter || formatFilter) && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#8b7fff] hover:text-white transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> {tt('resetFilters')}
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/50 text-sm">
            {tt('found')} <span className="text-white font-semibold">{filtered.length}</span>
            {filtered.length !== allOpportunities.length && ` / ${allOpportunities.length}`}
          </p>
        </div>

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                saved={savedIds.has(opp.id)}
                onToggleSave={handleToggleSave}
                aiMatch={profile ? aiRecommendationIds.has(opp.id) : false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">{tt('nothingFound')}</h3>
            <button
              onClick={clearFilters}
              className="mt-5 px-5 py-2.5 bg-[#5941ff] hover:bg-[#4730dd] text-white text-sm font-medium rounded-xl transition-colors"
            >
              {tt('resetFilters')}
            </button>
          </div>
        )}
      </div>

      {telegramModal && (
        <TelegramModal
          opportunity={telegramModal}
          onClose={() => setTelegramModal(null)}
        />
      )}
    </main>
  );
}
