import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { updateAccommodationSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type AccommodationUpdate = Database["public"]["Tables"]["accommodations"]["Update"];

function normalizeStatus(status: string | undefined) {
  if (!status) return undefined;
  return status === "active" ? "active" : "hidden";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const parsed = updateAccommodationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload: AccommodationUpdate = {
      name: parsed.data.name,
      area: parsed.data.area,
      address: parsed.data.address,
      concept: parsed.data.concept,
      status: normalizeStatus(parsed.data.status)
    };
    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ) as AccommodationUpdate;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("accommodations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ accommodation: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown update accommodation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("accommodations")
      .update({ status: "hidden" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ accommodation: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown hide accommodation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
