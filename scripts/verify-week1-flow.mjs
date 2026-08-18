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

async function requestJson(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${response.status} ${url}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function cleanup(supabase, created) {
  if (created.orderId) {
    await supabase.from("payment_orders").delete().eq("order_id", created.orderId);
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
  orderId: null
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
  const startDate = addDays(today, 14);
  const endDate = addDays(today, 60);
  const calendar = await requestJson(
    `${baseUrl}/api/availability/calendar?${new URLSearchParams({
      roomId: room.id,
      startDate,
      endDate
    })}`
  );
  const availableDates = new Set(
    (calendar.days ?? []).filter((day) => day.available).map((day) => day.date)
  );
  const checkIn = (calendar.days ?? []).find((day) =>
    day.available && availableDates.has(addDays(day.date, 1))
  )?.date;

  if (!checkIn) {
    throw new Error("No two-night available range found in the test window.");
  }

  const checkOut = addDays(checkIn, 2);
  const { data: options, error: optionError } = await supabase
    .from("booking_options")
    .select("id")
    .eq("accommodation_id", accommodationId)
    .eq("status", "active")
    .limit(1);

  if (optionError) throw optionError;

  const optionItems = (options ?? []).map((option) => ({
    optionId: option.id,
    quantity: 1
  }));
  const quote = await requestJson(`${baseUrl}/api/quote`, {
    method: "POST",
    body: JSON.stringify({
      roomId: room.id,
      checkIn,
      checkOut,
      adultCount: 2,
      childCount: 1,
      optionItems,
      utmCode: "campheaven_room_01"
    })
  });

  if (!quote.quote?.totalAmount || quote.quote.priceAuthority !== "server") {
    throw new Error("Quote API did not return a server-authoritative total amount.");
  }

  const hold = await requestJson(`${baseUrl}/api/booking-holds`, {
    method: "POST",
    body: JSON.stringify({
      roomId: room.id,
      checkIn,
      checkOut,
      adultCount: 2,
      childCount: 1,
      optionItems,
      utmCode: "campheaven_room_01",
      holdMinutes: 5
    })
  });

  if (!hold.hold?.id) {
    throw new Error("Booking hold API did not return a hold id.");
  }

  created.holdId = hold.hold.id;

  const payment = await requestJson(`${baseUrl}/api/payments/prepare`, {
    method: "POST",
    body: JSON.stringify({
      holdId: created.holdId,
      roomId: room.id,
      checkIn,
      checkOut,
      provider: "manual_bank_transfer",
      adultCount: 2,
      childCount: 1,
      optionItems,
      guestName: "1주차 QA",
      guestPhone: "010-0000-0000",
      utmCode: "campheaven_room_01"
    })
  });

  if (!payment.payment?.orderId || payment.quote?.totalAmount !== quote.quote.totalAmount) {
    throw new Error("Payment prepare API did not preserve the server quote.");
  }

  created.orderId = payment.payment.orderId;

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        accommodationId,
        room: room.name,
        checkIn,
        checkOut,
        totalAmount: quote.quote.totalAmount,
        holdId: created.holdId,
        orderId: created.orderId,
        checkedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
} finally {
  await cleanup(supabase, created);
}
