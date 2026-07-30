-- Gist database schema (Supabase)
-- Weekly puzzle: one score per username per week + collectibles.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique
    check (char_length(trim(username)) between 2 and 20)
    check (username ~ '^[a-zA-Z0-9_\- ]+$'),
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  username text not null,
  puzzle_id uuid,
  points integer not null check (points >= 0 and points <= 100),
  week_key text not null,
  created_at timestamptz not null default now()
);

-- One play per username per week
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
