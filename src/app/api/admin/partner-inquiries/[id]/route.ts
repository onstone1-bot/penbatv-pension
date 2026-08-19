import { NextResponse } from "next/server";
import { requireOperatorToken } from "@/lib/admin-auth";
import { updatePartnerInquiryStatusSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireOperatorToken(request);
    const { id } = await context.params;
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = updatePartnerInquiryStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const now = new Date().toISOString();
    const supabase = createAdminClient() as any;
    const { data, error } = await supabase
      .from("partner_inquiries")
      .update({
        status: parsed.data.status,
        operator_note: parsed.data.operatorNote ?? null,
        contacted_at: parsed.data.contacted ? now : null,
        updated_at: now
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ inquiry: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown partner inquiry update error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
