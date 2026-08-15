import { NextResponse } from "next/server";
import { getAvailableRooms, getRoomAvailability } from "@/lib/availability";
import { createClient } from "@/lib/supabase/server";
import type { ISODateString } from "@/lib/types";

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
    const supabase = await createClient();

    if (roomId) {
      const availability = await getRoomAvailability(supabase, roomId, checkIn, checkOut);
      return NextResponse.json({ availability });
    }

    const rooms = await getAvailableRooms(supabase, accommodationId!, checkIn, checkOut);
    return NextResponse.json({ rooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown availability error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
