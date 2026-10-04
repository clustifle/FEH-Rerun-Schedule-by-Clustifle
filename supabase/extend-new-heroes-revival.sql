begin;
insert into public.forging_bonds_revivals(month) select generate_series('2025-10-01'::date,'2029-10-01'::date,'1 month')::date on conflict do nothing;
commit;
