import type { StudentProfile, Roadmap, RoadmapStep } from '@/types/mentoria';
import { getProfileGoals, profileFingerprint, profileGoalsText } from '@/lib/profile';

function uid() { return Math.random().toString(36).slice(2, 9); }

const GOAL_TITLES: Record<string, string> = {
  'Top university admission': 'Путь в топ-университет',
  'Olympiad preparation': 'Олимпиадный чемпион',
  'IELTS/SAT': 'Мастер международных тестов',
  'Build portfolio': 'Портфолио лидера',
  'Leadership & volunteering': 'Лидер изменений',
  'Entrepreneurship': 'Предприниматель будущего',
};

export function generateFallbackRoadmap(profile: StudentProfile): Roadmap {
  const { grade, interests, goal, name } = profile;
  const goals = getProfileGoals(profile);
  const isUpper = grade >= 10;
  const gradeTrack =
    grade === 8 ? 'подготовка к 9 классу' :
    grade === 9 ? '9→10 roadmap' :
    grade === 10 ? '10→11 roadmap' :
    grade === 11 ? 'admissions/final-year roadmap' :
    '12 / Gap / Applications roadmap';
  const steps: RoadmapStep[] = [];

  const coursesForInterests: Record<string, string[]> = {
    'English': ['course-english'],
    'University Admissions': ['course-uni', 'course-english'],
    'Programming': ['course-cs'],
    'STEM': ['course-cs'],
    'Science': ['course-cs'],
    'Business': ['course-uni'],
    'Finance': ['course-uni'],
    'Social Impact': ['course-uni'],
  };

  const oppsByInterest: Record<string, string[]> = {
    'STEM': ['opp-1', 'opp-7'],
    'Programming': ['opp-2', 'opp-11', 'opp-12'],
    'English': ['opp-3'],
    'Social Impact': ['opp-4', 'opp-9'],
    'Science': ['opp-5'],
    'Business': ['opp-6'],
    'Finance': ['opp-8'],
    'University Admissions': ['opp-10', 'opp-3'],
  };

  const foundationCourses = [...new Set(interests.slice(0, 3).flatMap(i => coursesForInterests[i] ?? []))].slice(0, 2);
  const relevantOpps = [...new Set(interests.slice(0, 2).flatMap(i => oppsByInterest[i] ?? []))].slice(0, 3);

  steps.push({
    id: uid(),
    title: `Фундамент: ${gradeTrack}`,
    description: 'Начни с курсов, соответствующих твоим целям, и зафиксируй ближайшие дедлайны. Прочная база по предметам, английскому и регулярный учебный ритм нужны для сильного портфолио.',
    timeframe: 'Сейчас – 2 месяца',
    opportunityIds: [],
    courseIds: foundationCourses,
    deadline: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
  });

  steps.push({
    id: uid(),
    title: 'Первый опыт: подай заявку на программу',
    description: 'Реальный опыт участия в конкурсах и программах ценнее любой оценки. Выбери одну возможность, сохрани её, включи Telegram reminder и начни готовить требования.',
    timeframe: '1–3 месяца',
    opportunityIds: relevantOpps.slice(0, 2),
    courseIds: [],
    deadline: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  });

  steps.push({
    id: uid(),
    title: isUpper ? 'Портфолио достижений' : 'Углубление в нишу',
    description: isUpper
      ? 'Для 10-11 класса важны конкретные результаты. Завершай курсы, участвуй в конкурсах, собирай портфолио, рекомендации и список дедлайнов.'
      : 'Сосредоточься на 1-2 направлениях. Качество важнее количества: один проект, один курс и одна возможность с понятным дедлайном.',
    timeframe: '3–6 месяцев',
    opportunityIds: relevantOpps.slice(1),
    courseIds: foundationCourses.slice(1),
    deadline: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  });

  const step4: RoadmapStep = {
    id: uid(),
    title: goals.includes('Olympiad preparation') ? 'Олимпиадный трек' :
           (goals.includes('Top university admission') || goals.includes('IELTS/SAT')) ? 'Подготовка к поступлению' : 'Финальный рывок',
    description: goals.includes('Olympiad preparation')
      ? 'Систематически решай задачи, участвуй в тренировочных олимпиадах и работай с ментором.'
      : (goals.includes('Top university admission') || goals.includes('IELTS/SAT'))
        ? 'Сдай стандартизированные тесты (IELTS/SAT), напиши мотивационные письма, собери документы, рекомендации и финальный deadline calendar.'
        : 'Подведи итоги, обнови резюме и портфолио. Готовься к следующему уровню.',
    timeframe: '6–12 месяцев',
    opportunityIds: goals.includes('Olympiad preparation') ? ['opp-1', 'opp-12'] : ['opp-10', 'opp-3'],
    courseIds: goals.includes('Top university admission') ? ['course-uni', 'course-english'] : foundationCourses.slice(0, 1),
    deadline: new Date(Date.now() + 300 * 86400000).toISOString().split('T')[0],
  };
  steps.push(step4);

  return {
    title: `${GOAL_TITLES[goal] ?? 'Персональная дорожная карта'} — ${name}`,
    summary: `Персональная дорожная карта для ученика ${grade} класса (${gradeTrack}). Интересы: ${interests.slice(0, 2).join(', ')}. План связывает курсы, возможности, дедлайны, портфолио и test prep.`,
    steps: steps.map((s, i) => ({
      ...s,
      type: (i === 0 ? 'course' : i === steps.length - 1 ? 'milestone' : 'opportunity') as 'course' | 'opportunity' | 'milestone',
      reason: `Этот шаг выбран на основе твоего интереса к ${interests[0] ?? 'обучению'} и целей «${profileGoalsText(profile)}».`,
      nextAction: s.courseIds?.length
        ? `Открой курс "${s.courseIds[0]}" в разделе Курсы и пройди первый урок.`
        : s.opportunityIds?.length
          ? `Изучи требования программы и начни готовить заявку.`
          : `Отметь шаг выполненным, когда достигнешь результата.`,
    })),
    recommendedOpportunities: relevantOpps,
    recommendedCourses: foundationCourses,
    generatedAt: new Date().toISOString(),
    source: 'fallback' as const,
    profileSnapshot: profileFingerprint(profile),
  };
}
