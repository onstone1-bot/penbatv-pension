create table if not exists public.partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  stay_name text not null,
  area text not null,
  owner_name text,
  owner_phone text not null,
  email text,
  operation_type text not null default 'pension_bbq'
    check (operation_type in ('pension_bbq', 'pension', 'bbq', 'glamping')),
  room_count integer not null default 0 check (room_count >= 0),
  bbq_type text,
  external_channels text[] not null default '{}',
  message text,
  source text not null default 'partner_inquiry',
  status text not null default 'received'
    check (status in ('received', 'consulting', 'filming', 'onboarding', 'open', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_inquiries_status_created_idx
on public.partner_inquiries(status, created_at desc);

create index if not exists partner_inquiries_area_idx
on public.partner_inquiries(area);

alter table public.partner_inquiries enable row level security;

grant select, insert, update, delete on public.partner_inquiries to service_role;
