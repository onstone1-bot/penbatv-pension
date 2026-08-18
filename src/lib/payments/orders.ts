import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { PreparedPayment, PreparePaymentInput } from "@/lib/payments/provider";

type PaymentOrderRow = Database["public"]["Tables"]["payment_orders"]["Row"];

export type PaymentOrderLookup =
  | { available: true; order: PaymentOrderRow | null }
  | { available: false; reason: string };

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    const message = record.message;
    const details = record.details;
    const hint = record.hint;

    return [message, details, hint].filter((item): item is string => typeof item === "string" && item.length > 0).join(" / ") || JSON.stringify(record);
  }

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
        customer_id: input.customerId ?? null,
        room_id: input.roomId,
        check_in: input.checkIn,
        check_out: input.checkOut,
        provider: input.provider,
        mode: payment.mode,
        amount: input.totalAmount,
        option_amount: input.optionAmount,
        discount_amount: input.discountAmount,
        adult_count: input.adultCount,
        child_count: input.childCount,
        option_items: input.optionItems as Json,
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
  bookingId?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        payment_key: input.paymentKey,
        booking_id: input.bookingId ?? null,
        confirmed_at: new Date().toISOString()
      })
      .eq("order_id", input.orderId);

    if (error) throw error;

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderCancelled(input: {
  orderId: string;
  paymentKey?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "cancelled",
        payment_key: input.paymentKey ?? null
      })
      .eq("order_id", input.orderId)
      .eq("status", "ready");

    if (error) throw error;

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderWaitingDeposit(input: {
  orderId: string;
  paymentKey: string;
  bookingId?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "waiting_deposit",
        payment_key: input.paymentKey,
        booking_id: input.bookingId ?? null
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
      .eq("order_id", input.orderId)
      .eq("status", "ready");

    if (error) throw error;

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function expireReadyPaymentOrders(now = new Date().toISOString()) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_orders")
      .update({
        status: "expired"
      })
      .eq("status", "ready")
      .lt("expires_at", now)
      .select("order_id");

    if (error) throw error;

    return {
      persisted: true as const,
      expiredCount: data?.length ?? 0,
      orderIds: (data ?? []).map((order) => order.order_id)
    };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}
