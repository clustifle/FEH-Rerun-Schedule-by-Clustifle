begin;
alter table public.heroes drop constraint heroes_pool_check;
update public.heroes set pool=case when category in ('Legendary','Mythic','Emblem') then 'L/M/E Pool' when category in ('Special','Duo','Harmonized') then 'Special Heroes Pool' else 'General Pool' end where pool='Limited Pool' or pool is null;
alter table public.heroes add constraint heroes_pool_check check(pool in ('General Pool','Special Heroes Pool','L/M/E Pool'));
commit;
