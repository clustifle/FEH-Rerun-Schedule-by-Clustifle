begin;
create table if not exists public.tracker_managers(user_id uuid primary key references auth.users(id) on delete cascade,email text not null unique check(email=lower(email)));
alter table public.tracker_managers enable row level security;
revoke all on public.tracker_managers from anon,authenticated;
create or replace function public.tracker_role() returns text language sql stable security definer set search_path='' as $$
 select case when u.id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid and lower(u.email)='shyguyvn@gmail.com' then 'Owner' when exists(select 1 from public.tracker_managers m where m.user_id=u.id and m.email=lower(u.email)) then 'Manager' else null end from auth.users u where u.id=(select auth.uid()) and u.email_confirmed_at is not null;
$$;
create or replace function public.is_tracker_owner() returns boolean language sql stable security definer set search_path='' as $$ select coalesce(public.tracker_role() in ('Owner','Manager'),false); $$;
create or replace function public.list_tracker_managers() returns table(email text) language plpgsql stable security definer set search_path='' as $$
begin
 if public.tracker_role() is distinct from 'Owner' then raise exception 'Only the Owner can manage access.'; end if;
 return query select m.email from public.tracker_managers m order by m.email;
end; $$;
create or replace function public.set_tracker_manager(manager_email text,enabled boolean) returns void language plpgsql security definer set search_path='' as $$
declare normalized text:=lower(trim(manager_email)); account_id uuid;
begin
 if public.tracker_role() is distinct from 'Owner' then raise exception 'Only the Owner can manage access.'; end if;
 if normalized='shyguyvn@gmail.com' then raise exception 'The Owner role cannot be changed.'; end if;
 if normalized is null or length(normalized)>254 or normalized !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email address.'; end if;
 if enabled then
  select u.id into account_id from auth.users u where lower(u.email)=normalized and u.email_confirmed_at is not null;
  if account_id is null then raise exception 'Create and confirm this account in Supabase Authentication first, then add its email here.'; end if;
  if account_id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid then raise exception 'The Owner role cannot be changed.'; end if;
  insert into public.tracker_managers(user_id,email) values(account_id,normalized) on conflict(user_id) do update set email=excluded.email;
 else delete from public.tracker_managers m where m.email=normalized;
 end if;
end; $$;
revoke all on function public.tracker_role(),public.list_tracker_managers(),public.set_tracker_manager(text,boolean) from public;
grant execute on function public.tracker_role() to authenticated;
grant execute on function public.list_tracker_managers(),public.set_tracker_manager(text,boolean) to authenticated;
commit;
