import { NextResponse } from "next/server";
import { z } from "zod";
import { createBookingHold } from "@/lib/availability";
import { getRoomQuote } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ISODateString } from "@/lib/types";

const holdSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  utmCode: z.string().nullable().optional(),
  holdMinutes: z.number().int().min(1).max(30).optional()
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Unknown hold error";
}

export async function POST(request: Request) {
  const parsed = holdSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const result = await createBookingHold(supabase, {
      roomId: parsed.data.roomId,
      checkIn: parsed.data.checkIn as ISODateString,
      checkOut: parsed.data.checkOut as ISODateString,
      utmCode: parsed.data.utmCode,
      holdMinutes: parsed.data.holdMinutes
    });

    if (!result.hold) {
      return NextResponse.json(result, { status: 409 });
    }

    const quote = await getRoomQuote(
      supabase,
      parsed.data.roomId,
      parsed.data.checkIn as ISODateString,
      parsed.data.checkOut as ISODateString
    );

    return NextResponse.json({ ...result, quote }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
