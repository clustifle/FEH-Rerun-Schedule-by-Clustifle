-- A reusable numbered lineup, separate from every scheduled appearance.
create table public.weekly_revival_banners (
 number integer primary key check(number>0),
 hero_1 uuid references public.heroes(id) on delete restrict,
 hero_2 uuid references public.heroes(id) on delete restrict,
 hero_3 uuid references public.heroes(id) on delete restrict,
 source_url text not null default '' check(length(source_url)<=1000 and (source_url='' or source_url ~ '^https://')),
 revision integer not null default 1,
 check ((hero_1 is null and hero_2 is null and hero_3 is null) or
 (hero_1 is not null and hero_2 is not null and hero_3 is not null and hero_1<>hero_2 and hero_1<>hero_3 and hero_2<>hero_3))
);
create table public.weekly_revival_events (
 id uuid primary key default gen_random_uuid(),
 banner_number integer not null references public.weekly_revival_banners(number) on delete restrict,
 starts_on date not null, ends_on date not null check(ends_on>starts_on),
 confirmed boolean not null default true,
 source_url text not null default '' check(length(source_url)<=1000 and (source_url='' or source_url ~ '^https://')),
 revision integer not null default 1,
 unique(banner_number,starts_on)
);
create index weekly_revival_events_dates on public.weekly_revival_events(starts_on,ends_on);
alter table public.weekly_revival_banners enable row level security;
alter table public.weekly_revival_events enable row level security;
create policy weekly_banners_read on public.weekly_revival_banners for select to anon,authenticated using(true);
create policy weekly_events_read on public.weekly_revival_events for select to anon,authenticated using(true);
create policy weekly_banners_staff on public.weekly_revival_banners for all to authenticated using(public.is_tracker_owner()) with check(public.is_tracker_owner());
create policy weekly_events_staff on public.weekly_revival_events for all to authenticated using(public.is_tracker_owner()) with check(public.is_tracker_owner());
revoke all on public.weekly_revival_banners,public.weekly_revival_events from anon,authenticated;
grant select on public.weekly_revival_banners,public.weekly_revival_events to anon;
grant select,insert,update,delete on public.weekly_revival_banners,public.weekly_revival_events to authenticated;
create function tracker_private.validate_weekly_revival() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' then new.revision:=old.revision+1; end if;
 if tg_table_name='weekly_revival_events' then
  perform 1 from public.weekly_revival_banners where number=new.banner_number and hero_1 is not null for share;
  if not found then raise exception 'Add the three focus heroes before scheduling this banner'; end if;
 elsif new.hero_1 is null and exists(select 1 from public.weekly_revival_events where banner_number=new.number) then
  raise exception 'Remove appearances before clearing the lineup';
 end if;
 return new;
end $$;
revoke all on function tracker_private.validate_weekly_revival() from public,anon,authenticated;
create trigger validate_weekly_banner before insert or update on public.weekly_revival_banners for each row execute function tracker_private.validate_weekly_revival();
create trigger validate_weekly_event before insert or update on public.weekly_revival_events for each row execute function tracker_private.validate_weekly_revival();
insert into public.weekly_revival_banners(number) select generate_series(1,109);
