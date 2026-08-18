import { NextResponse } from "next/server";
import { requireOperatorToken } from "@/lib/admin-auth";
import { getServerEnv } from "@/lib/env";

const runtimeKeys: Array<{
  key: string;
  requiredFor: "public" | "server" | "payment" | "launch";
  required: boolean;
}> = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", requiredFor: "public", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", requiredFor: "public", required: true },
  { key: "NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID", requiredFor: "public", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", requiredFor: "server", required: true },
  { key: "STAYLINK_ADMIN_API_TOKEN", requiredFor: "server", required: true },
  { key: "TOSS_PAYMENTS_CLIENT_KEY", requiredFor: "payment", required: false },
  { key: "TOSS_PAYMENTS_SECRET_KEY", requiredFor: "payment", required: false },
  { key: "PENBATV_BANK_NAME", requiredFor: "launch", required: false },
  { key: "PENBATV_BANK_ACCOUNT_NO", requiredFor: "launch", required: false },
  { key: "PENBATV_BANK_HOLDER_NAME", requiredFor: "launch", required: false }
];

export async function GET(request: Request) {
  try {
    requireOperatorToken(request);
    getServerEnv();

    return NextResponse.json({
      environment: runtimeKeys.map((item) => ({
        ...item,
        present: Boolean(process.env[item.key]),
        secret: !item.key.startsWith("NEXT_PUBLIC_")
      })),
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown environment check error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
