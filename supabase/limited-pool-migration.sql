begin;
alter table public.heroes drop constraint heroes_pool_check;
update public.heroes set pool='Limited Pool' where pool='Special Heroes Pool' or category in ('Legendary','Mythic','Emblem','Chosen Hero','Rearmed','Attuned','Aided','Entwined','Duo','Harmonized','Vista');
alter table public.heroes add constraint heroes_pool_check check(pool in ('General Pool','Limited Pool'));
commit;
