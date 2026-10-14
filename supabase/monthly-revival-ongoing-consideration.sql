alter table public.monthly_revival_events drop constraint monthly_revival_events_check1;
alter table public.monthly_revival_events add constraint monthly_revival_events_dates_check check(
 (starts_on is null and ends_on is null) or
 (starts_on is not null and ends_on is not null and duration is not null
 and ends_on-starts_on=duration and month=date_trunc('month',starts_on)::date)
);
