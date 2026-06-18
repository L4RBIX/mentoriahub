import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Format, Grade, Opportunity, OpportunityCategory, OpportunityDirection } from '../src/types/mentoria';

const CHANNEL_URL = 'https://t.me/s/mentoria_organization';
const CHANNEL = '@mentoria_organization';
const DEMO_YEAR = 2026;
const RAW_FALLBACK_PATH = path.join(process.cwd(), 'src/lib/data/rawTelegramOpportunities.txt');
const OUTPUT_PATH = path.join(process.cwd(), 'src/lib/data/generated/telegramOpportunities.ts');

interface RawPost {
  id: string;
  text: string;
  urls: string[];
  sourceUrl: string;
}

interface ImportStats {
  source: 'web' | 'fallback-file';
  postsScanned: number;
  opportunitiesImported: number;
  skippedExpired: number;
  skippedInvalid: number;
}

const MONTHS: Record<string, number> = {
  января: 1,
  январь: 1,
  февраля: 2,
  февраль: 2,
  марта: 3,
  март: 3,
  апреля: 4,
  апрель: 4,
  мая: 5,
  май: 5,
  июня: 6,
  июнь: 6,
  июля: 7,
  июль: 7,
  августа: 8,
  август: 8,
  сентября: 9,
  сентябрь: 9,
  октября: 10,
  октябрь: 10,
  ноября: 11,
  ноябрь: 11,
  декабря: 12,
  декабрь: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function decodeHtml(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)));
}

