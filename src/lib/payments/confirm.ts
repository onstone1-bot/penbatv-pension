import { confirmTossPayment, type PaymentProviderId } from "@/lib/payments/provider";
import {
  getPaymentOrder,
  markPaymentOrderFailed,
  markPaymentOrderPaid
} from "@/lib/payments/orders";

export type ConfirmPreparedPaymentInput = {
  provider: Extract<PaymentProviderId, "card" | "tosspay" | "vbank">;
  paymentKey: string;
  orderId: string;
  amount: number;
  idempotencyKey?: string | null;
};

export async function confirmPreparedPayment(input: ConfirmPreparedPaymentInput) {
  const storedOrder = await getPaymentOrder(input.orderId);

  if (storedOrder.available && storedOrder.order) {
    if (storedOrder.order.amount !== input.amount) {
      await markPaymentOrderFailed({
        orderId: input.orderId,
        paymentKey: input.paymentKey
      });

      return {
        statusCode: 409,
        result: {
          status: "failed" as const,
          error: "Payment amount does not match the server-side order amount."
        }
      };
    }

    if (storedOrder.order.status !== "ready") {
      return {
        statusCode: 409,
        result: {
          status: "failed" as const,
          error: `Payment order is not ready: ${storedOrder.order.status}`
        }
      };
    }
  }

  const result = await confirmTossPayment({
    paymentKey: input.paymentKey,
    orderId: input.orderId,
    amount: input.amount,
    idempotencyKey: input.idempotencyKey
  });

  if (result.status === "paid") {
    await markPaymentOrderPaid({
      orderId: input.orderId,
      paymentKey: input.paymentKey
    });
  } else {
    await markPaymentOrderFailed({
      orderId: input.orderId,
      paymentKey: input.paymentKey
    });
  }

  return {
    statusCode: result.status === "failed" ? 502 : 200,
    result
  };
}
