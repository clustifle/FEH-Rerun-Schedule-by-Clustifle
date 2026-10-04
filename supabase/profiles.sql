create table if not exists public.tracker_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (char_length(display_name)<=80),
 bio text not null default '' check (char_length(bio)<=1000),
 avatar_path text check (avatar_path is null or avatar_path like id::text || '/%'),
 social_links jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links)='array' and jsonb_array_length(social_links)<=6),
 updated_at timestamptz not null default now()
);
alter table public.tracker_profiles enable row level security;
grant select on public.tracker_profiles to anon,authenticated;
grant insert,update on public.tracker_profiles to authenticated;
create policy "Public profiles readable" on public.tracker_profiles for select using (true);
create policy "Create own profile" on public.tracker_profiles for insert to authenticated with check (id=auth.uid());
create policy "Update own profile" on public.tracker_profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('profile-avatars','profile-avatars',true,2097152,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy "Upload own avatar" on storage.objects for insert to authenticated with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Update own avatar" on storage.objects for update to authenticated using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Remove own avatar" on storage.objects for delete to authenticated using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "Read own avatar objects" on storage.objects for select to authenticated using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
