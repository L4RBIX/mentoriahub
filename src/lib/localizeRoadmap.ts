/**
 * Client-side roadmap localization.
 *
 * `generateRoadmap()` stamps every step with a deterministic ID
 * (e.g. "local-foundation", "local-first-opportunity").  At render time we
 * look up the correct translated copy from ROADMAP_COPY using those IDs, so
 * the cached semantic roadmap works correctly in any language without a
 * network round-trip.
 *
 * Steps whose IDs don't match a known template (e.g. old fallback-generated
 * roadmaps) are returned unchanged, so stale caches degrade gracefully.
 */

import type {
  AppLanguage,
  Course,
  Goal,
  Interest,
  Opportunity,
  Roadmap,
  RoadmapStep,
  StudentProfile,
} from '@/types/mentoria';
import { ROADMAP_COPY } from '@/lib/recommendations';

// ---------------------------------------------------------------------------
// Label maps (internal English key → display string per language)
// ---------------------------------------------------------------------------

export const GOAL_L10N: Record<string, Record<AppLanguage, string>> = {
  'Top university admission':  { ru: 'Поступление в топ-университет', en: 'Top university admission',  kz: 'Үздік университетке түсу' },
  'Olympiad preparation':      { ru: 'Подготовка к олимпиаде',         en: 'Olympiad preparation',       kz: 'Олимпиадаға дайындық' },
  'IELTS/SAT':                 { ru: 'IELTS/SAT',                       en: 'IELTS/SAT',                  kz: 'IELTS/SAT' },
  'Build portfolio':           { ru: 'Собрать портфолио',               en: 'Build portfolio',            kz: 'Портфолио жасау' },
  'Leadership & volunteering': { ru: 'Лидерство и волонтёрство',        en: 'Leadership & volunteering',  kz: 'Көшбасшылық және волонтерлік' },
  'Entrepreneurship':          { ru: 'Предпринимательство',             en: 'Entrepreneurship',           kz: 'Кәсіпкерлік' },
};

