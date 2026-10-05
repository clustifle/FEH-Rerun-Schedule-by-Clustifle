begin;
alter table public.tracker_banners add column if not exists coming_soon boolean not null default false;
alter table public.forging_bonds_revivals add column if not exists coming_soon boolean not null default false;
alter table public.hall_of_forms_revivals add column if not exists coming_soon boolean not null default false;
create or replace function public.save_tracker_banner_status(banner_id uuid,banner_name text,start_date date,end_date date,start_time time,end_time time,hero_ids uuid[],layout_type text,is_coming_soon boolean) returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid;
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 saved_id:=public.save_tracker_banner_layout(banner_id,banner_name,start_date,end_date,start_time,end_time,hero_ids,layout_type);
 update public.tracker_banners set coming_soon=coalesce(is_coming_soon,false) where id=saved_id;
 return saved_id;
end;$$;
revoke all on function public.save_tracker_banner_status(uuid,text,date,date,time,time,uuid[],text,boolean) from public;
grant execute on function public.save_tracker_banner_status(uuid,text,date,date,time,time,uuid[],text,boolean) to authenticated;
commit;
