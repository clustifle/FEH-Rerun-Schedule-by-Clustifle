-- Mods Tool: existing Owner/Manager identities remain authoritative.
create table public.tracker_definitions (
 kind text not null check(kind in ('hero_type','pool')),
 name text not null check(length(trim(name)) between 1 and 60),
 description text not null default '' check(length(description)<=500),
 icon_path text not null default '' check(length(icon_path)<=300 and (icon_path='' or icon_path ~ '^(hero-types|pools|mods-icons)/[a-zA-Z0-9_./-]+$')),
 sort_order integer not null default 0,
 active boolean not null default true,
 primary key(kind,name)
);
alter table public.tracker_definitions enable row level security;
revoke all on public.tracker_definitions from anon,authenticated;
grant select on public.tracker_definitions to anon,authenticated;
grant insert,update on public.tracker_definitions to authenticated;
create policy "Read definitions" on public.tracker_definitions for select to anon,authenticated using(true);
create policy "Head Admin creates definitions" on public.tracker_definitions for insert to authenticated with check(public.tracker_role()='Owner');
create policy "Head Admin edits definitions" on public.tracker_definitions for update to authenticated using(public.tracker_role()='Owner') with check(public.tracker_role()='Owner');
insert into public.tracker_definitions(kind,name,icon_path,sort_order)
select 'hero_type',name,case when name in ('Legendary','Mythic','Chosen Hero') then '' when name='General' then 'pools/general.webp' when name='Special' then 'pools/special.webp' else 'hero-types/'||lower(name)||'.webp' end,ord::integer
from unnest(array['Legendary','Mythic','Emblem','Chosen Hero','Rearmed','Attuned','Aided','Entwined','Duo','Harmonized','Vista','General','Special']) with ordinality as t(name,ord);
insert into public.tracker_definitions(kind,name,icon_path,sort_order)
select 'pool',name,case when name='L/M/E Pool' then 'pools/lme.webp' when name='Seasonal Limited' then 'pools/special.webp' when name='Grail Pool' then 'hero-types/heroic-grails.webp' else 'pools/general.webp' end,ord::integer
from unnest(array['General Pool','Non-Seasonal Limited','Seasonal Limited','L/M/E Pool','Grail Pool','Limited Pool']) with ordinality as t(name,ord);
update public.tracker_definitions set active=false where name='Limited Pool';
alter table public.heroes drop constraint heroes_category_check;
alter table public.heroes drop constraint heroes_pool_check;
create schema if not exists tracker_private;
revoke all on schema tracker_private from public,anon,authenticated;
create function tracker_private.validate_hero_definitions() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.tracker_definitions where kind='hero_type' and name=new.category and (active or (tg_op='UPDATE' and name=old.category))) then raise exception 'Choose an active hero type.'; end if;
 if new.pool is not null and not exists(select 1 from public.tracker_definitions where kind='pool' and name=new.pool and (active or (tg_op='UPDATE' and name=old.pool))) then raise exception 'Choose an active hero pool.'; end if;
 return new;
end; $$;
create trigger validate_hero_definitions before insert or update on public.heroes for each row execute function tracker_private.validate_hero_definitions();

create table public.tracker_site_content (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('faq','announcement','release')),
 title text not null check(length(trim(title)) between 1 and 200),
 body text not null check(length(trim(body)) between 1 and 10000),
 section text not null default 'Schedules' check(section in ('Schedules','Browsing','Editing','About')),
 sources jsonb not null default '[]'::jsonb check(jsonb_typeof(sources)='array'),
 sort_order integer not null default 0,
 published boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.tracker_site_content enable row level security;
revoke all on public.tracker_site_content from anon,authenticated;
grant select on public.tracker_site_content to anon,authenticated;
grant insert,update,delete on public.tracker_site_content to authenticated;
create policy "Read published content" on public.tracker_site_content for select to anon,authenticated using(published or public.tracker_role()='Owner');
create policy "Head Admin creates content" on public.tracker_site_content for insert to authenticated with check(public.tracker_role()='Owner');
create policy "Head Admin edits content" on public.tracker_site_content for update to authenticated using(public.tracker_role()='Owner') with check(public.tracker_role()='Owner');
create policy "Head Admin removes content" on public.tracker_site_content for delete to authenticated using(public.tracker_role()='Owner');

