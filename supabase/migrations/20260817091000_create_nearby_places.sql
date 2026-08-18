create table if not exists public.nearby_places (
  id text primary key,
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  place_type text not null check (place_type in ('attraction', 'restaurant')),
  name text not null,
  category text not null,
  address text,
  distance_label text,
  travel_time text,
  description text,
  url text,
  map_url text,
  image_url text,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists nearby_places_accommodation_sort_idx
on public.nearby_places(accommodation_id, place_type, sort_order);

alter table public.nearby_places enable row level security;

drop policy if exists "anon can read active nearby places" on public.nearby_places;
create policy "anon can read active nearby places"
on public.nearby_places for select to anon
using (
  status = 'active'
  and exists (
    select 1 from public.accommodations a
    where a.id = nearby_places.accommodation_id
    and a.status = 'active'
  )
);

grant select on public.nearby_places to anon;
grant select, insert, update, delete on public.nearby_places to service_role;
