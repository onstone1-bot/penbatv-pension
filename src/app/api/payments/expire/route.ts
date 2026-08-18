import { NextResponse } from "next/server";
import { expireReadyPaymentOrders } from "@/lib/payments/orders";

export async function POST() {
  const result = await expireReadyPaymentOrders();

  return NextResponse.json(result, {
    status: result.persisted ? 200 : 500
  });
}
