-- Veltix Desk database setup
-- Supabase → SQL Editor → New query → paste all of this → Run

-- 1. Deals: one row per client deal (agreement + invoice + payments)
create table if not exists public.deals (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create index if not exists deals_owner_updated on public.deals (owner, updated_at desc);

-- 2. Settings: your agency details (UPI, bank, GSTIN…)
create table if not exists public.settings (
  owner       uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- 3. Lock both tables: each logged-in user sees and changes only their own rows
alter table public.deals    enable row level security;
alter table public.settings enable row level security;

drop policy if exists "own deals"    on public.deals;
drop policy if exists "own settings" on public.settings;

create policy "own deals" on public.deals
  for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

create policy "own settings" on public.settings
  for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

-- 4. Nobody who isn't logged in can touch these tables
revoke all on public.deals, public.settings from anon;
-- Veltix Desk: let payment links use any UPI ID saved in the admin panel
-- Supabase → SQL Editor → New query → paste all of this → Run (once)
--
-- The website's payment-link guard calls this function to get the UPI IDs
-- you have saved in Settings (current + previous). It returns only UPI IDs,
-- which are already public on your payment page. Nothing else is exposed.

create or replace function public.desk_allowed_upi()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select distinct lower(trim(u))
  from public.settings s,
  lateral (
    select s.data->>'upi' as u
    union all
    select jsonb_array_elements_text(
      case when jsonb_typeof(s.data->'upiHistory') = 'array'
           then s.data->'upiHistory' else '[]'::jsonb end)
  ) ids
  where coalesce(trim(u), '') <> '';
$$;

revoke all on function public.desk_allowed_upi() from public;
grant execute on function public.desk_allowed_upi() to anon, authenticated;
