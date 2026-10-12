create table public.tracker_hero_skills (
 id uuid primary key default gen_random_uuid(),hero_id uuid not null references public.heroes(id) on delete cascade,
 slot text not null check(slot in ('Weapon','Assist','Special','A','B','C','X')),
 family text not null default '' check(length(family)<=150),name text not null check(length(trim(name)) between 1 and 150),
 tier integer check(tier between 1 and 4),description text not null check(length(trim(description)) between 1 and 10000),
 refined boolean not null default false,icon_url text check(icon_url is null or icon_url ~ '^https://feh-community-polls[.]shyguyvn[.]workers[.]dev/community/images/[a-f0-9-]{36}$'),
 remix boolean not null default false,sp integer check(sp between 0 and 9999),rarity text not null default '' check(length(rarity)<=150),restrictions text not null default '' check(length(restrictions)<=2000),source_url text not null default '' check(source_url='' or (source_url like 'https://%' and length(source_url)<=2000)),revision integer not null default 1 check(revision>0),
 check(not refined or (slot='Weapon' and icon_url is not null))
);
create index tracker_hero_skills_hero_idx on public.tracker_hero_skills(hero_id);
alter table public.tracker_hero_skills enable row level security;
revoke all on public.tracker_hero_skills from anon,authenticated;
grant select on public.tracker_hero_skills to anon,authenticated;
grant insert,update,delete on public.tracker_hero_skills to authenticated;
create policy skills_public_read on public.tracker_hero_skills for select to anon,authenticated using(true);
create policy skills_staff_insert on public.tracker_hero_skills for insert to authenticated with check((select public.tracker_role()) in ('Owner','Manager'));
create policy skills_staff_update on public.tracker_hero_skills for update to authenticated using((select public.tracker_role()) in ('Owner','Manager')) with check((select public.tracker_role()) in ('Owner','Manager'));
create policy skills_staff_delete on public.tracker_hero_skills for delete to authenticated using((select public.tracker_role()) in ('Owner','Manager'));

alter table public.tracker_hero_skills add constraint passive_skill_icon_required check(slot not in ('A','B','C','X') or icon_url is not null);

alter table public.tracker_hero_skills add column refine_effect text not null default '' check(length(refine_effect)<=10000);
alter table public.tracker_hero_skills add column prerequisites text not null default '' check(length(prerequisites)<=2000);
alter table public.tracker_hero_skills alter column hero_id drop not null;
alter table public.tracker_hero_skills add column cooldown integer check(cooldown is null or (slot='Special' and cooldown between 0 and 99));
alter table public.tracker_hero_skills add column might integer check(might is null or (slot='Weapon' and might between 0 and 99)), add column range integer check(range is null or (slot='Weapon' and range in (1,2)));
alter table public.tracker_hero_skills add column exclusive boolean not null default false, add column inherit_moves text[] not null default '{}' check(inherit_moves <@ array['Fliers','Armored','Cavalry','Infantry']::text[]), add column inherit_weapons text[] not null default '{}' check(inherit_weapons <@ array['Sword','Lance','Axe','Staff','Beast','Bow','Breath','Dagger','Tome']::text[]), add constraint weapon_no_inheritance_options check(slot <> 'Weapon' or (not exclusive and cardinality(inherit_moves)=0 and cardinality(inherit_weapons)=0));

alter table public.tracker_hero_skills drop constraint tracker_hero_skills_inherit_weapons_check;
update public.tracker_hero_skills s set inherit_weapons = (select array_agg(distinct colored order by colored) from unnest(s.inherit_weapons) old cross join lateral unnest(case old when 'Sword' then array['Red Sword'] when 'Lance' then array['Blue Lance'] when 'Axe' then array['Green Axe'] when 'Staff' then array['Colorless Staff'] when 'Beast' then array['Red Beast','Blue Beast','Green Beast','Colorless Beast'] when 'Bow' then array['Red Bow','Blue Bow','Green Bow','Colorless Bow'] when 'Breath' then array['Red Breath','Blue Breath','Green Breath','Colorless Breath'] when 'Dagger' then array['Red Dagger','Blue Dagger','Green Dagger','Colorless Dagger'] when 'Tome' then array['Red Tome','Blue Tome','Green Tome','Colorless Tome'] else array[old] end) colored) where cardinality(inherit_weapons)>0;
alter table public.tracker_hero_skills add constraint tracker_hero_skills_inherit_weapons_check check(inherit_weapons <@ array['Red Sword','Red Beast','Red Bow','Red Breath','Red Dagger','Red Tome','Blue Lance','Blue Beast','Blue Bow','Blue Breath','Blue Dagger','Blue Tome','Green Axe','Green Beast','Green Bow','Green Breath','Green Dagger','Green Tome','Colorless Staff','Colorless Beast','Colorless Bow','Colorless Breath','Colorless Dagger','Colorless Tome']::text[]);
alter table public.tracker_hero_skills drop constraint weapon_no_inheritance_options; alter table public.tracker_hero_skills add constraint weapon_no_inheritance_options check(slot <> 'Weapon' or (cardinality(inherit_moves)=0 and cardinality(inherit_weapons)=0));
alter table public.tracker_hero_skills drop constraint if exists tracker_hero_skills_description_check; alter table public.tracker_hero_skills alter column description set default ''; alter table public.tracker_hero_skills add constraint tracker_hero_skills_description_check check(length(description)<=10000);
alter table public.tracker_hero_skills add column arcane boolean not null default false check(not arcane or slot='Weapon');
