import { confirmTossPayment, type PaymentProviderId } from "@/lib/payments/provider";
import {
  getPaymentOrder,
  markPaymentOrderFailed,
  markPaymentOrderPaid,
  markPaymentOrderWaitingDeposit
} from "@/lib/payments/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { enqueueBookingNotifications } from "@/lib/notifications";

type PaymentOrderRow = Database["public"]["Tables"]["payment_orders"]["Row"];

type StoredOptionItem = {
  optionId: string;
  quantity: number;
  unitPrice: number;
};

export type ConfirmPreparedPaymentInput = {
  provider: PaymentProviderId;
  paymentKey: string;
  orderId: string;
  amount: number;
  idempotencyKey?: string | null;
};

function makeBookingNo() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `PBTV-${date}-${suffix}`;
}

function parseOptionItems(value: PaymentOrderRow["option_items"]): StoredOptionItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) return null;

      const record = item as Record<string, unknown>;
      const optionId = record.optionId;
      const quantity = record.quantity;
      const unitPrice = record.unitPrice;

      if (typeof optionId !== "string") return null;

      return {
        optionId,
        quantity: typeof quantity === "number" ? Math.max(1, Math.trunc(quantity)) : 1,
        unitPrice: typeof unitPrice === "number" ? Math.max(0, Math.trunc(unitPrice)) : 0
      };
    })
    .filter((item): item is StoredOptionItem => Boolean(item));
}

