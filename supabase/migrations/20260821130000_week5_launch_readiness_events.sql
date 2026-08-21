-- Week 5 launch readiness event trail for PenBa TV.
-- Tracks notification, iCal, environment, and pilot-open checks before public rollout.

create table if not exists public.launch_readiness_events (
  id uuid primary key default gen_random_uuid(),
  actor_role text not null default 'operator' check (actor_role in ('host', 'operator')),
  actor_user_id uuid references public.profiles(id) on delete set null,
  stage text not null check (
    stage in (
      'notification_queue',
      'notification_dispatch',
      'ical_sync',
      'environment_check',
      'pilot_open'
    )
  ),
  target_type text not null check (
    target_type in (
      'booking',
      'notification',
      'room',
      'calendar_source',
      'environment',
      'pilot_run',
      'accommodation'
    )
  ),
  target_id text not null,
  status text not null default 'completed' check (status in ('completed', 'open', 'rehearsal', 'blocked', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists launch_readiness_events_stage_created_idx
  on public.launch_readiness_events(stage, created_at desc);

create index if not exists launch_readiness_events_target_idx
  on public.launch_readiness_events(target_type, target_id, created_at desc);

alter table public.launch_readiness_events enable row level security;

drop policy if exists "operators can read launch readiness events" on public.launch_readiness_events;
create policy "operators can read launch readiness events"
on public.launch_readiness_events for select to authenticated
using (private.current_profile_role() = 'operator');

revoke all on table public.launch_readiness_events from anon, authenticated;
grant select on public.launch_readiness_events to authenticated;
grant select, insert, update, delete on public.launch_readiness_events to service_role;
