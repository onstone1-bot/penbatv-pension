import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { logHostOperationEvent } from "@/lib/host-operation-events";
import { createYoutubeCampaignSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("youtube_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ campaigns: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown host youtube campaigns error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const parsed = createYoutubeCampaignSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("youtube_campaigns")
      .upsert(
        {
          code: parsed.data.code,
          title: parsed.data.title,
          video_url: parsed.data.videoUrl || null,
          room_id: parsed.data.roomId || null,
          category: parsed.data.category,
          tag: parsed.data.tag,
          description: parsed.data.description || null,
          thumbnail_url: parsed.data.thumbnailUrl || null,
          coupon_amount: parsed.data.couponAmount,
          status: parsed.data.status
        },
        { onConflict: "code" }
      )
      .select()
      .single();

    if (error) throw error;

    const { data: room } = data.room_id
      ? await supabase.from("rooms").select("accommodation_id").eq("id", data.room_id).maybeSingle()
      : { data: null };

    const operationLog = await logHostOperationEvent(request, {
      accommodationId: room?.accommodation_id ?? null,
      roomId: data.room_id,
      targetType: "youtube_campaign",
      targetId: data.code,
      action: "upsert",
      metadata: { title: data.title, category: data.category, tag: data.tag, status: data.status }
    });

    return NextResponse.json({ campaign: data, operationLog }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create youtube campaign error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
