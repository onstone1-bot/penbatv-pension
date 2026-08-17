import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
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

    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create youtube campaign error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
