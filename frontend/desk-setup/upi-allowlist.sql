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
