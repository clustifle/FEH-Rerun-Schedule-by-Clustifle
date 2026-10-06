alter table public.tracker_banners add column if not exists sort_order integer not null default 2147483647;

create or replace function public.reorder_tracker_banners(ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path=public as $$
begin
 if not public.is_tracker_owner() then
  raise exception 'Editor access required';
 end if;
 if ordered_ids is null then
  raise exception 'Invalid banner order';
 end if;

 lock table public.tracker_banners in share row exclusive mode;

 if cardinality(ordered_ids)<>(select count(distinct id) from unnest(ordered_ids) id)
    or cardinality(ordered_ids)<>(select count(*) from public.tracker_banners)
    or exists(
      select 1
      from unnest(ordered_ids) id
      left join public.tracker_banners b on b.id=id
      where b.id is null
    )
 then
  raise exception 'Banner list changed; reload before reordering';
 end if;

 update public.tracker_banners b
 set sort_order=ordered.position::integer
 from unnest(ordered_ids) with ordinality as ordered(id, position)
 where b.id=ordered.id;
end $$;

revoke all on function public.reorder_tracker_banners(uuid[]) from public,anon;
grant execute on function public.reorder_tracker_banners(uuid[]) to authenticated;
