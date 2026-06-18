create extension if not exists pgcrypto;

create table if not exists public.telegram_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  client_user_key text null,
  link_code text not null unique,
  telegram_chat_id text null,
  telegram_username text null,
  telegram_first_name text null,
  language text null check (language in ('ru', 'en', 'kz')),
  status text not null default 'pending' check (status in ('pending', 'connected')),
  created_at timestamptz not null default now(),
  linked_at timestamptz null
);

create index if not exists telegram_links_user_id_idx on public.telegram_links (user_id);
create index if not exists telegram_links_client_user_key_idx on public.telegram_links (client_user_key);
create index if not exists telegram_links_status_idx on public.telegram_links (status);

create table if not exists public.telegram_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  client_user_key text null,
  telegram_chat_id text not null,
  opportunity_id text null,
  title text not null,
  deadline date null,
  category text null,
  remind_at timestamptz null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'failed')),
  lang text null check (lang in ('ru', 'en', 'kz')),
  app_url text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

create index if not exists telegram_reminders_due_idx
  on public.telegram_reminders (status, remind_at)
  where status = 'scheduled';
create index if not exists telegram_reminders_user_id_idx on public.telegram_reminders (user_id);
create index if not exists telegram_reminders_client_user_key_idx on public.telegram_reminders (client_user_key);

alter table public.telegram_links enable row level security;
alter table public.telegram_reminders enable row level security;

drop policy if exists "telegram_links_service_role_only" on public.telegram_links;
create policy "telegram_links_service_role_only"
  on public.telegram_links
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "telegram_reminders_service_role_only" on public.telegram_reminders;
create policy "telegram_reminders_service_role_only"
  on public.telegram_reminders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
