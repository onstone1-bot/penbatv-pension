import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export type AdminOperationAction =
  | "dashboard_view"
  | "accommodation_approval"
  | "partner_inquiry_status"
  | "role_scope_check"
  | "qa_run";

export type AdminOperationTargetType =
  | "admin_dashboard"
  | "accommodation"
  | "partner_inquiry"
  | "profile"
  | "booking"
  | "payment_order"
  | "utm_campaign";

type AdminOperationInput = {
  action: AdminOperationAction;
  targetType: AdminOperationTargetType;
  targetId: string;
  status?: "completed" | "blocked" | "failed";
  metadata?: Json;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getActorUserId(request: Request) {
  const actorUserId = request.headers.get("x-penbatv-user-id");
  return actorUserId && uuidPattern.test(actorUserId) ? actorUserId : null;
}

export async function logAdminOperationEvent(request: Request, input: AdminOperationInput) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("admin_operation_events").insert({
      actor_user_id: getActorUserId(request),
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId,
      status: input.status ?? "completed",
      metadata: input.metadata ?? {}
    });

    if (error) throw error;
    return { persisted: true } as const;
  } catch (error) {
    return {
      persisted: false,
      reason: error instanceof Error ? error.message : "Unknown admin operation log error"
    } as const;
  }
}
