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

const rateCalendar = read("src/app/host/rate-calendar/HostRateCalendarClient.tsx");
const ratePage = read("src/app/host/rate-calendar/page.tsx");
const hostRooms = read("src/app/host/rooms/HostRoomsClient.tsx");
const css = read("src/app/globals.css");
const guide = read("docs/penbatv-architecture-launch-guide.md");

for (const required of [
  "달력 드래그 요금 설정",
  "room_rates insert preview",
  "바베큐 옵션 과금",
  "외부 달력 연동",
  "calendar_sync_sources insert preview",
  "iCal 가져오기 전용",
  "fixed_set",
  "per_person"
]) {
  assert(rateCalendar.includes(required), `Missing host UX guard: ${required}`);
}

assert(ratePage.includes("HostRateCalendarClient"), "Missing rate calendar page route.");
assert(hostRooms.includes("/host/rate-calendar"), "Missing host console link to rate calendar.");

for (const required of [
  ".rate-layout",
  ".rate-calendar-grid",
  ".rate-day",
  ".insert-preview",
  ".split-preview"
]) {
  assert(css.includes(required), `Missing host UX CSS guard: ${required}`);
}

for (const required of [
  "사장님 입력 UX",
  "성수기 요금",
  "바베큐 옵션",
  "외부 달력 연동"
]) {
  assert(guide.includes(required), `Missing host UX guide guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "owner-rate-option-calendar-ux",
      guards: [
        "drag-rate-calendar",
        "seasonal-rate-preview",
        "option-pricing-modes",
        "ical-import-source",
        "owner-guide"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
