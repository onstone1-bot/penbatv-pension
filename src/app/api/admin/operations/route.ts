import { NextResponse } from "next/server";
import { logAdminOperationEvent } from "@/lib/admin-operation-events";
import { requireOperatorToken } from "@/lib/admin-auth";
import { getAdminOperationsData } from "@/lib/admin-operations-data";

export async function GET(request: Request) {
  try {
    requireOperatorToken(request);
    const data = await getAdminOperationsData();
    const operationLog = await logAdminOperationEvent(request, {
      action: "dashboard_view",
      targetType: "admin_dashboard",
      targetId: "operations",
      metadata: {
        metricCount: data.metrics.length,
        propertyCount: data.properties.length,
        reservationCount: data.reservationRows.length,
        campaignCount: data.campaignRows.length
      }
    });

    return NextResponse.json({ ...data, operationLog });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown admin operations error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
