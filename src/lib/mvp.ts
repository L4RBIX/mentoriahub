import { COURSES } from '@/lib/data/courses';
import { MOCK_OPPORTUNITIES } from '@/lib/data/opportunities';
import { generateRecommendations } from '@/lib/recommendations';
import type {
  AppLanguage,
  Certificate,
  Course,
  CourseProgress,
  MentorLesson,
  Opportunity,
  Roadmap,
  SavedOpportunity,
  StudentProfile,
} from '@/types/mentoria';

export function daysUntil(dateStr: string): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getAllOpportunities(custom: Opportunity[] = []): Opportunity[] {
  const ids = new Set(MOCK_OPPORTUNITIES.map(o => o.id));
  return [...MOCK_OPPORTUNITIES, ...custom.filter(o => !ids.has(o.id))];
}

export function getAllCourses(custom: Course[] = []): Course[] {
  const ids = new Set(COURSES.map(course => course.id));
  return [...COURSES, ...custom.filter(course => !ids.has(course.id))];
}

export function getRecommendedOpportunities(
  profile: StudentProfile | null,
  roadmap: Roadmap | null,
  opportunities: Opportunity[],
  limit = 3,
): Opportunity[] {
  if (profile) {
    const saved = storageSafeSaved();
    return generateRecommendations(profile, opportunities, COURSES, { saved })
      .opportunities
      .map(result => result.item)
      .slice(0, limit);
  }

  const byId = new Map(opportunities.map(o => [o.id, o]));
  const roadmapMatches = roadmap?.recommendedOpportunities
    ?.map(id => byId.get(id))
    .filter((o): o is Opportunity => Boolean(o)) ?? [];

  const merged = [...roadmapMatches, ...opportunities]
    .filter((opp, index, arr) => arr.findIndex(o => o.id === opp.id) === index)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return merged.slice(0, limit);
}

function storageSafeSaved(): SavedOpportunity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('mentoria_saved_opportunities');
    return raw ? JSON.parse(raw) as SavedOpportunity[] : [];
  } catch {
    return [];
  }
}

