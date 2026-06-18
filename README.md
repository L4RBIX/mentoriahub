# Mentoria Hub

Mentoria Hub is an educational platform for students to discover opportunities, follow personalized roadmaps, complete courses, use Nastav AI, and receive Telegram deadline reminders.

## Features

- **Personalized Roadmap** — step-by-step learning paths with AI-powered recommendations
- **Courses** — curated course library with progress tracking
- **Opportunities** — internships, scholarships, competitions, and events
- **Nastav AI** — your personal AI mentor powered by DeepSeek
- **Telegram Reminders** — never miss a deadline with smart Telegram notifications
- **Leaderboard** — gamified progress with XP and achievements
- **Calendar** — unified view of all deadlines and events

## Tech Stack

- **Next.js 16** — App Router, React 19, TypeScript strict
- **shadcn/ui** — Radix primitives + Tailwind CSS v4
- **Supabase** — database and auth
- **Telegram Bot API** — deadline reminders
- **DeepSeek API** — AI mentor (Nastav)
- **Vercel** — deployment

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/L4RBIX/mentoriahub.git
   cd mentoriahub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your values in .env.local
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook verification secret |
| `CRON_SECRET` | Cron job authorization secret |
| `DEEPSEEK_API_KEY` | DeepSeek API key for Nastav AI |

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint check
npm run typecheck  # TypeScript check
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions on Vercel.

## License

MIT
