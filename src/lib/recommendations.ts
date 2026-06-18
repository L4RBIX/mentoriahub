import type {
  AppLanguage,
  Course,
  CourseProgress,
  Goal,
  Interest,
  Opportunity,
  Roadmap,
  RoadmapStep,
  SavedOpportunity,
  StudentProfile,
} from '@/types/mentoria';
import { getProfileGoals, profileFingerprint, profileGoalsText } from '@/lib/profile';

const DAY_MS = 86_400_000;

type RoadmapStepType = NonNullable<RoadmapStep['type']>;

interface RecommendationContext {
  saved?: SavedOpportunity[];
  progress?: CourseProgress[];
  language?: AppLanguage;
}

interface OpportunityScore {
  item: Opportunity;
  score: number;
  reasons: string[];
}

interface CourseScore {
  item: Course;
  score: number;
  reasons: string[];
}

const INTEREST_TERMS: Record<Interest, string[]> = {
  STEM: ['stem', 'math', 'science', 'research', 'olympiad', 'engineering', 'математика', 'наука', 'олимпиада'],
  Business: ['business', 'entrepreneur', 'startup', 'leadership', 'бизнес', 'стартап'],
  Programming: ['programming', 'coding', 'it', 'computer', 'algorithm', 'python', 'hackathon', 'программирование', 'информатика'],
  English: ['english', 'ielts', 'toefl', 'sat', 'academic', 'английский'],
  'University Admissions': ['university', 'admission', 'scholarship', 'essay', 'common app', 'sat', 'ielts', 'поступление', 'стипендия'],
  Science: ['science', 'research', 'biology', 'chemistry', 'physics', 'наука', 'исследование'],
  'Social Impact': ['volunteer', 'social', 'impact', 'community', 'волонтер', 'социальный'],
  Finance: ['finance', 'scholarship', 'economics', 'business', 'финансы', 'стипендия'],
};

const GOAL_TERMS: Record<Goal, string[]> = {
  'Top university admission': ['university', 'admission', 'scholarship', 'essay', 'portfolio', 'sat', 'ielts'],
  'Olympiad preparation': ['olympiad', 'math', 'programming', 'algorithm', 'science', 'competition'],
  'IELTS/SAT': ['ielts', 'sat', 'toefl', 'english', 'academic'],
  'Build portfolio': ['portfolio', 'project', 'research', 'hackathon', 'volunteering', 'leadership'],
  'Leadership & volunteering': ['leadership', 'volunteering', 'community', 'social', 'impact'],
  Entrepreneurship: ['business', 'startup', 'entrepreneur', 'finance', 'hackathon'],
};

