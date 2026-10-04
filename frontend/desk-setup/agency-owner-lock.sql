-- Veltix Desk: one set of agency details for the whole team, only the OWNER can change them
-- Run once in Supabase → SQL Editor, AFTER upi-owner-lock.sql. Safe to run again.
--
-- Agency details = your name, title, email, WhatsApp number, address, GSTIN,
-- UPI ID, account name, bank, account number, IFSC. They print on every
-- agreement, invoice and payment link, so a team member must never be able
-- to swap in their own number or bank account.
--
-- After this:
--   • everyone on the team uses the same agency details
--   • team members see them but can't edit them
--   • only the owner email in desk_owner_email() (upi-owner-lock.sql) can save changes

create table if not exists public.agency_profile (
  id          int primary key default 1 check (id = 1),   -- exactly one row
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.agency_profile enable row level security;
revoke all on public.agency_profile from anon, public;
grant select, insert, update on public.agency_profile to authenticated;

drop policy if exists "team reads agency" on public.agency_profile;
create policy "team reads agency" on public.agency_profile
  for select to authenticated using (true);

drop policy if exists "owner adds agency" on public.agency_profile;
create policy "owner adds agency" on public.agency_profile
  for insert to authenticated with check (public.desk_is_owner());

drop policy if exists "owner edits agency" on public.agency_profile;
create policy "owner edits agency" on public.agency_profile
  for update to authenticated using (public.desk_is_owner()) with check (public.desk_is_owner());

-- Start from the details you already saved: the owner's own copy if it exists,
-- otherwise the most recently saved copy from any admin account.
insert into public.agency_profile (id, data)
select 1, s.data
from public.settings s
left join auth.users u on u.id = s.owner
where s.data <> '{}'::jsonb
order by (lower(coalesce(u.email,'')) = public.desk_owner_email()) desc, s.updated_at desc
limit 1
on conflict (id) do nothing;
