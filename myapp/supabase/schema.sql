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

alter table public.users enable row level security;
alter table public.scores enable row level security;
alter table public.collectibles enable row level security;

drop policy if exists "Public read users" on public.users;
create policy "Public read users"
  on public.users for select
  using (true);

drop policy if exists "Public insert users" on public.users;
create policy "Public insert users"
  on public.users for insert
  with check (true);

drop policy if exists "Public read scores" on public.scores;
create policy "Public read scores"
  on public.scores for select
  using (true);

drop policy if exists "Public insert scores" on public.scores;
create policy "Public insert scores"
  on public.scores for insert
  with check ((points >= 0) and (points <= 100));

drop policy if exists "Public update scores" on public.scores;
create policy "Public update scores"
  on public.scores for update
  using (true)
  with check ((points >= 0) and (points <= 100));

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

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.users to anon, authenticated;
grant select, insert, update on table public.scores to anon, authenticated;
grant select, insert, update on table public.collectibles to anon, authenticated;
