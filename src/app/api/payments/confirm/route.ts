import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmPreparedPayment } from "@/lib/payments/confirm";

const confirmPaymentSchema = z.object({
  provider: z.enum(["card", "tosspay", "vbank"]).default("card"),
  paymentKey: z.string().min(1),
  orderId: z.string().min(6).max(64),
  amount: z.number().int().min(0)
});

export async function POST(request: Request) {
  const parsed = confirmPaymentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { result, statusCode } = await confirmPreparedPayment({
    provider: parsed.data.provider,
    paymentKey: parsed.data.paymentKey,
    orderId: parsed.data.orderId,
    amount: parsed.data.amount,
    idempotencyKey: request.headers.get("Idempotency-Key")
  });

  return NextResponse.json(result, { status: statusCode });
}
