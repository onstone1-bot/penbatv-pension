import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth/current-user";
import { updateCustomerProfileSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request) {
  const currentCustomer = await getCurrentCustomer();

  if (!currentCustomer?.user) {
    return NextResponse.json({ error: "Login is required to update profile." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateCustomerProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || currentCustomer.user.email || null,
      updated_at: now
    })
    .eq("id", currentCustomer.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: data,
    preferences: {
      notificationEnabled: parsed.data.notificationEnabled,
      cashReceiptType: parsed.data.cashReceiptType,
      cashReceiptValue: parsed.data.cashReceiptValue ?? null
    }
  });
}
