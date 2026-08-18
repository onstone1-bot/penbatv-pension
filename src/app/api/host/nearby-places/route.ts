import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { createNearbyPlaceSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nearby_places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ places: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown host nearby places error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const parsed = createNearbyPlaceSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nearby_places")
      .upsert(
        {
          id: parsed.data.id,
          accommodation_id: parsed.data.accommodationId,
          place_type: parsed.data.type,
          name: parsed.data.name,
          category: parsed.data.category,
          address: parsed.data.address || null,
          distance_label: parsed.data.distanceLabel || null,
          travel_time: parsed.data.travelTime || null,
          description: parsed.data.description || null,
          url: parsed.data.url || null,
          map_url: parsed.data.mapUrl || null,
          image_url: parsed.data.imageUrl || null,
          sort_order: parsed.data.sortOrder,
          status: parsed.data.status
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ place: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create nearby place error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
