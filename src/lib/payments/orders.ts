import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { PreparedPayment, PreparePaymentInput } from "@/lib/payments/provider";

type PaymentOrderRow = Database["public"]["Tables"]["payment_orders"]["Row"];
type PaymentOrderStatus = PaymentOrderRow["status"];
type PaymentOrderEventType = "prepared" | "paid" | "waiting_deposit" | "failed" | "cancelled" | "expired";

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

export async function logPaymentOrderEvent(input: {
  orderId: string;
  eventType: PaymentOrderEventType;
  fromStatus?: PaymentOrderStatus | null;
  toStatus?: PaymentOrderStatus | null;
  paymentKey?: string | null;
  bookingId?: string | null;
  message?: string | null;
  metadata?: Json;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("payment_order_events").insert({
      order_id: input.orderId,
      event_type: input.eventType,
      from_status: input.fromStatus ?? null,
      to_status: input.toStatus ?? null,
      payment_key: input.paymentKey ?? null,
      booking_id: input.bookingId ?? null,
      message: input.message ?? null,
      metadata: input.metadata ?? {}
    });

    if (error) throw error;

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function savePreparedPaymentOrder(
  payment: PreparedPayment,
  input: PreparePaymentInput
) {
  try {
    const supabase = createAdminClient();
    const isManualTransfer = input.provider === "manual_bank_transfer";
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
        expires_at: payment.expiresAt,
        deposit_due_at: isManualTransfer ? payment.expiresAt : null
      })
      .select()
      .single();

    if (error) throw error;

    await logPaymentOrderEvent({
      orderId: payment.orderId,
      eventType: "prepared",
      toStatus: "ready",
      message: isManualTransfer ? "수동 계좌이체 입금대기 주문이 생성되었습니다." : "결제 준비 주문이 생성되었습니다.",
      metadata: {
        provider: input.provider,
        mode: payment.mode,
        amount: input.totalAmount,
        holdId: input.holdId
      } as Json
    });

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
    const { data, error } = await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        payment_key: input.paymentKey,
        booking_id: input.bookingId ?? null,
        confirmed_at: new Date().toISOString(),
        last_error: null
      })
      .eq("order_id", input.orderId)
      .select("status, booking_id")
      .maybeSingle();

    if (error) throw error;

    await logPaymentOrderEvent({
      orderId: input.orderId,
      eventType: "paid",
      fromStatus: data?.status ?? null,
      toStatus: "paid",
      paymentKey: input.paymentKey,
      bookingId: input.bookingId ?? data?.booking_id ?? null,
      message: "결제가 승인되어 예약이 확정되었습니다."
    });

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderCancelled(input: {
  orderId: string;
  paymentKey?: string | null;
  reason?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const cancelledAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("payment_orders")
      .update({
        status: "cancelled",
        payment_key: input.paymentKey ?? null,
        cancelled_at: cancelledAt,
        last_error: input.reason ?? "Payment was cancelled before confirmation."
      })
      .eq("order_id", input.orderId)
      .eq("status", "ready")
      .select("status, booking_id")
      .maybeSingle();

    if (error) throw error;

    await logPaymentOrderEvent({
      orderId: input.orderId,
      eventType: "cancelled",
      fromStatus: data?.status ?? null,
      toStatus: "cancelled",
      paymentKey: input.paymentKey ?? null,
      bookingId: data?.booking_id ?? null,
      message: input.reason ?? "고객이 결제창에서 결제를 취소했습니다."
    });

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderWaitingDeposit(input: {
  orderId: string;
  paymentKey: string;
  bookingId?: string | null;
  depositDueAt?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_orders")
      .update({
        status: "waiting_deposit",
        payment_key: input.paymentKey,
        booking_id: input.bookingId ?? null,
        deposit_due_at: input.depositDueAt ?? null,
        last_error: null
      })
      .eq("order_id", input.orderId)
      .select("status, booking_id")
      .maybeSingle();

    if (error) throw error;

    await logPaymentOrderEvent({
      orderId: input.orderId,
      eventType: "waiting_deposit",
      fromStatus: data?.status ?? null,
      toStatus: "waiting_deposit",
      paymentKey: input.paymentKey,
      bookingId: input.bookingId ?? data?.booking_id ?? null,
      message: "수동 계좌이체 예약이 입금대기 상태로 전환되었습니다.",
      metadata: { depositDueAt: input.depositDueAt ?? null } as Json
    });

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderFailed(input: {
  orderId: string;
  paymentKey?: string | null;
  reason?: string | null;
  metadata?: Json;
}) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_orders")
      .update({
        status: "failed",
        payment_key: input.paymentKey ?? null,
        last_error: input.reason ?? "Payment confirmation failed."
      })
      .eq("order_id", input.orderId)
      .eq("status", "ready")
      .select("status, booking_id")
      .maybeSingle();

    if (error) throw error;

    await logPaymentOrderEvent({
      orderId: input.orderId,
      eventType: "failed",
      fromStatus: data?.status ?? null,
      toStatus: "failed",
      paymentKey: input.paymentKey ?? null,
      bookingId: data?.booking_id ?? null,
      message: input.reason ?? "결제 승인에 실패했습니다.",
      metadata: input.metadata ?? {}
    });

    return { persisted: true as const };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}

export async function markPaymentOrderExpired(input: {
  orderId: string;
  reason?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const expiredAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("payment_orders")
      .update({
        status: "expired",
        expired_at: expiredAt,
        last_error: input.reason ?? "Payment order expired before confirmation."
      })
      .eq("order_id", input.orderId)
      .eq("status", "ready")
      .select("status, booking_id")
      .maybeSingle();

    if (error) throw error;

    await logPaymentOrderEvent({
      orderId: input.orderId,
      eventType: "expired",
      fromStatus: data?.status ?? null,
      toStatus: "expired",
      bookingId: data?.booking_id ?? null,
      message: input.reason ?? "결제 준비 주문이 만료되었습니다."
    });

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
        status: "expired",
        expired_at: now,
        last_error: "Payment order expired before confirmation."
      })
      .eq("status", "ready")
      .lt("expires_at", now)
      .select("order_id, booking_id");

    if (error) throw error;

    await Promise.all(
      (data ?? []).map((order) =>
        logPaymentOrderEvent({
          orderId: order.order_id,
          eventType: "expired",
          fromStatus: "ready",
          toStatus: "expired",
          bookingId: order.booking_id,
          message: "결제 준비 주문이 만료되어 예약 가능 상태로 되돌릴 수 있습니다."
        })
      )
    );

    return {
      persisted: true as const,
      expiredCount: data?.length ?? 0,
      orderIds: (data ?? []).map((order) => order.order_id)
    };
  } catch (error) {
    return { persisted: false as const, reason: errorMessage(error) };
  }
}
