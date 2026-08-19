create table if not exists public.customer_preferences (
  customer_id uuid primary key references public.profiles(id) on delete cascade,
  notification_enabled boolean not null default true,
  cash_receipt_type text not null default 'none'
    check (cash_receipt_type in ('none', 'personal', 'business')),
  cash_receipt_value text,
  default_adult_count integer not null default 2 check (default_adult_count >= 1),
  default_child_count integer not null default 0 check (default_child_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  source text not null default 'customer_home',
  created_at timestamptz not null default now(),
  unique (customer_id, accommodation_id)
);

create table if not exists public.customer_recent_stays (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  room_id text references public.rooms(id) on delete set null,
  source text not null default 'stay_detail',
  view_count integer not null default 1 check (view_count >= 1),
  last_viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (customer_id, accommodation_id)
);

alter table public.partner_inquiries
  add column if not exists operator_note text,
  add column if not exists contacted_at timestamptz;

create index if not exists customer_favorites_customer_created_idx
on public.customer_favorites(customer_id, created_at desc);

create index if not exists customer_recent_stays_customer_viewed_idx
on public.customer_recent_stays(customer_id, last_viewed_at desc);

alter table public.customer_preferences enable row level security;
alter table public.customer_favorites enable row level security;
alter table public.customer_recent_stays enable row level security;

drop policy if exists "customers can read own preferences" on public.customer_preferences;
create policy "customers can read own preferences"
on public.customer_preferences for select to authenticated
using ((select auth.uid()) = customer_id);

drop policy if exists "customers can upsert own preferences" on public.customer_preferences;
create policy "customers can upsert own preferences"
on public.customer_preferences for insert to authenticated
with check ((select auth.uid()) = customer_id);

drop policy if exists "customers can update own preferences" on public.customer_preferences;
create policy "customers can update own preferences"
on public.customer_preferences for update to authenticated
using ((select auth.uid()) = customer_id)
with check ((select auth.uid()) = customer_id);

drop policy if exists "customers can read own favorites" on public.customer_favorites;
create policy "customers can read own favorites"
on public.customer_favorites for select to authenticated
using ((select auth.uid()) = customer_id);

drop policy if exists "customers can insert own favorites" on public.customer_favorites;
create policy "customers can insert own favorites"
on public.customer_favorites for insert to authenticated
with check ((select auth.uid()) = customer_id);

drop policy if exists "customers can delete own favorites" on public.customer_favorites;
create policy "customers can delete own favorites"
on public.customer_favorites for delete to authenticated
using ((select auth.uid()) = customer_id);

drop policy if exists "customers can read own recent stays" on public.customer_recent_stays;
create policy "customers can read own recent stays"
on public.customer_recent_stays for select to authenticated
using ((select auth.uid()) = customer_id);

drop policy if exists "customers can insert own recent stays" on public.customer_recent_stays;
create policy "customers can insert own recent stays"
on public.customer_recent_stays for insert to authenticated
with check ((select auth.uid()) = customer_id);

drop policy if exists "customers can update own recent stays" on public.customer_recent_stays;
create policy "customers can update own recent stays"
on public.customer_recent_stays for update to authenticated
using ((select auth.uid()) = customer_id)
with check ((select auth.uid()) = customer_id);

grant select, insert, update on public.customer_preferences to authenticated;
grant select, insert, delete on public.customer_favorites to authenticated;
grant select, insert, update on public.customer_recent_stays to authenticated;

grant select, insert, update, delete on public.customer_preferences to service_role;
grant select, insert, update, delete on public.customer_favorites to service_role;
grant select, insert, update, delete on public.customer_recent_stays to service_role;