function textFromHtml(html: string): string {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\r/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

function urlsFromHtml(html: string): string[] {
  const urls = new Set<string>();
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const url = decodeHtml(match[1]);
    if (url.startsWith('http')) urls.add(url);
  }
  for (const match of html.matchAll(/https?:\/\/[^\s<>"')]+/g)) {
    urls.add(decodeHtml(match[0]));
  }
  return [...urls].filter(url => !url.includes('telegram.org') && !url.includes('t.me/mentoria_organization'));
}

function extractWebPosts(html: string): RawPost[] {
  const posts: RawPost[] = [];
  const chunks = html.split('<div class="tgme_widget_message_wrap');
  for (const chunk of chunks) {
    const dataPost = chunk.match(/data-post="([^"]+)"/)?.[1];
    const textHtml = chunk.match(/<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    if (!dataPost || !textHtml) continue;

    const text = textFromHtml(textHtml);
    if (!text) continue;

    const postId = dataPost.split('/').pop() ?? dataPost;
    posts.push({
      id: postId,
      text,
      urls: urlsFromHtml(textHtml),
      sourceUrl: `https://t.me/${dataPost}`,
    });
  }
  return posts;
}

function extractFallbackPosts(raw: string): RawPost[] {
  return raw
    .split(/\n-{3,}\n|\n={3,}\n|\n\n(?=\S)/g)
    .map((text, index): RawPost => ({
      id: `manual-${index + 1}`,
      text: text.trim(),
      urls: [...text.matchAll(/https?:\/\/[^\s<>"')]+/g)].map(match => match[0]),
      sourceUrl: CHANNEL_URL,
    }))
    .filter(post => post.text.length > 20);
}

async function loadPosts(): Promise<{ posts: RawPost[]; source: ImportStats['source'] }> {
  try {
    const response = await fetch(CHANNEL_URL, {
      headers: {
        'user-agent': 'Mozilla/5.0 MentoriaHubImporter/1.0',
        accept: 'text/html',
      },
    });
    const html = await response.text();
    if (!response.ok || !html.includes('tgme_widget_message_text')) {
      throw new Error(`Telegram web preview unavailable: ${response.status}`);
    }
    return { posts: extractWebPosts(html), source: 'web' };
  } catch (error) {
    if (!existsSync(RAW_FALLBACK_PATH)) {
      throw new Error([
        `Could not fetch ${CHANNEL_URL}: ${error instanceof Error ? error.message : 'unknown error'}`,
        `Paste copied Telegram posts into ${RAW_FALLBACK_PATH} and run this script again.`,
      ].join('\n'));
    }

    const raw = await readFile(RAW_FALLBACK_PATH, 'utf8');
    return { posts: extractFallbackPosts(raw), source: 'fallback-file' };
  }
}

function candidateScore(text: string, urls: string[]): number {
  const lower = text.toLowerCase();
  const checks = [
    lower.includes('дедлайн'),
    lower.includes('даты работы'),
    lower.includes('registration'),
    lower.includes('registration fee'),
    lower.includes('формат'),
    lower.includes('conference'),
    lower.includes('mun'),
    lower.includes('сертификат'),
    lower.includes('портфолио'),
    lower.includes('олимпиада'),
    lower.includes('конкурс'),
    lower.includes('research'),
    lower.includes('essay'),
    lower.includes('program'),
    lower.includes('стипендия'),
    text.includes('🔗'),
    urls.length > 0 || /https?:\/\//i.test(text),
  ];
  return checks.filter(Boolean).length;
}

function parseDeadline(text: string): string | null {
  const lower = text.toLowerCase();
  const deadlineLine = lower.match(/дедлайн[:\s–—-]*([^\n]+)/i)?.[1] ?? lower;
  const numeric = deadlineLine.match(/(\d{1,2})[./](\d{1,2})(?:[./](20\d{2}))?/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    const year = numeric[3] ? Number(numeric[3]) : DEMO_YEAR;
    return toIsoDate(year, month, day);
  }

  const russian = deadlineLine.match(/(\d{1,2})\s+(января|январь|февраля|февраль|марта|март|апреля|апрель|мая|май|июня|июнь|июля|июль|августа|август|сентября|сентябрь|октября|октябрь|ноября|ноябрь|декабря|декабрь)(?:\s+(20\d{2}))?/i);
  if (russian) {
    const day = Number(russian[1]);
    const month = MONTHS[russian[2].toLowerCase()];
    const year = russian[3] ? Number(russian[3]) : DEMO_YEAR;
    return toIsoDate(year, month, day);
  }

  const english = deadlineLine.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:,?\s+(20\d{2}))?/i);
  if (english) {
    const month = MONTHS[english[1].toLowerCase()];
    const day = Number(english[2]);
    const year = english[3] ? Number(english[3]) : DEMO_YEAR;
    return toIsoDate(year, month, day);
  }

  return null;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (!month || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function parseFormat(text: string): Format {
  const lower = text.toLowerCase();
  if ((/онлайн|online|виртуально|virtual/i.test(lower)) && (/astana|venue|на базе|очно|offline/i.test(lower))) return 'Hybrid';
  if (/hybrid|гибрид|офлайн\s*\+\s*онлайн/i.test(lower)) return 'Hybrid';
  if (/офлайн|offline|очно|очный|на базе|astana/i.test(lower)) return 'Offline';
  if (/онлайн|online|виртуально|virtual|для всех стран/i.test(lower)) return 'Online';
  return 'Online';
}

function parseGrades(text: string): Grade[] {
  const lower = text.toLowerCase();
  if (/8\s*[-–—]\s*11|8-11|школьник|старшекласс/i.test(lower)) return [8, 9, 10, 11];
  const grades = new Set<Grade>();
  for (const match of lower.matchAll(/([8-9]|1[0-2])\s*(?:класс|grade|сынып)/g)) {
    const grade = Number(match[1]) as Grade;
    if ([8, 9, 10, 11, 12].includes(grade)) grades.add(grade);
  }
  return grades.size > 0 ? [...grades] : [8, 9, 10, 11];
}

function classifyCategory(text: string): OpportunityCategory {
  const lower = text.toLowerCase();
  if (/стипенд|scholarship|grant/.test(lower)) return 'Scholarship';
  if (/олимпиад|olympiad/.test(lower)) return 'Olympiad';
  if (/хакатон|hackathon/.test(lower)) return 'Hackathon';
  if (/research|исследован|лаборатор/.test(lower)) return 'Research';
  if (/волонт|volunteer/.test(lower)) return 'Volunteering';
  if (/стажиров|internship/.test(lower)) return 'Internship';
  if (/mobilograph|мобилограф|designer|дизайнер|hiring/.test(lower)) return 'Internship';
  if (/summer|лагерь|школа|camp/.test(lower)) return 'Summer School';
  return 'University Prep';
}

function classifyDirection(text: string): OpportunityDirection {
  const lower = text.toLowerCase();
  if (/mun|un women|human rights|unesco|ecosoc|political|international relations/.test(lower)) return 'Social Impact';
  if (/programming|coding|it|computer|информат|программ|python|\bai\b|data/.test(lower)) return 'Programming';
  if (/english|ielts|toefl|sat|essay|английск|эссе/.test(lower)) return 'English';
  if (/business|startup|entrepreneur|бизнес|стартап/.test(lower)) return 'Business';
  if (/finance|финанс|эконом/.test(lower)) return 'Finance';
  if (/volunteer|social|impact|волонт|социаль/.test(lower)) return 'Social Impact';
  if (/science|research|biology|physics|chemistry|наука|исследован/.test(lower)) return 'Science';
  if (/university|admission|стипенд|поступлен|college/.test(lower)) return 'University Admissions';
  return 'STEM';
}

function makeTitle(text: string): string {
  const lines = text
    .split('\n')
    .map(line => line.replace(/^[^\p{L}\p{N}]+/u, '').trim())
    .filter(Boolean)
    .filter(line => !/^(дедлайн|формат|стоимость|взнос|бесплатно|платно|подробнее|регистрация|ссылка)[:\s]/i.test(line));

  const preferred = lines.find(line => line.length >= 8 && line.length <= 90) ?? lines[0] ?? 'Mentoria opportunity';
  return preferred.replace(/\s+/g, ' ').slice(0, 120);
}

function makeDescription(text: string): string {
  const cleaned = text
    .replace(/https?:\/\/[^\s<>"')]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned.length > 700 ? `${cleaned.slice(0, 697).trim()}...` : cleaned;
}

function makeTags(text: string, category: OpportunityCategory, direction: OpportunityDirection): string[] {
  const lower = text.toLowerCase();
  const tags = new Set<string>(['Telegram', category, direction]);
  if (/бесплатно|free/.test(lower)) tags.add('бесплатно');
  if (/платно|взнос|fee/.test(lower)) tags.add('платно');
  if (/для всех стран|international|международ/.test(lower)) tags.add('international');
  if (/essay|эссе/.test(lower)) tags.add('essay');
  if (/research|исследован/.test(lower)) tags.add('research');
  if (/online|онлайн|виртуально/.test(lower)) tags.add('online');
  return [...tags].slice(0, 10);
}

function officialUrl(post: RawPost): string | undefined {
  return post.urls.find(url => !url.includes('t.me/')) ?? post.urls[0];
}

function parseOpportunity(post: RawPost): Opportunity | null {
  if (candidateScore(post.text, post.urls) < 2) return null;
  const deadline = parseDeadline(post.text);
  if (!deadline) return null;

  const category = classifyCategory(post.text);
  const direction = classifyDirection(post.text);
  const title = makeTitle(post.text);
  const url = officialUrl(post);

  return {
    id: `telegram-mentoria-${post.id}`,
    title,
    category,
    direction,
    grades: parseGrades(post.text),
    format: parseFormat(post.text),
    deadline,
    description: makeDescription(post.text),
    requirements: [
      `Источник: ${CHANNEL}`,
      post.text.toLowerCase().includes('бесплатно') ? 'Стоимость: бесплатно' : post.text.toLowerCase().includes('платно') || post.text.toLowerCase().includes('взнос') ? 'Стоимость: проверь условия участия' : 'Проверь требования на официальной странице',
    ],
    tags: makeTags(post.text, category, direction),
    applyUrl: url,
    websiteUrl: url,
    source: 'telegram',
    sourceLabel: 'Telegram',
    sourceChannel: CHANNEL,
    sourceUrl: post.sourceUrl,
  };
}

function isExpired(deadline: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(deadline);
  date.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

function uniqueById(opportunities: Opportunity[]): Opportunity[] {
  const seen = new Set<string>();
  return opportunities.filter(opportunity => {
    if (seen.has(opportunity.id)) return false;
    seen.add(opportunity.id);
    return true;
  });
}

function renderTs(opportunities: Opportunity[], stats: ImportStats): string {
  return `import type { Opportunity } from '@/types/mentoria';\n\n` +
    `export const TELEGRAM_IMPORT_STATS = ${JSON.stringify(stats, null, 2)} as const;\n\n` +
    `export const TELEGRAM_OPPORTUNITIES: Opportunity[] = ${JSON.stringify(opportunities, null, 2)};\n`;
}

async function main() {
  const { posts, source } = await loadPosts();
  let skippedExpired = 0;
  let skippedInvalid = 0;
  const parsed: Opportunity[] = [];

  for (const post of posts) {
    const opportunity = parseOpportunity(post);
    if (!opportunity) {
      skippedInvalid += 1;
      continue;
    }
    if (isExpired(opportunity.deadline)) {
      skippedExpired += 1;
      continue;
    }
    parsed.push(opportunity);
  }

  const opportunities = uniqueById(parsed);
  const stats: ImportStats = {
    source,
    postsScanned: posts.length,
    opportunitiesImported: opportunities.length,
    skippedExpired,
    skippedInvalid,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, renderTs(opportunities, stats), 'utf8');
  console.log(JSON.stringify(stats, null, 2));
}

await main();
