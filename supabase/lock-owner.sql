create or replace function public.is_tracker_owner() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=(select auth.uid()) and id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid and lower(email)='shyguyvn@gmail.com' and email_confirmed_at is not null);
$$;
