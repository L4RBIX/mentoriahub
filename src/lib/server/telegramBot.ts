import type { AppLanguage } from '@/types/mentoria';

export interface TelegramReminderBody {
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

interface TelegramApiResponse {
  ok: boolean;
  description?: string;
  result?: {
    message_id?: number;
  };
}

const COPY = {
  ru: {
    saved: 'ты сохранил(а):',
    deadline: 'Дедлайн',
    category: 'Категория',
    next: 'Следующий шаг:',
    nextText: 'Открой требования программы и начни подготовку заранее.',
    open: 'Открыть Mentoria Hub',
    remind: 'Напомнить за 3 дня',
    connected: '✅ Telegram подключён к Mentoria Hub. Теперь ты будешь получать напоминания по сохранённым возможностям.',
    callbackDone: 'Готово. Напоминание за 3 дня включено.',
  },
  en: {
    saved: 'you saved:',
    deadline: 'Deadline',
    category: 'Category',
    next: 'Next step:',
    nextText: 'Open the program requirements and start preparing early.',
    open: 'Open Mentoria Hub',
    remind: 'Remind me 3 days before',
    connected: '✅ Telegram connected to Mentoria Hub. You will now receive reminders for saved opportunities.',
    callbackDone: 'Done. 3-day reminder enabled.',
  },
  kz: {
    saved: 'сіз сақтадыңыз:',
    deadline: 'Дедлайн',
    category: 'Санат',
    next: 'Келесі қадам:',
    nextText: 'Бағдарлама талаптарын ашып, дайындықты ертерек бастаңыз.',
    open: 'Mentoria Hub ашу',
    remind: '3 күн бұрын еске сал',
    connected: '✅ Telegram Mentoria Hub-қа қосылды. Енді сақталған мүмкіндіктер бойынша еске салғыштар аласыз.',
    callbackDone: 'Дайын. 3 күн бұрын еске салу қосылды.',
  },
};

function copyFor(lang?: AppLanguage) {
  return COPY[lang ?? 'ru'];
}

function isPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
  } catch {
    return false;
  }
}

export function buildReminderMessage(body: TelegramReminderBody): string {
  const copy = copyFor(body.lang);
  const greeting = body.studentName ? `${body.studentName}, ` : '';
  return [
    '📌 <b>Mentoria Hub reminder</b>',
    '',
    `${greeting}${copy.saved}`,
    `<b>${body.title}</b>`,
    '',
    `📅 ${copy.deadline}: ${body.deadline}`,
    `🏷 ${copy.category}: ${body.category}`,
    '',
    copy.next,
    copy.nextText,
  ].join('\n');
}

export async function sendTelegramMessage(chatId: string, text: string, lang: AppLanguage = 'ru', url?: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return { ok: false, reason: 'Telegram bot token is missing' };
  }

  const copy = copyFor(lang);
  const openButton = isPublicUrl(url)
    ? { text: copy.open, url }
    : { text: copy.open, callback_data: 'open_mentoria_hub' };

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [openButton],
          [{ text: copy.remind, callback_data: `remind_3_days:${lang}` }],
        ],
      },
    }),
  });

  const data = await response.json() as TelegramApiResponse;
  return {
    ok: data.ok,
    reason: data.ok ? undefined : data.description ?? 'Telegram API rejected the message',
  };
}

export async function answerCallbackQuery(callbackQueryId: string, lang: AppLanguage = 'ru') {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const copy = copyFor(lang);
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: copy.callbackDone,
      show_alert: false,
    }),
  });
}

export async function sendPlainTelegramMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
}

export async function sendConnectionConfirmation(chatId: string, lang: AppLanguage = 'ru') {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const copy = copyFor(lang);
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: copy.connected,
    }),
  });
}
