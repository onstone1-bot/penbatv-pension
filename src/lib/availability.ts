import type { SupabaseClient } from "@supabase/supabase-js";
import type { AvailabilityReason, AvailabilityResult, ISODateString } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";
import { assertValidDateRange, rangesOverlap } from "@/lib/date";

type Client = SupabaseClient<Database>;

async function hasOverlappingRows(
  supabase: Client,
  table: "bookings" | "booking_holds" | "room_blocks",
  roomId: string,
  checkIn: string,
  checkOut: string
) {
  let query = supabase
    .from(table)
    .select("id")
    .eq("room_id", roomId)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);

  if (table === "bookings") {
    query = query.in("status", ["hold", "confirmed"]);
  }

  if (table === "booking_holds") {
    query = query.gt("expires_at", new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return Boolean(data?.length);
}

function isDateRangeConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23P01"
  );
}

export async function getRoomAvailability(
  supabase: Client,
  roomId: string,
  checkIn: ISODateString,
  checkOut: ISODateString
): Promise<AvailabilityResult> {
  assertValidDateRange(checkIn, checkOut);

  const checks: Array<[AvailabilityReason, "bookings" | "booking_holds" | "room_blocks"]> = [
    ["confirmed_booking", "bookings"],
    ["active_hold", "booking_holds"],
    ["room_block", "room_blocks"]
  ];

  for (const [reason, table] of checks) {
    if (await hasOverlappingRows(supabase, table, roomId, checkIn, checkOut)) {
      return { roomId, checkIn, checkOut, available: false, blockedReason: reason };
    }
  }

  return { roomId, checkIn, checkOut, available: true, blockedReason: null };
}

export async function getAvailableRooms(
  supabase: Client,
  accommodationId: string,
  checkIn: ISODateString,
  checkOut: ISODateString
) {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("id")
    .eq("accommodation_id", accommodationId)
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return Promise.all(
    (rooms ?? []).map((room) => getRoomAvailability(supabase, room.id, checkIn, checkOut))
  );
}

export async function createBookingHold(
  supabase: Client,
  input: {
    roomId: string;
    checkIn: ISODateString;
    checkOut: ISODateString;
    utmCode?: string | null;
    holdMinutes?: number;
  }
) {
  await expireBookingHolds(supabase);

  const availability = await getRoomAvailability(
    supabase,
    input.roomId,
    input.checkIn,
    input.checkOut
  );

  if (!availability.available) {
    return { hold: null, availability };
  }

  const expiresAt = new Date(Date.now() + (input.holdMinutes ?? 15) * 60_000).toISOString();
  const { data, error } = await supabase
    .from("booking_holds")
    .insert({
      room_id: input.roomId,
      check_in: input.checkIn,
      check_out: input.checkOut,
      utm_code: input.utmCode ?? null,
      expires_at: expiresAt
    })
    .select()
    .single();

  if (error) {
    if (isDateRangeConflict(error)) {
      return {
        hold: null,
        availability: {
          roomId: input.roomId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          available: false,
          blockedReason: "active_hold"
        } satisfies AvailabilityResult
      };
    }

    throw error;
  }

  return { hold: data, availability };
}

export async function expireBookingHolds(supabase: Client) {
  const { data, error } = await supabase
    .from("booking_holds")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    throw error;
  }

  return { expiredCount: data?.length ?? 0 };
}

export { rangesOverlap };
