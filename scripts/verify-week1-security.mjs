import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function pass(name) {
  checks.push({ name, ok: true });
}

function fail(name, message) {
  checks.push({ name, ok: false, message });
  failures.push(`${name}: ${message}`);
}

function expectContains(name, content, needle) {
  if (content.includes(needle)) {
    pass(name);
  } else {
    fail(name, `Missing required text: ${needle}`);
  }
}

const gitignore = read(".gitignore");
expectContains("local env files are ignored", gitignore, ".env.local");
expectContains("vercel project metadata is ignored", gitignore, ".vercel/");

const envExample = read(".env.local.example");
expectContains("service role is documented as server-only", envExample, "SUPABASE_SERVICE_ROLE_KEY");
expectContains("toss secret key is documented as server-only", envExample, "TOSS_PAYMENTS_SECRET_KEY");

const envSource = read("src/lib/env.ts");
const forbiddenPublicSecrets = [
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_TOSS_PAYMENTS_SECRET_KEY",
  "NEXT_PUBLIC_STAYLINK_ADMIN_API_TOKEN"
];

for (const key of forbiddenPublicSecrets) {
  if (envSource.includes(key) || envExample.includes(key)) {
    fail(`forbidden public env ${key}`, "Sensitive server key is exposed with NEXT_PUBLIC_ prefix.");
  } else {
    pass(`forbidden public env ${key}`);
  }
}

const adminAuth = read("src/lib/admin-auth.ts");
expectContains("host api requires admin token", adminAuth, "STAYLINK_ADMIN_API_TOKEN");
expectContains("host role helper exists", adminAuth, "requireHostToken");
expectContains("operator role helper exists", adminAuth, "requireOperatorToken");

const proxy = read("src/proxy.ts");
expectContains("supabase session proxy is enabled", proxy, "updateSession");

const schema = read("supabase/schema.v1.sql");
for (const table of [
  "accommodations",
  "profiles",
  "rooms",
  "bookings",
  "payment_orders",
  "payments",
  "notification_queue"
]) {
  expectContains(`rls enabled for ${table}`, schema, `alter table public.${table} enable row level security`);
}

const migrationPath = "supabase/migrations/20260821090000_week1_security_hardening.sql";
if (existsSync(join(root, migrationPath))) {
  const migration = read(migrationPath);
  expectContains("week1 migration creates host mapping", migration, "create table if not exists public.accommodation_host_users");
  expectContains("week1 migration includes private role helper", migration, "private.current_profile_role");
  expectContains("week1 migration includes host access helper", migration, "private.can_manage_accommodation");
  expectContains("week1 migration expands public read to authenticated", migration, "to anon, authenticated");
} else {
  fail("week1 migration exists", `${migrationPath} was not found.`);
}

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.message ? ` - ${check.message}` : ""}`);
}

if (failures.length > 0) {
  console.error(`\nWeek 1 security verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(`\nWeek 1 security verification passed with ${checks.length} checks.`);
