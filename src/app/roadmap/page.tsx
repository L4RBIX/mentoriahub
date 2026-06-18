'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Compass,
  RefreshCw,
  Target,
  User,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { getProfileGoals, profileFingerprint } from '@/lib/profile';
import { localizeRoadmap, INTEREST_L10N, GOAL_L10N } from '@/lib/localizeRoadmap';
import { useI18n } from '@/hooks/useI18n';
import { PlatformControls } from '@/components/PlatformControls';
import { BrandLogo } from '@/components/BrandLogo';
import type { AppLanguage, Roadmap, StudentProfile } from '@/types/mentoria';
import { COURSES } from '@/lib/data/courses';
import { MOCK_OPPORTUNITIES } from '@/lib/data/opportunities';
import { getLocalizedOpportunityText } from '@/lib/mvp';
import { NastavChat } from '@/components/NastavChat';

const COURSE_SHORT: Record<string, string> = {
  'course-english': 'Academic English',
  'course-cs': 'CS & Algorithms',
  'course-uni': 'Top University',
};

function getOppTitle(id: string, language: AppLanguage): string {
  const opp = MOCK_OPPORTUNITIES.find(o => o.id === id);
  if (!opp) return id;
  const title = getLocalizedOpportunityText(opp, language, 'title');
  return title.length > 32 ? title.slice(0, 32) + '…' : title;
}

