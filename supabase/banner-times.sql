begin;
alter table public.tracker_banners add column starts_time time not null default '07:00', add column ends_time time not null default '06:59';
alter table public.tracker_banners add constraint tracker_banner_time_order check(ends_on+ends_time>starts_on+starts_time);
create function public.save_tracker_banner_timed(banner_id uuid,banner_name text,start_date date,end_date date,start_time time,end_time time,hero_ids uuid[]) returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid:=coalesce(banner_id,gen_random_uuid());
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 insert into public.tracker_banners(id,name,starts_on,ends_on,starts_time,ends_time,updated) values(saved_id,trim(banner_name),start_date,end_date,start_time,end_time,now()) on conflict(id) do update set name=excluded.name,starts_on=excluded.starts_on,ends_on=excluded.ends_on,starts_time=excluded.starts_time,ends_time=excluded.ends_time,updated=excluded.updated;
 delete from public.tracker_banner_heroes bh where bh.banner_id=saved_id;
 insert into public.tracker_banner_heroes(banner_id,hero_id) select saved_id,unnest(coalesce(hero_ids,'{}'::uuid[])) on conflict do nothing;
 return saved_id;
end;
$$;
revoke all on function public.save_tracker_banner_timed(uuid,text,date,date,time,time,uuid[]) from public;
grant execute on function public.save_tracker_banner_timed(uuid,text,date,date,time,time,uuid[]) to authenticated;
commit;
