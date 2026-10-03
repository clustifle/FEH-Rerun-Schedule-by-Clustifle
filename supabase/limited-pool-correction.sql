begin;
alter table public.heroes drop constraint heroes_pool_check;
update public.heroes set pool='Limited Pool' where pool='Special Heroes Pool' or (pool='General Pool' and category in ('Rearmed','Attuned','Aided','Entwined','Vista','Chosen Hero'));
alter table public.heroes add constraint heroes_pool_check check(pool in ('General Pool','Limited Pool','L/M/E Pool'));
commit;
