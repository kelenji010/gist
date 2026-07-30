-- Weekly scores + collectibles (safe to re-run)

-- Add week_key if missing
alter table public.scores
  add column if not exists week_key text;

-- Backfill null week_keys to a placeholder so unique index can apply
update public.scores
set week_key = to_char(date_trunc('week', created_at + interval '1 day')::date, 'YYYY-MM-DD')
where week_key is null;

alter table public.scores
  alter column week_key set not null;

-- Drop old one-score-per-username unique index if present
drop index if exists public.scores_username_uidx;

create unique index if not exists scores_username_week_uidx
  on public.scores (username, week_key);

create index if not exists scores_week_points_idx
  on public.scores (week_key, points desc, created_at asc);

create table if not exists public.collectibles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  username text not null,
  number text not null,
  word text not null,
  week_key text not null,
  earned_at timestamptz not null default now()
);

create unique index if not exists collectibles_username_number_uidx
  on public.collectibles (username, number);

create index if not exists collectibles_username_idx
  on public.collectibles (username);
