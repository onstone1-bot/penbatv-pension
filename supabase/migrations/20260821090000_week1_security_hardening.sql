-- Week 1 security hardening for PenBa TV.
-- Goal: keep public content visible to guests and signed-in users while preparing
-- customer/host/operator row-level access for real operation.

create schema if not exists private;

create table if not exists public.accommodation_host_users (
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'host' check (role in ('host', 'manager')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  primary key (accommodation_id, user_id)
);

create index if not exists accommodation_host_users_user_idx
on public.accommodation_host_users(user_id, status);

alter table public.accommodation_host_users enable row level security;

create or replace function private.current_profile_role()
returns text
language sql
security definer
set search_path = public, pg_temp
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
  and p.status = 'active'
  limit 1
$$;

create or replace function private.can_manage_accommodation(target_accommodation_id text)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    private.current_profile_role() = 'operator'
    or exists (
      select 1
      from public.accommodation_host_users ahu
      where ahu.accommodation_id = target_accommodation_id
      and ahu.user_id = (select auth.uid())
      and ahu.status = 'active'
    ),
    false
  )
$$;

revoke all on function private.current_profile_role() from public;
revoke all on function private.can_manage_accommodation(text) from public;
grant execute on function private.current_profile_role() to authenticated;
grant execute on function private.can_manage_accommodation(text) to authenticated;

drop policy if exists "anon can read active accommodations" on public.accommodations;
create policy "public can read active accommodations"
on public.accommodations for select to anon, authenticated
using (status = 'active');

drop policy if exists "anon can read active rooms" on public.rooms;
create policy "public can read active rooms"
on public.rooms for select to anon, authenticated
using (status = 'active');

drop policy if exists "anon can read room images for active rooms" on public.room_images;
create policy "public can read room images for active rooms"
on public.room_images for select to anon, authenticated
using (
  exists (
    select 1 from public.rooms r
    where r.id = room_images.room_id
    and r.status = 'active'
  )
);

drop policy if exists "anon can read active room rates" on public.room_rates;
create policy "public can read active room rates"
on public.room_rates for select to anon, authenticated
using (
  exists (
    select 1 from public.rooms r
    where r.id = room_rates.room_id
    and r.status = 'active'
  )
);

drop policy if exists "anon can read active booking options" on public.booking_options;
create policy "public can read active booking options"
on public.booking_options for select to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1 from public.accommodations a
    where a.id = booking_options.accommodation_id
    and a.status = 'active'
  )
);

drop policy if exists "anon can read active youtube campaigns" on public.youtube_campaigns;
create policy "public can read active youtube campaigns"
on public.youtube_campaigns for select to anon, authenticated
using (status = 'active');

drop policy if exists "anon can read active naver links" on public.naver_links;
create policy "public can read active naver links"
on public.naver_links for select to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1 from public.accommodations a
    where a.id = naver_links.accommodation_id
    and a.status = 'active'
  )
);

drop policy if exists "anon can read active nearby places" on public.nearby_places;
create policy "public can read active nearby places"
on public.nearby_places for select to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1 from public.accommodations a
    where a.id = nearby_places.accommodation_id
    and a.status = 'active'
  )
);

drop policy if exists "authenticated users can insert own customer profile" on public.profiles;
create policy "authenticated users can insert own customer profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id and role = 'customer');

drop policy if exists "hosts can read own accommodation mappings" on public.accommodation_host_users;
create policy "hosts can read own accommodation mappings"
on public.accommodation_host_users for select to authenticated
using (
  user_id = (select auth.uid())
  or private.current_profile_role() = 'operator'
);

drop policy if exists "hosts can read bookings for managed accommodations" on public.bookings;
create policy "hosts can read bookings for managed accommodations"
on public.bookings for select to authenticated
using (
  private.current_profile_role() = 'operator'
  or exists (
    select 1
    from public.rooms r
    where r.id = bookings.room_id
    and private.can_manage_accommodation(r.accommodation_id)
  )
);

drop policy if exists "hosts can read payment orders for managed accommodations" on public.payment_orders;
create policy "hosts can read payment orders for managed accommodations"
on public.payment_orders for select to authenticated
using (
  private.current_profile_role() = 'operator'
  or exists (
    select 1
    from public.rooms r
    where r.id = payment_orders.room_id
    and private.can_manage_accommodation(r.accommodation_id)
  )
);

grant select on public.accommodations to authenticated;
grant select on public.rooms to authenticated;
grant select on public.room_images to authenticated;
grant select on public.room_rates to authenticated;
grant select on public.booking_options to authenticated;
grant select on public.youtube_campaigns to authenticated;
grant select on public.naver_links to authenticated;
grant select on public.nearby_places to authenticated;
grant insert on public.profiles to authenticated;
grant select on public.accommodation_host_users to authenticated;
grant select, insert, update, delete on public.accommodation_host_users to service_role;
