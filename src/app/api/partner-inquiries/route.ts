import { NextResponse } from "next/server";
import { createPartnerInquirySchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createPartnerInquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient() as any;
  const { data, error } = await supabase
    .from("partner_inquiries")
    .insert({
      stay_name: parsed.data.stayName,
      area: parsed.data.area,
      owner_name: parsed.data.ownerName || null,
      owner_phone: parsed.data.ownerPhone,
      email: parsed.data.email || null,
      operation_type: parsed.data.operationType,
      room_count: parsed.data.roomCount,
      bbq_type: parsed.data.bbqType || null,
      external_channels: parsed.data.externalChannels,
      message: parsed.data.message || null,
      source: parsed.data.source,
      status: "received"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inquiry: data }, { status: 201 });
}
