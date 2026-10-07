-- Manual editor options. Existing hero assignments and editor-only RLS remain unchanged.
alter table public.heroes drop constraint heroes_schedule_check;
alter table public.heroes add constraint heroes_schedule_check check(schedule in ('None','General','Remix','Monthly Revival','Waitlist','DSH Waitlist','NHR Waitlist'));
alter table public.heroes drop constraint heroes_check;
alter table public.heroes add constraint heroes_check check(schedule in ('None','Waitlist','DSH Waitlist','NHR Waitlist') or month is not null);
alter table public.heroes add constraint heroes_none_month_check check(schedule <> 'None' or month is null);
alter table public.heroes drop constraint heroes_pool_check;
alter table public.heroes add constraint heroes_pool_check check(pool in ('General Pool','Non-Seasonal Limited','Seasonal Limited','L/M/E Pool','Limited Pool','Grail Pool'));
