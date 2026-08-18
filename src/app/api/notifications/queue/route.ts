import { NextResponse } from "next/server";
import { z } from "zod";
import { requireHostToken } from "@/lib/admin-auth";
import { enqueueBookingNotifications, getNotificationQueue } from "@/lib/notifications";

const enqueueSchema = z.object({
  bookingId: z.string().uuid()
});

export async function GET(request: Request) {
  try {
    requireHostToken(request);
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? 30);
    const notifications = await getNotificationQueue(Number.isFinite(limit) ? limit : 30);

    return NextResponse.json({ notifications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown notification queue error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireHostToken(request);
    const parsed = enqueueSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await enqueueBookingNotifications(parsed.data.bookingId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown enqueue notification error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
