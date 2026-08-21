import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { logHostOperationEvent } from "@/lib/host-operation-events";
import { createRoomRateSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const parsed = createRoomRateSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("room_rates")
      .insert({
        room_id: id,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate,
        rate_type: parsed.data.rateType,
        nightly_price: parsed.data.nightlyPrice,
        weekend_extra: parsed.data.weekendExtra,
        priority: parsed.data.priority,
        memo: parsed.data.memo ?? null
      })
      .select()
      .single();

    if (error) throw error;

    const { data: room } = await supabase
      .from("rooms")
      .select("accommodation_id")
      .eq("id", id)
      .maybeSingle();

    const operationLog = await logHostOperationEvent(request, {
      accommodationId: room?.accommodation_id ?? null,
      roomId: id,
      targetType: "room_rate",
      targetId: data.id,
      action: "create",
      metadata: {
        startDate: data.start_date,
        endDate: data.end_date,
        rateType: data.rate_type,
        nightlyPrice: data.nightly_price
      }
    });

    return NextResponse.json({ rate: data, operationLog }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create room rate error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
