import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseUrl = process.env.STAYLINK_VERIFY_BASE_URL ?? "http://localhost:3000";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
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

async function requestJson(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  return { response, payload };
}

async function requestHtml(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  const html = await response.text();

  return { response, html };
}

function runStaticVerification(reason = "missing-live-env") {
  const stayClient = read("src/app/stays/[id]/StayAppClient.tsx");
  const myPage = read("src/app/my/page.tsx");
  const profileRoute = read("src/app/api/my/profile/route.ts");
  const favoritesRoute = read("src/app/api/my/favorites/route.ts");
  const recentRoute = read("src/app/api/my/recent-stays/route.ts");
  const adminRoute = read("src/app/api/admin/partner-inquiries/[id]/route.ts");
  const adminPage = read("src/app/admin/operations/page.tsx");
  const migration = read("supabase/migrations/20260819084000_day6_10_customer_ops.sql");

  for (const required of [
    "customer_preferences",
    "customer_favorites",
    "customer_recent_stays",
    "operator_note",
    "contacted_at"
  ]) {
    assert(migration.includes(required), `Missing day6-10 migration guard: ${required}`);
  }

  for (const required of ["찜하기", "/api/my/favorites", "/api/my/recent-stays", "penbatv.localFavorites"]) {
    assert(stayClient.includes(required), `Missing stay customer engagement guard: ${required}`);
  }

  for (const required of ["최근 본 숙소", "getCustomerEngagement", "initialDefaultAdultCount"]) {
    assert(myPage.includes(required), `Missing MY engagement guard: ${required}`);
  }

  for (const required of ["customer_preferences", "default_adult_count", "cash_receipt_type"]) {
    assert(profileRoute.includes(required), `Missing profile preference guard: ${required}`);
  }

  assert(favoritesRoute.includes("customer_favorites"), "Missing favorites API table guard.");
  assert(recentRoute.includes("customer_recent_stays"), "Missing recent stays API table guard.");
  assert(adminRoute.includes("requireOperatorToken") && adminRoute.includes("partner_inquiries"), "Missing operator inquiry API guard.");
  assert(adminPage.includes("PartnerInquiryStatusClient"), "Missing partner inquiry status client in admin page.");

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "static",
        reason,
        checked: [
          "customer-favorites",
          "customer-recent-stays",
          "customer-preferences",
          "partner-inquiry-status-update",
          "my-screen-engagement"
        ],
        checkedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminToken = process.env.STAYLINK_ADMIN_API_TOKEN;

if (!supabaseUrl || !serviceRoleKey || !adminToken) {
  runStaticVerification();
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const [stayHtml, myHtml] = await Promise.all([
  requestHtml("/stays/baebang-alps?utm_source=penbatv&utm_medium=day6_10_verify&utm_campaign=baebang-alps"),
  requestHtml("/my")
]);

assert(stayHtml.response.ok && stayHtml.html.includes("찜하기"), "Stay page did not render favorite action.");
assert(myHtml.response.ok && myHtml.html.includes("최근 본 숙소"), "MY page did not render recent stays section.");

const guestRecent = await requestJson("/api/my/recent-stays", {
  method: "POST",
  body: JSON.stringify({
    accommodationId: "baebang-alps",
    roomId: "A",
    source: "day6_10_verify_guest"
  })
});

assert(guestRecent.response.ok && guestRecent.payload.stored === false, "Guest recent-stay fallback did not respond.");

const guestFavorite = await requestJson("/api/my/favorites", {
  method: "POST",
  body: JSON.stringify({
    accommodationId: "baebang-alps",
    action: "add",
    source: "day6_10_verify_guest"
  })
});

assert(guestFavorite.response.status === 401, "Guest favorite API should require login.");

const inquiry = await requestJson("/api/partner-inquiries", {
  method: "POST",
  body: JSON.stringify({
    stayName: "6-10일차 QA 펜션",
    area: "충남 아산",
    ownerName: "QA대표",
    ownerPhone: "010-2222-3333",
    email: "qa@example.com",
    operationType: "pension_bbq",
    roomCount: 1,
    bbqType: "개별 바베큐",
    externalChannels: ["수기관리"],
    message: "6~10일차 입점문의 상태변경 검증",
    source: "day6_10_verify"
  })
});

assert(inquiry.response.status === 201 && inquiry.payload.inquiry?.id, "Partner inquiry test row was not created.");

const inquiryId = inquiry.payload.inquiry.id;
const update = await requestJson(`/api/admin/partner-inquiries/${inquiryId}`, {
  method: "PATCH",
  headers: {
    "x-admin-token": adminToken,
    "x-penbatv-role": "operator"
  },
  body: JSON.stringify({
    status: "consulting",
    operatorNote: "6~10일차 QA 상담중 전환",
    contacted: true
  })
});

assert(update.response.ok && update.payload.inquiry?.status === "consulting", "Partner inquiry status update failed.");

const { error: cleanupError } = await supabase
  .from("partner_inquiries")
  .delete()
  .eq("id", inquiryId)
  .eq("source", "day6_10_verify");

if (cleanupError) throw cleanupError;

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      checked: [
        "stay-page-favorite-action",
        "my-page-recent-stays",
        "guest-recent-stay-fallback",
        "favorite-requires-login",
        "partner-inquiry-status-api"
      ],
      inquiryStatus: update.payload.inquiry.status,
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
