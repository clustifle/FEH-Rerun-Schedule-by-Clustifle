begin;
alter table public.forging_bonds_revivals add column if not exists home_featured boolean not null default false;
alter table public.hall_of_forms_revivals add column if not exists home_featured boolean not null default false;
create or replace function public.set_home_revival(revival_kind text,revival_month date) returns void language plpgsql security invoker set search_path=public as $$
declare month_exists boolean;
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 if revival_kind not in ('forging_bonds_revivals','hall_of_forms_revivals') then raise exception 'Invalid revival schedule'; end if;
 perform pg_advisory_xact_lock(hashtext(revival_kind));
 if revival_month is not null then
  execute format('select exists(select 1 from public.%I where month=$1)',revival_kind) into month_exists using revival_month;
  if not month_exists then raise exception 'Revival month not found'; end if;
 end if;
 execute format('update public.%I set home_featured=(month=$1) is true where home_featured or month=$1',revival_kind) using revival_month;
end; $$;
revoke all on function public.set_home_revival(text,date) from public;
grant execute on function public.set_home_revival(text,date) to authenticated;
commit;
