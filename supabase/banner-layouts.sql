begin;
alter table public.tracker_banners add column if not exists banner_type text not null default 'lme' check(banner_type in ('lme','featured'));
update public.tracker_banners set banner_type='featured' where name in ('New Heroes: Fortune''s Weave','Special Heroes: Wind Bound');
create or replace function public.save_tracker_banner_layout(banner_id uuid,banner_name text,start_date date,end_date date,start_time time,end_time time,hero_ids uuid[],layout_type text) returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid;
begin
 if layout_type not in ('lme','featured') then raise exception 'Invalid banner type'; end if;
 if layout_type='featured' and cardinality(hero_ids)>4 then raise exception 'Featured banners can contain up to four heroes'; end if;
 saved_id:=public.save_tracker_banner_timed(banner_id,banner_name,start_date,end_date,start_time,end_time,hero_ids);
 update public.tracker_banners set banner_type=layout_type where id=saved_id;
 return saved_id;
end;$$;
revoke all on function public.save_tracker_banner_layout(uuid,text,date,date,time,time,uuid[],text) from public;
grant execute on function public.save_tracker_banner_layout(uuid,text,date,date,time,time,uuid[],text) to authenticated;
commit;
