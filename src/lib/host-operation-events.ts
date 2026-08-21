import { getRequestRole } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export type HostOperationTargetType =
  | "accommodation"
  | "room"
  | "room_image"
  | "room_rate"
  | "booking_option"
  | "youtube_campaign"
  | "naver_link"
  | "nearby_place";

export type HostOperationAction = "create" | "update" | "hide" | "upsert" | "set_cover";

type HostOperationInput = {
  accommodationId?: string | null;
  roomId?: string | null;
  targetType: HostOperationTargetType;
  targetId: string;
  action: HostOperationAction;
  metadata?: Json;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getActorUserId(request: Request) {
  const actorUserId = request.headers.get("x-penbatv-user-id");
  return actorUserId && uuidPattern.test(actorUserId) ? actorUserId : null;
}

export async function logHostOperationEvent(request: Request, input: HostOperationInput) {
  const actorRole = getRequestRole(request) === "operator" ? "operator" : "host";

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("host_operation_events").insert({
      actor_role: actorRole,
      actor_user_id: getActorUserId(request),
      accommodation_id: input.accommodationId ?? null,
      room_id: input.roomId ?? null,
      target_type: input.targetType,
      target_id: input.targetId,
      action: input.action,
      metadata: input.metadata ?? {}
    });

    if (error) throw error;
    return { persisted: true } as const;
  } catch (error) {
    return {
      persisted: false,
      reason: error instanceof Error ? error.message : "Unknown host operation log error"
    } as const;
  }
}
