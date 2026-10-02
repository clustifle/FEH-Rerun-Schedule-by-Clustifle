begin;
create table if not exists public.heroes (
 id uuid primary key,
 name text not null check(char_length(name) between 1 and 100),
 title text not null default '' check(char_length(title)<=150),
 category text not null check(category in ('Legendary','Mythic','Emblem','Chosen Hero')),
 schedule text not null default 'General' check(schedule in ('General','Remix','Monthly Revival')),
 color text not null check(color in ('Red','Blue','Green','Colorless')),
 month text check(month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
 status text not null check(status in ('Confirmed','Predicted','Uncertain','Unknown')),
 notes text not null default '' check(char_length(notes)<=2000),
 portrait text,
 blessing text,
 updated timestamptz not null default now(),
 check(status='Unknown' or month is not null),
 check(schedule<>'Monthly Revival' or category in ('Legendary','Mythic')),
 check((category='Emblem' and blessing is null) or (category in ('Legendary','Chosen Hero') and (blessing is null or blessing in ('Wind','Earth','Fire','Water'))) or (category='Mythic' and (blessing is null or blessing in ('Anima','Astra','Light','Dark'))))
);
alter table public.heroes enable row level security;
revoke all on public.heroes from anon, authenticated;
grant select on public.heroes to anon, authenticated;
grant insert, update, delete on public.heroes to authenticated;
create or replace function public.is_tracker_owner() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=(select auth.uid()) and lower(email)='shyguyvn@gmail.com' and email_confirmed_at is not null);
$$;
revoke all on function public.is_tracker_owner() from public;
grant execute on function public.is_tracker_owner() to anon, authenticated;
drop policy if exists "Public schedule" on public.heroes;
create policy "Public schedule" on public.heroes for select to anon, authenticated using(true);
drop policy if exists "Owner insert" on public.heroes;
create policy "Owner insert" on public.heroes for insert to authenticated with check((select public.is_tracker_owner()));
drop policy if exists "Owner update" on public.heroes;
create policy "Owner update" on public.heroes for update to authenticated using((select public.is_tracker_owner())) with check((select public.is_tracker_owner()));
drop policy if exists "Owner delete" on public.heroes;
create policy "Owner delete" on public.heroes for delete to authenticated using((select public.is_tracker_owner()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portraits','portraits',true,3145728,array['image/png','image/jpeg','image/webp']) on conflict(id) do update set public=true,file_size_limit=3145728,allowed_mime_types=array['image/png','image/jpeg','image/webp'];
drop policy if exists "Owner portrait read" on storage.objects;
create policy "Owner portrait read" on storage.objects for select to authenticated using(bucket_id='portraits' and (select public.is_tracker_owner()));
drop policy if exists "Owner portrait insert" on storage.objects;
create policy "Owner portrait insert" on storage.objects for insert to authenticated with check(bucket_id='portraits' and (select public.is_tracker_owner()));
drop policy if exists "Owner portrait update" on storage.objects;
create policy "Owner portrait update" on storage.objects for update to authenticated using(bucket_id='portraits' and (select public.is_tracker_owner())) with check(bucket_id='portraits' and (select public.is_tracker_owner()));
drop policy if exists "Owner portrait delete" on storage.objects;
create policy "Owner portrait delete" on storage.objects for delete to authenticated using(bucket_id='portraits' and (select public.is_tracker_owner()));
commit;
