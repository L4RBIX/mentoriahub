/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Compass,
  Medal,
  Settings,
  Target,
  Trophy,
  UserRound,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { getProfileGoals } from '@/lib/profile';
import { COURSES } from '@/lib/data/courses';
import { getAllOpportunities, getLocalizedOpportunityText } from '@/lib/mvp';
import { useI18n } from '@/hooks/useI18n';
import { PlatformControls } from '@/components/PlatformControls';
import { TelegramConnectCard } from '@/components/TelegramConnectCard';
import type {
  StudentProfile,
  Roadmap,
  SavedOpportunity,
  CourseProgress,
  Opportunity,
  Certificate,
} from '@/types/mentoria';
import { NastavChatCompact } from '@/components/NastavChatCompact';

const CATEGORY_COLORS: Record<string, string> = {
  'Olympiad': 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  'Hackathon': 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  'Summer School': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'Research': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Scholarship': 'bg-pink-500/15 text-pink-300 border-pink-500/25',
  'Volunteering': 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  'Internship': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  'University Prep': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

interface DashState {
  profile: StudentProfile | null;
  roadmap: Roadmap | null;
  savedOpps: SavedOpportunity[];
  courseProgress: CourseProgress[];
  customOpps: Opportunity[];
  certificates: Certificate[];
}

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/9 bg-white/[0.032] p-5 transition-colors hover:border-white/16">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-white/42">{label}</span>
        <span className="text-white/55">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-white/40">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { tt, language } = useI18n();
  const [state, setState] = useState<DashState>({
    profile: null,
    roadmap: null,
    savedOpps: [],
    courseProgress: [],
    customOpps: [],
    certificates: [],
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState({
      profile: storage.getProfile(),
      roadmap: storage.getRoadmap(),
      savedOpps: storage.getSavedOpportunities(),
      courseProgress: storage.getCourseProgress(),
      customOpps: storage.getCustomOpportunities(),
      certificates: storage.getCertificates(),
    });
    setMounted(true);
  }, []);

  const GOAL_LABELS: Record<string, string> = {
    'Top university admission': tt('goalUniversity'),
    'Olympiad preparation': tt('goalOlympiad'),
    'IELTS/SAT': tt('goalIELTS'),
    'Build portfolio': tt('goalPortfolio'),
    'Leadership & volunteering': tt('goalLeadership'),
    'Entrepreneurship': tt('goalEntrepreneur'),
  };

  const profileGoalsLabel = (profile: StudentProfile) =>
    getProfileGoals(profile).map(goal => GOAL_LABELS[goal] ?? goal).join(', ');

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#5941ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { profile, roadmap, savedOpps, courseProgress, certificates } = state;

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-white/75">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{tt('welcomeTitle')}</h1>
        <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">
          {tt('welcomeSubtitle')}
        </p>
        <Link
          href="/onboarding"
          className="px-8 py-3 rounded-xl bg-[#5941ff] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {tt('startOnboarding')}
        </Link>
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm">
          {[
            { icon: <Compass className="h-5 w-5" />, label: tt('roadmap') },
            { icon: <Target className="h-5 w-5" />, label: tt('opportunities') },
            { icon: <BookOpen className="h-5 w-5" />, label: tt('courses') },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-white/50">{icon}</span>
              <span className="text-white/30 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedSteps = roadmap?.steps.filter(s => s.completed).length ?? 0;
  const totalSteps = roadmap?.steps.length ?? 0;
  const coursesInProgress = courseProgress.length;
  const completedLessons = courseProgress.reduce((sum, item) => sum + item.completedLessonIds.length, 0);

  const allOpps = getAllOpportunities(state.customOpps);
  const savedOppDetails = savedOpps
    .map(s => allOpps.find(o => o.id === s.opportunityId))
    .filter((o): o is Opportunity => !!o)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const nearestDays = savedOppDetails.length > 0
    ? Math.max(0, daysUntil(savedOppDetails[0].deadline))
    : null;

  const nextStep = roadmap?.steps.find(step => !step.completed);
  const nextAction = nextStep
    ? `${tt('continueRoadmap')}: ${nextStep.title}`
    : savedOppDetails[0]
      ? `${tt('checkDeadline')}: ${getLocalizedOpportunityText(savedOppDetails[0], language, 'title')}`
      : tt('saveFirstOpp');

  const recentActivity = [
    { text: tt('roadmapCreated'), time: roadmap ? formatDate(roadmap.generatedAt) : tt('today') },
    { text: `${tt('savedOppsCount')}: ${savedOpps.length}`, time: tt('recently') },
    { text: `${tt('coursesStarted')}: ${coursesInProgress}`, time: tt('recently') },
  ];

  return (
    <div className="min-h-screen bg-[#050609]">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/8 bg-[#050609]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
            <div className="w-7 h-7 rounded-lg bg-[#5941ff] flex items-center justify-center text-sm text-white">М</div>
            <span className="text-white font-semibold text-sm">Mentoria Hub</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/roadmap" className="hidden px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors sm:inline-block">{tt('roadmap')}</Link>
            <Link href="/opportunities" className="hidden px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors sm:inline-block">{tt('opportunities')}</Link>
            <Link href="/courses" className="hidden px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors sm:inline-block">{tt('courses')}</Link>
            <PlatformControls />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-white/8 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-white/42">{tt('studentCommandCenter')}</p>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              {profile.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/55">
              {tt('dashboardSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/60">
              {profile.grade} {tt('grade')}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/60">
              {profileGoalsLabel(profile)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={tt('saved')} value={savedOpps.length} sub={tt('oppsSuffix')} icon={<Target className="h-5 w-5" />} />
          <StatCard label={tt('courses')} value={coursesInProgress} sub={tt('inProgress')} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard
            label={tt('roadmapWidget')}
            value={totalSteps > 0 ? `${completedSteps}/${totalSteps}` : '—'}
            sub={tt('stepsCompleted')}
            icon={<Compass className="h-5 w-5" />}
          />
          <StatCard
            label={tt('deadline')}
            value={nearestDays !== null ? `${nearestDays}${tt('daysShort')}` : '—'}
            sub={nearestDays !== null && savedOppDetails[0] ? (getLocalizedOpportunityText(savedOppDetails[0], language, 'title').slice(0, 20) + '…') : tt('noDeadlines')}
            icon={<Clock3 className="h-5 w-5" />}
          />
        </div>

        {/* Main 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Roadmap preview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-base">{tt('roadmapWidget')}</h2>
                <Link href="/roadmap" className="text-xs text-[#8b7fff] hover:text-white transition-colors">
                  {tt('seeAll')}
                </Link>
              </div>

              {!roadmap || roadmap.steps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm mb-4">{tt('noRoadmap')}</p>
                  <Link
                    href="/roadmap"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5941ff] text-xs text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    {tt('generateRoadmap')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {roadmap.steps.slice(0, 3).map((step, idx) => (
                    <div key={step.id} className="flex gap-3 items-start">
                      <div
                        className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold mt-0.5 roadmap-step-number${step.completed ? ' roadmap-step-number-done' : ''}`}
                        style={{
                          background: step.completed ? '#5941ff' : 'rgba(89,65,255,0.1)',
                          borderColor: '#5941ff',
                          color: '#fff',
                        }}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{step.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{step.timeframe}</p>
                      </div>
                      {step.deadline && (
                        <span className="shrink-0 text-xs text-white/25">{formatDate(step.deadline)}</span>
                      )}
                    </div>
                  ))}
                  {roadmap.steps.length > 3 && (
                    <p className="text-white/20 text-xs pt-1 pl-10">
                      + {roadmap.steps.length - 3}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Saved opportunities */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-base">{tt('savedOpportunities')}</h2>
                <Link href="/opportunities" className="text-xs text-[#8b7fff] hover:text-white transition-colors">
                  {tt('seeAll')}
                </Link>
              </div>

              {savedOppDetails.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm mb-4">{tt('noSavedOpps')}</p>
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    {tt('findOpportunities')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedOppDetails.slice(0, 5).map(opp => {
                    const days = daysUntil(opp.deadline);
                    const urgent = days <= 14;
                    const reminderStatus = savedOpps.find(s => s.opportunityId === opp.id)?.reminderStatus;
                    const oppTitle = getLocalizedOpportunityText(opp, language, 'title');
                    return (
                      <Link
                        key={opp.id}
                        href={`/opportunities/${opp.id}`}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 hover:border-[#5941ff]/30 hover:bg-white/[0.05] transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium leading-snug line-clamp-1 group-hover:text-[#8b7fff] transition-colors">{oppTitle}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-xs border ${CATEGORY_COLORS[opp.category] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
                              {opp.category}
                            </span>
                            <span className={`text-xs font-medium ${urgent ? 'text-red-400' : 'text-white/40'}`}>
                              {days > 0 ? `${days}${tt('daysShort')}` : tt('expired')} · {formatDate(opp.deadline)}
                            </span>
                            {reminderStatus && (
                              <span className={`text-xs ${reminderStatus === 'sent' ? 'text-emerald-400' : 'text-amber-300'}`}>
                                {reminderStatus === 'sent' ? tt('telegramSentStatus') : tt('telegramPreviewStatus')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/35 shrink-0 mt-0.5">
                          {opp.format}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Course progress */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-base">{tt('courseProgress')}</h2>
                <Link href="/courses" className="text-xs text-[#8b7fff] hover:text-white transition-colors">
                  {tt('seeAll')}
                </Link>
              </div>

              <div className="space-y-4">
                {COURSES.map(course => {
                  const prog = courseProgress.find(p => p.courseId === course.id);
                  const completed = prog?.completedLessonIds.length ?? 0;
                  const pct = Math.round((completed / course.lessonCount) * 100);
                  const hasProgress = pct > 0;

                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium group-hover:text-[#8b7fff] transition-colors truncate">
                            {course.title}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">{course.lessonCount} {tt('lessons')} · {course.estimatedHours} {tt('hoursAbbrev')}</p>
                        </div>
                        <span className="text-xs font-semibold shrink-0" style={{ color: hasProgress ? '#5941ff' : 'rgba(255,255,255,0.2)' }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: hasProgress ? '#5941ff' : 'rgba(255,255,255,0.1)' }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-base mb-5">{tt('activity')}</h2>
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/28" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs leading-snug">{item.text}</p>
                      <p className="text-white/25 text-xs mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">

            {/* Настав Chat widget */}
            <NastavChatCompact profile={profile} roadmap={roadmap} />

            {/* Next best action */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/42">{tt('nextAction')}</p>
              <p className="text-sm font-medium leading-relaxed text-white">{nextAction}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/roadmap" className="rounded-lg bg-[#5941ff] px-3 py-1.5 text-xs font-semibold text-white">Roadmap</Link>
                <Link href="/opportunities" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white">{tt('opportunities')}</Link>
              </div>
            </div>

            {/* Profile card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">{tt('profileSummary')}</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5941ff]/20 border border-[#5941ff]/30 flex items-center justify-center text-xl font-bold text-[#8b7fff]">
                  {profile.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{profile.name}</p>
                  <p className="text-white/40 text-xs">{profile.grade} {tt('grade')} · {profile.language === 'russian' ? 'Русский' : profile.language === 'english' ? 'English' : 'Қазақша'}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-white/30 text-xs mb-1.5">{tt('goal')}</p>
                  <p className="text-white text-xs font-medium">{profileGoalsLabel(profile)}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-1.5">{tt('interests')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.slice(0, 6).map(i => (
                      <span key={i} className="px-2 py-0.5 rounded-lg text-xs bg-white/5 border border-white/8 text-white/50">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <TelegramConnectCard />

            {/* Certificates and leaderboard */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/certificates" className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-[#5941ff]/30">
                <Medal className="h-5 w-5 text-white/60" />
                <p className="mt-2 text-sm font-semibold text-white">{tt('certificates')}</p>
                <p className="text-xs text-white/35">{certificates.length} issued</p>
              </Link>
              <Link href="/leaderboard" className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-[#5941ff]/30">
                <Trophy className="h-5 w-5 text-white/60" />
                <p className="mt-2 text-sm font-semibold text-white">{tt('leaderboard')}</p>
                <p className="text-xs text-white/35">{completedLessons * 120} {tt('points')}</p>
              </Link>
            </div>

            {/* Quick actions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">{tt('quickActions')}</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: '/opportunities', icon: <Target className="h-4 w-4" />, label: tt('opportunities') },
                  { href: '/courses', icon: <BookOpen className="h-4 w-4" />, label: tt('courses') },
                  { href: '/roadmap', icon: <Compass className="h-4 w-4" />, label: tt('roadmap') },
                  { href: '/calendar', icon: <CalendarDays className="h-4 w-4" />, label: tt('calendar') },
                  { href: '/certificates', icon: <Medal className="h-4 w-4" />, label: tt('certificates') },
                  { href: '/leaderboard', icon: <Trophy className="h-4 w-4" />, label: tt('leaderboard') },
                  { href: '/mentor', icon: <UserRound className="h-4 w-4" />, label: tt('mentor') },
                  { href: '/admin', icon: <Settings className="h-4 w-4" />, label: tt('admin') },
                ].map(({ href, icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] py-3 px-2 text-center transition-all duration-150 hover:border-[#5941ff]/40 hover:bg-white/10 group"
                  >
                    <span className="text-white/65 transition-colors group-hover:text-[#8b7fff]">{icon}</span>
                    <span className="text-white/55 text-xs group-hover:text-white transition-colors">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