create table public.tracker_profile_moderation (
 user_id uuid primary key references public.tracker_profiles(id) on delete cascade,
 hidden boolean not null default false,
 reason text not null default '' check(length(reason)<=500)
);
alter table public.tracker_profile_moderation enable row level security;
revoke all on public.tracker_profile_moderation from anon,authenticated;
grant select on public.tracker_profile_moderation to authenticated;
create policy "Head Admin reads moderation" on public.tracker_profile_moderation for select to authenticated using(public.tracker_role()='Owner');

create table public.tracker_admin_history (
 id bigint generated always as identity primary key,
 actor_id uuid,
 actor_role text,
 entity text not null,
 action text not null,
 label text not null,
 created_at timestamptz not null default now()
);
alter table public.tracker_admin_history enable row level security;
revoke all on public.tracker_admin_history from anon,authenticated;
grant select on public.tracker_admin_history to authenticated;
create policy "Staff reads permitted history" on public.tracker_admin_history for select to authenticated using(public.tracker_role()='Owner' or (public.tracker_role()='Manager' and entity in ('heroes','tracker_banners','tracker_banner_heroes','forging_bonds_revivals','hall_of_forms_revivals','tracker_waitlist','tracker_extended_waitlist')));
create function tracker_private.log_admin_change() returns trigger language plpgsql security definer set search_path='' as $$
declare item jsonb; actor text;
begin
 actor:=public.tracker_role();
 if actor not in ('Owner','Manager') or actor is null then return null; end if;
 item:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 insert into public.tracker_admin_history(actor_id,actor_role,entity,action,label)
 values(auth.uid(),actor,tg_table_name,lower(tg_op),left(coalesce(item->>'name',item->>'title',item->>'email',item->>'month',item->>'hero_id',item->>'user_id','Record'),200));
 return null;
end; $$;
do $$ declare tbl text; begin
 foreach tbl in array array['heroes','tracker_banners','tracker_banner_heroes','forging_bonds_revivals','hall_of_forms_revivals','tracker_waitlist','tracker_extended_waitlist','tracker_definitions','tracker_site_content','tracker_managers','tracker_profile_moderation'] loop
 execute format('create trigger mods_history after insert or update or delete on public.%I for each row execute function tracker_private.log_admin_change()',tbl);
 end loop;
end; $$;

create function public.mods_list_users(search_term text default '', page_offset integer default 0) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if public.tracker_role() is distinct from 'Owner' then raise exception 'Head Admin access required.'; end if;
 return coalesce((select jsonb_agg(row) from (
 select u.id,coalesce(p.username,'') as username,coalesce(p.display_name,'') as display_name,u.email,
 case when u.id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid then 'Owner' when m.user_id is not null then 'Manager' else 'Visitor' end as role,
 coalesce(x.hidden,false) as hidden,(p.id is not null) as has_profile
 from auth.users u left join public.tracker_profiles p on p.id=u.id left join public.tracker_managers m on m.user_id=u.id left join public.tracker_profile_moderation x on x.user_id=u.id
 where u.email_confirmed_at is not null and length(search_term)<=80 and (search_term='' or position(lower(trim(search_term)) in lower(coalesce(p.username,'')||' '||coalesce(p.display_name,'')||' '||coalesce(u.email,'')))>0)
 order by u.created_at,u.id limit 21 offset greatest(0,least(page_offset,10000))
 ) row),'[]'::jsonb);
end; $$;
create function public.mods_set_manager(account_id uuid, enabled boolean) returns void language plpgsql security definer set search_path='' as $$
declare account_email text;
begin
 if public.tracker_role() is distinct from 'Owner' then raise exception 'Head Admin access required.'; end if;
 if account_id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid then raise exception 'Head Admin access cannot be changed.'; end if;
 select lower(email) into account_email from auth.users where id=account_id and email_confirmed_at is not null;
 if account_email is null then raise exception 'A verified account is required.'; end if;
 if enabled then insert into public.tracker_managers(user_id,email) values(account_id,account_email) on conflict(user_id) do update set email=excluded.email;
 else delete from public.tracker_managers where user_id=account_id; end if;
