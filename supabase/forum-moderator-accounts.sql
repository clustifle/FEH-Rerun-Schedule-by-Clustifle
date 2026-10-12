create or replace function public.mods_forum_accounts() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if public.tracker_role() is distinct from 'Owner' then raise exception 'Head Admin access required'; end if;
 return coalesce((select jsonb_agg(row) from (
 select i.user_id::text as website_id,coalesce(i.identity_data->>'provider_id',i.identity_data->>'sub',i.provider_id) as github_id,p.username as login,p.username as username
 from auth.identities i join auth.users u on u.id=i.user_id join public.tracker_profiles p on p.id=i.user_id
 where p.username is not null and not exists(select 1 from public.tracker_profile_moderation m where m.user_id=p.id and m.hidden) and i.provider='github' and u.email_confirmed_at is not null and coalesce(i.identity_data->>'provider_id',i.identity_data->>'sub',i.provider_id) ~ '^\d{1,20}$'
 order by lower(p.username)
 ) row),'[]'::jsonb);
end $$;
revoke all on function public.mods_forum_accounts() from public,anon;
grant execute on function public.mods_forum_accounts() to authenticated;

