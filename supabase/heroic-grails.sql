-- Grail status is assigned manually. Existing and new heroes start unmarked.
alter table public.heroes add column heroic_grail boolean not null default false;
