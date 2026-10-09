create or replace function public.feh_github_signup_policy(event jsonb) returns jsonb language plpgsql stable security invoker set search_path='' as $$
begin
 if event->'user'->'app_metadata'->>'provider' is distinct from 'github' then return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','New accounts require GitHub. Existing email users should use Legacy Sign-in.')); end if;
 return '{}'::jsonb;
end; $$;
create or replace function public.feh_github_token_policy(event jsonb) returns jsonb language plpgsql stable security invoker set search_path='' as $$
begin
 if event->>'authentication_method' in ('password','otp','magiclink','recovery','email/signup') and exists(select 1 from auth.identities where user_id=(event->>'user_id')::uuid and provider='github') then
 return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','This account is linked to GitHub. Continue with GitHub to sign in.'));
 end if;
 return jsonb_build_object('claims',event->'claims');
end; $$;
revoke execute on function public.feh_github_signup_policy(jsonb),public.feh_github_token_policy(jsonb) from public,anon,authenticated;
grant execute on function public.feh_github_signup_policy(jsonb),public.feh_github_token_policy(jsonb) to supabase_auth_admin;
