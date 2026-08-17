import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmPreparedPayment } from "@/lib/payments/confirm";

const confirmPaymentSchema = z.object({
  provider: z
    .enum(["card", "naverpay", "tosspay", "vbank", "realtime_transfer", "manual_bank_transfer"])
    .default("card"),
  paymentKey: z.string().min(1),
  orderId: z.string().min(6).max(64),
  amount: z.number().int().min(0)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = confirmPaymentSchema.safeParse(body);

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
