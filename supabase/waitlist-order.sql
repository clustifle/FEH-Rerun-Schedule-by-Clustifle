-- Shared order; membership and weapon colors are never changed by reordering.
alter table public.tracker_waitlist add column if not exists sort_order integer not null default 2147483647;
create or replace function public.reorder_tracker_waitlist(weapon_color text,ordered_ids uuid[])
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 if weapon_color not in ('Red','Blue','Green','Colorless') or ordered_ids is null then raise exception 'Invalid color or order'; end if;
 lock table public.tracker_waitlist in share row exclusive mode;
 if cardinality(ordered_ids)<>(select count(distinct id) from unnest(ordered_ids) id)
 or exists(select 1 from unnest(ordered_ids) id left join public.tracker_waitlist w on w.hero_id=id left join public.heroes h on h.id=w.hero_id where w.hero_id is null or h.color<>weapon_color)
 or cardinality(ordered_ids)<>(select count(*) from public.tracker_waitlist w join public.heroes h on h.id=w.hero_id where h.color=weapon_color)
 then raise exception 'Waitlist changed; reload before reordering'; end if;
 update public.tracker_waitlist w set sort_order=ordered.position::integer
 from unnest(ordered_ids) with ordinality as ordered(id,position) where w.hero_id=ordered.id;
end $$;
revoke all on function public.reorder_tracker_waitlist(text,uuid[]) from public,anon;
grant execute on function public.reorder_tracker_waitlist(text,uuid[]) to authenticated;
