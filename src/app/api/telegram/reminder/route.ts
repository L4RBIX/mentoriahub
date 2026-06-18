import { NextRequest, NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/server/appUrl';
import { buildReminderMessage, sendTelegramMessage, type TelegramReminderBody } from '@/lib/server/telegramBot';
import { createTelegramLink, createTelegramReminder, getTelegramChatId } from '@/lib/server/telegramStore';

function isPublicHttpsUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
  } catch {
    return false;
  }
}

function reminderLink(body: TelegramReminderBody, req: NextRequest): string {
  if (isPublicHttpsUrl(body.url)) return body.url as string;

  const path = body.opportunityId ? `/opportunities/${encodeURIComponent(body.opportunityId)}` : '/opportunities';
  return `${getAppUrl(req.nextUrl.origin)}${path}`;
}

export async function POST(req: NextRequest) {
  let body: TelegramReminderBody;
  try {
    body = await req.json() as TelegramReminderBody;
  } catch {
    return NextResponse.json({ ok: false, preview: true, reason: 'Invalid request body' }, { status: 400 });
  }

  const { title, deadline, category, userId } = body;
  if (!title || !deadline || !category) {
    return NextResponse.json({ ok: false, preview: true, reason: 'Missing required fields' }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ ok: false, preview: true, reason: 'Telegram bot token is missing' });
  }

  const linkedChatId = userId ? await getTelegramChatId(userId) : null;
  const chatId = linkedChatId ?? (!userId ? process.env.TELEGRAM_CHAT_ID ?? null : null);

  if (!chatId) {
    let link: { code: string; token: string; botUrl: string } | null = null;
    if (userId) {
      try {
        link = await createTelegramLink(userId, body.lang);
      } catch (error) {
        return NextResponse.json({
          ok: false,
          needsTelegramConnect: true,
          reason: error instanceof Error ? error.message : 'Telegram link creation failed',
        });
      }
    }

    return NextResponse.json({
      ok: false,
      needsTelegramConnect: true,
      botUrl: link?.botUrl,
      token: link?.token,
      code: link?.code,
    });
  }

  try {
    const text = buildReminderMessage(body);
    const siteUrl = reminderLink(body, req);
    await createTelegramReminder({
      userId,
      chatId,
      opportunityId: body.opportunityId,
      title: body.title,
      deadline: body.deadline,
      deadlineDate: body.deadlineDate,
      category: body.category,
      lang: body.lang,
      appUrl: siteUrl,
    });
    const result = await sendTelegramMessage(chatId, text, body.lang ?? 'ru', siteUrl);

    if (!result.ok) {
      return NextResponse.json({ ok: false, preview: true, reason: result.reason ?? 'Telegram API rejected the message' });
    }

    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    console.error('[telegram] send error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ ok: false, preview: true, reason: 'Network error sending Telegram message' });
  }
}
