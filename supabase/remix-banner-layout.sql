-- Add the 16-slot Remix layout used by Legendary / Mythic / Emblem Remix banners.
-- Slot indexes are stable so the UI can preserve the two banner halves:
--   0-7  = Remix 1 (Red 0-1, Blue 2-3, Green 4-5, Colorless 6-7)
--   8-15 = Remix 2 in the same color order.
begin;

alter table public.tracker_banners drop constraint if exists tracker_banners_banner_type_check;
alter table public.tracker_banners
 add constraint tracker_banners_banner_type_check
 check (banner_type in ('lme','featured','revival','remix'));

alter table public.tracker_banner_heroes
 add column if not exists slot_index smallint;

alter table public.tracker_banner_heroes
 drop constraint if exists tracker_banner_heroes_slot_index_check;
alter table public.tracker_banner_heroes
 add constraint tracker_banner_heroes_slot_index_check
 check (slot_index is null or slot_index between 0 and 15);

create unique index if not exists tracker_banner_heroes_banner_slot_unique
 on public.tracker_banner_heroes(banner_id,slot_index)
 where slot_index is not null;

create or replace function public.save_tracker_banner_layout(
 banner_id uuid,
 banner_name text,
 start_date date,
 end_date date,
 start_time time,
 end_time time,
 hero_ids uuid[],
 layout_type text
) returns uuid
language plpgsql
security invoker
set search_path=''
as $$
declare saved_id uuid;
begin
 if layout_type not in ('lme','featured','revival','remix') then
  raise exception 'Invalid banner type';
 end if;

 if layout_type='featured' and cardinality(hero_ids)>4 then
  raise exception 'Featured banners can contain up to four heroes';
 end if;

 if layout_type='revival' and exists(
  select color
  from public.heroes
  where id=any(hero_ids)
  group by color
  having count(*)>2
 ) then
  raise exception 'Revival / Double Special banners allow up to two heroes per color';
 end if;

 if layout_type='remix' then
  if cardinality(hero_ids)>16 then
   raise exception 'Remix banners can contain up to sixteen heroes';
  end if;
  if exists(
   select color
   from public.heroes
   where id=any(hero_ids)
   group by color
   having count(*)>4
  ) then
   raise exception 'Remix banners allow up to four heroes per color';
  end if;
 end if;

 -- Change the layout before the timed save so moving away from a limited
 -- layout does not leave the old trigger rules in force.
 update public.tracker_banners set banner_type=layout_type where id=banner_id;
 saved_id:=public.save_tracker_banner_timed(
  banner_id,banner_name,start_date,end_date,start_time,end_time,hero_ids
 );
 update public.tracker_banners set banner_type=layout_type where id=saved_id;
 return saved_id;
end;
$$;

revoke all on function public.save_tracker_banner_layout(uuid,text,date,date,time,time,uuid[],text) from public;
grant execute on function public.save_tracker_banner_layout(uuid,text,date,date,time,time,uuid[],text) to authenticated;

create or replace function public.check_revival_banner_slots()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
declare
 kind text;
 hero_color text;
 max_per_color integer;
begin
 select banner_type into kind
 from public.tracker_banners
 where id=new.banner_id
 for update;

 if kind in ('revival','remix') then
  select color into hero_color from public.heroes where id=new.hero_id;

  if exists(
   select 1 from public.tracker_banner_heroes
   where banner_id=new.banner_id and hero_id=new.hero_id
  ) then
   return new;
  end if;

  max_per_color:=case when kind='remix' then 4 else 2 end;

  if (
   select count(*)
   from public.tracker_banner_heroes bh
   join public.heroes h on h.id=bh.hero_id
   where bh.banner_id=new.banner_id and h.color=hero_color
  )>=max_per_color then
   raise exception 'This banner already has % % heroes. Edit its lineup to replace a hero.',
    max_per_color,hero_color;
  end if;
 end if;

 return new;
end;
$$;

drop trigger if exists limit_revival_banner_slots on public.tracker_banner_heroes;
create trigger limit_revival_banner_slots
 before insert on public.tracker_banner_heroes
 for each row execute function public.check_revival_banner_slots();

commit;
