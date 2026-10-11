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
