create or replace function public.move_hof_revival(source_month date,target_month date,expected_lineup jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare src public.hall_of_forms_revivals; dst public.hall_of_forms_revivals;
begin
 if coalesce(public.tracker_role(),'') not in ('Owner','Manager') then raise exception 'Staff access required'; end if;
 if source_month=target_month then raise exception 'Choose a different month'; end if;
 perform month from public.hall_of_forms_revivals where month in (source_month,target_month) order by month for update;
 select * into src from public.hall_of_forms_revivals where month=source_month;
 select * into dst from public.hall_of_forms_revivals where month=target_month;
 if src.month is null or dst.month is null then raise exception 'Revival month not found'; end if;
 if src.hero_1 is null and src.hero_2 is null and src.hero_3 is null and src.hero_4 is null then raise exception 'The source has no lineup'; end if;
 if jsonb_build_object('title',src.title,'hero_1',src.hero_1,'hero_2',src.hero_2,'hero_3',src.hero_3,'hero_4',src.hero_4) is distinct from expected_lineup then raise exception 'This lineup changed. Reload and try again'; end if;
 if dst.hero_1 is not null or dst.hero_2 is not null or dst.hero_3 is not null or dst.hero_4 is not null then raise exception 'The destination already has a lineup. Choose an empty month'; end if;
 update public.hall_of_forms_revivals set title=src.title,hero_1=src.hero_1,hero_2=src.hero_2,hero_3=src.hero_3,hero_4=src.hero_4,ongoing=false,coming_soon=false,starts_on=null,ends_on=null,home_featured=src.home_featured where month=target_month;
 update public.hall_of_forms_revivals set title='Title to be announced',hero_1=null,hero_2=null,hero_3=null,hero_4=null,ongoing=false,coming_soon=false,starts_on=null,ends_on=null,home_featured=false where month=source_month;
end $$;
revoke all on function public.move_hof_revival(date,date,jsonb) from public;
grant execute on function public.move_hof_revival(date,date,jsonb) to authenticated;
revoke execute on function public.move_hof_revival(date,date,jsonb) from anon;
