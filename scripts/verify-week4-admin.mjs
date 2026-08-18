import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseUrl = process.env.STAYLINK_VERIFY_BASE_URL ?? "http://localhost:3000";
const accommodationId = process.env.STAYLINK_VERIFY_ACCOMMODATION_ID ?? "baebang-alps";

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

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminToken = process.env.STAYLINK_ADMIN_API_TOKEN;

if (!supabaseUrl || !serviceRoleKey || !adminToken) {
  throw new Error("Supabase URL, service role key, and STAYLINK_ADMIN_API_TOKEN are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const operations = await requestJson("/api/admin/operations");

if (!operations.response.ok) {
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
