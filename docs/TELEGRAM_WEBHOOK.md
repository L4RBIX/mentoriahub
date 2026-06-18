# Telegram webhook setup

Mentoria Hub keeps `TELEGRAM_BOT_TOKEN` server-side only.

For a deployed app:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://mentoriahub-kz.vercel.app/api/telegram/webhook?secret=$TELEGRAM_WEBHOOK_SECRET"
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

For local development, expose Next.js with ngrok:

```bash
ngrok http 3000
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://YOUR_NGROK_URL/api/telegram/webhook?secret=$TELEGRAM_WEBHOOK_SECRET"
```

Production persistence uses Supabase tables from `supabase/migrations/001_initial.sql`.
Local development can fall back to `.tmp/telegram-links.json` only when Supabase env vars are not configured.
