import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOperatorToken } from "@/lib/admin-auth";
import { dispatchDueNotifications } from "@/lib/notifications";

const dispatchSchema = z.object({
  limit: z.number().int().min(1).max(100).optional()
});

export async function POST(request: Request) {
  try {
    requireOperatorToken(request);
    const parsed = dispatchSchema.safeParse(await request.json().catch(() => ({})));

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await dispatchDueNotifications(parsed.data.limit ?? 20);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown notification dispatch error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
