import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOperatorToken } from "@/lib/admin-auth";
import { logLaunchReadinessEvent } from "@/lib/launch-readiness-events";
import { dispatchDueNotifications } from "@/lib/notifications";

const dispatchSchema = z.object({
  limit: z.number().int().min(1).max(100).optional()
});

export async function POST(request: Request) {
  try {
    requireOperatorToken(request);
    const parsed = dispatchSchema.safeParse(await request.json().catch(() => ({})));

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await dispatchDueNotifications(parsed.data.limit ?? 20);
    const launchReadinessLog = await logLaunchReadinessEvent(request, {
      stage: "notification_dispatch",
      targetType: "notification",
      targetId: result.notifications[0]?.id ?? "dispatch-empty",
      status: result.dispatchedCount > 0 ? "completed" : "blocked",
      metadata: { dispatchedCount: result.dispatchedCount, limit: parsed.data.limit ?? 20, provider: "mock-alimtalk" }
    });

    return NextResponse.json({ ...result, launchReadinessLog });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown notification dispatch error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
