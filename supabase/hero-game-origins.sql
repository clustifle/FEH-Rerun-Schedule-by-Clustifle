-- Adds manually editable FEH game origins for All Heroes, profiles, and wiki import.
-- Existing rows remain null and continue using the checked-in catalog fallback.
alter table public.heroes add column if not exists game_origins integer[]
 check(game_origins is null or (cardinality(game_origins)<=2 and game_origins <@ array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]));

-- Keep the atomic hero editor in sync with the additional editable field.
create or replace function public.tracker_v2_save_heroes(records jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare item jsonb; old public.heroes; next public.heroes; total integer:=0;
begin
 if coalesce(public.tracker_role(),'') not in ('Owner','Manager') then raise exception 'Staff access required'; end if;
 if jsonb_typeof(records)<>'array' or jsonb_array_length(records) not between 1 and 500 then raise exception 'Choose 1–500 heroes'; end if;
 if (select count(distinct x->>'id') from jsonb_array_elements(records) x)<>jsonb_array_length(records) then raise exception 'Duplicate hero selection'; end if;
 perform id from public.heroes where id in (select (x->>'id')::uuid from jsonb_array_elements(records) x) order by id for update;
 for item in select value from jsonb_array_elements(records) loop
  select * into old from public.heroes where id=(item->>'id')::uuid;
  if found then
   if (item->>'revision')::integer is distinct from old.revision then raise exception 'A hero changed. Refresh and review again.'; end if;
   next:=jsonb_populate_record(old,item);
  else
   if jsonb_array_length(records)<>1 then raise exception 'Hero no longer exists'; end if;
   next:=jsonb_populate_record(null::public.heroes,item); next.status:='Confirmed'; next.revision:=1; next.updated:=now();
  end if;
  if next.category in ('Legendary','Mythic','Chosen Hero') and next.blessing is null then raise exception 'Choose a blessing for Legendary, Mythic and Chosen heroes'; end if;
  if next.category not in ('Legendary','Mythic','Chosen Hero') then next.blessing:=null; end if;
  if next.schedule in ('None','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist','Schedule Under Consideration') then next.month:=null; end if;
  if old.id is null then
   insert into public.heroes select next.*;
  else
   update public.heroes set name=next.name,title=next.title,category=next.category,pool=next.pool,color=next.color,weapon_type=next.weapon_type,move_type=next.move_type,blessing=next.blessing,demote=next.demote,heroic_grail=next.heroic_grail,schedule=next.schedule,month=next.month,notes=next.notes,debut_version=next.debut_version,game_origins=next.game_origins,release_date=next.release_date,release_event=next.release_event where id=old.id;
  end if;
  total:=total+1;
 end loop;
 return jsonb_build_object('count',total,'id',records->0->>'id');
end $$;