export const ROADMAP_COPY = {
  ru: {
    title: (profile: StudentProfile) => `Персональная дорожная карта — ${profile.name}`,
    summary: (profile: StudentProfile) => `План рассчитан по профилю ученика ${profile.grade} класса: цели, интересы, курсы, возможности и ближайшие дедлайны. Рекомендации прозрачные: каждая позиция выбрана по совпадению с профилем и сроками.`,
    calculated: 'Рассчитано по профилю',
    reasonMatch: (profile: StudentProfile) => `Совпадает с целями «${profileGoalsText(profile)}» и интересами: ${profile.interests.slice(0, 2).join(', ')}.`,
    closeDeadline: 'Дедлайн близко, поэтому шаг стоит поставить выше в приоритете.',
    foundationTitle: 'Фундамент: начать с подходящего курса',
    foundationDesc: (course?: Course) => course
      ? `Начни с курса «${course.title}», чтобы закрыть базу перед заявками и проектами.`
      : 'Начни с базового курса Mentoria, чтобы выстроить учебный ритм и закрыть пробелы.',
    foundationAction: (course?: Course) => course ? `Открой курс «${course.title}» и пройди первый урок.` : 'Открой раздел курсов и выбери первый урок.',
    opportunityTitle: 'Первая сильная возможность',
    opportunityDesc: (opp?: Opportunity) => opp
      ? `Сохрани «${opp.title}» и проверь требования. Это даст реальный внешний результат для портфолио.`
      : 'Выбери одну возможность из каталога и подготовь требования заранее.',
    opportunityAction: (opp?: Opportunity) => opp ? `Сохрани «${opp.title}» и включи Telegram-напоминание.` : 'Сохрани подходящую возможность и включи Telegram-напоминание.',
    portfolioTitle: 'Портфолио и проект',
    portfolioDesc: 'Собери доказательства прогресса: проект, эссе, сертификат, участие в конкурсе или волонтёрский результат.',
    portfolioAction: 'Добавь один измеримый результат в портфолио на этой неделе.',
    deadlineTitle: 'Подготовка к дедлайнам',
    deadlineDesc: 'Разбей дедлайн на маленькие задачи: требования, документы, черновик заявки, проверка и отправка.',
    deadlineAction: 'Открой календарь и проверь ближайшие дедлайны.',
    advancedTitle: 'Углубление и сертификат',
    advancedDesc: (course?: Course) => course
      ? `Заверши курс «${course.title}», чтобы подтвердить прогресс и усилить заявку.`
      : 'Заверши один курс и добавь сертификат в свой учебный профиль.',
    advancedAction: 'Пройди следующий урок и доведи курс до 100%.',
    applicationTitle: 'Финальная готовность заявки',
    applicationDesc: 'Проверь список университетов, дедлайны, эссе, рекомендации, тесты и портфолио. Не обещаем поступление, но повышаем управляемость процесса.',
    applicationAction: 'Составь чеклист документов и отметь самый срочный пункт.',
    timeframeNow: 'Сейчас – 2 недели',
    timeframeMonth: '2–6 недель',
    timeframeQuarter: '1–3 месяца',
    timeframeLong: '3–6 месяцев',
  },
  en: {
    title: (profile: StudentProfile) => `Personalized roadmap — ${profile.name}`,
    summary: (profile: StudentProfile) => `Calculated from a grade ${profile.grade} profile: goals, interests, courses, opportunities, and upcoming deadlines. Each recommendation is based on profile fit and timing.`,
    calculated: 'Calculated from your profile',
    reasonMatch: (profile: StudentProfile) => `Matched to your goals "${profileGoalsText(profile)}" and interests: ${profile.interests.slice(0, 2).join(', ')}.`,
    closeDeadline: 'The deadline is close, so this should be prioritized.',
    foundationTitle: 'Foundation: start with the right course',
    foundationDesc: (course?: Course) => course
      ? `Start with "${course.title}" to build the base before applications and projects.`
      : 'Start with a Mentoria course to build study rhythm and close gaps.',
    foundationAction: (course?: Course) => course ? `Open "${course.title}" and complete the first lesson.` : 'Open Courses and choose your first lesson.',
    opportunityTitle: 'First high-signal opportunity',
    opportunityDesc: (opp?: Opportunity) => opp
      ? `Save "${opp.title}" and review the requirements. It can become a concrete portfolio signal.`
      : 'Choose one opportunity from the catalog and prepare the requirements early.',
    opportunityAction: (opp?: Opportunity) => opp ? `Save "${opp.title}" and turn on a Telegram reminder.` : 'Save a suitable opportunity and turn on a Telegram reminder.',
    portfolioTitle: 'Portfolio and project',
    portfolioDesc: 'Collect proof of growth: a project, essay, certificate, competition result, or volunteering impact.',
    portfolioAction: 'Add one measurable portfolio result this week.',
    deadlineTitle: 'Deadline preparation',
    deadlineDesc: 'Break the deadline into tasks: requirements, documents, application draft, review, and submission.',
    deadlineAction: 'Open Calendar and check your closest deadlines.',
    advancedTitle: 'Depth and certificate',
    advancedDesc: (course?: Course) => course
      ? `Complete "${course.title}" to prove progress and strengthen your application.`
      : 'Complete one course and add the certificate to your learning profile.',
    advancedAction: 'Complete the next lesson and move the course toward 100%.',
    applicationTitle: 'Final application readiness',
    applicationDesc: 'Review your university list, deadlines, essays, recommendations, tests, and portfolio. We do not guarantee admission, but the process becomes more manageable.',
    applicationAction: 'Create a document checklist and handle the most urgent item.',
    timeframeNow: 'Now – 2 weeks',
    timeframeMonth: '2–6 weeks',
    timeframeQuarter: '1–3 months',
    timeframeLong: '3–6 months',
  },
  kz: {
    title: (profile: StudentProfile) => `Жеке жол картасы — ${profile.name}`,
    summary: (profile: StudentProfile) => `${profile.grade}-сынып профилі бойынша есептелді: мақсат, қызығушылықтар, курстар, мүмкіндіктер және жақын дедлайндар. Әр ұсыныс профильге сәйкестік пен уақытқа негізделген.`,
    calculated: 'Профиль бойынша есептелді',
    reasonMatch: (profile: StudentProfile) => `«${profileGoalsText(profile)}» мақсаттарына және қызығушылықтарға сәйкес: ${profile.interests.slice(0, 2).join(', ')}.`,
    closeDeadline: 'Дедлайн жақын, сондықтан бұл қадамды жоғары қою керек.',
    foundationTitle: 'Негіз: дұрыс курстан бастау',
    foundationDesc: (course?: Course) => course
      ? `Өтінімдер мен жобаларға дейін база құру үшін «${course.title}» курсынан баста.`
      : 'Оқу ырғағын қалыптастыру үшін Mentoria курсынан баста.',
    foundationAction: (course?: Course) => course ? `«${course.title}» курсын ашып, бірінші сабақты өт.` : 'Курстар бөлімін ашып, бірінші сабақты таңда.',
    opportunityTitle: 'Алғашқы мықты мүмкіндік',
    opportunityDesc: (opp?: Opportunity) => opp
      ? `«${opp.title}» мүмкіндігін сақтап, талаптарын тексер. Бұл портфолиоға нақты нәтиже береді.`
      : 'Каталогтан бір мүмкіндікті таңдап, талаптарды ерте дайында.',
    opportunityAction: (opp?: Opportunity) => opp ? `«${opp.title}» сақтап, Telegram еске салғышын қос.` : 'Сәйкес мүмкіндікті сақтап, Telegram еске салғышын қос.',
    portfolioTitle: 'Портфолио және жоба',
    portfolioDesc: 'Прогрестің дәлелдерін жина: жоба, эссе, сертификат, конкурс немесе волонтерлік нәтиже.',
    portfolioAction: 'Осы аптада портфолиоға бір өлшенетін нәтиже қос.',
    deadlineTitle: 'Дедлайнға дайындық',
    deadlineDesc: 'Дедлайнды шағын тапсырмаларға бөл: талаптар, құжаттар, өтінімнің черновигі, тексеру және жіберу.',
    deadlineAction: 'Күнтізбені ашып, ең жақын дедлайндарды тексер.',
    advancedTitle: 'Тереңдету және сертификат',
    advancedDesc: (course?: Course) => course
      ? `Прогресті дәлелдеу үшін «${course.title}» курсын аяқта.`
      : 'Бір курсты аяқтап, сертификатты оқу профиліне қос.',
    advancedAction: 'Келесі сабақты өтіп, курсты 100%-ға жақындат.',
    applicationTitle: 'Өтінімге финалдық дайындық',
    applicationDesc: 'Университеттер тізімін, дедлайндарды, эсселерді, ұсыныстарды, тесттерді және портфолионы тексер. Түсуге кепілдік бермейміз, бірақ процесті басқаруға көмектесеміз.',
    applicationAction: 'Құжаттар чеклистін жасап, ең шұғыл пункттен баста.',
    timeframeNow: 'Қазір – 2 апта',
    timeframeMonth: '2–6 апта',
    timeframeQuarter: '1–3 ай',
    timeframeLong: '3–6 ай',
  },
};

