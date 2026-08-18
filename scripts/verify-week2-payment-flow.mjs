import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseUrl = process.env.STAYLINK_VERIFY_BASE_URL ?? "http://localhost:3000";
const accommodationId = process.env.STAYLINK_VERIFY_ACCOMMODATION_ID ?? "baebang-alps";
const qaGuestPhone = "010-0000-0014";

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const splitAt = trimmed.indexOf("=");
    if (splitAt === -1) continue;

    const key = trimmed.slice(0, splitAt).trim();
    let value = trimmed.slice(splitAt + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function addDays(date, amount) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

async function requestJson(pathname, init) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${response.status} ${pathname}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function requestJsonResult(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  return { ok: response.ok, status: response.status, payload };
}

async function createHoldForFirstAvailableRange(input) {
  const availableDates = new Set(input.days.filter((day) => day.available).map((day) => day.date));
  const candidates = input.days.filter((day) => day.available && availableDates.has(addDays(day.date, 1)));

  for (const candidate of candidates) {
    const checkIn = candidate.date;
    const checkOut = addDays(checkIn, 2);
    const result = await requestJsonResult("/api/booking-holds", {
      method: "POST",
      body: JSON.stringify({
        roomId: input.roomId,
        checkIn,
        checkOut,
        adultCount: 2,
        childCount: 0,
        optionItems: [],
        utmCode: "campheaven_room_01",
        holdMinutes: 5
      })
    });

    if (result.ok && result.payload.hold?.id) {
      return { hold: result.payload, checkIn, checkOut };
    }

    if (result.status === 409 && result.payload.availability?.blockedReason === "active_hold") {
      continue;
    }

    throw new Error(`${result.status} /api/booking-holds: ${JSON.stringify(result.payload)}`);
  }

  throw new Error("No available two-night range could create a booking hold for payment QA.");
}

async function cleanup(supabase, created) {
  if (created.bookingId) {
    await supabase.from("booking_option_items").delete().eq("booking_id", created.bookingId);
    await supabase.from("payments").delete().eq("booking_id", created.bookingId);
  }

  if (created.orderIds.length > 0) {
    await supabase.from("payment_orders").delete().in("order_id", created.orderIds);
  }

  if (created.bookingId) {
    await supabase.from("bookings").delete().eq("id", created.bookingId);
  }

  if (created.holdId) {
    await supabase.from("booking_holds").delete().eq("id", created.holdId);
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
const created = {
  holdId: null,
  bookingId: null,
  orderIds: []
};

try {
  const { data: rooms, error: roomError } = await supabase
    .from("rooms")
    .select("id, name")
    .eq("accommodation_id", accommodationId)
    .eq("status", "active")
    .order("name");

  if (roomError) throw roomError;
  if (!rooms?.length) throw new Error(`No active rooms found for ${accommodationId}.`);

  const room = rooms[0];
  const today = new Date().toISOString().slice(0, 10);
  const calendar = await requestJson(
    `/api/availability/calendar?${new URLSearchParams({
      roomId: room.id,
      startDate: addDays(today, 21),
      endDate: addDays(today, 75)
    })}`
  );
  const holdResult = await createHoldForFirstAvailableRange({
    days: calendar.days ?? [],
    roomId: room.id
  });
  const checkIn = holdResult.checkIn;
  const checkOut = holdResult.checkOut;

  created.holdId = holdResult.hold.hold.id;

  const manualPayment = await requestJson("/api/payments/prepare", {
    method: "POST",
    body: JSON.stringify({
      holdId: created.holdId,
      roomId: room.id,
      checkIn,
      checkOut,
      provider: "manual_bank_transfer",
      adultCount: 2,
      childCount: 0,
      optionItems: [],
      guestName: "2주차 QA",
      guestPhone: qaGuestPhone,
      utmCode: "campheaven_room_01"
    })
  });

  if (!manualPayment.payment?.orderId || manualPayment.payment.mode !== "manual") {
    throw new Error("Manual bank transfer prepare failed.");
  }
  if (!manualPayment.orderStorage?.persisted) {
    throw new Error(`Manual payment order was not persisted: ${manualPayment.orderStorage?.reason ?? "unknown reason"}`);
  }

  created.orderIds.push(manualPayment.payment.orderId);

  const confirmed = await requestJson("/api/payments/confirm", {
    method: "POST",
    body: JSON.stringify({
      provider: "manual_bank_transfer",
      paymentKey: `manual_${manualPayment.payment.orderId}`,
      orderId: manualPayment.payment.orderId,
      amount: manualPayment.payment.amount
    })
  });

  if (confirmed.status !== "waiting_deposit" || !confirmed.bookingId) {
    throw new Error("Manual transfer confirmation did not create a waiting deposit booking.");
  }

  created.bookingId = confirmed.bookingId;

  const myReservations = await requestJson(
    `/api/my/reservations?${new URLSearchParams({ phone: qaGuestPhone })}`
  );
  const reservation = (myReservations.reservations ?? []).find(
    (item) => item.id === created.bookingId
  );

  if (!reservation) {
    throw new Error("Customer reservation lookup did not return the created booking.");
  }

  const naverPay = await requestJson("/api/payments/prepare", {
    method: "POST",
    body: JSON.stringify({
      roomId: room.id,
      checkIn,
      checkOut,
      provider: "naverpay",
      adultCount: 2,
      childCount: 0,
      optionItems: [],
      guestName: "2주차 QA",
      guestPhone: qaGuestPhone,
      utmCode: "campheaven_room_01"
    })
  });

  if (!naverPay.payment?.orderId) {
    throw new Error("Naver Pay prepare did not create an order.");
  }
  if (!naverPay.orderStorage?.persisted) {
    throw new Error(`Naver Pay order was not persisted: ${naverPay.orderStorage?.reason ?? "unknown reason"}`);
  }

  created.orderIds.push(naverPay.payment.orderId);

  const expiredOrderId = `expired_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const { error: expiredInsertError } = await supabase.from("payment_orders").insert({
    order_id: expiredOrderId,
    room_id: room.id,
    check_in: checkIn,
    check_out: checkOut,
    provider: "card",
    mode: "mock",
    amount: 1000,
    status: "ready",
    checkout: {},
    expires_at: new Date(Date.now() - 60_000).toISOString()
  });

  if (expiredInsertError) throw expiredInsertError;
  created.orderIds.push(expiredOrderId);

  const expired = await requestJson("/api/payments/expire", {
    method: "POST",
    body: JSON.stringify({})
  });

  if (!expired.persisted || !expired.orderIds?.includes(expiredOrderId)) {
    throw new Error("Expired payment order was not marked expired.");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        accommodationId,
        room: room.name,
        checkIn,
        checkOut,
        manualOrderId: manualPayment.payment.orderId,
        waitingDepositBookingId: created.bookingId,
        naverPayMode: naverPay.payment.mode,
        naverPayEasyPay: naverPay.payment.checkout?.easyPay ?? null,
        expiredOrderId,
        myReservationCount: myReservations.reservations?.length ?? 0,
        checkedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
} finally {
  await cleanup(supabase, created);
}
