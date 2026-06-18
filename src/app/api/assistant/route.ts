import { NextRequest, NextResponse } from 'next/server';
import { isAppLanguage } from '@/lib/i18n';
import { profileGoalsText } from '@/lib/profile';
import type { AppLanguage, StudentProfile, Roadmap, Opportunity, Course } from '@/types/mentoria';

interface RequestBody {
  message: string;
  language?: string;
  /** The immediately preceding user message in this chat session, if any.
   * Used only to resolve language for ambiguous follow-ups like "ok" / "да". */
  previousUserMessage?: string;
  profile: StudentProfile | null;
  roadmap: Roadmap | null;
  savedOpportunities: Opportunity[];
  courses: Course[];
  opportunities: Opportunity[];
}

interface SuggestedAction {
  label: string;
  href: string;
}

interface AssistantResponse {
  answer: string;
  suggestedActions: SuggestedAction[];
  responseLanguage: AppLanguage;
}

interface ErrorResponse {
  error: string;
  details?: string;
  responseLanguage: AppLanguage;
}

interface DeepSeekParsed {
  answer?: string;
  suggestedActions?: SuggestedAction[];
}

const ALLOWED_ACTION_HREFS = new Set([
  '/roadmap',
  '/opportunities',
  '/courses',
  '/dashboard',
  '/courses/course-english',
  '/courses/course-cs',
  '/courses/course-uni',
  '/onboarding',
]);

function sanitizeSuggestedActions(actions: SuggestedAction[] | undefined): SuggestedAction[] {
  if (!Array.isArray(actions)) return [];

  return actions
    .filter(action => action.label?.trim() && ALLOWED_ACTION_HREFS.has(action.href))
    .slice(0, 3)
    .map(action => ({
      label: action.label.trim().slice(0, 32),
      href: action.href,
    }));
}

function recoverAnswerFromMalformedJson(text: string): string | null {
  const answerIndex = text.indexOf('"answer"');
  if (answerIndex === -1) return null;

  const colonIndex = text.indexOf(':', answerIndex);
  if (colonIndex === -1) return null;

  const firstQuoteIndex = text.indexOf('"', colonIndex + 1);
  if (firstQuoteIndex === -1) return null;

  let answer = '';
  let escaped = false;
  for (let i = firstQuoteIndex + 1; i < text.length; i += 1) {
    const char = text[i];

    if (escaped) {
      answer += char === 'n' ? '\n' : char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') break;
    answer += char;
  }

  const trimmed = answer.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDeepSeekContent(content: string, responseLanguage: AppLanguage): AssistantResponse {
  const text = content.trim();
  if (!text) throw new Error('Empty DeepSeek answer');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      answer: text,
      suggestedActions: [],
      responseLanguage,
    };
  }

  let parsed: DeepSeekParsed;
  try {
    parsed = JSON.parse(jsonMatch[0]) as DeepSeekParsed;
  } catch {
    const recoveredAnswer = recoverAnswerFromMalformedJson(text);
    if (!recoveredAnswer) throw new Error('Invalid DeepSeek response');

    return {
      answer: recoveredAnswer,
      suggestedActions: [],
      responseLanguage,
    };
  }

  if (!parsed.answer?.trim()) throw new Error('Empty DeepSeek answer');

  return {
    answer: parsed.answer.trim(),
    suggestedActions: sanitizeSuggestedActions(parsed.suggestedActions),
    responseLanguage,
  };
}

// --- Message-language detection -------------------------------------------
// The assistant must answer in the language the student actually wrote in,
// not blindly in the site's UI language. UI language is only a fallback for
// ambiguous/short messages (greetings-only aside — "hi"/"hello" are real
// English words and detect normally).

const KAZAKH_LETTERS = /[әғқңөұүіһ]/i;
const CYRILLIC_LETTERS = /[а-яё]/i;
const LATIN_LETTERS = /[a-z]/i;

