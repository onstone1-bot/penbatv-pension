import { NextResponse } from "next/server";
import { requireOperatorToken } from "@/lib/admin-auth";
import { getAdminOperationsData } from "@/lib/admin-operations-data";

export async function GET(request: Request) {
  try {
    requireOperatorToken(request);
    const data = await getAdminOperationsData();

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown admin operations error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
