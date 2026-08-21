import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { logHostOperationEvent } from "@/lib/host-operation-events";
import { createAccommodationSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("accommodations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ accommodations: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown host accommodations error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const parsed = createAccommodationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("accommodations")
      .insert({
        id: parsed.data.id,
        name: parsed.data.name,
        area: parsed.data.area,
        address: parsed.data.address ?? null,
        concept: parsed.data.concept ?? null,
        rating: 0,
        review_count: 0,
        status: parsed.data.status === "active" ? "active" : "hidden"
      })
      .select()
      .single();

    if (error) throw error;

    const operationLog = await logHostOperationEvent(request, {
      accommodationId: data.id,
      targetType: "accommodation",
      targetId: data.id,
      action: "create",
      metadata: {
        ownerName: parsed.data.ownerName,
        adPlan: parsed.data.adPlan,
        reservationMode: parsed.data.reservationMode,
        roomCount: parsed.data.roomCount
      }
    });

    return NextResponse.json(
      {
        accommodation: data,
        operationLog,
        onboarding: {
          ownerName: parsed.data.ownerName,
          ownerPhone: parsed.data.ownerPhone,
          adPlan: parsed.data.adPlan,
          reservationMode: parsed.data.reservationMode,
          commissionRate: parsed.data.commissionRate,
          minPrice: parsed.data.minPrice,
          roomCount: parsed.data.roomCount,
          tags: parsed.data.tags,
          featuredVideoUrl: parsed.data.featuredVideoUrl,
          featuredVideoTitle: parsed.data.featuredVideoTitle
        }
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create accommodation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
