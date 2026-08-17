import { NextResponse } from "next/server";
import { z } from "zod";
import { createBookingHold } from "@/lib/availability";
import { getRoomQuote } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ISODateString } from "@/lib/types";

const optionItemSchema = z.object({
  optionId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1)
});

const holdSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adultCount: z.number().int().min(1).max(30).default(1),
  childCount: z.number().int().min(0).max(30).default(0),
  optionItems: z.array(optionItemSchema).default([]),
  optionIds: z.array(z.string().min(1)).optional(),
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
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = holdSchema.safeParse(body);

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

    const optionItems =
      parsed.data.optionItems.length > 0
        ? parsed.data.optionItems
        : (parsed.data.optionIds ?? []).map((optionId) => ({ optionId, quantity: 1 }));
    const quote = await getRoomQuote(
      supabase,
      {
        roomId: parsed.data.roomId,
        checkIn: parsed.data.checkIn as ISODateString,
        checkOut: parsed.data.checkOut as ISODateString,
        adultCount: parsed.data.adultCount,
        childCount: parsed.data.childCount,
        optionItems,
        utmCode: parsed.data.utmCode ?? null
      }
    );

    return NextResponse.json({ ...result, quote }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
