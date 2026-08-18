import { createAdminClient } from "@/lib/supabase/admin";

type StatusCount = Record<string, number>;

function countBy<T>(items: T[], keyFn: (item: T) => string | null | undefined): StatusCount {
  return items.reduce<StatusCount>((acc, item) => {
    const key = keyFn(item) ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function percent(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export async function getAdminOperationsData() {
  const supabase = createAdminClient();
  const [
    accommodationsResult,
    roomsResult,
    bookingsResult,
    paymentOrdersResult,
    paymentsResult,
    settlementsResult,
    utmEventsResult,
    profilesResult,
    notificationsResult,
    calendarSourcesResult,
    pilotRunsResult
  ] = await Promise.all([
    supabase
      .from("accommodations")
      .select("id, name, area, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("rooms").select("id, accommodation_id, name, status"),
    supabase
      .from("bookings")
      .select("id, booking_no, room_id, check_in, check_out, guest_name, guest_phone, utm_code, status, payment_status, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("payment_orders")
      .select("order_id, room_id, booking_id, provider, mode, amount, option_amount, discount_amount, status, expires_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("payments")
      .select("booking_id, provider, amount, status, paid_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("settlements").select("gross_amount, pg_fee, platform_fee, payout_amount, status, payout_due_date"),
    supabase
      .from("utm_events")
      .select("event_name, utm_code, room_id, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("profiles")
      .select("id, role, provider, status, created_at, last_sign_in_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("notification_queue")
      .select("id, status, template_type, scheduled_at")
      .order("scheduled_at", { ascending: true })
      .limit(100),
    supabase
      .from("calendar_sync_sources")
      .select("id, room_id, provider, status, last_synced_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("pilot_runs")
      .select("id, accommodation_id, status, opened_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  for (const result of [
    accommodationsResult,
    roomsResult,
    bookingsResult,
    paymentOrdersResult,
    paymentsResult,
    settlementsResult,
    utmEventsResult,
    profilesResult,
    notificationsResult,
    calendarSourcesResult,
    pilotRunsResult
  ]) {
    if (result.error) throw result.error;
  }

  const accommodations = accommodationsResult.data ?? [];
  const rooms = roomsResult.data ?? [];
  const bookings = bookingsResult.data ?? [];
  const paymentOrders = paymentOrdersResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const settlements = settlementsResult.data ?? [];
  const utmEvents = utmEventsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const notifications = notificationsResult.data ?? [];
  const calendarSources = calendarSourcesResult.data ?? [];
  const pilotRuns = pilotRunsResult.data ?? [];
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const accommodationById = new Map(accommodations.map((stay) => [stay.id, stay]));
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");
  const waitingDepositOrders = paymentOrders.filter((order) => order.status === "waiting_deposit");
  const readyOrders = paymentOrders.filter((order) => order.status === "ready");
  const failedOrders = paymentOrders.filter((order) => order.status === "failed" || order.status === "cancelled");
  const bookingRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.total_amount, 0);
  const paidRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayoutAmount =
    settlements.length > 0
      ? settlements
          .filter((settlement) => settlement.status === "scheduled" || settlement.status === "held")
          .reduce((sum, settlement) => sum + settlement.payout_amount, 0)
      : Math.max(0, Math.round(paidRevenue * 0.9));
  const landingViews = utmEvents.filter((event) => event.event_name === "landing_view").length;
  const paymentStarts = utmEvents.filter((event) => event.event_name === "payment_started").length;
  const paymentCompleted = utmEvents.filter((event) => event.event_name === "payment_completed").length;
  const utmCodes = Array.from(
    new Set(
      [...utmEvents.map((event) => event.utm_code), ...bookings.map((booking) => booking.utm_code)].filter(
        (utmCode): utmCode is string => Boolean(utmCode)
      )
    )
  );

  return {
    metrics: [
      {
        label: "전체 예약",
        value: `${bookings.length}건`,
        detail: `확정 ${confirmedBookings.length} · 입금대기 ${bookings.filter((booking) => booking.status === "hold").length}`
      },
      {
        label: "결제 매출",
        value: `${paidRevenue.toLocaleString("ko-KR")}원`,
        detail: `예약 확정액 ${bookingRevenue.toLocaleString("ko-KR")}원`
      },
      {
        label: "정산 예정",
        value: `${pendingPayoutAmount.toLocaleString("ko-KR")}원`,
        detail: settlements.length > 0 ? `정산 ${settlements.length}건 기준` : "결제액 90% 임시 계산"
      },
      {
        label: "유튜브 전환율",
        value: `${percent(paymentCompleted || confirmedBookings.length, landingViews)}%`,
        detail: `방문 ${landingViews} · 결제시작 ${paymentStarts}`
      },
      {
        label: "회원 계정",
        value: `${profiles.length}명`,
        detail: `고객 ${profiles.filter((profile) => profile.role === "customer").length} · 사장님 ${profiles.filter((profile) => profile.role === "host").length} · 운영자 ${profiles.filter((profile) => profile.role === "operator").length}`
      }
    ],
    operationQueues: [
      { label: "입점 승인 대기", count: accommodations.filter((stay) => stay.status !== "active").length, owner: "운영자" },
      { label: "결제 검증 필요", count: readyOrders.length, owner: "정산 담당" },
      { label: "수동입금 확인", count: waitingDepositOrders.length, owner: "CS/운영" },
      { label: "실패/취소 확인", count: failedOrders.length, owner: "고객 안내" },
      { label: "알림 발송 대기", count: notifications.filter((row) => row.status === "queued").length, owner: "알림/CS" },
      { label: "외부달력 점검", count: calendarSources.filter((row) => row.status !== "active").length, owner: "사장님/운영" },
      { label: "파일럿 오픈 점검", count: pilotRuns.filter((row) => row.status !== "open").length, owner: "운영자" }
    ],
    properties: accommodations.map((stay) => ({
      id: stay.id,
      name: stay.name,
      area: stay.area,
      status: stay.status,
      roomCount: rooms.filter((room) => room.accommodation_id === stay.id).length,
      createdAt: stay.created_at
    })),
    memberRows: profiles.slice(0, 12).map((profile) => ({
      id: profile.id,
      role: profile.role,
      provider: profile.provider ?? "manual",
      status: profile.status,
      joinedAt: profile.created_at,
      lastSignInAt: profile.last_sign_in_at
    })),
    roleRows: [
      {
        role: "customer",
        screen: "고객홈 / MY",
        apiScope: "내 예약 조회, 프로필 수정",
        protection: "Supabase Auth + profiles.customer_id"
      },
      {
        role: "host",
        screen: "사장님 관리방",
        apiScope: "본인 숙소 등록, 객실/사진/영상/옵션 관리",
        protection: "x-admin-token + x-penbatv-role=host"
      },
      {
        role: "operator",
        screen: "운영자 관리방",
        apiScope: "입점 승인, 전체 예약/결제/정산/UTM 집계",
        protection: "x-admin-token + x-penbatv-role=operator"
      }
    ],
    reservationRows: bookings.slice(0, 10).map((booking) => {
      const room = roomById.get(booking.room_id);
      const stay = room ? accommodationById.get(room.accommodation_id) : null;

      return {
        bookingNo: booking.booking_no,
        stayName: stay?.name ?? "숙소 확인 필요",
        roomName: room?.name ?? booking.room_id,
        guestName: booking.guest_name,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        status: booking.status,
        paymentStatus: booking.payment_status,
        amount: booking.total_amount
      };
    }),
    settlementRows: paymentOrders.slice(0, 10).map((order) => ({
      orderId: order.order_id,
      provider: order.provider,
      status: order.status,
      amount: order.amount,
      payoutEstimate: Math.max(0, Math.round(order.amount * 0.9)),
      createdAt: order.created_at
    })),
    campaignRows: utmCodes.slice(0, 10).map((utmCode) => {
      const visits = utmEvents.filter((event) => event.utm_code === utmCode && event.event_name === "landing_view").length;
      const starts = utmEvents.filter((event) => event.utm_code === utmCode && event.event_name === "payment_started").length;
      const bookedRows = bookings.filter((booking) => booking.utm_code === utmCode);
      const revenue = bookedRows.reduce((sum, booking) => sum + booking.total_amount, 0);

      return {
        campaign: utmCode,
        visits,
        starts,
        bookings: bookedRows.length,
        conversionRate: percent(bookedRows.length, visits),
        revenue
      };
    }),
    statusCounts: {
      profiles: countBy(profiles, (profile) => profile.role),
      accommodations: countBy(accommodations, (stay) => stay.status),
      bookings: countBy(bookings, (booking) => booking.status),
      paymentOrders: countBy(paymentOrders, (order) => order.status),
      payments: countBy(payments, (payment) => payment.status),
      notifications: countBy(notifications, (notification) => notification.status),
      calendarSync: countBy(calendarSources, (source) => source.status),
      pilotRuns: countBy(pilotRuns, (run) => run.status)
    },
    week4QaRows: [
      { day: "22일차", title: "고객 회원가입/로그인", status: "연결됨", evidence: "네이버/카카오 OAuth 후 profiles 자동 저장" },
      { day: "23일차", title: "사장님/운영자 권한 분리", status: "강화됨", evidence: "관리 API role header 필수" },
      { day: "24일차", title: "운영자 입점 승인", status: "연결됨", evidence: "/api/admin/accommodations/[id]/approval" },
      { day: "25일차", title: "전체 예약 현황", status: "집계됨", evidence: "bookings 최근 예약 테이블" },
      { day: "26일차", title: "결제/정산 예정금액", status: "집계됨", evidence: "payment_orders, payments, settlements" },
      { day: "27일차", title: "유튜브 UTM 전환", status: "집계됨", evidence: "utm_events + bookings.utm_code" },
      { day: "28일차", title: "관리자 QA", status: "점검중", evidence: "권한, 승인, 집계, 상태 카운트 검증" }
    ]
  };
}
