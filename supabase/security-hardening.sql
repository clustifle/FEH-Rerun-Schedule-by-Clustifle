begin;
-- Audit confirmed these six client grants; application paths use row-level
-- SELECT/INSERT/UPDATE/DELETE and RPCs, never TRUNCATE. RLS cannot protect TRUNCATE.
revoke truncate on public.forging_bonds_revivals,public.hall_of_forms_revivals from anon,authenticated;
revoke truncate on public.tracker_profiles,public.tracker_personal_tracking from authenticated;
-- These owner-only RPCs already reject anonymous callers internally.
-- Remove the unnecessary anonymous API grant without changing signed-in access.
revoke execute on function public.list_tracker_managers() from public,anon;
revoke execute on function public.set_tracker_manager(text,boolean) from public,anon;
notify pgrst,'reload schema';
commit;
