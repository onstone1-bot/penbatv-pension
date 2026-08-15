-- StayLink Day 2 schema draft.
-- Convert this draft into a Supabase migration with:
-- supabase migration new init_staylink_schema

create extension if not exists pgcrypto;

create table if not exists public.accommodations (
  id text primary key,
  name text not null,
  area text not null,
  address text,
  concept text,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'hidden', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id text primary key,
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  name text not null,
  type text not null check (type in ('private_house', 'glamping', 'camp_site')),
  base_price integer not null default 0 check (base_price >= 0),
  weekend_extra integer not null default 0 check (weekend_extra >= 0),
  standard_capacity integer not null default 1 check (standard_capacity > 0),
  max_capacity integer not null default 1 check (max_capacity >= standard_capacity),
  description text,
  tags text[] not null default '{}',
  amenities jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  constraint room_images_room_url_key unique (room_id, url)
);

create table if not exists public.room_rates (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  rate_type text not null default 'seasonal' check (rate_type in ('base', 'seasonal', 'special')),
  nightly_price integer not null check (nightly_price >= 0),
  weekend_extra integer not null default 0 check (weekend_extra >= 0),
  priority integer not null default 0,
  memo text,
  created_at timestamptz not null default now(),
  constraint room_rates_valid_date_range check (start_date <= end_date),
  constraint room_rates_unique_rule unique (room_id, start_date, end_date, rate_type, priority)
);

create table if not exists public.booking_options (
  id text primary key,
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  name text not null,
  description text,
  price integer not null default 0 check (price >= 0),
  status text not null default 'active' check (status in ('active', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_holds (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id),
  check_in date not null,
  check_out date not null,
  utm_code text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint booking_holds_valid_date_range check (check_in < check_out)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_no text not null unique,
  room_id text not null references public.rooms(id),
  hold_id uuid references public.booking_holds(id),
  check_in date not null,
  check_out date not null,
  adult_count integer not null default 1 check (adult_count >= 1),
  child_count integer not null default 0 check (child_count >= 0),
  guest_name text not null,
  guest_phone text not null,
  utm_code text,
  status text not null default 'hold' check (status in ('hold', 'confirmed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  total_amount integer not null default 0 check (total_amount >= 0),
  option_amount integer not null default 0 check (option_amount >= 0),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  created_at timestamptz not null default now(),
  constraint bookings_valid_date_range check (check_in < check_out)
);

create table if not exists public.booking_option_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  option_id text not null references public.booking_options(id),
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.room_blocks (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id),
  check_in date not null,
  check_out date not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint room_blocks_valid_date_range check (check_in < check_out)
);

create table if not exists public.youtube_campaigns (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  video_url text,
  room_id text references public.rooms(id),
  coupon_amount integer not null default 0 check (coupon_amount >= 0),
  status text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default now()
);

create table if not exists public.utm_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  utm_code text,
  room_id text references public.rooms(id),
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  hold_id uuid references public.booking_holds(id),
  room_id text not null references public.rooms(id),
  provider text not null check (provider in ('card', 'naverpay', 'tosspay', 'vbank')),
  mode text not null default 'mock' check (mode in ('mock', 'toss')),
  amount integer not null check (amount >= 0),
  option_amount integer not null default 0 check (option_amount >= 0),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  status text not null default 'ready' check (status in ('ready', 'paid', 'failed', 'cancelled', 'expired')),
  payment_key text,
  checkout jsonb not null default '{}'::jsonb,
  utm_code text,
  guest_name text,
  guest_phone text,
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null check (provider in ('card', 'naverpay', 'tosspay', 'vbank')),
  payment_key text,
  amount integer not null check (amount >= 0),
  status text not null default 'ready' check (status in ('ready', 'paid', 'failed', 'cancelled', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  gross_amount integer not null check (gross_amount >= 0),
  pg_fee integer not null default 0 check (pg_fee >= 0),
  platform_fee integer not null default 0 check (platform_fee >= 0),
  payout_amount integer not null check (payout_amount >= 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'paid', 'held')),
  payout_due_date date,
  created_at timestamptz not null default now()
);

create index if not exists rooms_accommodation_id_idx on public.rooms(accommodation_id);
create index if not exists room_images_room_id_sort_idx on public.room_images(room_id, sort_order);
create index if not exists room_rates_room_date_idx on public.room_rates(room_id, start_date, end_date, priority desc);
create index if not exists booking_options_accommodation_sort_idx on public.booking_options(accommodation_id, sort_order);
create index if not exists bookings_room_date_idx on public.bookings(room_id, check_in, check_out);
create index if not exists booking_holds_room_date_idx on public.booking_holds(room_id, check_in, check_out, expires_at);
create index if not exists booking_option_items_booking_idx on public.booking_option_items(booking_id);
create index if not exists room_blocks_room_date_idx on public.room_blocks(room_id, check_in, check_out);
create index if not exists youtube_campaigns_code_idx on public.youtube_campaigns(code);
create index if not exists utm_events_utm_created_idx on public.utm_events(utm_code, created_at);
create index if not exists payment_orders_order_idx on public.payment_orders(order_id);
create index if not exists payment_orders_hold_idx on public.payment_orders(hold_id);
create index if not exists payment_orders_status_idx on public.payment_orders(status, expires_at);
create index if not exists payments_booking_idx on public.payments(booking_id);
create index if not exists settlements_payment_idx on public.settlements(payment_id);

alter table public.accommodations enable row level security;
alter table public.rooms enable row level security;
alter table public.room_images enable row level security;
alter table public.room_rates enable row level security;
alter table public.booking_options enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_holds enable row level security;
alter table public.booking_option_items enable row level security;
alter table public.room_blocks enable row level security;
alter table public.youtube_campaigns enable row level security;
alter table public.utm_events enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payments enable row level security;
alter table public.settlements enable row level security;

create policy "anon can read active accommodations"
on public.accommodations for select to anon
using (status = 'active');

create policy "anon can read active rooms"
on public.rooms for select to anon
using (status = 'active');

create policy "anon can read room images for active rooms"
on public.room_images for select to anon
using (
  exists (
    select 1 from public.rooms r
    where r.id = room_images.room_id
    and r.status = 'active'
  )
);

create policy "anon can read active room rates"
on public.room_rates for select to anon
using (
  exists (
    select 1 from public.rooms r
    where r.id = room_rates.room_id
    and r.status = 'active'
  )
);

create policy "anon can read active booking options"
on public.booking_options for select to anon
using (
  status = 'active'
  and exists (
    select 1 from public.accommodations a
    where a.id = booking_options.accommodation_id
    and a.status = 'active'
  )
);

create policy "anon can read active youtube campaigns"
on public.youtube_campaigns for select to anon
using (status = 'active');

create policy "anon can insert utm events"
on public.utm_events for insert to anon
with check (true);

grant select on public.accommodations to anon;
grant select on public.rooms to anon;
grant select on public.room_images to anon;
grant select on public.room_rates to anon;
grant select on public.booking_options to anon;
grant select on public.youtube_campaigns to anon;
grant insert on public.utm_events to anon;

grant select, insert, update, delete on all tables in schema public to service_role;
