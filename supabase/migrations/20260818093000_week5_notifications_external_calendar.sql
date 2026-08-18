create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  channel text not null default 'alimtalk' check (channel in ('alimtalk', 'sms')),
  template_type text not null check (template_type in ('booking_confirmed', 'checkin_guide', 'barbecue_reminder')),
  recipient_name text not null,
  recipient_phone text not null,
  message text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'cancelled')),
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists notification_queue_booking_template_unique_idx
on public.notification_queue(booking_id, template_type)
where booking_id is not null;

create index if not exists notification_queue_status_schedule_idx
on public.notification_queue(status, scheduled_at);

create table if not exists public.calendar_sync_sources (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  provider text not null,
  ical_url text,
  sync_policy text not null default 'import_only' check (sync_policy in ('import_only', 'two_way_later')),
  status text not null default 'active' check (status in ('active', 'paused', 'failed')),
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  constraint calendar_sync_sources_room_provider_unique unique (room_id, provider)
);

create table if not exists public.calendar_sync_events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.calendar_sync_sources(id) on delete cascade,
  room_id text not null references public.rooms(id) on delete cascade,
  external_uid text not null,
  summary text,
  check_in date not null,
  check_out date not null,
  status text not null default 'blocked' check (status in ('blocked', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint calendar_sync_events_valid_date_range check (check_in < check_out),
  constraint calendar_sync_events_source_uid_unique unique (source_id, external_uid)
);

alter table public.room_blocks
  add column if not exists external_source_id uuid references public.calendar_sync_sources(id) on delete cascade,
  add column if not exists external_uid text,
  add column if not exists source_channel text;

create unique index if not exists room_blocks_external_source_uid_unique_idx
on public.room_blocks(external_source_id, external_uid)
where external_source_id is not null and external_uid is not null;

create table if not exists public.pilot_runs (
  id uuid primary key default gen_random_uuid(),
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  status text not null default 'rehearsal' check (status in ('draft', 'rehearsal', 'ready', 'open')),
  checklist jsonb not null default '{}'::jsonb,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pilot_runs_accommodation_status_idx
on public.pilot_runs(accommodation_id, status, created_at desc);

alter table public.notification_queue enable row level security;
alter table public.calendar_sync_sources enable row level security;
alter table public.calendar_sync_events enable row level security;
alter table public.pilot_runs enable row level security;

grant select, insert, update, delete on public.notification_queue to service_role;
grant select, insert, update, delete on public.calendar_sync_sources to service_role;
grant select, insert, update, delete on public.calendar_sync_events to service_role;
grant select, insert, update, delete on public.pilot_runs to service_role;
