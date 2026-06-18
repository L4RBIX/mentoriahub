import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AppLanguage } from '@/types/mentoria';
import { getAppUrl } from '@/lib/server/appUrl';
import { isSupabaseConfigured, supabaseRest } from '@/lib/server/supabaseRest';

export interface TelegramChat {
  id: number | string;
  username?: string;
  first_name?: string;
}

export interface StoredTelegramReminder {
  id: string;
  telegram_chat_id: string;
  title: string;
  deadline: string | null;
  category: string | null;
  opportunity_id: string | null;
  lang: AppLanguage | null;
  app_url: string | null;
  status: 'scheduled' | 'sent' | 'failed';
}

interface TelegramLinkRecord {
  id: string;
  userId: string;
  token: string;
  chatId?: string;
  telegramUsername?: string;
  firstName?: string;
  language?: AppLanguage;
  status: 'pending' | 'connected';
  createdAt: string;
  connectedAt?: string;
}

interface SupabaseTelegramLink {
  id: string;
  user_id: string | null;
  client_user_key: string | null;
  link_code: string;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  telegram_first_name: string | null;
  language: AppLanguage | null;
  status: 'pending' | 'connected';
  created_at: string;
  linked_at: string | null;
}

interface SupabaseTelegramReminder {
  id: string;
  user_id: string | null;
  client_user_key: string | null;
  telegram_chat_id: string;
  opportunity_id: string | null;
  title: string;
  deadline: string | null;
  category: string | null;
  remind_at: string | null;
  status: 'scheduled' | 'sent' | 'failed';
  lang: AppLanguage | null;
  app_url: string | null;
  created_at: string;
  sent_at: string | null;
}

interface TelegramLinksFile {
  links: TelegramLinkRecord[];
}

export interface CreateReminderInput {
  userId?: string;
  chatId: string;
  opportunityId?: string;
  title: string;
  deadline?: string;
  deadlineDate?: string;
  category?: string;
  lang?: AppLanguage;
  appUrl?: string;
}

const LINK_TTL_MS = 15 * 60 * 1000;
const STORE_PATH = path.join(process.cwd(), '.tmp', 'telegram-links.json');

function makeToken(): string {
  return randomBytes(12).toString('base64url');
}

function makeId(): string {
  return `tl_${randomBytes(8).toString('hex')}`;
}

function isUuid(value: string | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function userFields(userId: string | undefined) {
  return {
    user_id: isUuid(userId) ? userId : null,
    client_user_key: userId ?? null,
  };
}

function sanitizeLanguage(language: AppLanguage | undefined | null): AppLanguage {
  return language === 'en' || language === 'kz' || language === 'ru' ? language : 'ru';
}

function shouldUseLocalStore(): boolean {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== 'production';
}

function assertPersistentStoreConfigured(): void {
  if (!shouldUseLocalStore() && !isSupabaseConfigured()) {
    throw new Error('Supabase is required for Telegram linking in production.');
  }
}

async function readStore(): Promise<TelegramLinksFile> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as TelegramLinksFile;
  } catch {
    return { links: [] };
  }
}

async function writeStore(store: TelegramLinksFile): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function pruneExpired(records: TelegramLinkRecord[]): TelegramLinkRecord[] {
  const now = Date.now();
  return records.filter(record => {
    if (record.status === 'connected') return true;
    return now - new Date(record.createdAt).getTime() <= LINK_TTL_MS;
  });
}

function botUrlFor(code: string): string {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    throw new Error('TELEGRAM_BOT_USERNAME is missing');
  }
  return `https://t.me/${botUsername.replace(/^@/, '')}?start=${code}`;
}

function reminderDate(deadlineDate: string | undefined): { deadline: string | null; remindAt: string | null } {
  if (!deadlineDate) return { deadline: null, remindAt: null };
  const deadline = new Date(deadlineDate);
  if (Number.isNaN(deadline.getTime())) return { deadline: null, remindAt: null };

  const remindAt = new Date(deadline);
  remindAt.setUTCDate(remindAt.getUTCDate() - 3);
  remindAt.setUTCHours(9, 0, 0, 0);

  return {
    deadline: deadline.toISOString().slice(0, 10),
    remindAt: remindAt.toISOString(),
  };
}

