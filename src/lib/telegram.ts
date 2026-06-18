import { storage } from '@/lib/storage';
import type { AppLanguage } from '@/types/mentoria';

export interface TelegramReminderPayload {
  userId?: string;
  opportunityId?: string;
  title: string;
  deadline: string;
  deadlineDate?: string;
  category: string;
  url?: string;
  studentName?: string;
  lang?: AppLanguage;
}

export interface TelegramReminderResult {
  ok: boolean;
  sent?: boolean;
  preview?: boolean;
  reason?: string;
  needsTelegramConnect?: boolean;
  botUrl?: string;
  token?: string;
  code?: string;
}

export async function sendTelegramReminder(payload: TelegramReminderPayload): Promise<TelegramReminderResult> {
  try {
    const userId = payload.userId ?? storage.getUserId();
    const res = await fetch('/api/telegram/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, userId }),
    });
    return await res.json() as TelegramReminderResult;
  } catch {
    return { ok: false, preview: true, reason: 'Network error' };
  }
}

export async function createTelegramLink(lang?: AppLanguage): Promise<{ ok: boolean; botUrl?: string; token?: string; code?: string; error?: string }> {
  try {
    const res = await fetch('/api/telegram/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: storage.getUserId(), lang }),
    });
    return await res.json() as { ok: boolean; botUrl?: string; token?: string; code?: string; error?: string };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}

export async function getTelegramStatus(code?: string): Promise<{ ok: boolean; connected: boolean; username?: string }> {
  try {
    const params = new URLSearchParams(code ? { code } : { userId: storage.getUserId() });
    const res = await fetch(`/api/telegram/status?${params.toString()}`);
    return await res.json() as { ok: boolean; connected: boolean; username?: string };
  } catch {
    return { ok: false, connected: false };
  }
}
