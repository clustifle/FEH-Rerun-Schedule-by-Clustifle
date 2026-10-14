create table public.monthly_revival_banners (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('Legendary','Mythic')),
 number integer not null check(number>0),
 hero_1 uuid not null references public.heroes(id) on delete restrict,
 hero_2 uuid not null references public.heroes(id) on delete restrict,
 hero_3 uuid not null references public.heroes(id) on delete restrict,
 source_url text not null default '' check(length(source_url)<=1000 and (source_url='' or source_url ~ '^https://')),
 revision integer not null default 1,
 unique(kind,number),check(hero_1<>hero_2 and hero_1<>hero_3 and hero_2<>hero_3)
);
create table public.monthly_revival_events (
 id uuid primary key default gen_random_uuid(),
 banner_id uuid not null references public.monthly_revival_banners(id) on delete restrict,
 month date check(month is null or extract(day from month)=1),
 starts_on date, ends_on date,
 duration integer check(duration in (28,35)),
 under_consideration boolean not null default false,
 confirmed boolean not null default true,
 source_url text not null default '' check(length(source_url)<=1000 and (source_url='' or source_url ~ '^https://')),
 revision integer not null default 1,
 check(month is not null or under_consideration),
 check((starts_on is null and ends_on is null) or
 (starts_on is not null and ends_on is not null and duration is not null
 and ends_on-starts_on=duration and month=date_trunc('month',starts_on)::date and not under_consideration))
);
create unique index monthly_revival_events_month on public.monthly_revival_events(banner_id,month) where month is not null;
create unique index monthly_revival_events_consideration on public.monthly_revival_events(banner_id) where month is null;
alter table public.monthly_revival_banners enable row level security;
alter table public.monthly_revival_events enable row level security;
revoke all on public.monthly_revival_banners,public.monthly_revival_events from anon,authenticated;
grant select on public.monthly_revival_banners,public.monthly_revival_events to anon;
grant select,insert,update,delete on public.monthly_revival_banners,public.monthly_revival_events to authenticated;
create policy monthly_banners_read on public.monthly_revival_banners for select to anon,authenticated using(true);
create policy monthly_events_read on public.monthly_revival_events for select to anon,authenticated using(true);
create policy monthly_banners_staff on public.monthly_revival_banners for all to authenticated using((select public.is_tracker_owner())) with check((select public.is_tracker_owner()));
create policy monthly_events_staff on public.monthly_revival_events for all to authenticated using((select public.is_tracker_owner())) with check((select public.is_tracker_owner()));
create function tracker_private.validate_monthly_revival() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' then new.revision:=old.revision+1;end if;
 if tg_table_name='monthly_revival_banners' then
  if (select count(*) from public.heroes where id in (new.hero_1,new.hero_2,new.hero_3) and category=new.kind)<>3 then
   raise exception 'Choose three distinct heroes of the banner type';
  end if;
 end if;
 return new;
end $$;
revoke all on function tracker_private.validate_monthly_revival() from public,anon,authenticated;
create trigger validate_monthly_banner before insert or update on public.monthly_revival_banners for each row execute function tracker_private.validate_monthly_revival();
create trigger validate_monthly_event before insert or update on public.monthly_revival_events for each row execute function tracker_private.validate_monthly_revival();
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',1,(select id from public.heroes where category='Legendary' and title='Vanguard Legend'),(select id from public.heroes where category='Legendary' and title='Glorious Archer'),(select id from public.heroes where category='Legendary' and title='Fell Vessel'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',2,(select id from public.heroes where category='Legendary' and title='Supreme Samurai'),(select id from public.heroes where category='Legendary' and title='Vallite Songstress'),(select id from public.heroes where category='Legendary' and title='Lady of the Wind'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',3,(select id from public.heroes where category='Legendary' and title='Princess of Ice'),(select id from public.heroes where category='Legendary' and title='Voice of Dreams'),(select id from public.heroes where category='Legendary' and title='Icy Blade'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',4,(select id from public.heroes where category='Legendary' and title='Hero-King'),(select id from public.heroes where category='Legendary' and title='Legendary Dragon'),(select id from public.heroes where category='Legendary' and title='Saint-King'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',5,(select id from public.heroes where category='Legendary' and title='Marquess of Ostia'),(select id from public.heroes where category='Legendary' and title='Graceful Resolve'),(select id from public.heroes where category='Legendary' and title='Legendary Lord'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',6,(select id from public.heroes where category='Legendary' and title='Blazing Lion'),(select id from public.heroes where category='Legendary' and title='Crusader of Light'),(select id from public.heroes where category='Legendary' and title='Unifier of Thracia'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',7,(select id from public.heroes where category='Legendary' and title='Queen of Valentia'),(select id from public.heroes where category='Legendary' and title='Blazing Knight'),(select id from public.heroes where category='Legendary' and title='Crowned Exalt'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Legendary',8,(select id from public.heroes where category='Legendary' and title='Savior King'),(select id from public.heroes where category='Legendary' and title='Child of Dusk'),(select id from public.heroes where category='Legendary' and title='Scion of Light'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Mythic',1,(select id from public.heroes where category='Mythic' and title='Girl on the Throne'),(select id from public.heroes where category='Mythic' and title='Dragon Divinity'),(select id from public.heroes where category='Mythic' and title='God of Strength'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Mythic',2,(select id from public.heroes where category='Mythic' and title='Chaos Goddess'),(select id from public.heroes where category='Mythic' and title='Dawn''s Trueblade'),(select id from public.heroes where category='Mythic' and title='Sweet Dreams'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Mythic',3,(select id from public.heroes where category='Mythic' and title='Lethal Swordsman'),(select id from public.heroes where category='Mythic' and title='Omnicidal Witch'),(select id from public.heroes where category='Mythic' and title='Merciful Death'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Mythic',4,(select id from public.heroes where category='Mythic' and title='Lewd Dream'),(select id from public.heroes where category='Mythic' and title='Death Sovereign'),(select id from public.heroes where category='Mythic' and title='The Enigma'));
insert into public.monthly_revival_banners(kind,number,hero_1,hero_2,hero_3) values ('Mythic',5,(select id from public.heroes where category='Mythic' and title='Saint of Legend'),(select id from public.heroes where category='Mythic' and title='Nightmare'),(select id from public.heroes where category='Mythic' and title='Daydream'));
-- Preserve unanimous existing monthly assignments without predicting exact dates.
insert into public.monthly_revival_events(banner_id,month)
 select b.id,(min(h.month)||'-01')::date from public.monthly_revival_banners b
 join public.heroes h on h.id in (b.hero_1,b.hero_2,b.hero_3)
 group by b.id having count(*)=3 and count(h.month)=3 and count(distinct h.month)=1 and bool_and(h.schedule='Monthly Revival');
