create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'host', 'operator')),
  provider text,
  provider_user_id text,
  email text,
  name text,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'pending', 'suspended')),
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_provider_user_id_unique_idx
on public.profiles(provider, provider_user_id)
where provider is not null and provider_user_id is not null;

create index if not exists profiles_role_status_idx on public.profiles(role, status);

alter table public.bookings
  add column if not exists customer_id uuid references public.profiles(id) on delete set null;

alter table public.payment_orders
  add column if not exists customer_id uuid references public.profiles(id) on delete set null;

create index if not exists bookings_customer_created_idx on public.bookings(customer_id, created_at desc);
create index if not exists payment_orders_customer_created_idx on public.payment_orders(customer_id, created_at desc);

alter table public.profiles enable row level security;

drop policy if exists "authenticated users can read own profile" on public.profiles;
create policy "authenticated users can read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "authenticated users can update own customer profile" on public.profiles;
create policy "authenticated users can update own customer profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id and role = 'customer');

grant select, update on public.profiles to authenticated;
grant select on public.bookings to authenticated;
grant select on public.payment_orders to authenticated;
grant select, insert, update, delete on public.profiles to service_role;