function formatDate(iso: string, lang: AppLanguage = 'ru'): string {
  const locale = lang === 'en' ? 'en-US' : lang === 'kz' ? 'kk-KZ' : 'ru-RU';
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function gradeRoadmapLabel(grade: number): string {
  if (grade === 8) return '8→9 roadmap';
  if (grade === 9) return '9→10 roadmap';
  if (grade === 10) return '10→11 roadmap';
  if (grade === 11) return 'admissions / final-year roadmap';
  return '12 / Gap / Applications roadmap';
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded-xl w-3/4" />
      <div className="h-4 bg-white/5 rounded-lg w-full" />
      <div className="h-4 bg-white/5 rounded-lg w-2/3" />
      <div className="space-y-4 mt-8">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/10 rounded-lg w-1/2" />
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const { tt, language } = useI18n();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const GOAL_LABELS: Record<string, string> = {
    'Top university admission': tt('goalUniversity'),
    'Olympiad preparation': tt('goalOlympiad'),
    'IELTS/SAT': tt('goalIELTS'),
    'Build portfolio': tt('goalPortfolio'),
    'Leadership & volunteering': tt('goalLeadership'),
    'Entrepreneurship': tt('goalEntrepreneur'),
  };

  // `lang` is passed explicitly so this callback is stable (no language dep).
  // Language-switching is handled by `displayRoadmap` (useMemo) below.
  const generate = useCallback(async (prof: StudentProfile, lang: AppLanguage) => {
    setGenerating(true);
    setHasError(false);
    try {
      const [{ MOCK_OPPORTUNITIES: opps }, { COURSES: courses }] = await Promise.all([
        import('@/lib/data/opportunities'),
        import('@/lib/data/courses'),
      ]);
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: prof,
          opportunities: opps,
          courses,
          savedOpportunities: storage.getSavedOpportunities(),
          courseProgress: storage.getCourseProgress(),
          language: lang,
        }),
      });
      const data = await res.json() as { roadmap: Roadmap };
      const stamped = { ...data.roadmap, profileSnapshot: profileFingerprint(prof) };
      storage.setRoadmap(stamped);
      setRoadmap(stamped);
    } catch {
      setHasError(true);
    } finally {
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    const prof = storage.getProfile();
    setProfile(prof);
    const saved = storage.getRoadmap();

    if (saved && prof) {
      const currentFp = profileFingerprint(prof);
      if (saved.profileSnapshot === currentFp) {
        // Cache is valid — localization is handled by `displayRoadmap` below.
        setRoadmap(saved);
        setLoading(false);
      } else {
        storage.clearRoadmap();
        setLoading(false);
        void generate(prof, language);
      }
    } else if (prof) {
      setLoading(false);
      void generate(prof, language);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate]); // language intentionally omitted: changes handled by displayRoadmap useMemo

  // Re-derives all user-visible step text in the current language without a
  // network request.  Updates instantly on language switch.
  const displayRoadmap = useMemo(() => {
    if (!roadmap || !profile) return roadmap;
    return localizeRoadmap(roadmap, profile, language, COURSES, MOCK_OPPORTUNITIES);
  }, [roadmap, profile, language]);

  function handleRegenerate() {
    const currentProfile = storage.getProfile();
    if (!currentProfile) return;
    setProfile(currentProfile);
    storage.clearRoadmap();
    setRoadmap(null);
    void generate(currentProfile, language);
  }

  function goalLabelsFor(prof: StudentProfile): string {
    return getProfileGoals(prof)
      .map(goal => GOAL_L10N[goal]?.[language] ?? GOAL_LABELS[goal] ?? goal)
      .join(', ');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5941ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{tt('profileNotFound')}</h1>
        <p className="text-white/50 text-sm mb-8 max-w-sm">
          {tt('profileNotFoundSub')}
        </p>
        <Link
          href="/onboarding"
          className="px-6 py-3 rounded-xl bg-[#5941ff] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {tt('generateRoadmapNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050609] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/8 bg-[#050609]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="hidden shrink-0 cursor-pointer items-center transition-opacity hover:opacity-80 sm:flex">
            <BrandLogo size="xs" showText={false} variant="dark" />
          </Link>
          <Link href="/dashboard" className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm text-white/58 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {tt('backDashboard')}
          </Link>
          <span className="hidden text-xs text-white/35 sm:inline">{tt('growthPlanLabel')}</span>
          <div className="flex items-center gap-2">
            <Link
              href="/opportunities"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/62 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              {tt('opportunities')}
            </Link>
            <PlatformControls />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">

        {/* Left column */}
        <div className="min-w-0">

        {/* Profile context card */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 md:p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-white/42">{tt('personalRoadmap')}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <h2 className="text-2xl font-semibold leading-none text-white md:text-3xl">{tt('growthPlan')}</h2>
                {displayRoadmap?.generatedAt && (
                  <span className="text-xs text-white/38">{formatDate(displayRoadmap.generatedAt, language)}</span>
                )}
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/62">
                {tt('roadmapContext')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[460px]">
              <div className="rounded-xl border border-white/8 bg-black/18 p-3">
                <div className="mb-2 flex items-center gap-2 text-white/42">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-[11px] uppercase tracking-[0.14em]">{tt('student')}</span>
                </div>
                <p className="truncate text-sm font-medium text-white">{profile.name}</p>
                <p className="mt-0.5 text-xs text-white/45">{profile.grade} {tt('grade')}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/18 p-3">
                <div className="mb-2 flex items-center gap-2 text-white/42">
                  <Target className="h-3.5 w-3.5" />
                  <span className="text-[11px] uppercase tracking-[0.14em]">{tt('goal')}</span>
                </div>
                <p className="line-clamp-3 text-sm font-medium leading-snug text-white">{goalLabelsFor(profile)}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/18 p-3">
                <div className="mb-2 flex items-center gap-2 text-white/42">
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-[11px] uppercase tracking-[0.14em]">{tt('status')}</span>
                </div>
                <p className="text-sm font-medium text-white">{tt('planSaved')}</p>
                <p className="mt-0.5 text-xs text-white/45">{gradeRoadmapLabel(profile.grade)}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 border-t border-white/8 pt-4 lg:grid-cols-[1fr_1.35fr]">
            <div>
              <p className="mb-2 text-xs text-white/42">{tt('interests')}</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 5).map(i => (
                  <span key={i} className="rounded-lg border border-white/8 bg-white/[0.025] px-2.5 py-1 text-xs text-white/58">
                    {INTEREST_L10N[i]?.[language] ?? i}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-white/42">{tt('gradeTimeline')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['9', '10', '11', '12+'].map((label, index) => {
                  const active =
                    (profile.grade === 8 && index === 0) ||
                    (profile.grade === 9 && index === 0) ||
                    (profile.grade === 10 && index === 1) ||
                    (profile.grade === 11 && index === 2) ||
                    (profile.grade === 12 && index === 3);
                  return (
                    <div
                      key={label}
                      className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                        active
                          ? 'grade-btn-active border-white/22 bg-white/10 text-white'
                          : 'grade-btn-inactive border-white/8 bg-white/[0.018] text-white/38'
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Generating state */}
        {generating && (
          <div className="text-center py-16 space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#5941ff]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5941ff] animate-spin" />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-[#5941ff]/10 text-[#8b7fff]">
                <Compass className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{tt('nastavBuilding')}</p>
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              {[tt('loadingInterest'), tt('loadingOpportunities'), tt('loadingRoadmap')].map((label, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div className="w-5 h-5 rounded-full border border-[#5941ff]/40 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5941ff] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  </div>
                  <span className="text-white/50 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && !generating && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4 text-sm">{tt('tryAgain')}</p>
            <button
              onClick={handleRegenerate}
              className="px-5 py-2.5 rounded-xl bg-[#5941ff] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {tt('tryAgain')}
            </button>
          </div>
        )}

        {/* Roadmap content */}
        {displayRoadmap && !generating && (
          <>
            <div className="mb-7 border-b border-white/8 pb-6">
              <div className="mb-3 inline-flex items-center gap-2 text-xs text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {tt('formedByNastav')} · {formatDate(displayRoadmap.generatedAt, language)}
              </div>
              <h1 className="mb-3 max-w-3xl text-2xl font-semibold leading-tight text-white md:text-3xl">
                {displayRoadmap.title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/62">
                {displayRoadmap.summary}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#5941ff] px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#4730dd] active:scale-[0.98]"
                >
                  {tt('watchOpportunities')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.045] hover:text-white"
                >
                  <BookOpen className="h-4 w-4" />
                  {tt('startCourse')}
                </Link>
                <button
                  onClick={handleRegenerate}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/8 px-4 py-2 text-sm font-medium text-white/48 transition-colors hover:border-white/16 hover:text-white/70"
                >
                  <RefreshCw className="h-4 w-4" />
                  {tt('updateRoadmap')}
                </button>
              </div>
            </div>

            {displayRoadmap.steps.length === 0 && <SkeletonLoader />}

            {displayRoadmap.steps.length > 0 && (
              <div className="space-y-5">
                {displayRoadmap.steps.map((step, idx) => {
                  const isLastStep = idx === displayRoadmap.steps.length - 1;
                  return (
                    <div key={step.id} className="grid grid-cols-[44px_1fr] gap-4 sm:grid-cols-[56px_1fr] sm:gap-5">

                      {/* Timeline column: number circle then connecting line to next step */}
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition-all roadmap-step-number ${
                          step.completed
                            ? 'border-emerald-400/35 bg-emerald-400/12 text-emerald-300 roadmap-step-number-done'
                            : 'border-white/12 bg-[#0d0f14] text-white/72'
                        }`}>
                          {step.completed ? <Check className="h-4 w-4" /> : idx + 1}
                        </div>
                        {!isLastStep && (
                          <div className="roadmap-step-line mt-1 min-h-[24px] w-px flex-1 bg-gradient-to-b from-white/18 to-white/4" />
                        )}
                      </div>

                      <div className="min-w-0 rounded-2xl border border-white/9 bg-white/[0.032] p-5 pb-5 transition-all duration-200 hover:border-white/16 hover:bg-white/[0.045]">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold leading-tight text-white">{step.title}</h3>
                            {step.type && (
                              <span className={`mt-2 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                                step.type === 'course'
                                  ? 'border-emerald-400/18 bg-emerald-400/8 text-emerald-300'
                                  : step.type === 'opportunity'
                                  ? 'border-sky-400/18 bg-sky-400/8 text-sky-300'
                                  : 'border-white/10 bg-white/[0.025] text-white/55'
                              }`}>
                                {step.type === 'course' ? tt('course') : step.type === 'opportunity' ? tt('program') : tt('milestone')}
                              </span>
                            )}
                          </div>
                          {step.timeframe && (
                            <span className="shrink-0 rounded-lg border border-white/10 bg-black/18 px-2.5 py-1 text-xs font-medium text-white/55">
                              {step.timeframe}
                            </span>
                          )}
                        </div>

                        <p className="mb-4 text-sm leading-relaxed text-white/62">{step.description}</p>

                        {step.reason && (
                          <p className="mb-3 border-l border-white/10 pl-3 text-xs leading-relaxed text-white/45">
                            {step.reason}
                          </p>
                        )}

                        {step.deadline && (
                          <div className="mb-3 flex items-center gap-1.5 text-xs text-white/45">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>{tt('deadline')}: {formatDate(step.deadline, language)}</span>
                          </div>
                        )}

                        {(step.courseIds?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {step.courseIds!.map(cid => {
                              const course = COURSES.find(c => c.id === cid);
                              return (
                                <Link
                                  key={cid}
                                  href={`/courses/${cid}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/18 bg-emerald-400/8 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-400/12"
                                >
                                  <BookOpen className="h-3.5 w-3.5" />
                                  {course?.title ? (COURSE_SHORT[cid] ?? course.title) : (COURSE_SHORT[cid] ?? cid)}
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {(step.opportunityIds?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {step.opportunityIds!.map(oid => (
                              <Link
                                key={oid}
                                href="/opportunities"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/18 bg-sky-400/8 px-2.5 py-1 text-xs text-sky-300 transition-colors hover:bg-sky-400/12"
                              >
                                <Target className="h-3.5 w-3.5" />
                                {getOppTitle(oid, language)}
                              </Link>
                            ))}
                          </div>
                        )}

                        {step.nextAction && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-black/16 px-3 py-2">
                            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8b7fff]" />
                            <p className="text-xs leading-relaxed text-white/68">{step.nextAction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ); })}
              </div>
            )}

            {((displayRoadmap.recommendedOpportunities?.length ?? 0) > 0 || (displayRoadmap.recommendedCourses?.length ?? 0) > 0) && (
              <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-white/42">{tt('selectedForProfile')}</p>
                <div className="space-y-4">
                  {(displayRoadmap.recommendedCourses?.length ?? 0) > 0 && (
                    <div>
                      <p className="mb-2 text-xs text-white/45">{tt('startCourse')}</p>
                      <div className="flex flex-wrap gap-2">
                        {displayRoadmap.recommendedCourses!.map(cid => (
                          <Link
                            key={cid}
                            href={`/courses/${cid}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/18 bg-emerald-400/8 px-3 py-1.5 text-xs text-emerald-300 transition-colors hover:bg-emerald-400/12"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            {COURSE_SHORT[cid] ?? cid}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {(displayRoadmap.recommendedOpportunities?.length ?? 0) > 0 && (
                    <div>
                      <p className="mb-2 text-xs text-white/45">{tt('suitablePrograms')}</p>
                      <div className="flex flex-wrap gap-2">
                        {displayRoadmap.recommendedOpportunities!.map(oid => (
                          <Link
                            key={oid}
                            href="/opportunities"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/18 bg-sky-400/8 px-3 py-1.5 text-xs text-sky-300 transition-colors hover:bg-sky-400/12"
                          >
                            <Target className="h-3.5 w-3.5" />
                            {getOppTitle(oid, language)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/opportunities"
                className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.032] p-5 transition-all duration-200 hover:border-white/18 hover:bg-white/[0.052]"
              >
                <Target className="h-5 w-5 text-white/70" />
                <p className="text-sm font-medium text-white">{tt('allOpportunities')}</p>
                <p className="text-xs text-white/45">{tt('opportunities')}</p>
              </Link>
              <Link
                href="/courses"
                className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.032] p-5 transition-all duration-200 hover:border-white/18 hover:bg-white/[0.052]"
              >
                <BookOpen className="h-5 w-5 text-white/70" />
                <p className="text-sm font-medium text-white">{tt('allCourses')}</p>
                <p className="text-xs text-white/45">{tt('courses')}</p>
              </Link>
            </div>
          </>
        )}
        </div>

        {/* Right column: Настав Chat */}
        <div className="lg:sticky lg:top-24">
          <NastavChat profile={profile} roadmap={displayRoadmap} />
        </div>

        </div>
      </div>
    </div>
  );
}
