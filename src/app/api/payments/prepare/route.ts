import { NextResponse } from "next/server";
import { z } from "zod";
import { preparePayment } from "@/lib/payments/provider";
import { savePreparedPaymentOrder } from "@/lib/payments/orders";

const preparePaymentSchema = z.object({
  holdId: z.string().nullable().optional(),
  roomId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  provider: z.enum(["card", "naverpay", "tosspay", "vbank"]),
  totalAmount: z.number().int().min(0),
  optionAmount: z.number().int().min(0).default(0),
  discountAmount: z.number().int().min(0).default(0),
  guestName: z.string().nullable().optional(),
  guestPhone: z.string().nullable().optional(),
  utmCode: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const parsed = preparePaymentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const url = new URL(request.url);
  const input = {
    holdId: parsed.data.holdId ?? null,
    roomId: parsed.data.roomId,
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    provider: parsed.data.provider,
    totalAmount: parsed.data.totalAmount,
    optionAmount: parsed.data.optionAmount,
    discountAmount: parsed.data.discountAmount,
    guestName: parsed.data.guestName ?? null,
    guestPhone: parsed.data.guestPhone ?? null,
    utmCode: parsed.data.utmCode ?? null,
    requestOrigin: url.origin
  };
  const payment = preparePayment(input);
  const orderStorage = await savePreparedPaymentOrder(payment, input);

  return NextResponse.json(
    {
      payment,
      orderStorage
    },
    { status: 201 }
  );
}
