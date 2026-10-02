begin;
alter table public.heroes drop constraint heroes_category_check;
alter table public.heroes add constraint heroes_category_check check(category in ('Legendary','Mythic','Emblem','Chosen Hero','Rearmed','Attuned','Aided','Entwined','Duo','Harmonized','Vista','General','Special'));
commit;
