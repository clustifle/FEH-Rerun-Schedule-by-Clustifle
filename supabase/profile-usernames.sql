begin;
-- Fill missing public usernames without changing any existing username.
do $$ declare p record; candidate text; stem text; n integer; begin
 for p in select id,display_name from public.tracker_profiles where username is null order by id loop
  stem:=left(trim(both '_' from regexp_replace(lower(p.display_name),'[^a-z0-9_]+','_','g')),18);
  if length(stem)<3 then stem:='feh_user'; end if;
  candidate:=stem;n:=1;
  while exists(select 1 from public.tracker_profiles where username=candidate) loop candidate:=stem||'_'||n::text;n:=n+1;end loop;
  update public.tracker_profiles set username=candidate where id=p.id and username is null;
 end loop;
end $$;
create or replace function public.get_public_tracker_profile_by_username(profile_username text) returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_public_tracker_profile(p.id) from public.tracker_profiles p where p.username=lower(profile_username) and char_length(profile_username) between 3 and 24;
$$;
revoke all on function public.get_public_tracker_profile_by_username(text) from public;
grant execute on function public.get_public_tracker_profile_by_username(text) to anon,authenticated;
create or replace function public.search_public_tracker_profiles(search_term text, result_offset integer default 0) returns table(id uuid,username text,display_name text,avatar_path text) language sql stable security definer set search_path='' as $$
 select p.id,p.username,p.display_name,p.avatar_path from public.tracker_profiles p
 where char_length(trim(search_term)) between 2 and 80 and p.username is not null
 and (position(lower(trim(search_term)) in p.username)>0 or position(lower(trim(search_term)) in lower(p.display_name))>0)
 order by (p.username=lower(trim(search_term))) desc,p.username,p.id
 limit 21 offset greatest(0,least(coalesce(result_offset,0),500));
$$;
revoke all on function public.search_public_tracker_profiles(text,integer) from public;
grant execute on function public.search_public_tracker_profiles(text,integer) to anon,authenticated;
commit;
