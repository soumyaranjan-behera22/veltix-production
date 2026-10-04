-- Veltix Desk: only the OWNER can approve UPI IDs
-- Run once in Supabase → SQL Editor. Safe to run again.
--
-- After this, a payment link works ONLY if it pays a UPI ID on the approved list.
-- Team members can see the list and pick from it, but only the owner email below
-- can add or remove UPI IDs. A team member who types their own UPI ID gets a
-- link that is blocked ("This payment link isn't valid").

-- 1. The owner (change only if your owner email changes)
create or replace function public.desk_owner_email() returns text
language sql immutable as $$ select 'soumya.rbehera007@gmail.com'::text $$;
revoke all on function public.desk_owner_email() from public, anon;

create or replace function public.desk_is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt()->>'email','')) = public.desk_owner_email()
$$;
revoke all on function public.desk_is_owner() from public;
grant execute on function public.desk_is_owner() to authenticated;

-- 2. The approved list
create table if not exists public.approved_upi (
  upi text primary key check (upi = lower(trim(upi)) and upi ~ '^[a-z0-9._-]{2,}@[a-z0-9.-]{2,}$'),
  added_at timestamptz not null default now()
);
alter table public.approved_upi enable row level security;
revoke all on public.approved_upi from anon, public;
grant select, insert, delete on public.approved_upi to authenticated;

drop policy if exists "team can read" on public.approved_upi;
create policy "team can read" on public.approved_upi
  for select to authenticated using (true);

drop policy if exists "owner adds" on public.approved_upi;
create policy "owner adds" on public.approved_upi
  for insert to authenticated with check (public.desk_is_owner());

drop policy if exists "owner removes" on public.approved_upi;
create policy "owner removes" on public.approved_upi
  for delete to authenticated using (public.desk_is_owner());

-- 3. Your current UPI ID, so links you already sent keep working
insert into public.approved_upi(upi) values ('pinkibehera671-2@oksbi') on conflict do nothing;

-- 4. The payment-link guard now trusts ONLY the approved list
create or replace function public.desk_allowed_upi() returns setof text
language sql stable security definer set search_path = public as $$
  select upi from public.approved_upi
$$;
revoke all on function public.desk_allowed_upi() from public;
grant execute on function public.desk_allowed_upi() to anon, authenticated;