// Short acknowledgement / filler words that carry no reliable language signal
// on their own (e.g. "ok" is used interchangeably in RU/EN/KZ chat slang).
const AMBIGUOUS_TOKENS = new Set([
  'да', 'нет', 'ок', 'окей', 'угу', 'ага', 'хорошо', 'ясно', 'понятно', 'и что', 'а дальше', 'дальше',
  'yes', 'no', 'ok', 'okay', 'yep', 'nope', 'sure', 'cool', 'fine', 'thanks', 'thx', 'and then', 'what next',
  'жоқ', 'ия', 'жарайды', 'түсінікті', 'дұрыс', 'содан кейін',
]);

function isAmbiguousMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase().replace(/[?!.,]/g, '').trim();
  if (!normalized) return true;
  if (AMBIGUOUS_TOKENS.has(normalized)) return true;
  // A 1-2 character message with no real letters (emoji, punctuation-only, etc.)
  if (normalized.length <= 2 && !/^[a-z]+$/i.test(normalized) && !KAZAKH_LETTERS.test(normalized) && !CYRILLIC_LETTERS.test(normalized)) return true;
  return false;
}

function detectScriptLanguage(message: string): AppLanguage | null {
  if (KAZAKH_LETTERS.test(message)) return 'kz';
  if (CYRILLIC_LETTERS.test(message)) return 'ru';
  if (LATIN_LETTERS.test(message)) return 'en';
  return null;
}

export function detectMessageLanguage(
  message: string,
  fallbackLanguage: AppLanguage,
  previousUserMessage?: string,
): AppLanguage {
  const trimmed = message.trim();
  if (!trimmed) return fallbackLanguage;

  if (isAmbiguousMessage(trimmed)) {
    // Ambiguous follow-up ("ok", "да", "и что?") — try the previous user
    // message in this session before giving up to the UI-language fallback.
    const prevTrimmed = previousUserMessage?.trim();
    if (prevTrimmed && !isAmbiguousMessage(prevTrimmed)) {
      const prevDetected = detectScriptLanguage(prevTrimmed);
      if (prevDetected) return prevDetected;
    }
    return fallbackLanguage;
  }

  return detectScriptLanguage(trimmed) ?? fallbackLanguage;
}

function buildLanguageInstruction(responseLanguage: AppLanguage, uiLanguage: AppLanguage): string {
  const header = `LANGUAGE:
Detected message language (responseLanguage): ${responseLanguage}
UI language (uiLanguage): ${uiLanguage}
Answer in responseLanguage — the detected language of the student's latest message. uiLanguage is only a fallback used when the message language was unclear; it does NOT override a clearly detected message language.`;

  if (responseLanguage === 'en') {
    return `${header}
Respond ONLY in English. Do not answer in Russian, even if the student's message was in Russian or mixed — unless you are directly quoting the student's own text. Use natural, product-appropriate English: "AI Mentor", "Roadmap", "Opportunities", "Courses".`;
  }

  if (responseLanguage === 'kz') {
    return `${header}
Respond ONLY in Kazakh. Use simple, clear, student-friendly Kazakh. Do not mix in Russian, except brand/exam names that have no Kazakh form (Mentoria Hub, SAT, IELTS, Telegram). Use: "AI тәлімгер", "жол картасы", "мүмкіндіктер", "курстар".`;
  }

  return `${header}
Отвечай ТОЛЬКО на русском языке. Используй естественный русский продуктовый язык: «Настав», «дорожная карта», «возможности», «курсы».`;
}

