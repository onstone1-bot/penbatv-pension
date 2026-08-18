import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/auth/current-user";
import { preparePayment } from "@/lib/payments/provider";
import { savePreparedPaymentOrder } from "@/lib/payments/orders";
import { getActiveBookingHold } from "@/lib/availability";
import { getRoomQuote } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ISODateString } from "@/lib/types";

const optionItemSchema = z.object({
  optionId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1)
});

const preparePaymentSchema = z.object({
  holdId: z.string().nullable().optional(),
  roomId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  provider: z.enum(["card", "naverpay", "tosspay", "vbank", "realtime_transfer", "manual_bank_transfer"]),
  totalAmount: z.number().int().min(0).optional(),
  optionAmount: z.number().int().min(0).optional(),
  discountAmount: z.number().int().min(0).optional(),
  adultCount: z.number().int().min(1).max(30).default(1),
  childCount: z.number().int().min(0).max(30).default(0),
  optionItems: z.array(optionItemSchema).default([]),
  optionIds: z.array(z.string().min(1)).optional(),
  guestName: z.string().nullable().optional(),
  guestPhone: z.string().nullable().optional(),
  utmCode: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = preparePaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const url = new URL(request.url);
    const supabase = createAdminClient();
    const currentCustomer = await getCurrentCustomer();
    const optionItems =
      parsed.data.optionItems.length > 0
        ? parsed.data.optionItems
        : (parsed.data.optionIds ?? []).map((optionId) => ({ optionId, quantity: 1 }));

    if (parsed.data.holdId) {
      const holdValidation = await getActiveBookingHold(supabase, {
        holdId: parsed.data.holdId,
        roomId: parsed.data.roomId,
        checkIn: parsed.data.checkIn as ISODateString,
        checkOut: parsed.data.checkOut as ISODateString
      });

      if (!holdValidation.valid) {
        return NextResponse.json(
          {
            error: "Booking hold is no longer valid.",
            reason: holdValidation.reason
          },
          { status: 409 }
        );
      }
    }

    const quote = await getRoomQuote(supabase, {
      roomId: parsed.data.roomId,
      checkIn: parsed.data.checkIn as ISODateString,
      checkOut: parsed.data.checkOut as ISODateString,
      adultCount: parsed.data.adultCount,
      childCount: parsed.data.childCount,
      optionItems,
      utmCode: parsed.data.utmCode ?? null
    });
    const input = {
      holdId: parsed.data.holdId ?? null,
      customerId: currentCustomer?.profile?.id ?? currentCustomer?.user.id ?? null,
      roomId: parsed.data.roomId,
      checkIn: parsed.data.checkIn,
      checkOut: parsed.data.checkOut,
      provider: parsed.data.provider,
      totalAmount: quote.totalAmount,
      optionAmount: quote.optionAmount,
      discountAmount: quote.discountAmount,
      adultCount: quote.adultCount,
      childCount: quote.childCount,
      optionItems: quote.optionItems,
      guestName: parsed.data.guestName ?? currentCustomer?.profile?.name ?? null,
      guestPhone: parsed.data.guestPhone ?? currentCustomer?.profile?.phone ?? currentCustomer?.user.phone ?? null,
      utmCode: parsed.data.utmCode ?? null,
      requestOrigin: url.origin
    };
    const payment = preparePayment(input);
    const orderStorage = await savePreparedPaymentOrder(payment, input);

    return NextResponse.json(
      {
        payment,
        quote,
        orderStorage
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown payment preparation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
