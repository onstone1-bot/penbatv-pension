import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
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

    return NextResponse.json({ rate: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create room rate error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
