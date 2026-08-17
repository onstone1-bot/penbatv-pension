import { NextResponse } from "next/server";
import { getAvailableRooms, getRoomAvailability } from "@/lib/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ISODateString } from "@/lib/types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Unknown availability error";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  const accommodationId = url.searchParams.get("accommodationId");
  const checkIn = url.searchParams.get("checkIn") as ISODateString | null;
  const checkOut = url.searchParams.get("checkOut") as ISODateString | null;

  if (!checkIn || !checkOut || (!roomId && !accommodationId)) {
    return NextResponse.json(
      { error: "roomId or accommodationId, checkIn, and checkOut are required." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    if (roomId) {
      const availability = await getRoomAvailability(supabase, roomId, checkIn, checkOut);
      return NextResponse.json({ availability });
    }

    const rooms = await getAvailableRooms(supabase, accommodationId!, checkIn, checkOut);
    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
