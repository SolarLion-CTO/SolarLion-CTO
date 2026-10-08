-- CTO360 sign-in log. Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run.

-- 1) One row per sign-in (written by the app right after Google sign-in)
create table if not exists public.login_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  provider    text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists login_events_created_at_idx on public.login_events (created_at desc);

-- 2) Who may see everyone's sign-ins
create table if not exists public.app_admins (
  email text primary key
);
-- Project owner; add more admins with another insert line (lower-case Gmail address).
insert into public.app_admins (email) values ('solarleocto@gmail.com') on conflict do nothing;

-- 3) Row Level Security
alter table public.login_events enable row level security;
alter table public.app_admins  enable row level security;

drop policy if exists "insert own sign-in" on public.login_events;
create policy "insert own sign-in" on public.login_events
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "read own or admin" on public.login_events;
create policy "read own or admin" on public.login_events
  for select to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.app_admins a where a.email = lower(auth.jwt() ->> 'email'))
  );

drop policy if exists "see own admin row" on public.app_admins;
create policy "see own admin row" on public.app_admins
  for select to authenticated using (email = lower(auth.jwt() ->> 'email'));
-- No update/delete policies: sign-in rows cannot be edited or removed from the app.
