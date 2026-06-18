# Mentoria Hub

A personalized EdTech platform that helps students discover opportunities, follow roadmaps, complete courses, and never miss deadlines.

## Live Demo

- Live Demo: https://mentoriahub-kz.vercel.app
- GitHub Repo: https://github.com/L4RBIX/mentoriahub

## Problem

Mentoria helps students grow through Telegram communities, announcements, and live learning sessions. That workflow is fast and familiar, but it becomes harder to scale as the number of students, opportunities, courses, and deadlines grows.

Students can miss important Telegram posts, struggle to understand which opportunities fit their profile, and lose access to learning value when they cannot attend live classes. Mentoria needs a structured platform that keeps the speed of Telegram while adding searchable opportunity discovery, personalized guidance, asynchronous learning, and reliable deadline reminders.

## Solution

Mentoria Hub is a student growth command center for opportunity discovery and learning. It combines a structured opportunity catalog, personalized onboarding, roadmap generation, asynchronous courses, dashboard tracking, Nastav AI mentor support, Telegram reminders, and admin/mentor tools in one responsive product.

The platform supports RU, EN, and KZ interfaces, dark/light theme, and mobile-first usage so students can move from discovery to action without losing context.

## Winning Product Insight

### We do not replace Telegram — we turn Telegram into a retention engine.

Mentoria students already live in Telegram. Mentoria Hub connects that habit to a structured product experience: students save opportunities in the platform, connect the Telegram bot, and receive deadline reminders directly where they already pay attention.

This keeps Mentoria's existing workflow while making it measurable, personalized, and scalable.

## Key Features

- Personalized student onboarding
- Opportunity catalog with filters and search
- Saved opportunities and deadline tracking
- AI-powered Nastav mentor chat
- Personalized roadmap generation
- Async course lessons with embedded videos and quizzes
- Course progress tracking
- Telegram reminder bot with deep-link connection flow
- Calendar view for saved and upcoming deadlines
- Leaderboard and certificates
- Mentor Portal for lesson/content management
- Admin Panel for platform operations
- RU/EN/KZ multilingual interface
- Dark/light theme
- Mobile-first responsive UI

## Demo User Flow

1. Student opens Mentoria Hub.
2. Student completes onboarding with grade, interests, goals, and language.
3. Mentoria Hub generates a personalized roadmap.
4. Student browses the opportunity catalog and saves a relevant opportunity.
5. Student connects the Telegram bot through a secure start code.
6. Student receives a Telegram reminder with the opportunity title, deadline, category, and Mentoria Hub link.
7. Student opens a course, watches a lesson, and completes a quiz.
8. Dashboard updates progress, saved opportunities, course activity, and deadlines.
9. Admins and mentors manage opportunities, lessons, and platform content.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/Radix-style UI primitives
- Supabase for production Telegram link/reminder storage
- Telegram Bot API for reminders and bot connection
- DeepSeek API for Nastav AI mentor
- Vercel for deployment and cron
- LocalStorage for MVP client-side profile, roadmap, course progress, and saved opportunity state

## Architecture Overview

- Frontend: Next.js App Router pages and React components
- Backend: Next.js API routes
- Database: Supabase tables for Telegram links and reminders
- AI: Nastav assistant API route with safe fallback behavior
- Telegram: bot webhook, link status, reminder send, and cron reminder endpoints
- Deployment: Vercel production deployment

### Important Pages

- `/`
- `/onboarding`
- `/opportunities`
- `/opportunities/[id]`
- `/courses`
- `/courses/[id]`
- `/roadmap`
- `/dashboard`
- `/calendar`
- `/nastav`
- `/mentor`
- `/admin`

### Important API Routes

- `/api/assistant`
- `/api/roadmap`
- `/api/telegram/link`
- `/api/telegram/status`
- `/api/telegram/webhook`
- `/api/telegram/reminder`
- `/api/cron/send-reminders`

## Environment Variables

Create `.env.local` from `.env.example` and fill in your own values. Do not commit real secrets.

```env
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

## Local Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Build for production:

```bash
npm run build
```

Additional checks:

```bash
npm run typecheck
npm run lint
```

## Supabase Setup

Run the SQL migration:

```txt
supabase/migrations/001_initial.sql
```

It creates:

- `telegram_links`
- `telegram_reminders`

These tables store Telegram connection codes, chat IDs, reminder records, and scheduled reminder status. The Supabase service role key is used only on the server.

## Telegram Setup

1. Create a bot with BotFather.
2. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME` to the environment.
3. Add `TELEGRAM_WEBHOOK_SECRET` to the environment.
4. Set the production webhook:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://mentoriahub-kz.vercel.app/api/telegram/webhook?secret=$TELEGRAM_WEBHOOK_SECRET"
```

5. Verify the webhook:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

Do not paste real bot tokens into source code or documentation.

## Deployment

Mentoria Hub is deployed on Vercel:

```txt
https://mentoriahub-kz.vercel.app
```

Deployment notes:

- Configure all required environment variables in the Vercel dashboard.
- `APP_URL` and `NEXT_PUBLIC_APP_URL` must match the production domain.
- Telegram webhook must use the production domain.
- Vercel Cron calls `/api/cron/send-reminders` for scheduled reminders.

## Project Structure

```txt
src/app              App Router pages and API routes
src/components       Reusable UI and product components
src/lib              Client-safe utilities, data, recommendations, localization
src/lib/server       Server-only Supabase, Telegram, and app URL helpers
src/types            Shared TypeScript types
supabase/migrations  SQL migration files
```

## Hackathon Impact

Mentoria Hub helps Mentoria scale beyond manual Telegram posting and live-only learning:

- Reduces manual Telegram workload through structured reminders
- Makes opportunities searchable, filterable, and personalized
- Supports students who cannot attend every live class
- Scales asynchronous learning through courses and quizzes
- Gives students clear next actions, roadmap steps, and deadlines
- Gives mentors/admins a foundation for managing content and operations

## Security

- Secrets are stored in environment variables.
- `.env.local`, `.vercel`, `.next`, `.tmp`, and local output files are ignored.
- Telegram bot token and Supabase service role key are server-only.
- Supabase service role key is never exposed to client components.
- `.env.example` contains placeholders only.

## MVP Status

- Working production deployment: https://mentoriahub-kz.vercel.app
- Core pages implemented
- Telegram backend implemented and production smoke-tested
- Supabase migration `001_initial.sql` applied for production Telegram linking/reminders
- Nastav AI uses DeepSeek when configured
- AI fallback is safe when the API key is missing
- Client profile, roadmap, course progress, and saved opportunity state use LocalStorage for the MVP

## Screenshots

Screenshots will be added after final demo capture.

## License

MIT

## Credits

Built for Mentoria students as a hackathon MVP by L4RBIX.
