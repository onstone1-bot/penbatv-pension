export type FeatureStatus = "implemented" | "mvp" | "planned";
export type BarbecueSlotStatus = "available" | "reserved" | "blocked";
export type NotificationTrigger = "booking_confirmed" | "checkin_guide" | "barbecue_reminder";

export const coreFeatureModules: Array<{
  title: string;
  status: FeatureStatus;
  summary: string;
  requirements: string[];
  implementation: string[];
}> = [
  {
    title: "실시간 예약 엔진",
    status: "mvp",
    summary: "날짜별, 객실별, 바베큐장 타임슬롯별 중복 예약을 차단합니다.",
    requirements: [
      "객실 예약은 bookings, booking_holds, room_blocks 범위 겹침으로 확인",
      "바베큐장은 날짜 + 시간대 + 슬롯 단위로 확인",
      "외부 채널 iCal 예약은 room_blocks로 가져와 고객 예약 가능 여부에 반영"
    ],
    implementation: [
      "GET /api/availability",
      "POST /api/booking-holds",
      "GET /api/availability/barbecue-timeslots"
    ]
  },
  {
    title: "결제 연동",
    status: "mvp",
    summary: "신용카드, 간편결제, 가상계좌와 현금영수증 발행 흐름을 분리해 관리합니다.",
    requirements: [
      "카드/간편결제는 Toss 결제창 또는 SDK로 결제 요청",
      "결제 승인 이후 payment_orders, payments에 결과 저장",
      "현금성 결제는 현금영수증 타입과 식별번호를 주문에 저장"
    ],
    implementation: [
      "POST /api/payments/prepare",
      "POST /api/payments/confirm",
      "cashReceipt issue payload placeholder"
    ]
  },
  {
    title: "관리자 페이지",
    status: "mvp",
    summary: "예약 현황, 매출 관리, 고객 통계를 운영자가 한 화면에서 확인합니다.",
    requirements: [
      "예약 요청/확정/취소 상태 조회",
      "일매출, 결제대기, 환불, 정산 예정금액 확인",
      "유튜브 캠페인별 유입 고객과 예약 전환율 확인"
    ],
    implementation: [
      "/host/rooms",
      "/host/properties",
      "/host/core-features"
    ]
  },
  {
    title: "알림 기능",
    status: "planned",
    summary: "예약 완료, 입실 안내, 바베큐장 이용 시간 카카오 알림톡을 템플릿 기반으로 발송합니다.",
    requirements: [
      "예약 완료 즉시 알림",
      "입실 전날 또는 당일 입실 안내",
      "바베큐장 이용 30분 전 리마인드",
      "실패 시 SMS 또는 수동 발송 대기열로 전환"
    ],
    implementation: [
      "notification_templates",
      "notification_queue",
      "Kakao AlimTalk provider adapter"
    ]
  }
];

export const barbecueSlots: Array<{
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  status: BarbecueSlotStatus;
  bookingNo?: string;
}> = [
  {
    id: "bbq-20260820-1800",
    date: "2026-08-20",
    startTime: "18:00",
    endTime: "20:00",
    label: "1부 저녁 바베큐",
    status: "reserved",
    bookingNo: "STAY-20260815-0001"
  },
  {
    id: "bbq-20260820-2030",
    date: "2026-08-20",
    startTime: "20:30",
    endTime: "22:30",
    label: "2부 야간 바베큐",
    status: "available"
  },
  {
    id: "bbq-20260821-1800",
    date: "2026-08-21",
    startTime: "18:00",
    endTime: "20:00",
    label: "1부 저녁 바베큐",
    status: "blocked"
  }
];

export const adminMetrics = [
  { label: "오늘 예약", value: "12건", detail: "요청 4 · 확정 8" },
  { label: "오늘 결제", value: "3,420,000원", detail: "카드 62% · 간편결제 31%" },
  { label: "전환율", value: "8.4%", detail: "유튜브 유입 기준" },
  { label: "알림 대기", value: "9건", detail: "입실 안내 6 · 바베큐 3" }
];

export const customerStats = [
  { label: "가족/단체", value: "54%" },
  { label: "커플", value: "28%" },
  { label: "친구 모임", value: "18%" }
];

export const notificationTemplates: Array<{
  trigger: NotificationTrigger;
  title: string;
  sendTiming: string;
  body: string;
}> = [
  {
    trigger: "booking_confirmed",
    title: "예약 완료",
    sendTiming: "결제 승인 또는 운영자 확정 즉시",
    body: "#{고객명}님, #{숙소명} 예약이 완료되었습니다. 체크인 #{체크인일}입니다."
  },
  {
    trigger: "checkin_guide",
    title: "입실 안내",
    sendTiming: "입실 전날 18:00",
    body: "#{고객명}님, 내일 입실 안내입니다. 주소, 주차, 비밀번호, 입실 시간을 확인해주세요."
  },
  {
    trigger: "barbecue_reminder",
    title: "바베큐장 이용 시간",
    sendTiming: "이용 30분 전",
    body: "#{고객명}님, 바베큐장 #{타임슬롯} 이용 시간이 곧 시작됩니다."
  }
];

export function checkBarbecueSlotAvailability(date: string, startTime: string, endTime: string) {
  const conflict = barbecueSlots.find(
    (slot) =>
      slot.date === date &&
      slot.startTime < endTime &&
      slot.endTime > startTime &&
      slot.status !== "available"
  );

  return {
    date,
    startTime,
    endTime,
    available: !conflict,
    blockedReason: conflict?.status ?? null,
    conflict: conflict ?? null
  };
}
