import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { PreparedPayment, PreparePaymentInput } from "@/lib/payments/provider";

type PaymentOrderRow = Database["public"]["Tables"]["payment_orders"]["Row"];

export type PaymentOrderLookup =
  | { available: true; order: PaymentOrderRow | null }
  | { available: false; reason: string };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown payment order storage error";
}

export async function savePreparedPaymentOrder(
  payment: PreparedPayment,
  input: PreparePaymentInput
) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_orders")
      .insert({
        order_id: payment.orderId,
        hold_id: input.holdId,
        room_id: input.roomId,
        provider: input.provider,
        mode: payment.mode,
        amount: input.totalAmount,
        option_amount: input.optionAmount,
        discount_amount: input.discountAmount,
        status: "ready",
        checkout: payment.checkout as Json,
        utm_code: input.utmCode,
        guest_name: input.guestName,
        guest_phone: input.guestPhone,
        expires_at: payment.expiresAt
      })
      .select()
      .single();

    if (error) throw error;

    return { persisted: true as const, order: data };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function getPaymentOrder(orderId: string): Promise<PaymentOrderLookup> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (error) throw error;

    return { available: true, order: data };
  } catch (error) {
    return { available: false, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderPaid(input: {
  orderId: string;
  paymentKey: string;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        payment_key: input.paymentKey,
        confirmed_at: new Date().toISOString()
      })
      .eq("order_id", input.orderId);

    if (error) throw error;

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderFailed(input: {
  orderId: string;
  paymentKey?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "failed",
        payment_key: input.paymentKey ?? null
      })
      .eq("order_id", input.orderId);

    if (error) throw error;

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}
