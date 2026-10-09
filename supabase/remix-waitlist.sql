alter table public.tracker_extended_waitlist drop constraint tracker_extended_waitlist_list_kind_check;
alter table public.tracker_extended_waitlist add constraint tracker_extended_waitlist_list_kind_check check (list_kind in ('dsh','nhr','remix'));
alter table public.heroes drop constraint heroes_schedule_check;
alter table public.heroes add constraint heroes_schedule_check check (schedule in ('None','General','Remix','Monthly Revival','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist'));
alter table public.heroes drop constraint heroes_check;
alter table public.heroes add constraint heroes_check check (schedule in ('None','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist') or month is not null);
alter table public.heroes drop constraint heroes_waitlist_month_check;
alter table public.heroes add constraint heroes_waitlist_month_check check (schedule not in ('Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist') or month is null);
alter table public.heroes add constraint heroes_remix_waitlist_pool_check check (schedule<>'Remix Waitlist' or (pool is not null and pool in ('General Pool','Non-Seasonal Limited')));
create or replace function public.validate_remix_waitlist_member() returns trigger language plpgsql set search_path='' as $$
declare hero_pool text;
begin
 if new.list_kind='remix' then
  select h.pool into hero_pool from public.heroes h where h.id=new.hero_id for share;
  if hero_pool is null or hero_pool not in ('General Pool','Non-Seasonal Limited') then raise exception 'Remix Waitlist accepts only General Pool and Non-Seasonal Limited heroes.'; end if;
 end if;
 return new;
end $$;
create trigger validate_remix_waitlist_member before insert or update on public.tracker_extended_waitlist for each row execute function public.validate_remix_waitlist_member();
create or replace function public.protect_remix_waitlist_pool() returns trigger language plpgsql set search_path='' as $$
begin
 if (new.pool is null or new.pool not in ('General Pool','Non-Seasonal Limited')) and exists(select 1 from public.tracker_extended_waitlist w where w.hero_id=new.id and w.list_kind='remix') then raise exception 'Remove this hero from Remix Waitlist before changing to an ineligible pool.'; end if;
 return new;
end $$;
create trigger protect_remix_waitlist_pool before update of pool on public.heroes for each row execute function public.protect_remix_waitlist_pool();
create or replace function public.reorder_extended_waitlist(waitlist_kind text,weapon_color text,ordered_ids uuid[]) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 if waitlist_kind not in ('dsh','nhr','remix') or waitlist_kind is null or weapon_color not in ('Red','Blue','Green','Colorless') or weapon_color is null or ordered_ids is null then raise exception 'Invalid waitlist, color or order'; end if;
 lock table public.tracker_extended_waitlist in share row exclusive mode;
 if cardinality(ordered_ids)<>(select count(distinct id) from unnest(ordered_ids) id)
 or exists(select 1 from unnest(ordered_ids) id left join public.tracker_extended_waitlist w on w.hero_id=id and w.list_kind=waitlist_kind left join public.heroes h on h.id=w.hero_id where w.hero_id is null or h.color<>weapon_color)
 or cardinality(ordered_ids)<>(select count(*) from public.tracker_extended_waitlist w join public.heroes h on h.id=w.hero_id where w.list_kind=waitlist_kind and h.color=weapon_color)
 then raise exception 'Waitlist changed; reload before reordering'; end if;
 update public.tracker_extended_waitlist w set sort_order=ordered.position::integer from unnest(ordered_ids) with ordinality as ordered(id,position) where w.hero_id=ordered.id and w.list_kind=waitlist_kind;
end $$;
revoke all on function public.reorder_extended_waitlist(text,text,uuid[]) from public,anon;
grant execute on function public.reorder_extended_waitlist(text,text,uuid[]) to authenticated;
