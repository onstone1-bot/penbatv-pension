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
const css = read("src/app/globals.css");

for (const required of [
  "customerJourney",
  "bookingModeChoices",
  "예약 요청",
  "바로 결제",
  "journey-panel",
  "decision-grid",
  "mode-card"
]) {
  assert(stayClient.includes(required), `Missing customer week3 guard: ${required}`);
}

for (const required of [
  "reservationRequests",
  "예약 운영 콘솔",
  "예약 요청함",
  "예약 차단일",
  "운영 체크리스트",
  "host-dashboard-grid"
]) {
  assert(hostClient.includes(required), `Missing host week3 guard: ${required}`);
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
        "youtube-to-booking-journey",
        "booking-mode-selection",
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
