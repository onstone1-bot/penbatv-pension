import type { SupabaseClient } from "@supabase/supabase-js";
import type { AvailabilityReason, AvailabilityResult, ISODateString } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";
import { assertValidDateRange, enumerateNights, rangesOverlap } from "@/lib/date";

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

export async function getRoomCalendarAvailability(
  supabase: Client,
  roomId: string,
  startDate: ISODateString,
  endDate: ISODateString
) {
  assertValidDateRange(startDate, endDate);
  await expireBookingHolds(supabase);

  const [bookingsResult, holdsResult, blocksResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, check_in, check_out")
      .eq("room_id", roomId)
      .in("status", ["hold", "confirmed"])
      .lt("check_in", endDate)
      .gt("check_out", startDate),
    supabase
      .from("booking_holds")
      .select("id, check_in, check_out")
      .eq("room_id", roomId)
      .gt("expires_at", new Date().toISOString())
      .lt("check_in", endDate)
      .gt("check_out", startDate),
    supabase
      .from("room_blocks")
      .select("id, check_in, check_out")
      .eq("room_id", roomId)
      .lt("check_in", endDate)
      .gt("check_out", startDate)
  ]);

  if (bookingsResult.error) throw bookingsResult.error;
  if (holdsResult.error) throw holdsResult.error;
  if (blocksResult.error) throw blocksResult.error;

  const blockedRanges: Array<{
    checkIn: string;
    checkOut: string;
    reason: AvailabilityReason;
  }> = [
    ...(bookingsResult.data ?? []).map((row) => ({
      checkIn: row.check_in,
      checkOut: row.check_out,
      reason: "confirmed_booking" as const
    })),
    ...(holdsResult.data ?? []).map((row) => ({
      checkIn: row.check_in,
      checkOut: row.check_out,
      reason: "active_hold" as const
    })),
    ...(blocksResult.data ?? []).map((row) => ({
      checkIn: row.check_in,
      checkOut: row.check_out,
      reason: "room_block" as const
    }))
  ];

  return enumerateNights(startDate, endDate).map((date) => {
    const nextDate = new Date(`${date}T00:00:00.000Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const checkOut = nextDate.toISOString().slice(0, 10);
    const conflict = blockedRanges.find((range) =>
      rangesOverlap(date, checkOut, range.checkIn, range.checkOut)
    );

    return {
      date,
      roomId,
      available: !conflict,
      blockedReason: conflict?.reason ?? null
    };
  });
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

export async function getActiveBookingHold(
  supabase: Client,
  input: {
    holdId: string;
    roomId: string;
    checkIn: ISODateString;
    checkOut: ISODateString;
  }
) {
  await expireBookingHolds(supabase);

  const { data, error } = await supabase
    .from("booking_holds")
    .select("id, room_id, check_in, check_out, expires_at")
    .eq("id", input.holdId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      valid: false as const,
      reason: "missing_or_expired"
    };
  }

  if (new Date(data.expires_at).getTime() <= Date.now()) {
    await expireBookingHolds(supabase);

    return {
      valid: false as const,
      reason: "missing_or_expired"
    };
  }

  const matchesSelection =
    data.room_id === input.roomId &&
    data.check_in === input.checkIn &&
    data.check_out === input.checkOut;

  if (!matchesSelection) {
    return {
      valid: false as const,
      reason: "selection_mismatch"
    };
  }

  return {
    valid: true as const,
    hold: data
  };
}

export async function expireBookingHolds(supabase: Client) {
  const { data: referencedOrders, error: referencedError } = await supabase
    .from("payment_orders")
    .select("hold_id")
    .not("hold_id", "is", null);

  if (referencedError) {
    throw referencedError;
  }

  const referencedHoldIds = [
    ...new Set((referencedOrders ?? []).map((order) => order.hold_id).filter(Boolean))
  ];
  let query = supabase
    .from("booking_holds")
    .delete()
    .lt("expires_at", new Date().toISOString());

  if (referencedHoldIds.length > 0) {
    query = query.not("id", "in", `(${referencedHoldIds.join(",")})`);
  }

  const { data, error } = await query.select("id");

  if (error) {
    throw error;
  }

  return { expiredCount: data?.length ?? 0 };
}

export { rangesOverlap };
