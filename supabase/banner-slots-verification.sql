-- Regression check; all test records are rolled back.
begin;
select set_config('request.jwt.claim.sub','360457b7-e43f-4bf7-bcb1-d9792233a243',true);
do $$
declare slots uuid[]; saved uuid; bad_slots uuid[]; invalid_rejected boolean:=false;
begin
 select array_agg(id order by (rank-1)/2,color_order,rank) into slots from(select id,row_number() over(partition by color order by id) as rank,array_position(array['Red','Blue','Green','Colorless'],color) as color_order from public.heroes) ranked where rank<=4;
 if cardinality(slots)<>16 then raise exception 'Need four heroes of each color';end if;
 saved:=public.save_tracker_banner_slots(null,'Rollback-only Remix verification','2026-10-05','2026-10-06','07:00','06:59',slots,'remix',false,slots);
 if (select count(*) from public.tracker_banner_heroes where banner_id=saved)<>16 or (select slot_count from public.tracker_banners where id=saved)<>16 then raise exception 'Incorrect slot capacity';end if;
 if exists(select 1 from public.tracker_banner_heroes where banner_id=saved and hero_id<>slots[slot_index+1]) then raise exception 'Slot positions changed';end if;
 bad_slots:=slots;bad_slots[1]:=slots[3];bad_slots[3]:=slots[1];
 begin
  perform public.save_tracker_banner_slots(saved,'Rollback-only Remix verification','2026-10-05','2026-10-06','07:00','06:59',bad_slots,'remix',false,bad_slots);
 exception when others then
  if sqlerrm like '%color does not match%' then invalid_rejected:=true;else raise;end if;
 end;
 if not invalid_rejected then raise exception 'Wrong-color hero was accepted';end if;
 bad_slots:=slots;bad_slots[1]:=slots[2];invalid_rejected:=false;
 begin
  perform public.save_tracker_banner_slots(saved,'Rollback-only Remix verification','2026-10-05','2026-10-06','07:00','06:59',bad_slots,'remix',false,bad_slots);
 exception when others then
  if sqlerrm like '%duplicate hero selection%' then invalid_rejected:=true;else raise;end if;
 end;
 if not invalid_rejected then raise exception 'Duplicate hero was accepted';end if;
 perform set_config('request.jwt.claim.sub','',true);invalid_rejected:=false;
 begin
  perform public.save_tracker_banner_slots(saved,'Rollback-only Remix verification','2026-10-05','2026-10-06','07:00','06:59',slots,'remix',false,slots);
 exception when others then
  if sqlerrm like '%Editor access required%' then invalid_rejected:=true;else raise;end if;
 end;
 if not invalid_rejected then raise exception 'Unauthenticated save was accepted';end if;
end;$$;
rollback;
select 'Passed: 16 slots, exact group assignments, wrong-color and duplicate rejection, editor-only saves; all test data rolled back.' as result;
