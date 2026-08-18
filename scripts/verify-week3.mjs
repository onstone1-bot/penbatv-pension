import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const stayClient = read("src/app/stays/[id]/StayAppClient.tsx");
const hostClient = read("src/app/host/rooms/HostRoomsClient.tsx");
const stayPage = read("src/app/stays/[id]/page.tsx");
const availabilityApi = read("src/app/api/availability/calendar/route.ts");
const availabilityLib = read("src/lib/availability.ts");
const quoteApi = read("src/app/api/quote/route.ts");
const pricingLib = read("src/lib/pricing.ts");
const holdApi = read("src/app/api/booking-holds/route.ts");
const prepareApi = read("src/app/api/payments/prepare/route.ts");
const confirmApi = read("src/app/api/payments/confirm/route.ts");
const paymentConfirm = read("src/lib/payments/confirm.ts");
const week3Doc = read("docs/week3-days15-21-progress.md");
const css = read("src/app/globals.css");

for (const required of [
  "/api/availability/calendar",
  "/api/availability?",
  "/api/quote",
  "/api/booking-holds",
  "/api/payments/prepare",
  "/api/payments/confirm",
  "initialBookingMode=\"instant\"",
  "내 예약 보기",
  "bookingId",
  "bookingNo"
]) {
  const source = required === "initialBookingMode=\"instant\"" ? stayPage : stayClient;
  assert(source.includes(required), `Missing week3 reservation flow guard: ${required}`);
}

for (const [label, source, guards] of [
  ["calendar-api", `${availabilityApi}\n${availabilityLib}`, ["getRoomCalendarAvailability", "bookings", "booking_holds", "room_blocks"]],
  ["quote-api", `${quoteApi}\n${pricingLib}`, ["getRoomQuote", "priceAuthority"]],
  ["hold-api", holdApi, ["createBookingHold", "holdMinutes", "quote"]],
  ["prepare-api", prepareApi, ["getRoomQuote", "savePreparedPaymentOrder", "currentCustomer"]],
  ["confirm-api", confirmApi, ["confirmPreparedPayment", "Idempotency-Key"]],
  ["payment-confirm", paymentConfirm, ["bookingNo", "payment_status", "booking_option_items"]]
]) {
  for (const guard of guards) {
    assert(source.includes(guard), `Missing ${label} guard: ${guard}`);
  }
}

for (const required of [
  "reservationRequests",
  "예약 요청함",
  "예약 차단일",
  "운영 체크리스트",
  "host-dashboard-grid"
]) {
  assert(hostClient.includes(required), `Missing host week3 guard: ${required}`);
}

for (const required of [
  "15일차",
  "16일차",
  "17일차",
  "18일차",
  "19일차",
  "20일차",
  "21일차"
]) {
  assert(week3Doc.includes(required), `Missing week3 progress doc guard: ${required}`);
}

for (const required of [
  ".journey-panel",
  ".decision-grid",
  ".mode-grid",
  ".request-note",
  ".host-dashboard-grid",
  ".request-card",
  ".block-row",
  ".check-list"
]) {
  assert(css.includes(required), `Missing week3 CSS guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "week3-concept-detail",
      guards: [
        "date-calendar-availability",
        "room-media-after-selection",
        "server-side-quote",
        "booking-hold",
        "payment-prepare-confirm",
        "my-reservation-link",
        "host-reservation-inbox",
        "host-block-calendar",
        "operation-checklist"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
