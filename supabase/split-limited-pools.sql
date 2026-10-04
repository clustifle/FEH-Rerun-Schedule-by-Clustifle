begin;
alter table public.heroes drop constraint if exists heroes_pool_check;
update public.heroes set pool=case when category in ('Special','Duo','Harmonized') then 'Seasonal Limited' else 'Non-Seasonal Limited' end where pool in ('Limited Pool','Special Heroes Pool');
-- Retain the legacy value for clients already open during deployment.
alter table public.heroes add constraint heroes_pool_check check(pool in ('General Pool','Non-Seasonal Limited','Seasonal Limited','L/M/E Pool','Limited Pool'));
commit;
