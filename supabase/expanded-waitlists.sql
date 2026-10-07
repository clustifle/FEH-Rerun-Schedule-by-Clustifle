-- Existing L/M/E membership and order remain in tracker_waitlist.
-- DSH and NHR start empty; no category or banner changes populate any list.
create table public.tracker_extended_waitlist (
 list_kind text not null check (list_kind in ('dsh','nhr')),
 hero_id uuid not null references public.heroes(id) on delete cascade,
 added_at timestamptz not null default now(),
 sort_order integer not null default 2147483647,
 primary key (list_kind,hero_id)
);
create index tracker_extended_waitlist_hero_idx on public.tracker_extended_waitlist(hero_id);
alter table public.tracker_extended_waitlist enable row level security;
revoke all on public.tracker_extended_waitlist from public,anon,authenticated;
grant select on public.tracker_extended_waitlist to anon,authenticated;
grant insert,delete on public.tracker_extended_waitlist to authenticated;
create policy "View extended waitlists" on public.tracker_extended_waitlist for select to anon,authenticated using (true);
create policy "Editors add extended waitlist heroes" on public.tracker_extended_waitlist for insert to authenticated with check (public.is_tracker_owner());
create policy "Editors remove extended waitlist heroes" on public.tracker_extended_waitlist for delete to authenticated using (public.is_tracker_owner());
create function public.reorder_extended_waitlist(waitlist_kind text,weapon_color text,ordered_ids uuid[])
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 if waitlist_kind not in ('dsh','nhr') or waitlist_kind is null or weapon_color not in ('Red','Blue','Green','Colorless') or weapon_color is null or ordered_ids is null then raise exception 'Invalid waitlist, color or order'; end if;
 lock table public.tracker_extended_waitlist in share row exclusive mode;
 if cardinality(ordered_ids)<>(select count(distinct id) from unnest(ordered_ids) id)
 or exists(select 1 from unnest(ordered_ids) id left join public.tracker_extended_waitlist w on w.hero_id=id and w.list_kind=waitlist_kind left join public.heroes h on h.id=w.hero_id where w.hero_id is null or h.color<>weapon_color)
 or cardinality(ordered_ids)<>(select count(*) from public.tracker_extended_waitlist w join public.heroes h on h.id=w.hero_id where w.list_kind=waitlist_kind and h.color=weapon_color)
 then raise exception 'Waitlist changed; reload before reordering'; end if;
 update public.tracker_extended_waitlist w set sort_order=ordered.position::integer
 from unnest(ordered_ids) with ordinality as ordered(id,position)
 where w.hero_id=ordered.id and w.list_kind=waitlist_kind;
end $$;
revoke all on function public.reorder_extended_waitlist(text,text,uuid[]) from public,anon;
grant execute on function public.reorder_extended_waitlist(text,text,uuid[]) to authenticated;
alter table public.heroes drop constraint heroes_schedule_check;
alter table public.heroes add constraint heroes_schedule_check check (schedule in ('General','Remix','Monthly Revival','Waitlist','DSH Waitlist','NHR Waitlist'));
alter table public.heroes drop constraint heroes_check;
alter table public.heroes add constraint heroes_check check (schedule in ('Waitlist','DSH Waitlist','NHR Waitlist') or month is not null);
alter table public.heroes drop constraint heroes_waitlist_month_check;
alter table public.heroes add constraint heroes_waitlist_month_check check (schedule not in ('Waitlist','DSH Waitlist','NHR Waitlist') or month is null);
