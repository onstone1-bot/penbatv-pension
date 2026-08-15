import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const schema = read("supabase/schema.v1.sql");
const seed = read("supabase/seed.sql");

const requiredTables = [
  "accommodations",
  "rooms",
  "room_images",
  "room_rates",
  "booking_options",
  "booking_holds",
  "bookings",
  "booking_option_items",
  "room_blocks",
  "youtube_campaigns",
  "utm_events",
  "payment_orders",
  "payments",
  "settlements"
];

const tableOrder = [...schema.matchAll(/create table if not exists public\.([a-z_]+)/g)].map(
  (match) => match[1]
);

for (const table of requiredTables) {
  assert(tableOrder.includes(table), `Missing table: ${table}`);
  assert(
    schema.includes(`alter table public.${table} enable row level security`),
    `Missing RLS enablement: ${table}`
  );
}

assert(
  tableOrder.indexOf("booking_holds") < tableOrder.indexOf("bookings"),
  "booking_holds must be created before bookings"
);
assert(
  tableOrder.indexOf("bookings") < tableOrder.indexOf("booking_option_items"),
  "bookings must be created before booking_option_items"
);
assert(
  tableOrder.indexOf("payment_orders") < tableOrder.indexOf("payments"),
  "payment_orders must be created before payments"
);
assert(
  tableOrder.indexOf("payments") < tableOrder.indexOf("settlements"),
  "payments must be created before settlements"
);

for (const campaign of ["campheaven_room_01", "campheaven_bbq_01", "campheaven_route_01"]) {
  assert(seed.includes(campaign), `Missing campaign seed: ${campaign}`);
}

for (const route of [
  "src/app/api/accommodations/[id]/route.ts",
  "src/app/api/accommodations/[id]/rooms/route.ts",
  "src/app/api/accommodations/[id]/options/route.ts",
  "src/app/api/availability/route.ts",
  "src/app/api/booking-holds/route.ts",
  "src/app/api/payments/prepare/route.ts",
  "src/app/api/payments/confirm/route.ts",
  "src/app/payments/success/page.tsx",
  "src/app/payments/fail/page.tsx",
  "src/app/api/landing/route.ts",
  "src/lib/payments/provider.ts",
  "src/lib/payments/orders.ts",
  "src/lib/payments/confirm.ts",
  "src/lib/stay-page-data.ts",
  "src/app/stays/[id]/page.tsx",
  "src/app/stays/[id]/StayAppClient.tsx",
  "src/app/host/rooms/page.tsx",
  "src/app/host/rooms/HostRoomsClient.tsx"
]) {
  assert(exists(route), `Missing route/page file: ${route}`);
}

assert(
  read("src/app/stays/[id]/page.tsx").includes("getStayPageData"),
  "Stay page must load data through getStayPageData"
);

console.log(
  JSON.stringify(
    {
      ok: true,
      tables: tableOrder,
      campaigns: ["campheaven_room_01", "campheaven_bbq_01", "campheaven_route_01"],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
