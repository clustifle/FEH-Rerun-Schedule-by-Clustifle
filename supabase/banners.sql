-- Banner dates are inclusive calendar dates in UTC.
begin;
create table public.tracker_banners (
 id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(trim(name)) between 1 and 150),
 starts_on date not null,
 ends_on date not null,
 updated timestamptz not null default now(),
 check(ends_on>=starts_on)
);
create table public.tracker_banner_heroes (
 banner_id uuid not null references public.tracker_banners(id) on delete cascade,
 hero_id uuid not null references public.heroes(id) on delete cascade,
 primary key(banner_id,hero_id)
);
alter table public.tracker_banners enable row level security;
alter table public.tracker_banner_heroes enable row level security;
revoke all on public.tracker_banners,public.tracker_banner_heroes from anon,authenticated;
grant select on public.tracker_banners,public.tracker_banner_heroes to anon,authenticated;
grant insert,update,delete on public.tracker_banners,public.tracker_banner_heroes to authenticated;
create policy "Public banners" on public.tracker_banners for select to anon,authenticated using(true);
create policy "Editors manage banners" on public.tracker_banners for all to authenticated using((select public.is_tracker_owner())) with check((select public.is_tracker_owner()));
create policy "Public banner heroes" on public.tracker_banner_heroes for select to anon,authenticated using(true);
create policy "Editors manage banner heroes" on public.tracker_banner_heroes for all to authenticated using((select public.is_tracker_owner())) with check((select public.is_tracker_owner()));
create function public.save_tracker_banner(banner_id uuid,banner_name text,start_date date,end_date date,hero_ids uuid[]) returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid:=coalesce(banner_id,gen_random_uuid());
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 insert into public.tracker_banners(id,name,starts_on,ends_on,updated) values(saved_id,trim(banner_name),start_date,end_date,now()) on conflict(id) do update set name=excluded.name,starts_on=excluded.starts_on,ends_on=excluded.ends_on,updated=excluded.updated;
 delete from public.tracker_banner_heroes bh where bh.banner_id=saved_id;
 insert into public.tracker_banner_heroes(banner_id,hero_id) select saved_id,unnest(coalesce(hero_ids,'{}'::uuid[])) on conflict do nothing;
 return saved_id;
end;
$$;
revoke all on function public.save_tracker_banner(uuid,text,date,date,uuid[]) from public;
grant execute on function public.save_tracker_banner(uuid,text,date,date,uuid[]) to authenticated;
commit;
