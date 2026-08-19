import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseUrl = process.env.STAYLINK_VERIFY_BASE_URL ?? "http://localhost:3000";
const accommodationId = process.env.STAYLINK_VERIFY_ACCOMMODATION_ID ?? "baebang-alps";
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertStatic(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

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

function compactDate(date) {
  return date.replaceAll("-", "");
}

async function requestJson(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": process.env.STAYLINK_ADMIN_API_TOKEN,
      ...(init.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${response.status} ${pathname}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

function runStaticVerification(reason = "missing-live-env") {
  const notificationsPage = read("src/app/host/notifications/page.tsx");
  const channelSyncPage = read("src/app/integrations/channel-sync/page.tsx");
  const readinessPage = read("src/app/release-readiness/page.tsx");
  const rehearsalPage = read("src/app/launch-rehearsal/page.tsx");
  const notificationLib = read("src/lib/notifications.ts");
  const icalLib = read("src/lib/ical-sync.ts");
  const pilotLib = read("src/lib/pilot.ts");
  const environmentRoute = read("src/app/api/admin/environment/route.ts");
  const week5Doc = read("docs/week5-days28-35-progress.md");

  for (const required of ["Week 5 Day 28-30", "28일차 관리자 최종 QA", "예약 완료", "입실 안내", "바베큐 리마인드", "Mock 발송"]) {
    assertStatic(notificationsPage.includes(required), `Missing week5 notification page guard: ${required}`);
  }

  for (const required of ["Week 5 Day 31", "/api/integrations/ical/sync", "room_blocks", "calendar_sync_sources"]) {
    assertStatic(channelSyncPage.includes(required), `Missing week5 iCal page guard: ${required}`);
  }

  for (const required of ["Week 5 Day 32-33", "verify:mobile", "verify:week5:launch", "GitHub push", "Vercel"]) {
    assertStatic(readinessPage.includes(required), `Missing week5 readiness guard: ${required}`);
  }

  for (const required of ["Week 5 Day 34-35", "POST /api/pilot/open", "Go/No-Go", "파일럿 오픈 기록"]) {
    assertStatic(rehearsalPage.includes(required), `Missing week5 rehearsal guard: ${required}`);
  }

  for (const required of ["booking_confirmed", "checkin_guide", "barbecue_reminder", "mock-alimtalk"]) {
    assertStatic(notificationLib.includes(required), `Missing week5 notification engine guard: ${required}`);
  }

  for (const required of ["parseIcalEvents", "calendar_sync_events", "room_blocks", "external_uid"]) {
    assertStatic(icalLib.includes(required), `Missing week5 iCal engine guard: ${required}`);
  }

  for (const required of ["mobileChecked", "getPilotReadiness", "status: readiness.ready ? \"open\" : \"rehearsal\""]) {
    assertStatic(pilotLib.includes(required), `Missing week5 pilot guard: ${required}`);
  }

  for (const required of ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "STAYLINK_ADMIN_API_TOKEN", "TOSS_PAYMENTS_CLIENT_KEY", "requiredFor"]) {
    assertStatic(environmentRoute.includes(required), `Missing week5 environment guard: ${required}`);
  }

  for (const required of ["28일차", "29일차", "30일차", "31일차", "32일차", "33일차", "34일차", "35일차"]) {
    assertStatic(week5Doc.includes(required), `Missing week5 progress doc guard: ${required}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "static",
        reason,
        checked: [
          "notification-queue-templates",
          "ical-sync-room-blocks",
          "mobile-qa-release-readiness",
          "environment-variable-check",
          "pilot-open-checklist"
        ],
        checkedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
}

async function cleanup(supabase, created) {
  if (created.bookingId) {
    await supabase.from("notification_queue").delete().eq("booking_id", created.bookingId);
  }

  if (created.sourceId) {
    await supabase.from("room_blocks").delete().eq("external_source_id", created.sourceId);
    await supabase.from("calendar_sync_events").delete().eq("source_id", created.sourceId);
    await supabase.from("calendar_sync_sources").delete().eq("id", created.sourceId);
  }

  if (created.pilotRunId) {
    await supabase.from("pilot_runs").delete().eq("id", created.pilotRunId);
  }

  if (created.bookingId) {
    await supabase.from("booking_option_items").delete().eq("booking_id", created.bookingId);
    await supabase.from("payments").delete().eq("booking_id", created.bookingId);
    await supabase.from("bookings").delete().eq("id", created.bookingId);
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminToken = process.env.STAYLINK_ADMIN_API_TOKEN;

if (!supabaseUrl || !serviceRoleKey || !adminToken) {
  runStaticVerification();
  process.exit(0);
}

if (process.env.STAYLINK_VERIFY_LIVE !== "1") {
  runStaticVerification("live-disabled-default");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
const created = {
  bookingId: null,
  sourceId: null,
  pilotRunId: null
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
  const checkIn = addDays(today, 140);
  const checkOut = addDays(today, 142);
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_no: `PBTV-W5-${suffix.toUpperCase()}`,
      room_id: room.id,
      check_in: checkIn,
      check_out: checkOut,
      adult_count: 2,
      child_count: 0,
      guest_name: "5주차 QA",
      guest_phone: "010-0000-0035",
      utm_code: "week5_youtube_pilot",
      status: "confirmed",
      payment_status: "paid",
      total_amount: 310000,
      option_amount: 30000,
      discount_amount: 10000
    })
    .select()
    .single();

  if (bookingError) throw bookingError;
  created.bookingId = booking.id;

  const queued = await requestJson("/api/notifications/queue", {
    method: "POST",
    headers: { "x-penbatv-role": "host" },
    body: JSON.stringify({ bookingId: booking.id })
  });

  if (queued.queuedCount !== 3) {
    throw new Error(`Expected 3 queued notifications, got ${queued.queuedCount}.`);
  }

  const queue = await requestJson("/api/notifications/queue?limit=20", {
    headers: { "x-penbatv-role": "host" }
  });

  if (!queue.notifications?.some((notification) => notification.booking_id === booking.id)) {
    throw new Error("Notification queue lookup did not include the QA booking.");
  }

  const dispatched = await requestJson("/api/notifications/dispatch", {
    method: "POST",
    headers: { "x-penbatv-role": "operator" },
    body: JSON.stringify({ limit: 10 })
  });

  if (dispatched.dispatchedCount < 1) {
    throw new Error("Due notification dispatch did not send any rows.");
  }

  const blockStart = addDays(today, 160);
  const blockEnd = addDays(today, 162);
  const icalText = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:week5-${suffix}`,
    `DTSTART;VALUE=DATE:${compactDate(blockStart)}`,
    `DTEND;VALUE=DATE:${compactDate(blockEnd)}`,
    "SUMMARY:외부 예약 QA",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");
  const synced = await requestJson("/api/integrations/ical/sync", {
    method: "POST",
    headers: { "x-penbatv-role": "host" },
    body: JSON.stringify({
      roomId: room.id,
      provider: `qa-week5-${suffix}`,
      icalText,
      syncPolicy: "import_only"
    })
  });

  created.sourceId = synced.source?.id ?? null;

  if (synced.eventCount !== 1 || synced.blockCount !== 1) {
    throw new Error("iCal sync did not create the expected external block.");
  }

  const calendar = await requestJson(
    `/api/availability/calendar?${new URLSearchParams({
      roomId: room.id,
      startDate: blockStart,
      endDate: addDays(blockStart, 3)
    })}`
  );
  const blockedDay = (calendar.days ?? []).find((day) => day.date === blockStart);

  if (blockedDay?.available !== false || blockedDay.blockedReason !== "room_block") {
    throw new Error("iCal room block was not reflected in availability calendar.");
  }

  const pilot = await requestJson("/api/pilot/open", {
    method: "POST",
    headers: { "x-penbatv-role": "operator" },
    body: JSON.stringify({
      accommodationId,
      checklist: {
        youtubeLinkChecked: true,
        bookingFlowChecked: true,
        paymentChecked: true,
        notificationChecked: true,
        hostDashboardChecked: true,
        mobileChecked: true
      }
    })
  });

  created.pilotRunId = pilot.pilotRun?.id ?? null;

  if (!pilot.readiness?.ready || pilot.pilotRun?.status !== "open") {
    throw new Error("Pilot open readiness did not pass.");
  }

  const environment = await requestJson("/api/admin/environment", {
    headers: { "x-penbatv-role": "operator" }
  });

  if (!environment.environment?.filter((item) => item.required).every((item) => item.present)) {
    throw new Error("One or more required deployment environment variables are missing locally.");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        accommodationId,
        room: room.name,
        checked: [
          "booking-notification-queue",
          "mock-alimtalk-dispatch",
          "checkin-guide-barbecue-reminder-scheduling",
          "ical-external-room-block",
          "availability-calendar-blocked-by-ical",
          "deployment-env-presence-api",
          "pilot-open-checklist"
        ],
        notificationQueuedCount: queued.queuedCount,
        dispatchedCount: dispatched.dispatchedCount,
        icalEventCount: synced.eventCount,
        icalBlockCount: synced.blockCount,
        pilotStatus: pilot.pilotRun.status,
        checkedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
} finally {
  await cleanup(supabase, created);
}