function buildSystemPrompt(
  profile: StudentProfile | null,
  roadmap: Roadmap | null,
  savedOpportunities: Opportunity[],
  courses: Course[],
  opportunities: Opportunity[],
  responseLanguage: AppLanguage,
  uiLanguage: AppLanguage,
): string {
  const profileInfo = profile
    ? `Ученик: ${profile.name}, ${profile.grade} класс. Интересы: ${profile.interests.join(', ')}. Любимые предметы: ${profile.subjects.join(', ') || 'не указаны'}. Цели: ${profileGoalsText(profile)}.`
    : 'Профиль не заполнен — посоветуй начать онбординг';

  const roadmapInfo =
    roadmap && roadmap.steps.length > 0
      ? `Дорожная карта: ${roadmap.steps
          .slice(0, 5)
          .map((s, i) => `${i + 1}) ${s.title}${s.completed ? ' ✓' : ''}${s.nextAction ? ` — ${s.nextAction}` : ''}`)
          .join('; ')}`
      : 'Дорожная карта не создана';

  const savedInfo =
    savedOpportunities.length > 0
      ? `Сохранённые возможности: ${savedOpportunities.map(o => `${o.title} (дедлайн ${o.deadline})`).slice(0, 5).join('; ')}`
      : 'Возможности не сохранены';

  const coursesInfo =
    courses.length > 0
      ? `Курсы в Mentoria Hub: ${courses
          .slice(0, 6)
          .map(c => `${c.id}: ${c.title}; теги ${c.tags.join(', ')}; ${c.estimatedHours} ч.`)
          .join(' | ')}`
      : 'Курсы не переданы';

  const opportunitiesInfo =
    opportunities.length > 0
      ? `Возможности в каталоге: ${opportunities
          .slice(0, 12)
          .map(o => `${o.id}: ${o.title}; направление ${o.direction}; дедлайн ${o.deadline}; теги ${o.tags.join(', ')}`)
          .join(' | ')}`
      : 'Возможности не переданы';

  const languageInstruction = buildLanguageInstruction(responseLanguage, uiLanguage);

  return `Ты — «Настав», единый AI-наставник Mentoria Hub для казахстанских школьников 8–11 классов. Отвечай кратко, конкретно и по вопросу. Обычно 2–4 предложения.

${languageInstruction}
Это правило языка имеет наивысший приоритет в этом промпте.

Контекст:
${profileInfo}
${roadmapInfo}
${savedInfo}
${coursesInfo}
${opportunitiesInfo}

Правила качества:
- Не упоминай DeepSeek, провайдера, fallback, demo, offline или внутреннюю реализацию.
- Используй профиль, roadmap, сохранённые возможности, курсы и каталог возможностей.
- Если спрашивают про SAT — отвечай про SAT, не переключайся на IELTS.
- Если спрашивают про IELTS — отвечай про IELTS, не переключайся на SAT.
- Если спрашивают про Stanford, MIT, Ivy League или топ-университеты — говори про академическую базу, English/SAT/IELTS prep, портфолио, проекты, extracurriculars, эссе, рекомендации и дедлайны.
- Если спрашивают про возможности — выбери 1–2 релевантные возможности из каталога. Не придумывай новые названия.
- Если спрашивают про курсы — рекомендуй конкретный курс из Mentoria Hub.
- Если спрашивают "что делать" — дай план действий внутри Mentoria Hub: открыть курс, проверить roadmap, сохранить возможность, включить Telegram-напоминание.
- Не выдумывай точные внешние дедлайны, если их нет в предоставленном каталоге.
- Не обещай гарантированное поступление, балл или результат.

Верни ТОЛЬКО валидный JSON без markdown. Текст внутри "answer" и "label" должен быть на языке, указанном в LANGUAGE выше:
{"answer":"текст ответа","suggestedActions":[{"label":"Название","href":"/маршрут"}]}

Допустимые href: /roadmap, /opportunities, /courses, /dashboard, /courses/course-english, /courses/course-cs, /courses/course-uni, /onboarding
Максимум 3 действия. Если нет — пустой массив.`;
}

function errorResponse(error: string, status: number, responseLanguage: AppLanguage, details?: string) {
  const body: ErrorResponse = details ? { error, details, responseLanguage } : { error, responseLanguage };
  return NextResponse.json(body, { status });
}

