# Mentoria Hub Production Deployment

Production URL must be:

```txt
https://mentoriahub-kz.vercel.app
```

Do not use a random Vercel preview URL as the final demo URL.

## Required Vercel environment variables

Set these in Vercel Project Settings → Environment Variables for Production, Preview, and Development as needed:

```txt
NEXT_PUBLIC_APP_URL=https://mentoriahub-kz.vercel.app
APP_URL=https://mentoriahub-kz.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here
TELEGRAM_BOT_USERNAME=your_bot_username
CRON_SECRET=your_cron_secret_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

`TELEGRAM_CHAT_ID` is optional for local demos only. Production user reminders use `telegram_links.telegram_chat_id`.

## Supabase

Run the SQL in:

```txt
supabase/migrations/001_initial.sql
```

The current MVP stores profile, onboarding, roadmap, courses, and saved opportunities in browser localStorage. Supabase is used server-side for production-safe Telegram linking and scheduled reminders. The service role key must never be exposed to client code.

## Telegram webhook

After production deploy and env setup:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://mentoriahub-kz.vercel.app/api/telegram/webhook?secret=$TELEGRAM_WEBHOOK_SECRET"
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

The webhook route also accepts Telegram's `X-Telegram-Bot-Api-Secret-Token` header and `Authorization: Bearer <secret>`.

## Production tests

1. Open `https://mentoriahub-kz.vercel.app`.
2. Check `/opportunities`, `/courses`, `/dashboard`, `/roadmap`, `/mentor`, and `/nastav`.
3. Complete onboarding and confirm dashboard/roadmap render.
4. Click Connect Telegram, open the bot, and send `/start <code>`.
5. Refresh/check Telegram status in the dashboard.
6. Save an opportunity and send the Telegram reminder.
7. Confirm the Telegram message button opens Mentoria Hub, not localhost.
8. Call `/api/cron/send-reminders?secret=$CRON_SECRET` or wait for Vercel Cron, then check due reminders are marked sent.
9. Ask Nastav a question. Without `DEEPSEEK_API_KEY`, the route returns a safe fallback answer instead of a 500.

## Reminder scheduling note

The project includes `/api/cron/send-reminders` and `vercel.json` runs it daily at 09:00 UTC, which is compatible with Vercel Hobby. For hourly reminder processing, configure an external cron or upgrade the Vercel plan and change the schedule to `0 * * * *`.
