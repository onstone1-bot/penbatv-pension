import { NextResponse } from "next/server";
import { getRoomCalendarAvailability } from "@/lib/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ISODateString } from "@/lib/types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Unknown calendar availability error";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  const startDate = url.searchParams.get("startDate") as ISODateString | null;
  const endDate = url.searchParams.get("endDate") as ISODateString | null;

  if (!roomId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "roomId, startDate, and endDate are required." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const days = await getRoomCalendarAvailability(supabase, roomId, startDate, endDate);

    return NextResponse.json({
      roomId,
      startDate,
      endDate,
      days
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
