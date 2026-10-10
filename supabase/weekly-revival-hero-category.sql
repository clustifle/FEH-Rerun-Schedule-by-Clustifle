alter table public.heroes drop constraint heroes_schedule_check;
alter table public.heroes add constraint heroes_schedule_check check(schedule in ('None','General','Remix','Monthly Revival','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist','Schedule Under Consideration','Weekly Revival'));
alter table public.heroes drop constraint heroes_check;
alter table public.heroes add constraint heroes_check check(schedule in ('None','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist','Schedule Under Consideration','Weekly Revival') or month is not null);
alter table public.heroes drop constraint heroes_waitlist_month_check;
alter table public.heroes add constraint heroes_waitlist_month_check check(schedule not in ('Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist','Schedule Under Consideration','Weekly Revival') or month is null);
