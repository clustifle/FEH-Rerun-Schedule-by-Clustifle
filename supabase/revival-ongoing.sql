begin;
alter table public.forging_bonds_revivals add column if not exists ongoing boolean not null default false;
alter table public.forging_bonds_revivals add column if not exists starts_on date;
alter table public.forging_bonds_revivals add column if not exists ends_on date;
alter table public.forging_bonds_revivals add column if not exists starts_time time not null default '07:00';
alter table public.forging_bonds_revivals add column if not exists ends_time time not null default '06:59';
alter table public.forging_bonds_revivals add constraint revival_ongoing_dates check(not ongoing or (starts_on is not null and ends_on is not null and ends_on+ends_time>starts_on+starts_time));
commit;
