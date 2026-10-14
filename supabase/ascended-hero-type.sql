-- Add Ascended to the existing staff-managed hero type catalog.
insert into public.tracker_definitions(kind,name,description,icon_path,sort_order,active)
values ('hero_type','Ascended','Ascended Hero','hero-types/ascended.webp',14,true)
on conflict (kind,name) do update set icon_path=excluded.icon_path,active=true;
