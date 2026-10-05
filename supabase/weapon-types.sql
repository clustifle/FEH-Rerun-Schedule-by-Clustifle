-- Existing heroes remain unassigned. No backfill is performed.
alter table public.heroes add column if not exists weapon_type text;
alter table public.heroes add constraint heroes_weapon_type_check check (
 weapon_type is null or
 (color='Red' and weapon_type in ('Sword','Beast','Bow','Breath','Dagger','Tome')) or
 (color='Blue' and weapon_type in ('Lance','Beast','Bow','Breath','Dagger','Tome')) or
 (color='Green' and weapon_type in ('Axe','Beast','Bow','Breath','Dagger','Tome')) or
 (color='Colorless' and weapon_type in ('Staff','Beast','Bow','Breath','Dagger','Tome'))
);
