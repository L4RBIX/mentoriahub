import { NextRequest, NextResponse } from 'next/server';
import { answerCallbackQuery, sendConnectionConfirmation, sendPlainTelegramMessage } from '@/lib/server/telegramBot';
import { connectTelegramToken } from '@/lib/server/telegramStore';
import type { AppLanguage } from '@/types/mentoria';

interface TelegramWebhookUpdate {
  message?: {
    text?: string;
    chat: {
      id: number | string;
      username?: string;
      first_name?: string;
    };
  };
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      chat: {
        id: number | string;
      };
    };
  };
}

function languageFromCallback(data?: string): AppLanguage {
  const lang = data?.split(':')[1];
  return lang === 'en' || lang === 'kz' || lang === 'ru' ? lang : 'ru';
}

function isAuthorizedWebhook(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true;

  const querySecret = req.nextUrl.searchParams.get('secret');
  const telegramHeaderSecret = req.headers.get('x-telegram-bot-api-secret-token');
  const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  return querySecret === secret || telegramHeaderSecret === secret || bearer === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedWebhook(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
  }

  let update: TelegramWebhookUpdate;
  try {
    update = await req.json() as TelegramWebhookUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid Telegram update' }, { status: 400 });
  }

  const text = update.message?.text ?? '';
  if (text.startsWith('/start')) {
    const token = text.split(/\s+/)[1];
    if (!token || !update.message?.chat) {
      return NextResponse.json({ ok: true });
    }

    try {
      const language = await connectTelegramToken(token, update.message.chat);
      await sendConnectionConfirmation(String(update.message.chat.id), language);
    } catch (error) {
      await sendPlainTelegramMessage(
        String(update.message.chat.id),
        `Не удалось подключить Telegram: ${error instanceof Error ? error.message : 'invalid token'}`,
      );
    }

    return NextResponse.json({ ok: true });
  }

  const callback = update.callback_query;
  if (callback) {
    const lang = languageFromCallback(callback.data);
    await answerCallbackQuery(callback.id, lang);
    if (callback.message?.chat.id) {
      const confirmation = {
        ru: 'Готово. Напоминание за 3 дня включено.',
        en: 'Done. 3-day reminder enabled.',
        kz: 'Дайын. 3 күн бұрын еске салу қосылды.',
      }[lang];
      await sendPlainTelegramMessage(String(callback.message.chat.id), confirmation);
    }
  }

  return NextResponse.json({ ok: true });
}
