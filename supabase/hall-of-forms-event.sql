alter table public.tracker_banners add column if not exists event_type text check(event_type is null or event_type='hof');
alter table public.tracker_banners add column if not exists skills_month date;
alter table public.tracker_banners add column if not exists added_skills jsonb not null default '[]'::jsonb check(jsonb_typeof(added_skills)='array' and jsonb_array_length(added_skills)<=200);
create or replace function public.save_tracker_banner_event(banner_id uuid,banner_name text,start_date date,end_date date,start_time time,end_time time,hero_ids uuid[],layout_type text,is_coming_soon boolean,slot_ids uuid[],event_kind text,event_month date,event_skills jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid; clean_skills jsonb;
begin
 if not public.is_tracker_owner() then raise exception 'Editor access required'; end if;
 if event_kind is not null and event_kind<>'hof' then raise exception 'Invalid event type'; end if;
 if event_kind='hof' and (layout_type<>'featured' or cardinality(hero_ids)<>4 or event_month is null) then raise exception 'Hall of Forms requires four heroes and a skill update month'; end if;
 if jsonb_typeof(event_skills) is distinct from 'array' or jsonb_array_length(event_skills)>200 then raise exception 'Invalid skill selection'; end if;
 if exists(select 1 from jsonb_array_elements(event_skills) s where jsonb_typeof(s) is distinct from 'object' or coalesce(length(trim(s->>'name')),0) not between 1 and 150 or coalesce(s->>'slot','') not in ('Weapon','Assist','Special','A','B','C','X') or coalesce(length(s->>'icon_url'),0)>2000) then raise exception 'Invalid skill entry'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s->>'id','name',s->>'name','slot',s->>'slot','icon_url',s->>'icon_url','refined',s->'refined','arcane',s->'arcane')),'[]'::jsonb) into clean_skills from jsonb_array_elements(event_skills) s;
 saved_id:=public.save_tracker_banner_slots(banner_id,banner_name,start_date,end_date,start_time,end_time,hero_ids,layout_type,is_coming_soon,slot_ids);
 update public.tracker_banners set event_type=event_kind,skills_month=case when event_kind='hof' then date_trunc('month',event_month)::date else null end,added_skills=case when event_kind='hof' then clean_skills else '[]'::jsonb end where id=saved_id;
 return saved_id;
end;$$;
revoke all on function public.save_tracker_banner_event(uuid,text,date,date,time,time,uuid[],text,boolean,uuid[],text,date,jsonb) from public,anon;
grant execute on function public.save_tracker_banner_event(uuid,text,date,date,time,time,uuid[],text,boolean,uuid[],text,date,jsonb) to authenticated;
