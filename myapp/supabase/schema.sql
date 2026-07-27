-- Gist database schema (Supabase)
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- For now we only need users + scores.
-- Extra puzzle tables can be added later when you build the new board.

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
  created_at timestamptz not null default now()
);

-- One score row per username (optional uniqueness; app also upserts by username)
create unique index if not exists scores_username_uidx on public.scores (username);

create index if not exists scores_points_idx on public.scores (points desc, created_at asc);
