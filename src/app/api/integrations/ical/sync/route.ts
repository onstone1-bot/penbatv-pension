import { NextResponse } from "next/server";
import { z } from "zod";
import { requireHostToken } from "@/lib/admin-auth";
import { syncIcalBlocks } from "@/lib/ical-sync";
import { logLaunchReadinessEvent } from "@/lib/launch-readiness-events";

const syncSchema = z.object({
  roomId: z.string().min(1),
  provider: z.string().min(1),
  icalUrl: z.string().url().optional(),
  icalText: z.string().min(1).optional(),
  syncPolicy: z.enum(["import_only", "two_way_later"]).optional()
});

export async function POST(request: Request) {
  try {
    requireHostToken(request);
    const parsed = syncSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await syncIcalBlocks(parsed.data);
    const launchReadinessLog = await logLaunchReadinessEvent(request, {
      stage: "ical_sync",
      targetType: "calendar_source",
      targetId: result.source.id,
      metadata: { roomId: parsed.data.roomId, provider: parsed.data.provider, eventCount: result.eventCount, blockCount: result.blockCount }
    });

    return NextResponse.json({ ...result, launchReadinessLog });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown iCal sync error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
