import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOperatorToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const approvalSchema = z.object({
  status: z.enum(["active", "hidden", "suspended"]),
  note: z.string().optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireOperatorToken(request);
    const { id } = await context.params;
    const parsed = approvalSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("accommodations")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      accommodation: data,
      approval: {
        status: parsed.data.status,
        note: parsed.data.note ?? null,
        approvedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown accommodation approval error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
