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

const css = read("src/app/globals.css");
const layout = read("src/app/layout.tsx");

for (const required of [
  "@media (max-width: 390px)",
  "env(safe-area-inset-bottom)",
  ".bottom-tabs",
  ".flow-card input",
  "font-size: 16px",
  "overflow-wrap: anywhere",
  ".primary-action:disabled",
  ".hold-timer",
  "font-variant-numeric: tabular-nums",
  ".calendar-grid",
  ".availability-summary"
]) {
  assert(css.includes(required), `Missing mobile CSS guard: ${required}`);
}

for (const required of ["export const viewport", 'width: "device-width"', "viewportFit"]) {
  assert(layout.includes(required), `Missing viewport guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "mobile-390",
      guards: [
        "viewport",
        "safe-area-bottom",
        "input-16px",
        "text-wrap",
        "disabled-booking-action",
        "hold-timer",
        "calendar-availability"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