function fallbackAssistantResponse(
  responseLanguage: AppLanguage,
  profile: StudentProfile | null,
  roadmap: Roadmap | null,
): AssistantResponse {
  if (responseLanguage === 'en') {
    return {
      answer: profile
        ? `Start with one concrete step this week: update your roadmap, pick one saved opportunity, and prepare its requirements before the deadline. Based on your grade ${profile.grade} profile, the strongest next move is to combine a course with one portfolio-building action.`
        : 'Start by completing onboarding so Mentoria Hub can build your roadmap. Then save one opportunity, choose one course, and set up Telegram reminders for deadlines.',
      suggestedActions: [
        { label: roadmap ? 'Open Roadmap' : 'Start Onboarding', href: roadmap ? '/roadmap' : '/onboarding' },
        { label: 'Find Opportunities', href: '/opportunities' },
      ],
      responseLanguage,
    };
  }

  if (responseLanguage === 'kz') {
    return {
      answer: profile
        ? `Осы аптаға бір нақты қадам таңдаңыз: жол картасын ашып, бір сақталған мүмкіндіктің талаптарын дедлайнға дейін дайындаңыз. ${profile.grade}-сынып профилі үшін курс пен портфолиоға арналған бір әрекетті бірге жүргізу тиімді.`
        : 'Алдымен onboarding өтіп, Mentoria Hub сізге жеке жол картасын құрсын. Содан кейін бір мүмкіндікті сақтап, бір курсты таңдаңыз және Telegram еске салғышын қосыңыз.',
      suggestedActions: [
        { label: roadmap ? 'Жол картасы' : 'Onboarding', href: roadmap ? '/roadmap' : '/onboarding' },
        { label: 'Мүмкіндіктер', href: '/opportunities' },
      ],
      responseLanguage,
    };
  }

  return {
    answer: profile
      ? `На этой неделе выбери один конкретный шаг: открой дорожную карту, возьми одну сохранённую возможность и подготовь её требования до дедлайна. Для профиля ${profile.grade} класса сильный следующий ход — связать курс с одним действием для портфолио.`
      : 'Сначала пройди onboarding, чтобы Mentoria Hub собрал личную дорожную карту. Затем сохрани одну возможность, выбери один курс и включи Telegram-напоминания по дедлайнам.',
    suggestedActions: [
      { label: roadmap ? 'Открыть roadmap' : 'Начать onboarding', href: roadmap ? '/roadmap' : '/onboarding' },
      { label: 'Возможности', href: '/opportunities' },
    ],
    responseLanguage,
  };
}

function getSafeErrorReason(err: unknown): string {
  if (err instanceof DOMException && err.name === 'TimeoutError') {
    return 'Request timed out';
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message.slice(0, 160);
  }

  return 'Unknown error';
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    message,
    language: rawLanguage,
    previousUserMessage,
    profile,
    roadmap,
    savedOpportunities = [],
    courses = [],
    opportunities = [],
  } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const uiLanguage: AppLanguage = isAppLanguage(rawLanguage) ? rawLanguage : 'ru';
  const responseLanguage = detectMessageLanguage(message, uiLanguage, previousUserMessage);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
  const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';

  console.info(`[assistant] hasKey: ${Boolean(apiKey)}`);
  console.info(`[assistant] model: ${model}`);
  console.info(`[assistant] baseUrl: ${baseUrl}`);
  console.info(`[assistant] uiLanguage: ${uiLanguage}`);
  console.info(`[assistant] responseLanguage: ${responseLanguage}`);

  if (!apiKey) {
    console.warn('[assistant] DeepSeek API key is missing; returning safe fallback response');
    return NextResponse.json(fallbackAssistantResponse(responseLanguage, profile, roadmap));
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt(profile, roadmap, savedOpportunities, courses, opportunities, responseLanguage, uiLanguage) },
          { role: 'user', content: message },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.35,
        max_tokens: 900,
      }),
      signal: AbortSignal.timeout(12000),
    });

    console.info(`[assistant] DeepSeek status: ${res.status}`);

    if (!res.ok) {
      const details = `HTTP ${res.status}`;
      console.error(`[assistant] error: ${details}`);
      return errorResponse('DeepSeek request failed', 502, responseLanguage, details);
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? '';
    return NextResponse.json(parseDeepSeekContent(text, responseLanguage));
  } catch (err) {
    const details = getSafeErrorReason(err);
    console.error(`[assistant] error: ${details}`);
    return errorResponse('DeepSeek request failed', 502, responseLanguage, details);
  }
}