export const INTEREST_L10N: Record<string, Record<AppLanguage, string>> = {
  'STEM':                  { ru: 'STEM',                          en: 'STEM',                    kz: 'STEM' },
  'Business':              { ru: 'Бизнес',                        en: 'Business',                kz: 'Бизнес' },
  'Programming':           { ru: 'Программирование',              en: 'Programming',             kz: 'Бағдарламалау' },
  'English':               { ru: 'Английский язык',               en: 'English',                 kz: 'Ағылшын тілі' },
  'University Admissions': { ru: 'Поступление в университет',    en: 'University Admissions',   kz: 'Университетке түсу' },
  'Science':               { ru: 'Наука',                         en: 'Science',                 kz: 'Ғылым' },
  'Social Impact':         { ru: 'Социальный вклад',              en: 'Social Impact',           kz: 'Әлеуметтік әсер' },
  'Finance':               { ru: 'Финансы',                       en: 'Finance',                 kz: 'Қаржы' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(deadline: string): number {
  const s = new Date(); s.setHours(0, 0, 0, 0);
  const e = new Date(deadline); e.setHours(0, 0, 0, 0);
  return Math.ceil((e.getTime() - s.getTime()) / 86_400_000);
}

/**
 * Returns a copy of `profile` with goal/interests replaced by their display
 * labels in `lang`.  Name and grade are left unchanged.
 *
 * We cast goal/interests back to their union types so ROADMAP_COPY template
 * functions (which accept StudentProfile) receive a compatible object —
 * those functions only use the values as interpolated strings anyway.
 */
function withLocalizedLabels(profile: StudentProfile, lang: AppLanguage): StudentProfile {
  return {
    ...profile,
    goal: (GOAL_L10N[profile.goal]?.[lang] ?? profile.goal) as Goal,
    goals: (profile.goals ?? [profile.goal]).map(
      goal => (GOAL_L10N[goal]?.[lang] ?? goal) as Goal,
    ),
    interests: profile.interests.map(
      i => (INTEREST_L10N[i]?.[lang] ?? i) as Interest,
    ),
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Re-renders a locally-generated roadmap (`source: 'local'`) in the requested
 * language using ROADMAP_COPY templates, without any network request.
 *
 * Pass the same `allCourses` / `allOpps` arrays that the roadmap page already
 * has in memory — resolution is done by matching IDs from
 * `roadmap.recommendedCourses` and `roadmap.recommendedOpportunities`.
 */
export function localizeRoadmap(
  roadmap: Roadmap,
  profile: StudentProfile,
  language: AppLanguage,
  allCourses: Course[],
  allOpps: Opportunity[],
): Roadmap {
  // Only re-derive text for template-based roadmaps; AI / fallback roadmaps
  // cannot be reliably re-rendered from templates (no deterministic step IDs).
  if (roadmap.source !== 'local') return roadmap;

  const copy         = ROADMAP_COPY[language];
  const localProfile = withLocalizedLabels(profile, language);

  // Resolve recommended items in their original order using top-level IDs.
  const topCourses = (roadmap.recommendedCourses ?? [])
    .map(id => allCourses.find(c => c.id === id))
    .filter((c): c is Course => Boolean(c));

  const topOpps = (roadmap.recommendedOpportunities ?? [])
    .map(id => allOpps.find(o => o.id === id))
    .filter((o): o is Opportunity => Boolean(o));

  const firstCourse  = topCourses[0];
  const secondCourse = topCourses[1] ?? firstCourse;
  const firstOpp     = topOpps[0];
  const urgentOpp    = topOpps.find(o => daysUntil(o.deadline) <= 30) ?? topOpps[1] ?? firstOpp;

  const matchReason = copy.reasonMatch(localProfile);
  const closeReason = urgentOpp && daysUntil(urgentOpp.deadline) <= 30
    ? copy.closeDeadline
    : matchReason;

  // Per-step text overrides keyed by the deterministic IDs from generateRoadmap().
  const STEP_OVERRIDES: Record<string, Partial<RoadmapStep>> = {
    'local-foundation': {
      title:       copy.foundationTitle,
      description: copy.foundationDesc(firstCourse),
      timeframe:   copy.timeframeNow,
      reason:      matchReason,
      nextAction:  copy.foundationAction(firstCourse),
    },
    'local-first-opportunity': {
      title:       copy.opportunityTitle,
      description: copy.opportunityDesc(firstOpp),
      timeframe:   copy.timeframeMonth,
      reason:      matchReason,
      nextAction:  copy.opportunityAction(firstOpp),
    },
    'local-portfolio': {
      title:       copy.portfolioTitle,
      description: copy.portfolioDesc,
      timeframe:   copy.timeframeQuarter,
      reason:      matchReason,
      nextAction:  copy.portfolioAction,
    },
    'local-deadline': {
      title:       copy.deadlineTitle,
      description: copy.deadlineDesc,
      timeframe:   copy.timeframeMonth,
      reason:      closeReason,
      nextAction:  copy.deadlineAction,
    },
    'local-advanced': {
      title:       copy.advancedTitle,
      description: copy.advancedDesc(secondCourse),
      timeframe:   copy.timeframeQuarter,
      reason:      matchReason,
      nextAction:  copy.advancedAction,
    },
    'local-application': {
      title:       copy.applicationTitle,
      description: copy.applicationDesc,
      timeframe:   copy.timeframeLong,
      reason:      matchReason,
      nextAction:  copy.applicationAction,
    },
  };

  const localizedSteps = roadmap.steps.map(step => {
    const override = STEP_OVERRIDES[step.id];
    return override ? { ...step, ...override } : step;
  });

  return {
    ...roadmap,
    title:   copy.title(localProfile),
    summary: `${copy.summary(localProfile)} ${copy.calculated}.`,
    steps:   localizedSteps,
  };
}
