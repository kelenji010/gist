-- Align remote DB with weekly scores + collectibles (already applied via MCP).
-- Safe to re-run.

alter table public.scores
  add column if not exists week_key text;

update public.scores
set week_key = to_char(date_trunc('week', created_at)::date, 'YYYY-MM-DD')
where week_key is null;

alter table public.scores
  alter column week_key set not null;

alter table public.scores
  drop constraint if exists scores_points_check;

alter table public.scores
  add constraint scores_points_check check (points >= 0 and points <= 100);

alter table public.scores drop constraint if exists scores_username_key;
drop index if exists public.scores_username_key;

create unique index if not exists scores_username_week_uidx
  on public.scores (username, week_key);

create index if not exists scores_week_points_idx
  on public.scores (week_key, points desc, created_at asc);

drop policy if exists "Public update scores" on public.scores;
create policy "Public update scores"
  on public.scores for update
  using (true)
  with check ((points >= 0) and (points <= 100));

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

alter table public.collectibles enable row level security;

drop policy if exists "Public read collectibles" on public.collectibles;
create policy "Public read collectibles"
  on public.collectibles for select
  using (true);

drop policy if exists "Public insert collectibles" on public.collectibles;
create policy "Public insert collectibles"
  on public.collectibles for insert
  with check (true);

drop policy if exists "Public update collectibles" on public.collectibles;
create policy "Public update collectibles"
  on public.collectibles for update
  using (true)
  with check (true);
