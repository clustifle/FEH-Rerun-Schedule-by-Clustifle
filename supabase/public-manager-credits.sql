-- Public credits expose only the same names used on public profiles, never account emails.
create or replace function public.public_schedule_manager_credits()
returns table(username text,display_name text)
language sql stable security definer set search_path='' as $$
select p.username,p.display_name from public.tracker_profiles p
join auth.users u on u.id=p.id
join public.tracker_managers m on lower(m.email)=lower(u.email)
where p.username is not null order by p.username;
$$;
revoke all on function public.public_schedule_manager_credits() from public;
grant execute on function public.public_schedule_manager_credits() to anon,authenticated;
