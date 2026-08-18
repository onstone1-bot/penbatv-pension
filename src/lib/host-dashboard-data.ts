import { createAdminClient } from "@/lib/supabase/admin";
import { formatWon } from "@/lib/local-quote";

function countBy<T>(items: T[], keyFn: (item: T) => string | null | undefined) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item) ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function inCurrentMonth(date: string) {
  const now = new Date();
  const value = new Date(date);

  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
}

export async function getHostDashboardData(accommodationId = "baebang-alps") {
  const supabase = createAdminClient();
  const [
    stayResult,
    roomsResult,
    bookingsResult,
    paymentOrdersResult,
    paymentsResult,
    utmEventsResult,
    videosResult
  ] = await Promise.all([
    supabase
      .from("accommodations")
      .select("id, name, area, address, concept, status")
      .eq("id", accommodationId)
      .single(),
    supabase
      .from("rooms")
      .select("id, name, status, base_price")
      .eq("accommodation_id", accommodationId)
      .order("name"),
    supabase
      .from("bookings")
      .select("id, booking_no, room_id, check_in, check_out, adult_count, child_count, guest_name, guest_phone, utm_code, status, payment_status, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("payment_orders")
      .select("order_id, room_id, booking_id, provider, status, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("payments")
      .select("booking_id, amount, status, paid_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("utm_events")
      .select("event_name, utm_code, room_id, created_at")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("youtube_campaigns")
      .select("code, title, video_url, room_id, tag, thumbnail_url, status")
      .eq("status", "active")
      .limit(20)
  ]);

  for (const result of [
    stayResult,
    roomsResult,
    bookingsResult,
    paymentOrdersResult,
    paymentsResult,
    utmEventsResult,
    videosResult
  ]) {
    if (result.error) throw result.error;
  }

  const stay = stayResult.data;

  if (!stay) {
    throw new Error(`Accommodation ${accommodationId} was not found.`);
  }

  const rooms = roomsResult.data ?? [];
  const roomIds = new Set(rooms.map((room) => room.id));
  const bookings = (bookingsResult.data ?? []).filter((booking) => roomIds.has(booking.room_id));
  const paymentOrders = (paymentOrdersResult.data ?? []).filter((order) => roomIds.has(order.room_id));
  const payments = paymentsResult.data ?? [];
  const utmEvents = (utmEventsResult.data ?? []).filter((event) => !event.room_id || roomIds.has(event.room_id));
  const videos = (videosResult.data ?? []).filter((video) => !video.room_id || roomIds.has(video.room_id));
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const paidRevenue = payments
    .filter((payment) => payment.status === "paid")
    .filter((payment) => bookings.some((booking) => booking.id === payment.booking_id))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");
  const holdBookings = bookings.filter((booking) => booking.status === "hold");
  const currentMonthBookings = bookings.filter((booking) => inCurrentMonth(booking.check_in));
  const youtubeBookings = bookings.filter((booking) => Boolean(booking.utm_code));
  const landingViews = utmEvents.filter((event) => event.event_name === "landing_view").length;

  return {
    stay,
    metrics: [
      {
        label: "이번 달 예약",
        value: `${currentMonthBookings.length}건`,
        detail: `확정 ${confirmedBookings.length} · 입금대기 ${holdBookings.length}`
      },
      {
        label: "결제 매출",
        value: formatWon(paidRevenue),
        detail: `예약 총액 ${formatWon(bookings.reduce((sum, booking) => sum + booking.total_amount, 0))}`
      },
      {
        label: "유튜브 유입",
        value: `${landingViews.toLocaleString("ko-KR")}회`,
        detail: `UTM 예약 ${youtubeBookings.length}건`
      },
      {
        label: "결제 대기",
        value: `${paymentOrders.filter((order) => order.status === "ready" || order.status === "waiting_deposit").length}건`,
        detail: "결제창/수동입금 확인 필요"
      }
    ],
    roomRows: rooms.map((room) => {
      const roomBookings = bookings.filter((booking) => booking.room_id === room.id);
      const roomRevenue = roomBookings.reduce((sum, booking) => sum + booking.total_amount, 0);
      const roomViews = utmEvents.filter((event) => event.room_id === room.id && event.event_name === "landing_view").length;

      return {
        room: room.name,
        views: roomViews,
        bookings: roomBookings.length,
        revenue: roomRevenue,
        status: room.status
      };
    }),
    reservationRows: bookings.slice(0, 12).map((booking) => ({
      id: booking.id,
      bookingNo: booking.booking_no,
      roomName: roomById.get(booking.room_id)?.name ?? booking.room_id,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      people: `성인 ${booking.adult_count} · 아동 ${booking.child_count}`,
      status: booking.status,
      paymentStatus: booking.payment_status,
      totalAmount: booking.total_amount
    })),
    statusCounts: {
      bookings: countBy(bookings, (booking) => booking.status),
      payments: countBy(payments, (payment) => payment.status),
      paymentOrders: countBy(paymentOrders, (order) => order.status)
    },
    videos: videos.slice(0, 3).map((video) => ({
      title: video.title,
      tag: video.tag,
      url: video.video_url ?? "#",
      thumbnailUrl: video.thumbnail_url
    }))
  };
}
