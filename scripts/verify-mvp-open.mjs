import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseUrl = process.env.STAYLINK_VERIFY_BASE_URL ?? "http://localhost:3000";
const accommodationId = process.env.STAYLINK_VERIFY_ACCOMMODATION_ID ?? "baebang-alps";

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

async function requestJson(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
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
        utmCode: "mvp_open",
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

  throw new Error("No available two-night range could create a booking hold for MVP QA.");
}

async function requestHtml(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status} ${pathname}: ${text.slice(0, 200)}`);
  }

  return text;
}

function assertSourceMarkers(filePath, markers) {
  const text = fs.readFileSync(path.join(root, filePath), "utf8");

  for (const marker of markers) {
    if (!text.includes(marker)) {
      throw new Error(`${filePath} is missing marker: ${marker}`);
    }
  }
}

async function cleanup(supabase, created) {
  if (created.bookingId) {
    await supabase.from("notification_queue").delete().eq("booking_id", created.bookingId);
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
      endDate: addDays(today, 90)
    })}`
  );
  await requestHtml(`/stays/${accommodationId}?utm_source=penbatv&utm_medium=mvp_open&utm_campaign=${accommodationId}`);
  assertSourceMarkers("src/app/stays/[id]/StayAppClient.tsx", [
    "예약일정 선택",
    "객실 사진과 영상",
    "이 방·사이트로 예약하기"
  ]);

  const holdResult = await createHoldForFirstAvailableRange({
    days: calendar.days ?? [],
    roomId: room.id
  });
  const checkIn = holdResult.checkIn;
  const checkOut = holdResult.checkOut;
  created.holdId = holdResult.hold.hold.id;

  const quote = await requestJson("/api/quote", {
    method: "POST",
    body: JSON.stringify({
      roomId: room.id,
      checkIn,
      checkOut,
      adultCount: 2,
      childCount: 0,
      optionItems: [],
      utmCode: "mvp_open"
    })
  });

  if (!quote.quote?.totalAmount || quote.quote.totalAmount <= 0) {
    throw new Error("Server-side quote did not return a positive amount.");
  }

  const payment = await requestJson("/api/payments/prepare", {
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
      guestName: "MVP QA",
      guestPhone: "010-0000-0005",
      utmCode: "mvp_open"
    })
  });

  if (!payment.payment?.orderId) throw new Error("Payment prepare did not create an order.");
  if (!payment.orderStorage?.persisted) {
    throw new Error(`Payment order was not persisted: ${payment.orderStorage?.reason ?? "unknown reason"}`);
  }
  created.orderIds.push(payment.payment.orderId);

  const confirmed = await requestJson("/api/payments/confirm", {
    method: "POST",
    body: JSON.stringify({
      provider: "manual_bank_transfer",
      paymentKey: `manual_${payment.payment.orderId}`,
      orderId: payment.payment.orderId,
      amount: payment.payment.amount
    })
  });

  if (!confirmed.bookingId || confirmed.status !== "waiting_deposit") {
    throw new Error("Payment confirm did not create a booking.");
  }

  created.bookingId = confirmed.bookingId;

  const ownerHtml = await requestHtml("/host/owner-dashboard");

  for (const marker of ["최근 예약 현황", "고객 · 일정 · 결제상태"]) {
    if (!ownerHtml.includes(marker)) {
      throw new Error(`Owner dashboard is missing marker: ${marker}`);
    }
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
        checked: [
          "date-room-availability",
          "room-photo-video-booking-screen",
          "server-side-quote",
          "payment-confirm-creates-booking",
          "host-owner-dashboard-reservation-status"
        ],
        quoteAmount: quote.quote.totalAmount,
        bookingId: created.bookingId,
        checkedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
} finally {
  await cleanup(supabase, created);
}
