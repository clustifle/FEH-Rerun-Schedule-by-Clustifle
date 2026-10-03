-- Optional editor-maintained summoning distinction. Existing entries stay unmarked.
alter table public.heroes add column demote boolean not null default false;
