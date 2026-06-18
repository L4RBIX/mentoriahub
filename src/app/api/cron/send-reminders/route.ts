import { NextRequest, NextResponse } from 'next/server';
import { buildReminderMessage, sendTelegramMessage } from '@/lib/server/telegramBot';
import {
  getDueTelegramReminders,
  markTelegramReminderFailed,
  markTelegramReminderSent,
} from '@/lib/server/telegramStore';
import type { AppLanguage } from '@/types/mentoria';

function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const userAgent = req.headers.get('user-agent') ?? '';
  if (userAgent.includes('vercel-cron/1.0')) return true;
  if (!secret) return true;

  const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const querySecret = req.nextUrl.searchParams.get('secret');
  return bearer === secret || querySecret === secret;
}

function languageOrDefault(lang: AppLanguage | null): AppLanguage {
  return lang === 'en' || lang === 'kz' || lang === 'ru' ? lang : 'ru';
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized cron' }, { status: 401 });
  }

  const reminders = await getDueTelegramReminders(50);
  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    const lang = languageOrDefault(reminder.lang);
    const text = buildReminderMessage({
      opportunityId: reminder.opportunity_id ?? undefined,
      title: reminder.title,
      deadline: reminder.deadline ?? 'not specified',
      category: reminder.category ?? 'Opportunity',
      lang,
    });

    const result = await sendTelegramMessage(reminder.telegram_chat_id, text, lang, reminder.app_url ?? undefined);
    if (result.ok) {
      await markTelegramReminderSent(reminder.id);
      sent += 1;
    } else {
      await markTelegramReminderFailed(reminder.id);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, checked: reminders.length, sent, failed });
}
