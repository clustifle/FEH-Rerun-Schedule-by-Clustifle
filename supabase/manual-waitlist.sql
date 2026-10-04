create table public.tracker_waitlist(hero_id uuid primary key references public.heroes(id) on delete cascade,added_at timestamptz not null default now());
alter table public.tracker_waitlist enable row level security;
revoke all on public.tracker_waitlist from anon,public,authenticated;
grant select on public.tracker_waitlist to anon,authenticated;
grant insert,delete on public.tracker_waitlist to authenticated;
create policy "View manual waitlist" on public.tracker_waitlist for select using (true);
create policy "Editors add waitlist heroes" on public.tracker_waitlist for insert to authenticated with check (public.is_tracker_owner());
create policy "Editors remove waitlist heroes" on public.tracker_waitlist for delete to authenticated using (public.is_tracker_owner());
