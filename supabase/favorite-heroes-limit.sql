-- Increase favorite hero capacity without changing profile permissions.
begin;
alter table public.tracker_profiles drop constraint tracker_profiles_favorite_heroes_check;
alter table public.tracker_profiles add constraint tracker_profiles_favorite_heroes_check check (cardinality(favorite_heroes) <= 20);
commit;
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.tracker_profiles'::regclass
and conname = 'tracker_profiles_favorite_heroes_check';
