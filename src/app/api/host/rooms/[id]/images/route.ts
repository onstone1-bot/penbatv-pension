import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
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

    return NextResponse.json({ image: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create room image error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
