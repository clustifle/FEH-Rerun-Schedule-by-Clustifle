begin;
drop trigger if exists route_unknown_hero_to_waitlist on public.heroes;
alter table public.heroes alter column status set default 'Confirmed';
alter table public.heroes drop constraint heroes_check;
alter table public.heroes add constraint heroes_check check(schedule='Waitlist' or month is not null);
commit;
