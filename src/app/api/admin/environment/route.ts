import { NextResponse } from "next/server";
import { requireOperatorToken } from "@/lib/admin-auth";
import { getServerEnv } from "@/lib/env";

const runtimeKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STAYLINK_ADMIN_API_TOKEN",
  "TOSS_PAYMENTS_CLIENT_KEY",
  "TOSS_PAYMENTS_SECRET_KEY"
];

export async function GET(request: Request) {
  try {
    requireOperatorToken(request);
    getServerEnv();

    return NextResponse.json({
      environment: runtimeKeys.map((key) => ({
        key,
        present: Boolean(process.env[key]),
        secret: !key.startsWith("NEXT_PUBLIC_")
      })),
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown environment check error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
