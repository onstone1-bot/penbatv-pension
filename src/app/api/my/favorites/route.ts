import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth/current-user";
import { toggleCustomerFavoriteSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const currentCustomer = await getCurrentCustomer();

  if (!currentCustomer?.user) {
    return NextResponse.json({ error: "Login is required to save favorites." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = toggleCustomerFavoriteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient() as any;
  const customerId = currentCustomer.user.id;

  if (parsed.data.action === "remove") {
    const { error } = await supabase
      .from("customer_favorites")
      .delete()
      .eq("customer_id", customerId)
      .eq("accommodation_id", parsed.data.accommodationId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ favorite: false, accommodationId: parsed.data.accommodationId });
  }

  const { data, error } = await supabase
    .from("customer_favorites")
    .upsert(
      {
        customer_id: customerId,
        accommodation_id: parsed.data.accommodationId,
        source: parsed.data.source
      },
      { onConflict: "customer_id,accommodation_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ favorite: true, row: data });
}
