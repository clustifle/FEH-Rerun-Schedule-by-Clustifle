create or replace function public.mods_list_users(search_term text default '', page_offset integer default 0) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if public.tracker_role() is distinct from 'Owner' then raise exception 'Head Admin access required.'; end if;
 return coalesce((select jsonb_agg(row) from (
 select u.id,coalesce(p.username,'') as username,coalesce(p.display_name,'') as display_name,
 exists(select 1 from auth.identities i where i.user_id=u.id and i.provider='github') as github_linked,
 case when u.id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid then 'Owner' when m.user_id is not null then 'Manager' else 'Visitor' end as role,
 coalesce(x.hidden,false) as hidden,(p.id is not null) as has_profile
 from auth.users u left join public.tracker_profiles p on p.id=u.id left join public.tracker_managers m on m.user_id=u.id left join public.tracker_profile_moderation x on x.user_id=u.id
 where u.email_confirmed_at is not null and length(search_term)<=80 and (search_term='' or position(lower(trim(search_term)) in lower(coalesce(p.username,'')||' '||coalesce(p.display_name,'')))>0)
 order by u.created_at,u.id limit 21 offset greatest(0,least(page_offset,10000))
 ) row),'[]'::jsonb);
end; $$;
revoke execute on function public.mods_list_users(text,integer) from public,anon;
grant execute on function public.mods_list_users(text,integer) to authenticated;