function toStoredReminder(record: SupabaseTelegramReminder): StoredTelegramReminder {
  return {
    id: record.id,
    telegram_chat_id: record.telegram_chat_id,
    title: record.title,
    deadline: record.deadline,
    category: record.category,
    opportunity_id: record.opportunity_id,
    lang: record.lang,
    app_url: record.app_url,
    status: record.status,
  };
}

export async function createTelegramLink(
  userId: string,
  language: AppLanguage = 'ru',
): Promise<{ code: string; token: string; botUrl: string }> {
  assertPersistentStoreConfigured();
  const code = makeToken();

  if (isSupabaseConfigured()) {
    await supabaseRest<SupabaseTelegramLink[]>('telegram_links', {
      method: 'POST',
      body: {
        ...userFields(userId),
        link_code: code,
        language: sanitizeLanguage(language),
        status: 'pending',
      },
      prefer: 'return=representation',
    });

    return { code, token: code, botUrl: botUrlFor(code) };
  }

  const store = await readStore();
  const links = pruneExpired(store.links);
  links.push({
    id: makeId(),
    userId,
    token: code,
    language,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  await writeStore({ links });

  return { code, token: code, botUrl: botUrlFor(code) };
}

export async function connectTelegramToken(code: string, chat: TelegramChat): Promise<AppLanguage> {
  assertPersistentStoreConfigured();

  if (isSupabaseConfigured()) {
    const records = await supabaseRest<SupabaseTelegramLink[]>('telegram_links', {
      query: {
        link_code: `eq.${code}`,
        select: 'id,language,status',
        limit: '1',
      },
    });

    const record = records[0];
    if (!record || record.status !== 'pending') {
      throw new Error('Telegram link code is invalid or expired');
    }

    await supabaseRest<SupabaseTelegramLink[]>('telegram_links', {
      method: 'PATCH',
      query: {
        id: `eq.${record.id}`,
      },
      body: {
        telegram_chat_id: String(chat.id),
        telegram_username: chat.username ?? null,
        telegram_first_name: chat.first_name ?? null,
        status: 'connected',
        linked_at: new Date().toISOString(),
      },
      prefer: 'return=representation',
    });

    return sanitizeLanguage(record.language);
  }

  const store = await readStore();
  const links = pruneExpired(store.links);
  const index = links.findIndex(record => record.token === code);
  if (index === -1) {
    throw new Error('Telegram link code is invalid or expired');
  }

  const language = links[index].language ?? 'ru';
  links[index] = {
    ...links[index],
    chatId: String(chat.id),
    telegramUsername: chat.username,
    firstName: chat.first_name,
    status: 'connected',
    connectedAt: new Date().toISOString(),
  };

  await writeStore({ links });
  return language;
}

export async function getTelegramStatus(userId: string): Promise<{ connected: boolean; username?: string }> {
  assertPersistentStoreConfigured();

  if (isSupabaseConfigured()) {
    const fields = userFields(userId);
    const query = fields.user_id
      ? { user_id: `eq.${fields.user_id}` }
      : { client_user_key: `eq.${fields.client_user_key}` };
    const records = await supabaseRest<SupabaseTelegramLink[]>('telegram_links', {
      query: {
        ...query,
        status: 'eq.connected',
        telegram_chat_id: 'not.is.null',
        select: 'telegram_username,telegram_first_name,linked_at',
        order: 'linked_at.desc',
        limit: '1',
      },
    });

    const record = records[0];
    return {
      connected: !!record,
      username: record?.telegram_username ?? record?.telegram_first_name ?? undefined,
    };
  }

  const store = await readStore();
  const links = pruneExpired(store.links);
  const record = [...links].reverse().find(item => item.userId === userId && item.status === 'connected' && item.chatId);
  if (links.length !== store.links.length) {
    await writeStore({ links });
  }

  return {
    connected: !!record,
    username: record?.telegramUsername ?? record?.firstName,
  };
}

export async function getTelegramStatusByCode(code: string): Promise<{ connected: boolean; username?: string }> {
  assertPersistentStoreConfigured();

  if (isSupabaseConfigured()) {
    const records = await supabaseRest<SupabaseTelegramLink[]>('telegram_links', {
      query: {
        link_code: `eq.${code}`,
        select: 'telegram_username,telegram_first_name,status',
        limit: '1',
      },
    });

    const record = records[0];
    return {
      connected: record?.status === 'connected',
      username: record?.telegram_username ?? record?.telegram_first_name ?? undefined,
    };
  }

  const store = await readStore();
  const links = pruneExpired(store.links);
  const record = links.find(item => item.token === code);
  return {
    connected: record?.status === 'connected',
    username: record?.telegramUsername ?? record?.firstName,
  };
}

export async function getTelegramChatId(userId: string): Promise<string | null> {
  assertPersistentStoreConfigured();

  if (isSupabaseConfigured()) {
    const fields = userFields(userId);
    const query = fields.user_id
      ? { user_id: `eq.${fields.user_id}` }
      : { client_user_key: `eq.${fields.client_user_key}` };
    const records = await supabaseRest<SupabaseTelegramLink[]>('telegram_links', {
      query: {
        ...query,
        status: 'eq.connected',
        telegram_chat_id: 'not.is.null',
        select: 'telegram_chat_id,linked_at',
        order: 'linked_at.desc',
        limit: '1',
      },
    });

    return records[0]?.telegram_chat_id ?? null;
  }

  const store = await readStore();
  const links = pruneExpired(store.links);
  const record = [...links].reverse().find(item => item.userId === userId && item.status === 'connected' && item.chatId);
  if (links.length !== store.links.length) {
    await writeStore({ links });
  }

  return record?.chatId ?? null;
}

export async function createTelegramReminder(input: CreateReminderInput): Promise<StoredTelegramReminder | null> {
  if (!isSupabaseConfigured()) return null;

  const { deadline, remindAt } = reminderDate(input.deadlineDate);
  if (!remindAt) return null;

  const records = await supabaseRest<SupabaseTelegramReminder[]>('telegram_reminders', {
    method: 'POST',
    body: {
      ...userFields(input.userId),
      telegram_chat_id: input.chatId,
      opportunity_id: input.opportunityId ?? null,
      title: input.title,
      deadline,
      category: input.category ?? null,
      remind_at: remindAt,
      status: 'scheduled',
      lang: sanitizeLanguage(input.lang),
      app_url: input.appUrl ?? getAppUrl(),
    },
    prefer: 'return=representation',
  });

  return records[0] ? toStoredReminder(records[0]) : null;
}

export async function getDueTelegramReminders(limit = 25): Promise<StoredTelegramReminder[]> {
  if (!isSupabaseConfigured()) return [];

  const records = await supabaseRest<SupabaseTelegramReminder[]>('telegram_reminders', {
    query: {
      status: 'eq.scheduled',
      remind_at: `lte.${new Date().toISOString()}`,
      select: 'id,telegram_chat_id,title,deadline,category,opportunity_id,lang,app_url,status',
      order: 'remind_at.asc',
      limit,
    },
  });

  return records.map(toStoredReminder);
}

export async function markTelegramReminderSent(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabaseRest<never>('telegram_reminders', {
    method: 'PATCH',
    query: { id: `eq.${id}` },
    body: {
      status: 'sent',
      sent_at: new Date().toISOString(),
    },
  });
}

export async function markTelegramReminderFailed(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabaseRest<never>('telegram_reminders', {
    method: 'PATCH',
    query: { id: `eq.${id}` },
    body: { status: 'failed' },
  });
}
