import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
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

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function safeHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function normalizeError(error) {
  if (!error) return null;

  return {
    code: error.code ?? "UNKNOWN",
    message: error.message ?? String(error)
  };
}

async function countRows(supabase, table, queryBuilder) {
  const baseQuery = supabase.from(table).select("id", { count: "exact", head: true });
  const query = queryBuilder ? queryBuilder(baseQuery) : baseQuery;
  const { count, error } = await query;

  return {
    table,
    ok: !error,
    count: count ?? 0,
    error: normalizeError(error)
  };
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const accessKey = serviceRoleKey ?? publishableKey;

const result = {
  ok: false,
  checkedAt: new Date().toISOString(),
  projectHost: supabaseUrl ? safeHost(supabaseUrl) : null,
  env: {
    hasSupabaseUrl: Boolean(supabaseUrl),
    hasPublishableKey: Boolean(publishableKey),
    hasServiceRoleKey: Boolean(serviceRoleKey),
    usingServiceRoleForDiagnostics: Boolean(serviceRoleKey)
  },
  tables: [],
  sample: null,
  nextActions: []
};

if (!supabaseUrl || !accessKey) {
  result.nextActions.push(
    ".env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 설정하세요."
  );
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} else {
  const supabase = createClient(supabaseUrl, accessKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const tableChecks = [
    ["accommodations", (query) => query.eq("status", "active")],
    ["rooms", (query) => query.eq("status", "active")],
    ["room_images"],
    ["room_rates"],
    ["booking_options", (query) => query.eq("status", "active")],
    ["booking_holds"],
    ["bookings"],
    ["room_blocks"],
    ["youtube_campaigns", (query) => query.eq("status", "active")],
    ["naver_links", (query) => query.eq("status", "active")],
    ["nearby_places", (query) => query.eq("status", "active")],
    ["payment_orders"],
    ["payments"]
  ];

  result.tables = await Promise.all(
    tableChecks.map(([table, queryBuilder]) => countRows(supabase, table, queryBuilder))
  );

  const { data: sample, error: sampleError } = await supabase
    .from("accommodations")
    .select(
      "id, name, status, rooms:rooms(id, name, status, room_images(id), room_rates(id)), booking_options(id, name, status)"
    )
    .eq("id", "baebang-alps")
    .maybeSingle();

  if (sampleError) {
    result.sample = {
      ok: false,
      error: normalizeError(sampleError)
    };
  } else {
    const rooms = sample?.rooms ?? [];
    const roomIds = rooms.map((room) => room.id);
    const { count: roomCampaignCount, error: roomCampaignError } =
      roomIds.length > 0
        ? await supabase
            .from("youtube_campaigns")
            .select("id", { count: "exact", head: true })
            .eq("status", "active")
            .in("room_id", roomIds)
        : { count: 0, error: null };

    result.sample = {
      ok: Boolean(sample),
      accommodationId: sample?.id ?? null,
      accommodationName: sample?.name ?? null,
      roomCount: rooms.length,
      imageCount: rooms.reduce((sum, room) => sum + (room.room_images?.length ?? 0), 0),
      rateCount: rooms.reduce((sum, room) => sum + (room.room_rates?.length ?? 0), 0),
      optionCount: sample?.booking_options?.length ?? 0,
      campaignCount: roomCampaignCount ?? 0,
      campaignError: normalizeError(roomCampaignError)
    };
  }

  const failedTables = result.tables.filter((table) => !table.ok);
  const emptyRequiredTables = result.tables.filter((table) =>
    ["accommodations", "rooms", "room_images", "room_rates", "booking_options", "youtube_campaigns"].includes(
      table.table
    ) && table.count === 0
  );

  if (failedTables.length > 0) {
    result.nextActions.push(
      `Supabase에서 접근 실패한 테이블을 확인하세요: ${failedTables.map((table) => table.table).join(", ")}`
    );
  }

  if (emptyRequiredTables.length > 0) {
    result.nextActions.push(
      `예약 화면에 필요한 기본 데이터를 입력하세요: ${emptyRequiredTables
        .map((table) => table.table)
        .join(", ")}`
    );
  }

  if (result.sample && !result.sample.ok) {
    result.nextActions.push("baebang-alps 숙소 기준 샘플 데이터가 Supabase에 있는지 확인하세요.");
  }

  result.ok =
    failedTables.length === 0 &&
    emptyRequiredTables.length === 0 &&
    Boolean(result.sample?.ok) &&
    result.sample.roomCount > 0 &&
    result.sample.imageCount > 0 &&
    result.sample.rateCount > 0;

  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}
