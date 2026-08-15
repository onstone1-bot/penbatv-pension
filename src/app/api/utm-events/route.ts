import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

const eventSchema = z.object({
  eventName: z.enum([
    "landing_view",
    "video_card_click",
    "room_detail_view",
    "booking_hold_created",
    "payment_started",
    "payment_completed"
  ]),
  utmCode: z.string().nullable().optional(),
  roomId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export async function POST(request: Request) {
  const payload = eventSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("utm_events")
    .insert({
      event_name: payload.data.eventName,
      utm_code: payload.data.utmCode ?? null,
      room_id: payload.data.roomId ?? null,
      session_id: payload.data.sessionId ?? null,
      metadata: (payload.data.metadata ?? {}) as Json
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
