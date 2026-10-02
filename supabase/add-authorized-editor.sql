-- Run manager-roles.sql first. Add the initial Manager without changing the Owner.
insert into public.tracker_managers(user_id,email) select id,lower(email) from auth.users where id='2e379498-6cf4-4122-8f0e-d64aaa670517'::uuid and lower(email)='althompsonjr0713@gmail.com' and email_confirmed_at is not null on conflict(user_id) do update set email=excluded.email;