end; $$;
create function public.mods_moderate_profile(account_id uuid, hide_profile boolean, moderation_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
 if public.tracker_role() is distinct from 'Owner' then raise exception 'Head Admin access required.'; end if;
 if account_id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid then raise exception 'The Head Admin profile cannot be hidden.'; end if;
 if hide_profile and length(trim(moderation_reason))=0 then raise exception 'Enter a moderation reason.'; end if;
 insert into public.tracker_profile_moderation(user_id,hidden,reason) values(account_id,hide_profile,trim(moderation_reason)) on conflict(user_id) do update set hidden=excluded.hidden,reason=excluded.reason;
end; $$;
revoke execute on function public.mods_list_users(text,integer),public.mods_set_manager(uuid,boolean),public.mods_moderate_profile(uuid,boolean,text) from public,anon;
grant execute on function public.mods_list_users(text,integer),public.mods_set_manager(uuid,boolean),public.mods_moderate_profile(uuid,boolean,text) to authenticated;

insert into public.tracker_site_content(kind,title,body,section,sources,sort_order)
select 'faq',value->>'question',value->>'answer',value->>'section',coalesce(value->'sources','[]'::jsonb),ord::integer from jsonb_array_elements('[{"section": "Schedules", "question": "Which schedule should I use?", "answer": "Open **Schedule** in the navigation menu and choose the view that matches the event you want to track.\n\n- **General:** Recorded rerun months for Legendary, Mythic, Emblem, and Chosen Heroes.\n- **Remix:** Reruns associated with Remix banners.\n- **L/M Revival:** Monthly Legendary and Mythic revival entries.\n- **NH Revival:** Returning New Heroes lineups and Forging Bonds revivals.\n- **HoF Revival:** Returning Hall of Forms lineups."}, {"section": "Schedules", "question": "Are listed rerun months confirmed dates?", "answer": "A recorded month identifies a **rerun window**, rather than an exact event start date. Read the hero’s notes for the source, supporting information, and any uncertainty.\n\nCheck **in-game announcements** for confirmed dates and featured lineups. The Head Administrator and Schedule Managers maintain the website’s records manually."}, {"section": "Schedules", "question": "What do the banner cards show?", "answer": "The Home page displays current and upcoming events, featured heroes, active dates, and a **remaining-time** or **coming-soon** label.\n\n- **L/M/E, New Heroes Return, and Double Special Heroes:** Lineups grouped by weapon color.\n- **New and Special Heroes:** Four featured hero portraits.\n- **Remix:** Two selectable groups of eight heroes.\n- **Revivals:** Returning New Heroes or Hall of Forms event lineups.\n\nDisplayed times follow your selected timezone in **Settings → Date & time**."}, {"section": "Schedules", "question": "How does the Remix window work?", "answer": "A Remix card contains **two groups of eight heroes**, with two slots per weapon color in each group.\n\nThe card transitions between **Remix 1** and **Remix 2**. Use its group controls to select a lineup manually.\n\nA hero’s appearance in that lineup is recorded separately from their next scheduled rerun month."}, {"section": "Schedules", "question": "How are New Heroes Return and NH Revival different?", "answer": "**New Heroes Return** is a returning-hero summoning banner. Its card groups featured heroes by weapon color, and it has a separate NHR Waitlist.\n\n**NH Revival** is the New Heroes Revival schedule, including returning lineups associated with Forging Bonds revivals.\n\nThese views maintain separate entries. Check the event name and notes to identify the relevant rerun."}, {"section": "Schedules", "question": "Where can I find Hall of Forms revivals?", "answer": "Open **Schedule → HoF Revival Schedule**, choose an available month, and select a portrait to open the hero’s full profile.\n\n**Hall of Forms is an event lineup.** Appearing in Hall of Forms does not make a Heroic Grails unit summonable on a banner. Use the Grail visibility toggle if you want to hide those units while browsing."}, {"section": "Schedules", "question": "Why are there three rerun waitlists?", "answer": "The waitlists separate heroes by the type of rerun being tracked. Open **Rerun Waitlist** in navigation and choose a list.\n\n- **L/M/E Waitlist:** Heroes awaiting a recorded rerun that may involve a Legendary, Mythic, or Emblem banner.\n- **DSH Waitlist:** Heroes awaiting a Double Special Heroes rerun.\n- **NHR Waitlist:** Heroes awaiting a New Heroes Return rerun.\n\nEach list has its own membership and order. Waitlists do not use the month browser."}, {"section": "Schedules", "question": "Which heroes can appear in the L/M/E Waitlist?", "answer": "Alongside Legendary, Mythic, and Emblem Heroes, the L/M/E Waitlist may include **General, Special, Rearmed, Attuned, Aided, Entwined, and Vista Heroes** after their release in a New Heroes or Special Heroes summoning event.\n\nAn entry tracks a **possible rerun whose timing or banner is uncertain**. Inclusion does not confirm that the hero will return on an L/M/E banner or guarantee a rerun date.\n\nOnly the **Head Administrator** and authorized **Schedule Managers** manually add or edit entries. A hero’s debut does not add them automatically."}, {"section": "Schedules", "question": "Are heroes added to a waitlist automatically?", "answer": "**No.** The Head Administrator and authorized Schedule Managers add waitlist entries manually. Changing a hero’s schedule category does not add them to a waitlist.\n\nRemoving a waitlist entry keeps the hero in the roster. It does not remove the hero from banner lineups or other waitlists."}, {"section": "Browsing", "question": "How do I search and filter heroes?", "answer": "Use the search field in a schedule or **All Heroes** to find heroes by name or title. All Heroes also searches hero types and notes.\n\nOpen **Filters** to narrow results by the options available in that view, including hero type, weapon color and type, movement, pool, and Heroic Grails visibility. All Heroes also offers schedule, blessing, and demote filters.\n\nIf a hero appears to be missing, clear the search and reset the filters. Search results remain limited to the selected view."}, {"section": "Browsing", "question": "What is the difference between Standard and Compact view?", "answer": "**Standard** uses larger portraits and more spacing. **Compact** uses smaller portraits to make dense schedules easier to scan. Both adapt to the browser size, and wide schedules can scroll horizontally.\n\nAll Heroes has its own **Cards, Compact, List, and Table** views, together with ten sorting options.\n\nSelect a hero in any view to open their full **Hero Profile**. You can share that page’s address; the link includes the hero’s name, title, and type."}, {"section": "Browsing", "question": "What is up with the random heroes selection?", "answer": "The roster is maintained manually and supports more than Legendary, Mythic, Emblem, Chosen, or recently released Duo and seasonal heroes.\n\nHeroes are also recorded for **banner lineups, rerun waitlists, New Heroes revivals, and Hall of Forms revivals**. This is why older heroes such as Summer Freyja and Wind Tribe Catria may appear.\n\nA roster entry alone does not confirm an upcoming rerun. Check the hero’s schedule, month, and notes. Weapon and movement details are entered manually, so some records may still be incomplete."}, {"section": "Browsing", "question": "What do the portrait icons mean?", "answer": "Portrait icons identify the hero’s recorded characteristics.\n\n- **Upper left:** Weapon type.\n- **Lower left:** Hero type, where applicable.\n- **Lower right:** Movement type.\n- **Heroic Grails icon:** The hero is marked as a Heroic Grails unit.\n\nGeneral and Special Heroes leave the hero-type corner blank. Desktop hover previews and full Hero Profiles show the recorded labels and notes."}, {"section": "Browsing", "question": "How do Heroic Grails and Grail Pool work?", "answer": "**Heroic Grails** is a separate checkbox in the hero editor. **Grail Pool** is a separate pool assignment. Editors maintain both fields manually.\n\nMarked units display a grail icon and label on portraits, hover previews, and Hero Profiles. Use the **Grail visibility toggle**, including in HoF revivals, to show or hide these units.\n\nHiding a unit changes your displayed results only; it does not delete the hero or change an event’s recorded lineup."}, {"section": "Browsing", "question": "What do hero pool labels mean?", "answer": "Pool labels organize the tracker’s hero records into **General Pool, Seasonal Limited, Non-Seasonal Limited, L/M/E Pool, and Grail Pool**.\n\n**Pool** and **hero type** are separate fields that editors can assign independently. Check the actual event’s summoning details for availability; a tracker label alone does not establish whether a hero is summonable."}, {"section": "Browsing", "question": "Why does a hero have no rerun schedule or month?", "answer": "Editors can select **None** to leave the schedule and rerun month blank while keeping the hero’s notes.\n\nNone is an editor option and does not have a separate schedule page. Unscheduled heroes remain available in **All Heroes** and on their full Hero Profiles."}, {"section": "Browsing", "question": "How do I browse months and open Hero Details?", "answer": "Use **Browse Month** to select a year and month, or use the arrows to move through available months. **Current month** returns to the current period.\n\nPublic visitors see months containing recorded rerun heroes or NH/HoF revival entries. Empty months are hidden; editors retain them for scheduling.\n\nHover over a portrait on desktop for a preview, or click or tap it to open the full **Hero Profile**. Returning from a profile preserves the selected schedule month. Waitlists do not have a month browser."}, {"section": "Browsing", "question": "How do themes and Settings work?", "answer": "Open **Settings → Personalization** to select the default Fire Emblem Heroes theme or one of ten realm variants. The light and dark dream realms have separate themes.\n\nPersonalization also controls view size, text, tags, remembered navigation, carousel behavior, and motion. **Date & time** controls the clock format and timezone.\n\nThese preferences are saved on the current device."}, {"section": "Browsing", "question": "How does the home carousel work?", "answer": "Use the **arrows** or **numbered tiles** to select a banner. The **Play/Pause** button controls automatic rotation.\n\nOpen **Settings → Personalization → Home carousel** to adjust autoplay, time per banner, and pause on hover.\n\nThe controls follow your selected realm’s colors and use numbered selection buttons instead of an animated countdown progress bar."}, {"section": "Browsing", "question": "Does the website update automatically?", "answer": "When automatic updates are enabled, the website checks for a newly published deployment while visible and when you return or reconnect.\n\nA new deployment is applied when panels are closed and you are no longer typing. Schedule data is not reloaded every 30 seconds.\n\nOpen **Settings → Updates** to manage automatic updates or select **Refresh now**."}, {"section": "Browsing", "question": "How do I reset my preferences?", "answer": "You can restore the current device’s default preferences from Personalization.\n\n1. Open **Settings → Personalization → Reset**.\n2. Select **Reset settings**.\n3. Confirm **Restore defaults**, or choose **Cancel** to keep your preferences.\n\nResetting preferences does not delete heroes, schedule records, or your account."}, {"section": "Browsing", "question": "Do I need an account to browse?", "answer": "**No account is required** to browse schedules, heroes, waitlists, public profiles, Settings, or the FAQ.\n\nUse **Sign in** or **Sign up** in navigation for account features. You can continue with GitHub; linking GitHub to an existing account is optional.\n\nNew accounts have **Visitor** access. Creating an account does not grant schedule-editing permissions."}, {"section": "Browsing", "question": "How do profiles and Find Users work?", "answer": "**Profile** opens your public profile when you are signed in. Select **Edit Profile** to change your username, display name, picture, banner, bio, social links, favorites, and visibility choices in a dedicated popup.\n\n**Find Users** searches public usernames and display names. Sign-in email addresses are private and do not appear in search results.\n\nChanging your username changes your public profile link. Followed heroes and saved schedules remain private to your account."}, {"section": "Editing", "question": "Who can edit live schedules and manage access?", "answer": "The **Head Administrator** and authorized **Schedule Managers** maintain heroes, banners, revivals, and waitlists. Only the Head Administrator manages editor access.\n\nEveryone may submit information, corrections, and project contributions. Live editing remains restricted to authorized accounts."}, {"section": "Editing", "question": "How do I add or edit a hero?", "answer": "Use **Add hero** in the relevant view, or **Edit hero** on a Hero Profile, to open the editor.\n\n1. Enter the hero’s name, title, and type.\n2. Set the weapon color and type, movement type, pool, and any applicable blessing.\n3. Choose a schedule and month when required, or select **None** to keep notes only.\n4. Set the separate **Demote** and **Heroic Grails** checkboxes as appropriate.\n5. Review the notes and select **Save hero** to publish the changes."}, {"section": "Editing", "question": "How do I add or edit a banner lineup?", "answer": "Select **Add banner** on Home, or open a card’s **three-dot menu → Edit banner / slots**.\n\n1. Choose the banner type and enter its name and active dates/times.\n2. Select a hero slot to open the hero picker.\n3. Review the featured lineup and save the banner.\n\nRemix uses two groups of eight heroes, with two slots per weapon color. Other layouts follow the selected banner type. Banner membership is recorded separately from a hero’s rerun schedule."}, {"section": "Editing", "question": "How do I update revival entries?", "answer": "Open **Edit revival** in NH Revival or HoF Revival to update an event’s title and featured heroes.\n\nFor an ongoing event, enter its active dates and **UTC times** to display the remaining-time label. Review the lineup, then save the entry.\n\nNH Revival and HoF Revival are maintained separately."}, {"section": "Editing", "question": "How do I reorganize banners and waitlists?", "answer": "Open **Reorganize** in the relevant view and choose a way to move entries.\n\n- Drag an entry using its handle with a mouse or touch.\n- Use the move controls beside an entry.\n- Press **Alt + Up/Down** on a focused entry.\n\nSelect **Save order** to apply the arrangement. **Reset order** discards unsaved changes. Each waitlist and weapon color is ordered independently."}, {"section": "Editing", "question": "How do portrait uploads work?", "answer": "Choose, drop, or paste a **PNG, JPG, or WebP** portrait up to **3 MB**. Supported direct FEH Wiki/Fandom image links can also be imported.\n\nWait for the image preview, review the hero’s details, and save. Portraits are optimized when doing so reduces their file size.\n\nOptimized public copies are served through GitHub Pages. Newly uploaded portraits use the live Storage fallback until an optimized copy is available."}, {"section": "About", "question": "How do I install the website as an app?", "answer": "Open **navigation → Install App** and select **Install**. If the browser supports a PWA installation prompt, the button opens it for confirmation.\n\nIf a prompt is unavailable, follow the displayed browser instructions. On **iPhone or iPad**, use **Safari → Share → Add to Home Screen**.\n\nCurrent schedules and editing require an internet connection.", "sources": [["PWA installation support", "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt"]]}, {"section": "About", "question": "Can anyone contribute to the website?", "answer": "**Everyone is welcome to contribute.** You can suggest rerun information, hero corrections, features, design improvements, or bug reports through GitHub issues.\n\nTesting, documentation, and code contributions are also welcome. For schedule corrections, include a source and clearly distinguish **confirmed information** from **predictions**.\n\nMaintainers review submissions before applying changes to the live website. The Contributing Guidelines explain how to get started.", "sources": [["Contributing Guidelines", "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/blob/main/CONTRIBUTING.md"], ["Submit an issue", "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/issues"]]}, {"section": "About", "question": "Is the website open source?", "answer": "The website’s **original code and documentation use the MIT License**.\n\nNintendo artwork, game UI, backgrounds, supplied fonts, and other third-party materials retain their respective rights and terms. The code license does not grant permission to reuse those assets.\n\nSee the license and third-party notices below for details.", "sources": [["MIT License", "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/blob/main/LICENSE"], ["Third-party notices", "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/blob/main/THIRD_PARTY_NOTICES.md"]]}]'::jsonb) with ordinality as entry(value,ord);

create function tracker_private.touch_site_content() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at:=clock_timestamp();return new;end; $$;
create trigger mods_content_updated before update on public.tracker_site_content for each row execute function tracker_private.touch_site_content();
CREATE OR REPLACE FUNCTION public.get_public_tracker_profile(profile_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select jsonb_build_object('id',p.id,'display_name',p.display_name,'username',p.username,'avatar_path',p.avatar_path,'banner_path',p.banner_path,
 'bio',case when p.id=auth.uid() or coalesce(p.visibility->'bio','true'::jsonb)='true'::jsonb then p.bio else '' end,
 'social_links',case when p.id=auth.uid() or coalesce(p.visibility->'social_links','true'::jsonb)='true'::jsonb then p.social_links else '[]'::jsonb end,
 'about',case when p.id=auth.uid() or coalesce(p.visibility->'about','true'::jsonb)='true'::jsonb then p.about else '' end,
 'favorite_heroes',case when p.id=auth.uid() or coalesce(p.visibility->'favorite_heroes','true'::jsonb)='true'::jsonb then to_jsonb(p.favorite_heroes) else '[]'::jsonb end,
 'favorite_games',case when p.id=auth.uid() or coalesce(p.visibility->'favorite_games','true'::jsonb)='true'::jsonb then to_jsonb(p.favorite_games) else '[]'::jsonb end,
 'role',case when p.id='360457b7-e43f-4bf7-bcb1-d9792233a243'::uuid and exists(select 1 from auth.users u where u.id=p.id and u.email_confirmed_at is not null) then 'Head Administrator' when exists(select 1 from public.tracker_managers m join auth.users u on u.id=m.user_id where m.user_id=p.id and m.email=lower(u.email) and u.email_confirmed_at is not null) then 'Schedule Manager' else null end)
 from public.tracker_profiles p where p.id=profile_id and (p.id=auth.uid() or public.tracker_role()='Owner' or not exists(select 1 from public.tracker_profile_moderation m where m.user_id=p.id and m.hidden));
$function$;

CREATE OR REPLACE FUNCTION public.search_public_tracker_profiles(search_term text, result_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, username text, display_name text, avatar_path text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select p.id,p.username,p.display_name,p.avatar_path from public.tracker_profiles p
 where not exists(select 1 from public.tracker_profile_moderation m where m.user_id=p.id and m.hidden) and char_length(trim(search_term)) between 2 and 80 and p.username is not null
 and (position(lower(trim(search_term)) in p.username)>0 or position(lower(trim(search_term)) in lower(p.display_name))>0)
 order by (p.username=lower(trim(search_term))) desc,p.username,p.id
 limit 21 offset greatest(0,least(coalesce(result_offset,0),500));
$function$;