async function getBookingByHoldId(holdId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("hold_id", holdId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function finalizePaidPaymentOrder(input: {
  order: PaymentOrderRow;
  paymentKey: string;
}) {
  if (input.order.booking_id) {
    await markPaymentOrderPaid({
      orderId: input.order.order_id,
      paymentKey: input.paymentKey,
      bookingId: input.order.booking_id
    });

    return { bookingId: input.order.booking_id, idempotent: true };
  }

  const supabase = createAdminClient();
  const optionItems = parseOptionItems(input.order.option_items);
  let booking = null;

  if (!input.order.check_in || !input.order.check_out) {
    throw new Error("Payment order is missing check-in or check-out date.");
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        booking_no: makeBookingNo(),
        room_id: input.order.room_id,
        hold_id: input.order.hold_id,
        check_in: input.order.check_in,
        check_out: input.order.check_out,
        adult_count: input.order.adult_count,
        child_count: input.order.child_count,
        guest_name: input.order.guest_name || "예약 고객",
        guest_phone: input.order.guest_phone || "미입력",
        utm_code: input.order.utm_code,
        status: "confirmed",
        payment_status: "paid",
        total_amount: input.order.amount,
        option_amount: input.order.option_amount,
        discount_amount: input.order.discount_amount
      })
      .select()
      .single();

    if (error) throw error;
    booking = data;
  } catch (error) {
    if (input.order.hold_id) {
      const existingBooking = await getBookingByHoldId(input.order.hold_id);
      if (existingBooking) {
        booking = existingBooking;
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  if (optionItems.length > 0) {
    const { error: optionError } = await supabase.from("booking_option_items").insert(
      optionItems.map((item) => ({
        booking_id: booking.id,
        option_id: item.optionId,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }))
    );

    if (optionError && !String(optionError.message).includes("duplicate")) {
      throw optionError;
    }
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    booking_id: booking.id,
    provider: input.order.provider,
    payment_key: input.paymentKey,
    amount: input.order.amount,
    status: "paid",
    paid_at: new Date().toISOString()
  });

  if (paymentError && !String(paymentError.message).includes("duplicate")) {
    throw paymentError;
  }

  await markPaymentOrderPaid({
    orderId: input.order.order_id,
    paymentKey: input.paymentKey,
    bookingId: booking.id
  });
  await enqueueBookingNotifications(booking.id);

  return { bookingId: booking.id, idempotent: false };
}

async function recordManualTransferPaymentOrder(input: {
  order: PaymentOrderRow;
  paymentKey: string;
}) {
  if (input.order.booking_id) {
    await markPaymentOrderWaitingDeposit({
      orderId: input.order.order_id,
      paymentKey: input.paymentKey,
      bookingId: input.order.booking_id
    });

    return { bookingId: input.order.booking_id, idempotent: true };
  }

  const supabase = createAdminClient();
  const optionItems = parseOptionItems(input.order.option_items);
  let booking = null;

  if (!input.order.check_in || !input.order.check_out) {
    throw new Error("Payment order is missing check-in or check-out date.");
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        booking_no: makeBookingNo(),
        room_id: input.order.room_id,
        hold_id: input.order.hold_id,
        check_in: input.order.check_in,
        check_out: input.order.check_out,
        adult_count: input.order.adult_count,
        child_count: input.order.child_count,
        guest_name: input.order.guest_name || "예약 고객",
        guest_phone: input.order.guest_phone || "미입력",
        utm_code: input.order.utm_code,
        status: "hold",
        payment_status: "pending",
        total_amount: input.order.amount,
        option_amount: input.order.option_amount,
        discount_amount: input.order.discount_amount
      })
      .select()
      .single();

    if (error) throw error;
    booking = data;
  } catch (error) {
    if (input.order.hold_id) {
      const existingBooking = await getBookingByHoldId(input.order.hold_id);
      if (existingBooking) {
        booking = existingBooking;
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  if (optionItems.length > 0) {
    const { error: optionError } = await supabase.from("booking_option_items").insert(
      optionItems.map((item) => ({
        booking_id: booking.id,
        option_id: item.optionId,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }))
    );

    if (optionError && !String(optionError.message).includes("duplicate")) {
      throw optionError;
    }
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    booking_id: booking.id,
    provider: input.order.provider,
    payment_key: input.paymentKey,
    amount: input.order.amount,
    status: "ready",
    paid_at: null
  });

  if (paymentError && !String(paymentError.message).includes("duplicate")) {
    throw paymentError;
  }

  await markPaymentOrderWaitingDeposit({
    orderId: input.order.order_id,
    paymentKey: input.paymentKey,
    bookingId: booking.id
  });
  await enqueueBookingNotifications(booking.id);

  return { bookingId: booking.id, idempotent: false };
}

export async function confirmPreparedPayment(input: ConfirmPreparedPaymentInput) {
  const storedOrder = await getPaymentOrder(input.orderId);

  if (!storedOrder.available || !storedOrder.order) {
    return {
      statusCode: 404,
      result: {
        status: "failed" as const,
        error: "Payment order was not found."
      }
    };
  }

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

  if (
    (storedOrder.order.status === "paid" || storedOrder.order.status === "waiting_deposit") &&
    storedOrder.order.booking_id
  ) {
    return {
      statusCode: 200,
      result: {
        status: storedOrder.order.status === "paid" ? ("paid" as const) : ("waiting_deposit" as const),
        idempotent: true,
        orderId: input.orderId,
        bookingId: storedOrder.order.booking_id
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

  if (input.provider === "manual_bank_transfer") {
    const finalized = await recordManualTransferPaymentOrder({
      order: storedOrder.order,
      paymentKey: input.paymentKey
    });

    return {
      statusCode: 200,
      result: {
        mode: "manual" as const,
        status: "waiting_deposit" as const,
        orderId: input.orderId,
        paymentKey: input.paymentKey,
        amount: input.amount,
        bookingId: finalized.bookingId,
        idempotent: finalized.idempotent
      }
    };
  }

  const result = await confirmTossPayment({
    paymentKey: input.paymentKey,
    orderId: input.orderId,
    amount: input.amount,
    idempotencyKey: input.idempotencyKey
  });

  if (result.status === "paid") {
    const finalized = await finalizePaidPaymentOrder({
      order: storedOrder.order,
      paymentKey: input.paymentKey
    });

    return {
      statusCode: 200,
      result: {
        ...result,
        bookingId: finalized.bookingId,
        idempotent: finalized.idempotent
      }
    };
  } else {
    await markPaymentOrderFailed({
      orderId: input.orderId,
      paymentKey: input.paymentKey
    });
  }

  return {
    statusCode: 502,
    result
  };
}
