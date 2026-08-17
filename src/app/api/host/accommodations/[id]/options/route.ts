import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { createBookingOptionSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("booking_options")
      .select("*")
      .eq("accommodation_id", id)
      .order("sort_order");

    if (error) throw error;

    return NextResponse.json({ options: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown host booking options error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    const { id } = await context.params;
    const parsed = createBookingOptionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("booking_options")
      .upsert(
        {
          id: parsed.data.id,
          accommodation_id: id,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          price: parsed.data.price,
          sort_order: parsed.data.sortOrder,
          status: parsed.data.status
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ option: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown create booking option error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
