begin;
create table if not exists public.forging_bonds_revivals(month date primary key check(extract(day from month)=1),title text not null default 'Title to be announced' check(length(title) between 1 and 150),hero_1 uuid references public.heroes(id) on delete set null,hero_2 uuid references public.heroes(id) on delete set null,hero_3 uuid references public.heroes(id) on delete set null,hero_4 uuid references public.heroes(id) on delete set null);
alter table public.forging_bonds_revivals enable row level security;
create policy "Public Forging Bonds schedule" on public.forging_bonds_revivals for select to anon,authenticated using(true);
create policy "Editors manage Forging Bonds" on public.forging_bonds_revivals for all to authenticated using((select public.is_tracker_owner())) with check((select public.is_tracker_owner()));
grant select on public.forging_bonds_revivals to anon;
grant select,insert,update,delete on public.forging_bonds_revivals to authenticated;
insert into public.forging_bonds_revivals(month) select generate_series('2026-11-01'::date,'2029-12-01'::date,'1 month')::date on conflict do nothing;
commit;
