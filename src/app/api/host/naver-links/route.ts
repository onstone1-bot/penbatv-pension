import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { logHostOperationEvent } from "@/lib/host-operation-events";
import { createNaverLinkSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("naver_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ links: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown host naver links error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const parsed = createNaverLinkSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("naver_links")
      .upsert(
        {
          id: parsed.data.id,
          accommodation_id: parsed.data.accommodationId,
          room_id: parsed.data.roomId || null,
          link_type: parsed.data.type,
          title: parsed.data.title,
          url: parsed.data.url,
          author: parsed.data.author,
          excerpt: parsed.data.excerpt || null,
          rating: parsed.data.rating ?? null,
          published_at: parsed.data.publishedAt || null,
          sort_order: parsed.data.sortOrder,
          status: parsed.data.status
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;

    const operationLog = await logHostOperationEvent(request, {
      accommodationId: data.accommodation_id,
      roomId: data.room_id,
      targetType: "naver_link",
      targetId: data.id,
      action: "upsert",
      metadata: { type: data.link_type, title: data.title, status: data.status }
    });

    return NextResponse.json({ link: data, operationLog }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create naver link error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
