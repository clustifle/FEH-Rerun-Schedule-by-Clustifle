-- Additive public v2 schema. Existing heroes, accounts and tracking remain intact.
create table public.tracker_feh_versions (
 version text primary key check(version ~ '^[0-9]{1,2}\.(0|[1-9][0-9]?)$'),
 release_date date,
 sort_order integer not null default 1000 check(sort_order between 0 and 100000)
);
alter table public.tracker_feh_versions enable row level security;
grant select on public.tracker_feh_versions to anon,authenticated;
grant insert,update,delete on public.tracker_feh_versions to authenticated;
create policy "Public versions" on public.tracker_feh_versions for select to anon,authenticated using(true);
create policy "Staff manage versions" on public.tracker_feh_versions for all to authenticated using((select public.tracker_role()) in ('Owner','Manager')) with check((select public.tracker_role()) in ('Owner','Manager'));
insert into public.tracker_feh_versions(version,sort_order) select n||'.0',n*100 from generate_series(1,10) n;
alter table public.heroes add column debut_version text references public.tracker_feh_versions(version) on update cascade on delete set null;
alter table public.heroes add column release_date date;
alter table public.heroes add column release_event text check(char_length(release_event)<=200);
alter table public.heroes add column revision integer not null default 1;
create index heroes_debut_version_idx on public.heroes(debut_version);
create table public.tracker_watchlist (
 user_id uuid not null references auth.users(id) on delete cascade,
 hero_id uuid not null references public.heroes(id) on delete cascade,
 list_name text not null default 'Following' check(list_name in ('Following','Saving for','Merge project','Waiting for rerun')),
 primary key(user_id,hero_id)
);
alter table public.tracker_watchlist enable row level security;
grant select,insert,update,delete on public.tracker_watchlist to authenticated;
create policy "Own watchlist" on public.tracker_watchlist for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
insert into public.tracker_watchlist(user_id,hero_id)
 select p.id,h.id from public.tracker_personal_tracking p join public.heroes h on h.id=any(p.followed_heroes) on conflict do nothing;
create function public.tracker_hero_revision() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.revision:=old.revision+1; new.updated:=now(); return new; end $$;
revoke all on function public.tracker_hero_revision() from public;
create trigger tracker_hero_revision before update on public.heroes for each row execute function public.tracker_hero_revision();

-- Atomic edits retain existing RLS, validate all rows and reject stale previews.
create function public.tracker_v2_save_heroes(records jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare item jsonb; old public.heroes; next public.heroes; total integer:=0;
begin
 if coalesce(public.tracker_role(),'') not in ('Owner','Manager') then raise exception 'Staff access required'; end if;
 if jsonb_typeof(records)<>'array' or jsonb_array_length(records) not between 1 and 500 then raise exception 'Choose 1–500 heroes'; end if;
 if (select count(distinct x->>'id') from jsonb_array_elements(records) x)<>jsonb_array_length(records) then raise exception 'Duplicate hero selection'; end if;
 -- Deterministic locking prevents overlapping batches from deadlocking.
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
   update public.heroes set name=next.name,title=next.title,category=next.category,pool=next.pool,color=next.color,weapon_type=next.weapon_type,move_type=next.move_type,blessing=next.blessing,demote=next.demote,heroic_grail=next.heroic_grail,schedule=next.schedule,month=next.month,notes=next.notes,debut_version=next.debut_version,release_date=next.release_date,release_event=next.release_event where id=old.id;
  end if;
  total:=total+1;
 end loop;
 return jsonb_build_object('count',total,'id',records->0->>'id');
end $$;
revoke all on function public.tracker_v2_save_heroes(jsonb) from public;
grant execute on function public.tracker_v2_save_heroes(jsonb) to authenticated;

create function public.tracker_v2_versions(payload jsonb,operation text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v text; original text; replacement text; selected text[]; i integer:=0; changes jsonb;
begin
 if coalesce(public.tracker_role(),'') not in ('Owner','Manager') then raise exception 'Staff access required'; end if;
 -- Serialize version operations so assignment replacement and renaming stay atomic.
 lock table public.tracker_feh_versions in share row exclusive mode;
 if operation='save' then
  v:=payload->>'version'; original:=nullif(payload->>'original_version','');
  if original is null then insert into public.tracker_feh_versions values(v,(payload->>'release_date')::date,(payload->>'sort_order')::integer);
  else update public.tracker_feh_versions set version=v,release_date=(payload->>'release_date')::date,sort_order=(payload->>'sort_order')::integer where version=original; if not found then raise exception 'Version no longer exists'; end if; end if;
 else
  if operation='delete' then selected:=array[payload->>'version']; else select array_agg(value) into selected from jsonb_array_elements_text(payload->'versions'); end if;
  if coalesce(cardinality(selected),0) not between 1 and 500 or (select count(*) from public.tracker_feh_versions where version=any(selected))<>cardinality(selected) then raise exception 'Refresh your version selection'; end if;
  if operation='delete' or payload->>'action'='delete' then
   replacement:=nullif(payload->>'replacement','');
   if replacement=any(selected) or (replacement is not null and not exists(select 1 from public.tracker_feh_versions where version=replacement)) then raise exception 'Choose a valid replacement version'; end if;
   update public.heroes set debut_version=replacement where debut_version=any(selected);
   delete from public.tracker_feh_versions where version=any(selected);
  elsif payload->>'action'='update' then
   changes:=payload->'changes';
   foreach v in array selected loop
    update public.tracker_feh_versions set release_date=case when changes?'release_date' then (changes->>'release_date')::date else release_date end,sort_order=case when changes?'sort_order' then (changes->>'sort_order')::integer+i else sort_order end where version=v; i:=i+1;
   end loop;
  else raise exception 'Unknown version action'; end if;
 end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.tracker_v2_versions(jsonb,text) from public;
grant execute on function public.tracker_v2_versions(jsonb,text) to authenticated;
-- Override Supabase's default grants; all remaining access uses the policies above.
revoke all on public.tracker_watchlist from anon;
revoke all on function public.tracker_v2_save_heroes(jsonb) from anon;
revoke all on function public.tracker_v2_versions(jsonb,text) from anon;
revoke all on function public.tracker_hero_revision() from anon,authenticated;
revoke insert,update,delete,truncate,references,trigger on public.tracker_feh_versions from anon;
revoke truncate,references,trigger on public.tracker_watchlist,public.tracker_feh_versions from authenticated;
