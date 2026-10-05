begin;
alter table public.tracker_profiles add column username text check (username is null or username ~ '^[a-z0-9_]{3,24}$'), add column about text not null default '' check (char_length(about)<=1500), add column favorite_heroes uuid[] not null default '{}' check (cardinality(favorite_heroes)<=20), add column favorite_games text[] not null default '{}' check (cardinality(favorite_games)<=12), add column visibility jsonb not null default '{"bio":true,"social_links":true,"about":true,"favorite_heroes":true,"favorite_games":true}'::jsonb check (jsonb_typeof(visibility)='object');
create unique index tracker_profiles_username_unique on public.tracker_profiles(username) where username is not null;
drop policy "Public profiles readable" on public.tracker_profiles;
revoke all on public.tracker_profiles from anon,public;
create policy "Read own full profile" on public.tracker_profiles for select to authenticated using (id=auth.uid());
create or replace function public.get_public_tracker_profile(profile_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',p.id,'display_name',p.display_name,'username',p.username,'avatar_path',p.avatar_path,
 'bio',case when p.id=auth.uid() or coalesce(p.visibility->'bio','true'::jsonb)='true'::jsonb then p.bio else '' end,
 'social_links',case when p.id=auth.uid() or coalesce(p.visibility->'social_links','true'::jsonb)='true'::jsonb then p.social_links else '[]'::jsonb end,
 'about',case when p.id=auth.uid() or coalesce(p.visibility->'about','true'::jsonb)='true'::jsonb then p.about else '' end,
 'favorite_heroes',case when p.id=auth.uid() or coalesce(p.visibility->'favorite_heroes','true'::jsonb)='true'::jsonb then to_jsonb(p.favorite_heroes) else '[]'::jsonb end,
 'favorite_games',case when p.id=auth.uid() or coalesce(p.visibility->'favorite_games','true'::jsonb)='true'::jsonb then to_jsonb(p.favorite_games) else '[]'::jsonb end,
 'role',case when p.id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid and exists(select 1 from auth.users u where u.id=p.id and u.email_confirmed_at is not null) then 'Head Administrator' when exists(select 1 from public.tracker_managers m join auth.users u on u.id=m.user_id where m.user_id=p.id and m.email=lower(u.email) and u.email_confirmed_at is not null) then 'Schedule Manager' else null end)
 from public.tracker_profiles p where p.id=profile_id;
$$;
revoke all on function public.get_public_tracker_profile(uuid) from public;
grant execute on function public.get_public_tracker_profile(uuid) to anon,authenticated;
create table public.tracker_personal_tracking(id uuid primary key references auth.users(id) on delete cascade,followed_heroes uuid[] not null default '{}' check (cardinality(followed_heroes)<=100),saved_schedules jsonb not null default '[]'::jsonb check (jsonb_typeof(saved_schedules)='array' and jsonb_array_length(saved_schedules)<=20));
alter table public.tracker_personal_tracking enable row level security;
revoke all on public.tracker_personal_tracking from anon,public;
grant select,insert,update on public.tracker_personal_tracking to authenticated;
create policy "Read own personal tracking" on public.tracker_personal_tracking for select to authenticated using (id=auth.uid());
create policy "Create own personal tracking" on public.tracker_personal_tracking for insert to authenticated with check (id=auth.uid());
create policy "Update own personal tracking" on public.tracker_personal_tracking for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
commit;
