import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { logHostOperationEvent } from "@/lib/host-operation-events";
import { createRoomImageSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const parsed = createRoomImageSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (parsed.data.isCover) {
      const { error: coverResetError } = await supabase
        .from("room_images")
        .update({ is_cover: false })
        .eq("room_id", id);

      if (coverResetError) throw coverResetError;
    }

    const { data, error } = await supabase
      .from("room_images")
      .insert({
        room_id: id,
        url: parsed.data.url,
        caption: parsed.data.caption ?? null,
        sort_order: parsed.data.sortOrder,
        is_cover: parsed.data.isCover
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
      targetType: "room_image",
      targetId: data.id,
      action: data.is_cover ? "set_cover" : "create",
      metadata: { caption: data.caption, sortOrder: data.sort_order, isCover: data.is_cover }
    });

    return NextResponse.json({ image: data, operationLog }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create room image error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
