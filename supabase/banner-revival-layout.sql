begin;
alter table public.tracker_banners drop constraint if exists tracker_banners_banner_type_check;
alter table public.tracker_banners add constraint tracker_banners_banner_type_check check (banner_type in ('lme','featured','revival'));
create or replace function public.save_tracker_banner_layout(banner_id uuid,banner_name text,start_date date,end_date date,start_time time,end_time time,hero_ids uuid[],layout_type text) returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid;
begin
 if layout_type not in ('lme','featured','revival') then raise exception 'Invalid banner type'; end if;
 if layout_type='featured' and cardinality(hero_ids)>4 then raise exception 'Featured banners can contain up to four heroes'; end if;
 if layout_type='revival' and exists(select color from public.heroes where id=any(hero_ids) group by color having count(*)>2) then raise exception 'Revival / Double Special banners allow up to two heroes per color'; end if;
 -- Update first so changing away from a limited layout permits larger lineups.
 update public.tracker_banners set banner_type=layout_type where id=banner_id;
 saved_id:=public.save_tracker_banner_timed(banner_id,banner_name,start_date,end_date,start_time,end_time,hero_ids);
 update public.tracker_banners set banner_type=layout_type where id=saved_id;
 return saved_id;
end;$$;
create or replace function public.check_revival_banner_slots() returns trigger language plpgsql security invoker set search_path='' as $$
declare kind text; hero_color text;
begin
 select banner_type into kind from public.tracker_banners where id=new.banner_id for update;
 if kind='revival' then
  select color into hero_color from public.heroes where id=new.hero_id;
  if exists(select 1 from public.tracker_banner_heroes where banner_id=new.banner_id and hero_id=new.hero_id) then return new; end if;
  if (select count(*) from public.tracker_banner_heroes bh join public.heroes h on h.id=bh.hero_id where bh.banner_id=new.banner_id and h.color=hero_color)>=2 then raise exception 'This banner already has two % heroes. Edit its lineup to replace a hero.',hero_color; end if;
 end if;
 return new;
end;$$;
drop trigger if exists limit_revival_banner_slots on public.tracker_banner_heroes;
create trigger limit_revival_banner_slots before insert on public.tracker_banner_heroes for each row execute function public.check_revival_banner_slots();
commit;
