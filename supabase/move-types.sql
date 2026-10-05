-- Optional manual assignment. Existing heroes remain unassigned.
alter table public.heroes add column if not exists move_type text;
alter table public.heroes add constraint heroes_move_type_check check (move_type is null or move_type in ('Fliers','Armored','Cavalry','Infantry'));
