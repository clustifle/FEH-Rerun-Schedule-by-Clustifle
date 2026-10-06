begin;
alter table public.tracker_banners drop constraint if exists tracker_banners_banner_type_check;
alter table public.tracker_banners add constraint tracker_banners_banner_type_check check (banner_type in ('lme','featured','revival','remix'));
alter table public.tracker_banners add column if not exists slot_count integer;
alter table public.tracker_banner_heroes add column if not exists slot_index integer;
create or replace function public.save_tracker_banner_layout(banner_id uuid,banner_name text,start_date date,end_date date,start_time time,end_time time,hero_ids uuid[],layout_type text) returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid;
begin
 if layout_type not in ('lme','featured','revival','remix') then raise exception 'Invalid banner type'; end if;
 if layout_type='featured' and cardinality(hero_ids)>4 then raise exception 'Featured banners can contain up to four heroes'; end if;
 if layout_type='revival' and exists(select color from public.heroes where id=any(hero_ids) group by color having count(*)>2) then raise exception 'Revival / Double Special banners allow up to two heroes per color'; end if;
 if layout_type='remix' and (cardinality(hero_ids)>16 or exists(select color from public.heroes where id=any(hero_ids) group by color having count(*)>4)) then raise exception 'Remix allows four heroes per color, split between two groups'; end if;
 -- Update first so changing away from a limited layout permits larger lineups.
 update public.tracker_banners set banner_type=layout_type where id=banner_id;
 saved_id:=public.save_tracker_banner_timed(banner_id,banner_name,start_date,end_date,start_time,end_time,hero_ids);
 update public.tracker_banners set banner_type=layout_type where id=saved_id;
 return saved_id;
end;$$;

create or replace function public.save_tracker_banner_slots(banner_id uuid,banner_name text,start_date date,end_date date,start_time time,end_time time,hero_ids uuid[],layout_type text,is_coming_soon boolean,slot_ids uuid[]) returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid; slot_count integer; entry record; expected_color text;
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 slot_count:=coalesce(cardinality(slot_ids),0);
 if (layout_type='remix' and slot_count<>16) or (layout_type='revival' and slot_count<>8) or (layout_type='featured' and slot_count<>4) or (layout_type='lme' and (slot_count<12 or slot_count%4<>0)) then raise exception 'Invalid banner slots'; end if;
 if cardinality(hero_ids)<> (select count(*) from unnest(slot_ids) id where id is not null) or exists(select id from unnest(slot_ids) id where id is not null group by id having count(*)>1) or exists(select id from unnest(hero_ids) id where not(id=any(array_remove(slot_ids,null)))) then raise exception 'Invalid or duplicate hero selection'; end if;
 for entry in select id,ordinality-1 as position from unnest(slot_ids) with ordinality as slots(id,ordinality) where id is not null loop
  if layout_type<>'featured' then
   expected_color:=(array['Red','Blue','Green','Colorless'])[case when layout_type='remix' then (entry.position%8)/2+1 else entry.position/(slot_count/4)+1 end];
   if not exists(select 1 from public.heroes where id=entry.id and color=expected_color) then raise exception 'Hero color does not match its slot'; end if;
  end if;
 end loop;
 saved_id:=public.save_tracker_banner_status(banner_id,banner_name,start_date,end_date,start_time,end_time,hero_ids,layout_type,is_coming_soon);
 update public.tracker_banners set slot_count=cardinality(slot_ids) where id=saved_id;
 update public.tracker_banner_heroes bh set slot_index=slots.position from (select id,(ordinality-1)::integer as position from unnest(slot_ids) with ordinality as entries(id,ordinality)) slots where bh.banner_id=saved_id and bh.hero_id=slots.id;
 return saved_id;
end;$$;
revoke all on function public.save_tracker_banner_slots(uuid,text,date,date,time,time,uuid[],text,boolean,uuid[]) from public;
grant execute on function public.save_tracker_banner_slots(uuid,text,date,date,time,time,uuid[],text,boolean,uuid[]) to authenticated;
commit;
