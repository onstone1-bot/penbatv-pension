import { createAdminClient } from "@/lib/supabase/admin";

export type CustomerReservation = {
  id: string;
  bookingNo: string;
  accommodationId: string;
  stayName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  status: string;
  paymentStatus: string;
  paymentProvider: string | null;
  totalAmount: number;
  createdAt: string;
};

function normalizePhone(value: string | null | undefined) {
  return value?.replace(/\D/g, "") ?? "";
}

export async function getCustomerReservations(input: {
  customerId?: string | null;
  guestPhone?: string | null;
  limit?: number;
} = {}) {
  const limit = input.limit ?? 10;
  const phone = normalizePhone(input.guestPhone);
  const customerId = input.customerId ?? null;
  const supabase = createAdminClient();

  let bookingQuery = supabase
    .from("bookings")
    .select(
      "id, booking_no, room_id, customer_id, check_in, check_out, adult_count, child_count, guest_name, guest_phone, status, payment_status, total_amount, created_at"
    )
    .order("created_at", { ascending: false });

  if (customerId) {
    bookingQuery = bookingQuery.eq("customer_id", customerId);
  }

  const { data: bookings, error: bookingError } = await bookingQuery.limit(phone && !customerId ? 50 : limit);

  if (bookingError) throw bookingError;

  const filteredBookings = phone && !customerId
    ? (bookings ?? []).filter((booking) => normalizePhone(booking.guest_phone) === phone).slice(0, limit)
    : (bookings ?? []);
  const roomIds = [...new Set(filteredBookings.map((booking) => booking.room_id))];

  if (filteredBookings.length === 0 || roomIds.length === 0) {
    return {
      source: "supabase" as const,
      reservations: [] as CustomerReservation[]
    };
  }

  const [{ data: rooms, error: roomError }, { data: payments, error: paymentError }] =
    await Promise.all([
      supabase.from("rooms").select("id, name, accommodation_id").in("id", roomIds),
      supabase
        .from("payments")
        .select("booking_id, provider, status, amount, paid_at, created_at")
        .in("booking_id", filteredBookings.map((booking) => booking.id))
        .order("created_at", { ascending: false })
    ]);

  if (roomError) throw roomError;
  if (paymentError) throw paymentError;

  const accommodationIds = [...new Set((rooms ?? []).map((room) => room.accommodation_id))];
  const { data: accommodations, error: accommodationError } =
    accommodationIds.length > 0
      ? await supabase.from("accommodations").select("id, name").in("id", accommodationIds)
      : { data: [], error: null };

  if (accommodationError) throw accommodationError;

  const roomById = new Map((rooms ?? []).map((room) => [room.id, room]));
  const accommodationById = new Map((accommodations ?? []).map((stay) => [stay.id, stay]));
  const latestPaymentByBookingId = new Map(
    (payments ?? []).map((payment) => [payment.booking_id, payment])
  );

  return {
    source: "supabase" as const,
    reservations: filteredBookings.map((booking) => {
      const room = roomById.get(booking.room_id);
      const accommodation = room ? accommodationById.get(room.accommodation_id) : null;
      const payment = latestPaymentByBookingId.get(booking.id);

      return {
        id: booking.id,
        bookingNo: booking.booking_no,
        accommodationId: room?.accommodation_id ?? "baebang-alps",
        stayName: accommodation?.name ?? "숙소 정보 확인 필요",
        roomName: room?.name ?? "객실 정보 확인 필요",
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        guestName: booking.guest_name,
        guestPhone: booking.guest_phone,
        status: booking.status,
        paymentStatus: booking.payment_status,
        paymentProvider: payment?.provider ?? null,
        totalAmount: booking.total_amount,
        createdAt: booking.created_at
      };
    })
  };
}
