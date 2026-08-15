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

const coreData = read("src/lib/core-features.ts");
const corePage = read("src/app/host/core-features/page.tsx");
const apiRoute = read("src/app/api/availability/barbecue-timeslots/route.ts");
const homePage = read("src/app/page.tsx");
const hostRooms = read("src/app/host/rooms/HostRoomsClient.tsx");
const css = read("src/app/globals.css");
const guide = read("docs/core-feature-requirements.md");

for (const required of [
  "coreFeatureModules",
  "barbecueSlots",
  "checkBarbecueSlotAvailability",
  "실시간 예약 엔진",
  "현금영수증",
  "카카오 알림톡",
  "notificationTemplates"
]) {
  assert(coreData.includes(required), `Missing core feature data guard: ${required}`);
}

for (const required of [
  "핵심 기능 요구사항 대시보드",
  "feature-module-grid",
  "timeslot-grid",
  "notification-template-list",
  "결제/현금영수증 구현 메모"
]) {
  assert(corePage.includes(required), `Missing core feature page guard: ${required}`);
}

for (const required of ["GET", "date", "startTime", "endTime", "availability", "barbecueSlots"]) {
  assert(apiRoute.includes(required), `Missing barbecue availability API guard: ${required}`);
}

assert(homePage.includes("/host/core-features"), "Missing home link to core features.");
assert(hostRooms.includes("/host/core-features"), "Missing host console link to core features.");

for (const required of [
  ".feature-module-grid",
  ".feature-module-card",
  ".feature-status",
  ".customer-stat-grid",
  ".timeslot-card",
  ".notification-template-card"
]) {
  assert(css.includes(required), `Missing core feature CSS guard: ${required}`);
}

for (const required of [
  "실시간 예약 엔진",
  "barbecue_bookings",
  "payment_orders",
  "cash_receipt_key",
  "admin_daily_sales",
  "notification_queue",
  "Kakao AlimTalk provider adapter"
]) {
  assert(guide.includes(required), `Missing core feature guide guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "penbatv-core-features",
      guards: [
        "room-and-barbecue-availability",
        "payment-and-cash-receipt-plan",
        "admin-sales-customer-stats",
        "kakao-alimtalk-notification-queue",
        "responsive-core-feature-screen"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
