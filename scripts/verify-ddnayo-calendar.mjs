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

const calendarData = read("src/lib/booking-calendar-status.ts");
const calendarPage = read("src/app/booking-calendar-status/page.tsx");
const homePage = read("src/app/page.tsx");
const css = read("src/app/globals.css");

for (const required of [
  "CalendarStatus",
  "buildRoomCalendarRows",
  "buildBarbecueCalendarRow",
  "normalizeCalendarAccommodationId",
  "accommodationId",
  "예약가능",
  "예약완료"
]) {
  assert(calendarData.includes(required), `Missing DDNAYO calendar data guard: ${required}`);
}

for (const required of [
  "실시간 예약 현황",
  "떠나요 예약시스템",
  "status-calendar-grid",
  "객실/사이트",
  "barbecueRow.zoneName",
  "calendar_status"
]) {
  assert(calendarPage.includes(required), `Missing DDNAYO calendar page guard: ${required}`);
}

assert(homePage.includes("/booking-calendar-status"), "Missing home link to booking calendar status.");

for (const required of [
  ".calendar-status-page",
  ".calendar-status-hero",
  ".calendar-status-toolbar",
  ".status-calendar-grid",
  ".status-cell.available",
  ".status-cell.reserved",
  ".barbecue-row"
]) {
  assert(css.includes(required), `Missing DDNAYO calendar CSS guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "ddnayo-style-booking-calendar-status",
      guards: [
        "accommodation-id-query",
        "room-date-price-status-grid",
        "reservation-status-legend",
        "barbecue-timeslot-status-row",
        "calendar-to-booking-utm-link"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
