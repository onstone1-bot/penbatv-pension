import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { createRoomSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("*, room_images(*), room_rates(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ rooms: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown host rooms error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const parsed = createRoomSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        id: parsed.data.id,
        accommodation_id: parsed.data.accommodationId,
        name: parsed.data.name,
        type: parsed.data.type,
        base_price: parsed.data.basePrice,
        weekend_extra: parsed.data.weekendExtra,
        standard_capacity: parsed.data.standardCapacity,
        max_capacity: parsed.data.maxCapacity,
        description: parsed.data.description ?? null,
        tags: parsed.data.tags,
        amenities: parsed.data.amenities as Json
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ room: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create room error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