export function getDeadlineOpportunities(
  saved: SavedOpportunity[],
  recommended: Opportunity[],
  opportunities: Opportunity[],
): Opportunity[] {
  const byId = new Map(opportunities.map(o => [o.id, o]));
  const savedOpps = saved.map(item => byId.get(item.opportunityId)).filter((o): o is Opportunity => Boolean(o));
  const source = savedOpps.length > 0 ? [...savedOpps, ...recommended] : recommended;
  return source
    .filter((opp, index, arr) => arr.findIndex(o => o.id === opp.id) === index)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export function isCourseComplete(course: Course, progress: CourseProgress | null | undefined): boolean {
  return (progress?.completedLessonIds.length ?? 0) >= course.lessons.length;
}

export function makeCertificate(profile: StudentProfile, course: Course): Certificate {
  return {
    id: `MH-${course.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    courseId: course.id,
    studentName: profile.name,
    courseName: course.title,
    issuedAt: new Date().toISOString(),
  };
}

// --- Opportunity localization --------------------------------------------
// `description`/`requirements`/`benefits` on Opportunity are the Russian
// default. EN/KZ overrides are optional per-field so custom/admin-added
// opportunities (which never get translated) still render correctly by
// falling back to the RU text instead of breaking.

export function getLocalizedOpportunityText(opportunity: Opportunity, language: AppLanguage, field: 'title' | 'description'): string;
export function getLocalizedOpportunityText(opportunity: Opportunity, language: AppLanguage, field: 'requirements' | 'benefits'): string[];
export function getLocalizedOpportunityText(
  opportunity: Opportunity,
  language: AppLanguage,
  field: 'title' | 'description' | 'requirements' | 'benefits',
): string | string[] {
  if (field === 'title') {
    if (language === 'en') return opportunity.titleEn ?? opportunity.title;
    if (language === 'kz') return opportunity.titleKz ?? opportunity.title;
    return opportunity.title;
  }

  if (field === 'description') {
    if (language === 'en') return opportunity.descriptionEn ?? opportunity.description;
    if (language === 'kz') return opportunity.descriptionKz ?? opportunity.description;
    return opportunity.description;
  }

  if (field === 'requirements') {
    if (language === 'en') return opportunity.requirementsEn ?? opportunity.requirements;
    if (language === 'kz') return opportunity.requirementsKz ?? opportunity.requirements;
    return opportunity.requirements;
  }

  // benefits
  if (language === 'en') return opportunity.benefitsEn ?? opportunity.benefits ?? [];
  if (language === 'kz') return opportunity.benefitsKz ?? opportunity.benefits ?? [];
  return opportunity.benefits ?? [];
}

// --- Deterministic "AI Mentor advice" -------------------------------------
// No live API call — a fixed, opportunity-shape-aware advice list so the
// detail page never depends on DeepSeek being configured.

type AdviceKind = 'language-test' | 'stem' | 'scholarship' | 'volunteering' | 'hackathon' | 'research' | 'general';

function classifyAdvice(opportunity: Opportunity): AdviceKind {
  const tags = opportunity.tags.map(t => t.toLowerCase());
  const hasTag = (...needles: string[]) => needles.some(n => tags.some(tag => tag.includes(n)));

  if (opportunity.category === 'Hackathon') return 'hackathon';
  if (opportunity.category === 'Research') return 'research';
  if (hasTag('ielts', 'sat', 'toefl') || (opportunity.direction === 'English' && opportunity.category === 'University Prep')) {
    return 'language-test';
  }
  if (opportunity.category === 'Volunteering' || opportunity.direction === 'Social Impact') return 'volunteering';
  if (opportunity.category === 'Scholarship' || (opportunity.category === 'University Prep' && opportunity.direction === 'University Admissions')) {
    return 'scholarship';
  }
  if (opportunity.direction === 'STEM' || opportunity.direction === 'Programming' || opportunity.direction === 'Science') return 'stem';
  return 'general';
}

const MENTOR_ADVICE: Record<AdviceKind, Record<AppLanguage, string[]>> = {
  'language-test': {
    ru: [
      'Сделай диагностический тест, чтобы увидеть текущий балл и слабые модули.',
      'Составь план подготовки на 6–8 недель: грамматика, лексика, практика по модулям.',
      'Проходи полноформатные практические тесты раз в неделю с разбором ошибок.',
      'Подключи курс Academic English в Mentoria Hub для структурированной базы.',
    ],
    en: [
      'Take a diagnostic test first to see your current score and weak sections.',
      'Build a 6–8 week prep plan covering grammar, vocabulary, and section practice.',
      'Take a full practice test once a week and review every mistake.',
      'Use the Academic English course in Mentoria Hub for a structured foundation.',
    ],
    kz: [
      'Алдымен диагностикалық тест тапсырып, қазіргі балл мен әлсіз тұстарыңды анықта.',
      '6–8 апталық дайындық жоспарын құр: грамматика, сөздік қор, бөлімдер бойынша жаттығу.',
      'Аптасына бір рет толық практикалық тест тапсырып, қателерді талдап отыр.',
      'Mentoria Hub-тағы Academic English курсын негіз ретінде пайдалан.',
    ],
  },
  stem: {
    ru: [
      'Собери небольшое портфолио: проекты, код, эксперименты — что уже сделано.',
      'Проверь, выполняешь ли формальные требования (классы, баллы, отбор).',
      'Возьми один pet-проект и доведи его до конца — это сильнее списка курсов.',
      'Тренируй решение задач: олимпиадные сборники, LeetCode, прошлые туры.',
    ],
    en: [
      'Put together a small portfolio: projects, code, experiments you have already done.',
      'Double-check the formal requirements (grade, scores, qualifying rounds).',
      'Pick one pet project and finish it end-to-end — that beats a list of courses.',
      'Practice problem solving: olympiad archives, LeetCode, past rounds.',
    ],
    kz: [
      'Шағын портфолио жина: жобалар, код, тәжірибелер — нені істегеніңді көрсет.',
      'Формальды талаптарды тексер (сынып, балл, іріктеу кезеңдері).',
      'Бір pet-жобаны таңдап, оны соңына дейін аяқта — бұл курстар тізімінен әлдеқайда күшті.',
      'Есеп шығаруды жаттықтыр: олимпиада жинақтары, LeetCode, өткен турлар.',
    ],
  },
  scholarship: {
    ru: [
      'Начни с мотивационного письма — это решает больше, чем баллы.',
      'Собери документы заранее: справки, транскрипты, рекомендации.',
      'Попроси рекомендательное письмо у учителя минимум за 2 недели до дедлайна.',
      'Поставь себе внутренний дедлайн на неделю раньше официального.',
    ],
    en: [
      'Start with the motivation essay — it often matters more than your scores.',
      'Gather documents early: transcripts, certificates, recommendation letters.',
      'Ask a teacher for a recommendation letter at least 2 weeks before the deadline.',
      'Set yourself an internal deadline one week before the official one.',
    ],
    kz: [
      'Алдымен мотивациялық хаттан баста — ол көбінесе балдан да маңызды.',
      'Құжаттарды ертерек жинай: транскрипттер, сертификаттар, ұсыныс хаттары.',
      'Ұсыныс хатын мұғалімнен дедлайнға дейін кемінде 2 апта бұрын сұра.',
      'Өзіңе ресми дедлайннан бір апта ертерек ішкі мерзім қой.',
    ],
  },
  volunteering: {
    ru: [
      'Определи свою мотивацию — почему именно эта тема важна для тебя.',
      'Зафиксируй конкретный измеримый вклад: часы, людей, проекты.',
      'Веди короткий дневник или фото-отчёт — это станет твоей "impact story".',
      'Будь последовательным: регулярное участие важнее разовой акции.',
    ],
    en: [
      'Be clear on your motivation — why this cause matters to you specifically.',
      'Track a concrete, measurable contribution: hours, people, projects.',
      'Keep a short log or photo journal — it becomes your impact story.',
      'Stay consistent: regular involvement matters more than a one-off event.',
    ],
    kz: [
      'Мотивацияңды анықта — неге дәл осы тақырып сен үшін маңызды.',
      'Нақты, өлшенетін үлесіңді белгіле: сағат, адам саны, жобалар.',
      'Қысқа күнделік немесе фото-есеп жүргіз — бұл сенің impact story-ың болады.',
      'Тұрақты бол: бір реттік шара емес, жүйелі қатысу маңыздырақ.',
    ],
  },
  hackathon: {
    ru: [
      'Собери команду 2–4 человека с разными ролями: код, дизайн, презентация.',
      'Заранее продумай идею и проверь, что прототип реально успеешь собрать.',
      'Сделай рабочее демо, даже минимальное — оно весит больше идеальной идеи.',
      'Подготовь чёткий 2–3 минутный питч и выложи проект на GitHub.',
    ],
    en: [
      'Form a team of 2–4 with different roles: code, design, presentation.',
      'Plan the idea early and make sure the prototype is actually buildable in time.',
      'Ship a working demo, even a minimal one — it beats a perfect idea with no demo.',
      'Prepare a tight 2–3 minute pitch and publish the project on GitHub.',
    ],
    kz: [
      '2–4 адамнан тұратын команда жина: код, дизайн, презентация рөлдерімен.',
      'Идеяны алдын ала ойлап, прототипті уақытында жасап үлгеретініңе көз жеткіз.',
      'Тым болмаса минималды жұмыс істейтін демо жаса — бұл тамаша идеядан да маңызды.',
      '2–3 минуттық қысқа pitch дайындап, жобаны GitHub-қа жүктеп қой.',
    ],
  },
  research: {
    ru: [
      'Сузи тему до конкретного исследовательского вопроса, а не общей области.',
      'Найди потенциального научного руководителя или менторскую группу.',
      'Напиши короткий abstract: проблема, метод, ожидаемый результат.',
      'Зафиксируй методологию заранее — это первое, о чём спросят на интервью.',
    ],
    en: [
      'Narrow your topic down to one specific research question, not a broad field.',
      'Find a potential mentor or research group before applying.',
      'Write a short abstract: the problem, your method, the expected outcome.',
      'Define your methodology early — it is the first thing interviewers ask about.',
    ],
    kz: [
      'Тақырыпты жалпы саладан нақты зерттеу сұрағына дейін тарылт.',
      'Өтінім бермес бұрын ықтимал ғылыми жетекші немесе зерттеу тобын тап.',
      'Қысқа abstract жаз: мәселе, әдіс, күтілетін нәтиже.',
      'Әдістемені алдын ала анықта — сұхбатта бірінші сұрайтын сұрақ осы.',
    ],
  },
  general: {
    ru: [
      'Перечитай требования внимательно и отметь, что уже выполнено.',
      'Собери документы и черновик заявки заранее, не в последний день.',
      'Сохрани возможность и включи Telegram-напоминание о дедлайне.',
      'Если нужна личная стратегия — спроси Настав на странице roadmap.',
    ],
    en: [
      'Re-read the requirements carefully and note what you already meet.',
      'Prepare documents and a draft application early, not on the last day.',
      'Save the opportunity and turn on a Telegram deadline reminder.',
      'For a personal strategy, ask AI Mentor on the roadmap page.',
    ],
    kz: [
      'Талаптарды мұқият оқып, нені орындағаныңды белгіле.',
      'Құжаттар мен өтінім жобасын соңғы күнге қалдырмай ертерек дайында.',
      'Мүмкіндікті сақтап, Telegram дедлайн еске салғышын қос.',
      'Жеке стратегия қажет болса, roadmap бетінде AI тәлімгерден сұра.',
    ],
  },
};

export function getMentorAdvice(opportunity: Opportunity, language: AppLanguage): string[] {
  const kind = classifyAdvice(opportunity);
  return MENTOR_ADVICE[kind][language];
}

export function getCourseWithMentorLessons(courseId: string, mentorLessons: MentorLesson[], courses: Course[] = COURSES): Course | null {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;

  const extraLessons = mentorLessons
    .filter(lesson => lesson.courseId === courseId)
    .map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      content: `${lesson.description}\n\nМини-задание: ${lesson.task}`,
      videoUrl: lesson.videoUrl,
      order: course.lessons.length + index + 1,
    }));

  return {
    ...course,
    lessonCount: course.lessons.length + extraLessons.length,
    lessons: [...course.lessons, ...extraLessons],
  };
}
