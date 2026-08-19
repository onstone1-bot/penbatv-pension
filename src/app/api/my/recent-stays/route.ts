import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth/current-user";
import { recordRecentStaySchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = recordRecentStaySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const currentCustomer = await getCurrentCustomer();

  if (!currentCustomer?.user) {
    return NextResponse.json({
      stored: false,
      mode: "guest",
      accommodationId: parsed.data.accommodationId
    });
  }

  const supabase = createAdminClient() as any;
  const now = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from("customer_recent_stays")
    .select("id, view_count")
    .eq("customer_id", currentCustomer.user.id)
    .eq("accommodation_id", parsed.data.accommodationId)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

  if (existing) {
    const { data, error } = await supabase
      .from("customer_recent_stays")
      .update({
        room_id: parsed.data.roomId ?? null,
        source: parsed.data.source,
        view_count: existing.view_count + 1,
        last_viewed_at: now
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ stored: true, mode: "updated", row: data });
  }

  const { data, error } = await supabase
    .from("customer_recent_stays")
    .insert({
      customer_id: currentCustomer.user.id,
      accommodation_id: parsed.data.accommodationId,
      room_id: parsed.data.roomId ?? null,
      source: parsed.data.source,
      view_count: 1,
      last_viewed_at: now
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ stored: true, mode: "created", row: data });
}
