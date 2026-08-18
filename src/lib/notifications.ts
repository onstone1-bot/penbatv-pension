import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";

type NotificationRow = Database["public"]["Tables"]["notification_queue"]["Row"];
type NotificationInsert = Database["public"]["Tables"]["notification_queue"]["Insert"];

function makeKstDateTime(date: string, hour: number, minute = 0) {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+09:00`).toISOString();
}

function addDays(date: string, amount: number) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

function templateMessage(input: {
  type: NotificationRow["template_type"];
  guestName: string;
  stayName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
}) {
  if (input.type === "booking_confirmed") {
    return `[펜바TV] ${input.guestName}님, ${input.stayName} ${input.roomName} 예약이 접수되었습니다. 일정: ${input.checkIn}~${input.checkOut}`;
  }

  if (input.type === "checkin_guide") {
    return `[펜바TV] 내일은 ${input.stayName} 입실일입니다. 입실 15:00, 퇴실 11:00이며 객실은 ${input.roomName}입니다.`;
  }

  return `[펜바TV] ${input.stayName} 바베큐 이용 리마인드입니다. 예약하신 시간 전에 숯/그릴 준비 상태를 확인해 주세요.`;
}

export async function enqueueBookingNotifications(bookingId: string) {
  const supabase = createAdminClient();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError) throw bookingError;

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, name, accommodation_id")
    .eq("id", booking.room_id)
    .single();

  if (roomError) throw roomError;

  const { data: accommodation, error: accommodationError } = await supabase
    .from("accommodations")
    .select("id, name, address")
    .eq("id", room.accommodation_id)
    .single();

  if (accommodationError) throw accommodationError;

  const common = {
    booking_id: booking.id,
    channel: "alimtalk" as const,
    recipient_name: booking.guest_name,
    recipient_phone: booking.guest_phone,
    metadata: {
      bookingNo: booking.booking_no,
      stayName: accommodation.name,
      roomName: room.name,
      address: accommodation.address,
      source: "penbatv-week5"
    } satisfies Json
  };
  const rows: NotificationInsert[] = [
    {
      ...common,
      template_type: "booking_confirmed" as const,
      message: templateMessage({
        type: "booking_confirmed",
        guestName: booking.guest_name,
        stayName: accommodation.name,
        roomName: room.name,
        checkIn: booking.check_in,
        checkOut: booking.check_out
      }),
      scheduled_at: new Date().toISOString()
    },
    {
      ...common,
      template_type: "checkin_guide" as const,
      message: templateMessage({
        type: "checkin_guide",
        guestName: booking.guest_name,
        stayName: accommodation.name,
        roomName: room.name,
        checkIn: booking.check_in,
        checkOut: booking.check_out
      }),
      scheduled_at: makeKstDateTime(addDays(booking.check_in, -1), 18)
    },
    {
      ...common,
      template_type: "barbecue_reminder" as const,
      message: templateMessage({
        type: "barbecue_reminder",
        guestName: booking.guest_name,
        stayName: accommodation.name,
        roomName: room.name,
        checkIn: booking.check_in,
        checkOut: booking.check_out
      }),
      scheduled_at: makeKstDateTime(booking.check_in, 17, 30)
    }
  ];

  const inserted = [];

  for (const row of rows) {
    const { data, error } = await supabase
      .from("notification_queue")
      .insert(row)
      .select()
      .single();

    if (error) {
      if (String(error.message).includes("duplicate")) continue;
      throw error;
    }

    inserted.push(data);
  }

  return { queuedCount: inserted.length, notifications: inserted };
}

export async function getNotificationQueue(limit = 30) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notification_queue")
    .select("*")
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data ?? [];
}

export async function dispatchDueNotifications(limit = 20, now = new Date().toISOString()) {
  const supabase = createAdminClient();
  const { data: dueRows, error: selectError } = await supabase
    .from("notification_queue")
    .select("*")
    .eq("status", "queued")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (selectError) throw selectError;

  const ids = (dueRows ?? []).map((row) => row.id);

  if (ids.length === 0) {
    return { dispatchedCount: 0, notifications: [] };
  }

  const { data, error } = await supabase
    .from("notification_queue")
    .update({
      status: "sent",
      sent_at: now,
      metadata: {
        provider: "mock-alimtalk",
        dispatchedBy: "penbatv-week5"
      } satisfies Json
    })
    .in("id", ids)
    .select();

  if (error) throw error;

  return { dispatchedCount: data?.length ?? 0, notifications: data ?? [] };
}
