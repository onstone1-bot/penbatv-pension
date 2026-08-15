import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { expireBookingHolds } from "@/lib/availability";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const supabase = createAdminClient();
    const result = await expireBookingHolds(supabase);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown expire holds error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