function toAppLanguage(profile: StudentProfile, explicit?: AppLanguage): AppLanguage {
  if (explicit) return explicit;
  if (profile.language === 'english') return 'en';
  if (profile.language === 'kazakh') return 'kz';
  return 'ru';
}

function daysUntil(deadline: string): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / DAY_MS);
}

function textForOpportunity(opportunity: Opportunity): string {
  return [
    opportunity.title,
    opportunity.titleEn,
    opportunity.titleKz,
    opportunity.description,
    opportunity.descriptionEn,
    opportunity.descriptionKz,
    opportunity.category,
    opportunity.direction,
    opportunity.format,
    ...opportunity.tags,
    ...opportunity.requirements,
    ...(opportunity.requirementsEn ?? []),
    ...(opportunity.requirementsKz ?? []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function textForCourse(course: Course): string {
  return [
    course.title,
    course.description,
    course.level,
    ...course.tags,
    ...course.lessons.flatMap(lesson => [lesson.title, lesson.content]),
  ].join(' ').toLowerCase();
}

function hasTerm(haystack: string, terms: string[]): boolean {
  return terms.some(term => haystack.includes(term.toLowerCase()));
}

function interestMatchScore(haystack: string, interests: Interest[], directDirection?: string): number {
  let score = 0;
  interests.forEach(interest => {
    if (directDirection === interest) score += 18;
    if (hasTerm(haystack, [interest, ...(INTEREST_TERMS[interest] ?? [])])) score += 12;
  });
  return Math.min(30, score);
}

function goalMatchScore(haystack: string, goal: Goal): number {
  return hasTerm(haystack, GOAL_TERMS[goal] ?? [goal]) ? 25 : 0;
}

function goalsMatchScore(haystack: string, goals: Goal[]): number {
  const score = goals.reduce((sum, goal) => sum + goalMatchScore(haystack, goal), 0);
  return Math.min(45, score);
}

function courseCompleted(progress: CourseProgress[] | undefined, course: Course): boolean {
  const record = progress?.find(item => item.courseId === course.id);
  return !!record && record.completedLessonIds.length >= course.lessons.length;
}

export function scoreOpportunity(
  profile: StudentProfile,
  opportunity: Opportunity,
  context: RecommendationContext = {},
): OpportunityScore {
  const text = textForOpportunity(opportunity);
  const savedIds = new Set((context.saved ?? []).map(item => item.opportunityId));
  const days = daysUntil(opportunity.deadline);
  const reasons: string[] = [];
  let score = 0;

  const interestScore = interestMatchScore(text, profile.interests, opportunity.direction);
  if (interestScore > 0) {
    score += interestScore;
    reasons.push('interest/tag match');
  }

  const goalScore = goalsMatchScore(text, getProfileGoals(profile));
  if (goalScore > 0) {
    score += goalScore;
    reasons.push('goal match');
  }

  if (opportunity.grades.includes(profile.grade)) {
    score += 20;
    reasons.push('grade eligible');
  } else {
    score -= 50;
    reasons.push('grade mismatch');
  }

  if (days < 0) {
    score -= 100;
    reasons.push('deadline passed');
  } else if (days <= 30) {
    score += 15;
    reasons.push('upcoming deadline');
  }

  if (opportunity.format === 'Online' || opportunity.format === 'Hybrid') {
    score += 5;
    reasons.push('accessible format');
  }

  if (savedIds.has(opportunity.id)) {
    score -= 20;
    reasons.push('already saved');
  }

  return { item: opportunity, score, reasons };
}

export function scoreCourse(
  profile: StudentProfile,
  course: Course,
  recommendedOpportunities: Opportunity[] = [],
  context: RecommendationContext = {},
): CourseScore {
  const text = textForCourse(course);
  const reasons: string[] = [];
  let score = 0;

  const interestScore = interestMatchScore(text, profile.interests);
  if (interestScore > 0) {
    score += interestScore;
    reasons.push('interest/tag match');
  }

  const goalScore = goalsMatchScore(text, getProfileGoals(profile));
  if (goalScore > 0) {
    score += goalScore;
    reasons.push('goal match');
  }

  const grade = profile.grade;
  const levelFit =
    (grade <= 9 && course.level === 'Beginner') ||
    (grade === 10 && (course.level === 'Beginner' || course.level === 'Intermediate')) ||
    (grade >= 11 && (course.level === 'Intermediate' || course.level === 'Advanced'));
  if (levelFit) {
    score += 15;
    reasons.push('level fit');
  }

  const supportsOpp = recommendedOpportunities.some(opportunity => {
    const oppText = textForOpportunity(opportunity);
    return course.tags.some(tag => oppText.includes(tag.toLowerCase()));
  });
  if (supportsOpp) {
    score += 15;
    reasons.push('supports recommended opportunities');
  }

  const record = context.progress?.find(item => item.courseId === course.id);
  if (record && record.completedLessonIds.length > 0) {
    score += 5;
    reasons.push('already started');
  }

  if (courseCompleted(context.progress, course)) {
    score -= 30;
    reasons.push('already completed');
  }

  return { item: course, score, reasons };
}

export function generateRecommendations(
  profile: StudentProfile,
  opportunities: Opportunity[],
  courses: Course[],
  context: RecommendationContext = {},
) {
  const opportunityScores = opportunities
    .map(opportunity => scoreOpportunity(profile, opportunity, context))
    .sort((a, b) => b.score - a.score);

  const diverse: OpportunityScore[] = [];
  const categories = new Set<string>();
  opportunityScores.forEach(result => {
    const diversityBonus = categories.has(result.item.category) ? 0 : 5;
    const adjusted = { ...result, score: result.score + diversityBonus };
    if (!categories.has(result.item.category) || diverse.length < 3) {
      diverse.push(adjusted);
      categories.add(result.item.category);
    }
  });

  const topOpportunities = [...diverse]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const recommendedOpportunityItems = topOpportunities.map(result => result.item);
  const courseScores = courses
    .map(course => scoreCourse(profile, course, recommendedOpportunityItems, context))
    .sort((a, b) => b.score - a.score);

  return {
    opportunities: topOpportunities,
    courses: courseScores.slice(0, 4),
  };
}

function dateAfter(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

function step(
  id: string,
  type: RoadmapStepType,
  title: string,
  description: string,
  timeframe: string,
  reason: string,
  nextAction: string,
  courseIds: string[] = [],
  opportunityIds: string[] = [],
  deadline?: string,
): RoadmapStep {
  return {
    id,
    type,
    title,
    description,
    timeframe,
    reason,
    nextAction,
    courseIds,
    opportunityIds,
    recommendedCourses: courseIds,
    recommendedOpportunities: opportunityIds,
    deadline,
  };
}

export function generateRoadmap(
  profile: StudentProfile,
  opportunities: Opportunity[],
  courses: Course[],
  context: RecommendationContext = {},
): Roadmap {
  const language = toAppLanguage(profile, context.language);
  const copy = ROADMAP_COPY[language];
  const recommendations = generateRecommendations(profile, opportunities, courses, context);
  const topOpps = recommendations.opportunities.map(result => result.item);
  const topCourses = recommendations.courses.map(result => result.item);
  const firstCourse = topCourses[0];
  const secondCourse = topCourses[1] ?? firstCourse;
  const firstOpp = topOpps[0];
  const urgentOpp = topOpps.find(opportunity => daysUntil(opportunity.deadline) <= 30) ?? topOpps[1] ?? firstOpp;
  const matchReason = copy.reasonMatch(profile);
  const closeReason = urgentOpp && daysUntil(urgentOpp.deadline) <= 30 ? copy.closeDeadline : matchReason;

  const steps: RoadmapStep[] = [
    step(
      'local-foundation',
      'course',
      copy.foundationTitle,
      copy.foundationDesc(firstCourse),
      copy.timeframeNow,
      matchReason,
      copy.foundationAction(firstCourse),
      firstCourse ? [firstCourse.id] : [],
      [],
      dateAfter(14),
    ),
    step(
      'local-first-opportunity',
      'opportunity',
      copy.opportunityTitle,
      copy.opportunityDesc(firstOpp),
      copy.timeframeMonth,
      matchReason,
      copy.opportunityAction(firstOpp),
      [],
      firstOpp ? [firstOpp.id] : [],
      firstOpp?.deadline ?? dateAfter(45),
    ),
    step(
      'local-portfolio',
      'portfolio',
      copy.portfolioTitle,
      copy.portfolioDesc,
      copy.timeframeQuarter,
      matchReason,
      copy.portfolioAction,
      secondCourse ? [secondCourse.id] : [],
      topOpps.slice(1, 3).map(opportunity => opportunity.id),
      dateAfter(90),
    ),
    step(
      'local-deadline',
      'deadline',
      copy.deadlineTitle,
      copy.deadlineDesc,
      copy.timeframeMonth,
      closeReason,
      copy.deadlineAction,
      [],
      urgentOpp ? [urgentOpp.id] : [],
      urgentOpp?.deadline ?? dateAfter(30),
    ),
    step(
      'local-advanced',
      'course',
      copy.advancedTitle,
      copy.advancedDesc(secondCourse),
      copy.timeframeQuarter,
      matchReason,
      copy.advancedAction,
      secondCourse ? [secondCourse.id] : [],
      [],
      dateAfter(120),
    ),
  ];

  const profileGoals = getProfileGoals(profile);
  if (profile.grade >= 10 || profileGoals.includes('Top university admission') || profileGoals.includes('IELTS/SAT')) {
    steps.push(step(
      'local-application',
      'application',
      copy.applicationTitle,
      copy.applicationDesc,
      copy.timeframeLong,
      matchReason,
      copy.applicationAction,
      topCourses.slice(0, 2).map(course => course.id),
      topOpps.slice(0, 3).map(opportunity => opportunity.id),
      dateAfter(profile.grade >= 11 ? 60 : 180),
    ));
  }

  return {
    title: copy.title(profile),
    summary: `${copy.summary(profile)} ${copy.calculated}.`,
    steps,
    recommendedOpportunities: topOpps.slice(0, 4).map(opportunity => opportunity.id),
    recommendedCourses: topCourses.slice(0, 2).map(course => course.id),
    generatedAt: new Date().toISOString(),
    source: 'local',
    profileSnapshot: profileFingerprint(profile),
  };
}
