import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { updateRoomImageSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type RoomImageUpdate = Database["public"]["Tables"]["room_images"]["Update"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const parsed = updateRoomImageSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload: RoomImageUpdate = {
      url: parsed.data.url,
      caption: parsed.data.caption,
      sort_order: parsed.data.sortOrder,
      is_cover: parsed.data.isCover
    };
    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ) as RoomImageUpdate;

    const supabase = createAdminClient();
    if (parsed.data.isCover) {
      const { data: targetImage, error: targetError } = await supabase
        .from("room_images")
        .select("room_id")
        .eq("id", id)
        .single();

      if (targetError) throw targetError;

      const { error: coverResetError } = await supabase
        .from("room_images")
        .update({ is_cover: false })
        .eq("room_id", targetImage.room_id);

      if (coverResetError) throw coverResetError;
    }

    const { data, error } = await supabase
      .from("room_images")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown update room image error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const supabase = createAdminClient();
    const { error } = await supabase.from("room_images").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown delete room image error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
