import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { updateRoomSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";

type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const parsed = updateRoomSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload: RoomUpdate = {
      name: parsed.data.name,
      type: parsed.data.type,
      base_price: parsed.data.basePrice,
      weekend_extra: parsed.data.weekendExtra,
      standard_capacity: parsed.data.standardCapacity,
      max_capacity: parsed.data.maxCapacity,
      description: parsed.data.description,
      tags: parsed.data.tags,
      amenities: parsed.data.amenities as Json | undefined,
      status: parsed.data.status
    };
    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ) as RoomUpdate;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rooms")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ room: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown update room error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rooms")
      .update({ status: "hidden" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ room: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown delete room error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
