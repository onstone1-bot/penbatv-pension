import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOperatorToken } from "@/lib/admin-auth";
import { logLaunchReadinessEvent } from "@/lib/launch-readiness-events";
import { createPilotRun } from "@/lib/pilot";

const pilotSchema = z.object({
  accommodationId: z.string().min(1),
  checklist: z.object({
    youtubeLinkChecked: z.boolean(),
    bookingFlowChecked: z.boolean(),
    paymentChecked: z.boolean(),
    notificationChecked: z.boolean(),
    hostDashboardChecked: z.boolean(),
    mobileChecked: z.boolean()
  })
});

export async function POST(request: Request) {
  try {
    requireOperatorToken(request);
    const parsed = pilotSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createPilotRun(parsed.data);
    const launchReadinessLog = await logLaunchReadinessEvent(request, {
      stage: "pilot_open",
      targetType: "pilot_run",
      targetId: result.pilotRun.id,
      status: result.pilotRun.status === "open" ? "open" : "rehearsal",
      metadata: { accommodationId: parsed.data.accommodationId, readiness: result.readiness }
    });

    return NextResponse.json({ ...result, launchReadinessLog }, { status: result.readiness.ready ? 201 : 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pilot open error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
