import { getRequestRole } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export type LaunchReadinessStage =
  | "notification_queue"
  | "notification_dispatch"
  | "ical_sync"
  | "environment_check"
  | "pilot_open";

export type LaunchReadinessTargetType =
  | "booking"
  | "notification"
  | "room"
  | "calendar_source"
  | "environment"
  | "pilot_run"
  | "accommodation";

type LaunchReadinessInput = {
  stage: LaunchReadinessStage;
  targetType: LaunchReadinessTargetType;
  targetId: string;
  status?: "completed" | "open" | "rehearsal" | "blocked" | "failed";
  metadata?: Json;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getActorUserId(request: Request) {
  const actorUserId = request.headers.get("x-penbatv-user-id");
  return actorUserId && uuidPattern.test(actorUserId) ? actorUserId : null;
}

export async function logLaunchReadinessEvent(request: Request, input: LaunchReadinessInput) {
  const requestRole = getRequestRole(request);
  const actorRole = requestRole === "host" ? "host" : "operator";

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("launch_readiness_events")
      .insert({
        actor_role: actorRole,
        actor_user_id: getActorUserId(request),
        stage: input.stage,
        target_type: input.targetType,
        target_id: input.targetId,
        status: input.status ?? "completed",
        metadata: input.metadata ?? {}
      })
      .select()
      .single();

    if (error) throw error;
    return { persisted: true, event: data } as const;
  } catch (error) {
    return {
      persisted: false,
      reason: error instanceof Error ? error.message : "Unknown launch readiness log error"
    } as const;
  }
}

export async function getLatestLaunchReadinessEvents(limit = 12) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("launch_readiness_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
