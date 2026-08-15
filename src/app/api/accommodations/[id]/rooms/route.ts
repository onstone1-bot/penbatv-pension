import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type RoomImageRow = Database["public"]["Tables"]["room_images"]["Row"];
type RoomRateRow = Database["public"]["Tables"]["room_rates"]["Row"];
type RoomWithDetails = RoomRow & {
  room_images: Pick<RoomImageRow, "url" | "caption" | "sort_order" | "is_cover">[];
  room_rates: RoomRateRow[];
};

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rooms")
    .select("*, room_images(url, caption, sort_order, is_cover), room_rates(*)")
    .eq("accommodation_id", id)
    .eq("status", "active")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rooms = ((data ?? []) as unknown as RoomWithDetails[]).map((room) => ({
    ...room,
    room_images: [...(room.room_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    room_rates: [...(room.room_rates ?? [])].sort((a, b) => b.priority - a.priority)
  }));

  return NextResponse.json({ rooms });
}
