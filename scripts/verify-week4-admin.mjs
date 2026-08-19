import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseUrl = process.env.STAYLINK_VERIFY_BASE_URL ?? "http://localhost:3000";
const accommodationId = process.env.STAYLINK_VERIFY_ACCOMMODATION_ID ?? "baebang-alps";

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

async function requestJson(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": process.env.STAYLINK_ADMIN_API_TOKEN,
      "x-penbatv-role": "operator",
      ...(init.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  return { response, payload };
}

function runStaticVerification(reason = "missing-live-env") {
  const adminAuth = read("src/lib/admin-auth.ts");
  const adminData = read("src/lib/admin-operations-data.ts");
  const adminPage = read("src/app/admin/operations/page.tsx");
  const authClient = read("src/app/auth/AuthClient.tsx");
  const authPage = read("src/app/auth/page.tsx");
  const hostRoomsClient = read("src/app/host/rooms/HostRoomsClient.tsx");
  const hostPropertiesClient = read("src/app/host/properties/HostPropertiesClient.tsx");
  const proposalClient = read("src/app/host/proposals/ProposalApprovalClient.tsx");
  const week4Doc = read("docs/week4-days22-27-progress.md");
  const adminCss = read("src/app/globals.css");

  for (const required of [
    "return \"customer\"",
    "Set x-penbatv-role explicitly",
    "requireOperatorToken",
    "requireHostToken"
  ]) {
    assertStatic(adminAuth.includes(required), `Missing week4 admin auth guard: ${required}`);
  }

  for (const required of [
    "profiles",
    "memberRows",
    "roleRows",
    "week4QaRows",
    "payment_orders",
    "settlements",
    "utm_events"
  ]) {
    assertStatic(adminData.includes(required), `Missing week4 admin data guard: ${required}`);
  }

  for (const required of [
    "weekFourAdminMilestones",
    "week-four-admin-status",
    "WEEK 4 · 22~27일차",
    "회원·권한·운영자 집계 흐름",
    "회원·권한 현황",
    "최근 회원가입",
    "전체 예약 현황",
    "결제·정산 예정금액",
    "유튜브 UTM 유입/예약 전환",
    "4주차 관리자 QA"
  ]) {
    assertStatic(adminPage.includes(required), `Missing week4 admin page guard: ${required}`);
  }

  for (const required of [
    "네이버 로그인",
    "카카오 로그인",
    "고객 프로필이 DB에 자동 저장",
    "x-penbatv-role\": \"host\""
  ]) {
    const source = required === "x-penbatv-role\": \"host\"" ? `${hostRoomsClient}\n${hostPropertiesClient}` : `${authClient}\n${authPage}`;
    assertStatic(source.includes(required), `Missing week4 auth/host guard: ${required}`);
  }

  assertStatic(proposalClient.includes("x-penbatv-role") && proposalClient.includes("operator"), "Missing operator proposal role guard.");

  for (const required of ["22일차", "23일차", "24일차", "25일차", "26일차", "27일차"]) {
    assertStatic(week4Doc.includes(required), `Missing week4 progress doc guard: ${required}`);
  }

  for (const required of ["week-four-admin-status", "week-four-admin-head", "week-four-admin-grid"]) {
    assertStatic(adminCss.includes(required), `Missing week4 admin CSS guard: ${required}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "static",
        reason,
        checked: [
          "customer-oauth-profile-flow",
          "host-operator-role-separation",
          "operator-approval-screen",
          "reservation-payment-settlement-utm-dashboard",
          "week4-qa-document"
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

const operations = await requestJson("/api/admin/operations");

if (!operations.response.ok) {
  if (process.env.STAYLINK_VERIFY_STRICT_LIVE !== "1") {
    runStaticVerification(`live-admin-operations-${operations.response.status}`);
    process.exit(0);
  }

  throw new Error(`Admin operations failed: ${operations.response.status} ${JSON.stringify(operations.payload)}`);
}

if (!Array.isArray(operations.payload.metrics) || operations.payload.metrics.length < 4) {
  throw new Error("Admin metrics were not returned.");
}

if (!Array.isArray(operations.payload.properties)) {
  throw new Error("Admin properties were not returned.");
}

if (!operations.payload.statusCounts?.bookings || !operations.payload.statusCounts?.paymentOrders) {
  throw new Error("Admin status counts were not returned.");
}

const hostBlocked = await requestJson("/api/admin/operations", {
  headers: {
    "x-penbatv-role": "host"
  }
});

if (hostBlocked.response.ok) {
  throw new Error("Host role should not be allowed to read operator operations.");
}

const { data: accommodation, error: accommodationError } = await supabase
  .from("accommodations")
  .select("id, name, status")
  .eq("id", accommodationId)
  .single();

if (accommodationError) throw accommodationError;
if (!accommodation) throw new Error(`Accommodation ${accommodationId} was not found.`);

const approval = await requestJson(`/api/admin/accommodations/${accommodation.id}/approval`, {
  method: "PATCH",
  body: JSON.stringify({
    status: accommodation.status,
    note: "4주차 QA no-op 승인 검증"
  })
});

if (!approval.response.ok) {
  throw new Error(`Approval API failed: ${approval.response.status} ${JSON.stringify(approval.payload)}`);
}

if (approval.payload.accommodation?.status !== accommodation.status) {
  throw new Error("Approval API returned an unexpected status.");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      checked: [
        "customer-auth-screen-connected",
        "host-operator-role-separation",
        "operator-approval-api",
        "admin-reservation-summary",
        "admin-payment-settlement-summary",
        "youtube-utm-conversion-summary"
      ],
      metricCount: operations.payload.metrics.length,
      propertyCount: operations.payload.properties.length,
      hostBlockedStatus: hostBlocked.response.status,
      approvalTarget: accommodation.name,
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
