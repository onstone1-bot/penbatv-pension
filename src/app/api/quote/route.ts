import { NextResponse } from "next/server";
import { getRoomQuote } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";
import type { ISODateString } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  const checkIn = url.searchParams.get("checkIn") as ISODateString | null;
  const checkOut = url.searchParams.get("checkOut") as ISODateString | null;

  if (!roomId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "roomId, checkIn, and checkOut are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    const quote = await getRoomQuote(supabase, roomId, checkIn, checkOut);
    return NextResponse.json({ quote });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown quote error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
