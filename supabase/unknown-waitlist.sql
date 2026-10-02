begin;
create or replace function public.route_unknown_hero_to_waitlist() returns trigger language plpgsql set search_path=public as $$
begin
 if new.status='Unknown' then new.schedule:='Waitlist'; new.month:=null; end if;
 return new;
end;
$$;
create trigger route_unknown_hero_to_waitlist before insert or update on public.heroes for each row execute function public.route_unknown_hero_to_waitlist();
update public.heroes set schedule='Waitlist',month=null where status='Unknown';
commit;
