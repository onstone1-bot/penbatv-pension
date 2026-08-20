-- Week 2 payment and reservation confirmation hardening.
-- Adds audit-grade payment order events and separates manual transfer deposit due time.

alter table public.payment_orders
  add column if not exists deposit_due_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists expired_at timestamptz,
  add column if not exists last_error text;

create table if not exists public.payment_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.payment_orders(order_id) on delete cascade,
  event_type text not null check (event_type in ('prepared', 'paid', 'waiting_deposit', 'failed', 'cancelled', 'expired')),
  from_status text check (from_status is null or from_status in ('ready', 'paid', 'waiting_deposit', 'failed', 'cancelled', 'expired')),
  to_status text check (to_status is null or to_status in ('ready', 'paid', 'waiting_deposit', 'failed', 'cancelled', 'expired')),
  payment_key text,
  booking_id uuid references public.bookings(id) on delete set null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_orders_deposit_due_idx
on public.payment_orders(status, deposit_due_at);

create index if not exists payment_order_events_order_created_idx
on public.payment_order_events(order_id, created_at desc);

alter table public.payment_order_events enable row level security;

drop policy if exists "authenticated users can read own payment order events" on public.payment_order_events;
create policy "authenticated users can read own payment order events"
on public.payment_order_events for select to authenticated
using (
  exists (
    select 1 from public.payment_orders po
    where po.order_id = payment_order_events.order_id
    and po.customer_id = (select auth.uid())
  )
);

grant select on public.payment_order_events to authenticated;
grant select, insert, update, delete on public.payment_order_events to service_role;
