-- Week 4 admin operations audit trail for PenBa TV.
-- Tracks operator approvals, partner inquiry handling, and operations dashboard access.

create table if not exists public.admin_operation_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null check (
    action in (
      'dashboard_view',
      'accommodation_approval',
      'partner_inquiry_status',
      'role_scope_check',
      'qa_run'
    )
  ),
  target_type text not null check (
    target_type in (
      'admin_dashboard',
      'accommodation',
      'partner_inquiry',
      'profile',
      'booking',
      'payment_order',
      'utm_campaign'
    )
  ),
  target_id text not null,
  status text not null default 'completed' check (status in ('completed', 'blocked', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_operation_events_action_created_idx
  on public.admin_operation_events(action, created_at desc);

create index if not exists admin_operation_events_target_idx
  on public.admin_operation_events(target_type, target_id, created_at desc);

alter table public.admin_operation_events enable row level security;

drop policy if exists "operators can read admin operation events" on public.admin_operation_events;
create policy "operators can read admin operation events"
on public.admin_operation_events for select to authenticated
using (private.current_profile_role() = 'operator');

revoke all on table public.admin_operation_events from anon, authenticated;
grant select on public.admin_operation_events to authenticated;
grant select, insert, update, delete on public.admin_operation_events to service_role;
