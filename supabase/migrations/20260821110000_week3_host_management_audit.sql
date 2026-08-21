-- Week 3 host management audit trail for PenBa TV.
-- Keeps owner-facing content changes traceable without exposing write access to the browser.

create table if not exists public.host_operation_events (
  id uuid primary key default gen_random_uuid(),
  actor_role text not null default 'host' check (actor_role in ('host', 'operator')),
  actor_user_id uuid references public.profiles(id) on delete set null,
  accommodation_id text references public.accommodations(id) on delete set null,
  room_id text references public.rooms(id) on delete set null,
  target_type text not null check (
    target_type in (
      'accommodation',
      'room',
      'room_image',
      'room_rate',
      'booking_option',
      'youtube_campaign',
      'naver_link',
      'nearby_place'
    )
  ),
  target_id text not null,
  action text not null check (action in ('create', 'update', 'hide', 'upsert', 'set_cover')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists host_operation_events_accommodation_created_idx
  on public.host_operation_events(accommodation_id, created_at desc);

create index if not exists host_operation_events_target_idx
  on public.host_operation_events(target_type, target_id, created_at desc);

create index if not exists host_operation_events_room_created_idx
  on public.host_operation_events(room_id, created_at desc);

alter table public.host_operation_events enable row level security;

drop policy if exists "hosts can read operation events for managed accommodations" on public.host_operation_events;
create policy "hosts can read operation events for managed accommodations"
on public.host_operation_events for select to authenticated
using (
  private.current_profile_role() = 'operator'
  or (
    accommodation_id is not null
    and private.can_manage_accommodation(accommodation_id)
  )
);

revoke all on table public.host_operation_events from anon, authenticated;
grant select on public.host_operation_events to authenticated;
grant select, insert, update, delete on public.host_operation_events to service_role;
