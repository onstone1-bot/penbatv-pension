export const reservationPaymentMetrics = [
  { label: "오늘 예약접수", value: "12건", detail: "유튜브 유입 8건" },
  { label: "결제대기", value: "4건", detail: "총 1,080,000원" },
  { label: "결제완료", value: "7건", detail: "카드 5 · 간편결제 2" },
  { label: "정산예정", value: "2,430,000원", detail: "수수료 차감 전" }
];

export const reservationPaymentStages = [
  {
    step: "01",
    title: "예약 가능 여부 확인",
    body: "객실 예약, 예약 홀드, 방막기, 바베큐 타임슬롯을 동시에 확인해 중복 예약을 막습니다.",
    api: "GET /api/availability"
  },
  {
    step: "02",
    title: "예약 15분 선점",
    body: "바로결제 고객은 결제 전 객실 재고를 15분간 잠금 처리해 다른 고객과 충돌하지 않게 합니다.",
    api: "POST /api/booking-holds"
  },
  {
    step: "03",
    title: "결제 준비",
    body: "카드, 간편결제, 가상계좌, 현금영수증 정보를 받아 결제 주문을 생성합니다.",
    api: "POST /api/payments/prepare"
  },
  {
    step: "04",
    title: "결제 승인 및 예약확정",
    body: "결제 성공 redirect 또는 승인 API 결과를 예약, 결제, 알림톡 발송 상태로 연결합니다.",
    api: "POST /api/payments/confirm"
  }
];

export const reservationPaymentRows = [
  {
    bookingNo: "PB-20260822-001",
    guest: "김민지",
    room: "독채펜션 A",
    date: "2026-08-22 - 2026-08-24",
    option: "바베큐 18:00",
    channel: "YouTube Shorts",
    amount: 270000,
    status: "결제대기",
    nextAction: "결제 링크 재발송"
  },
  {
    bookingNo: "PB-20260822-002",
    guest: "박성훈",
    room: "글램핑 B",
    date: "2026-08-28 - 2026-08-29",
    option: "숯불세트",
    channel: "펜바TV 상세",
    amount: 210000,
    status: "결제완료",
    nextAction: "예약 완료 알림톡"
  },
  {
    bookingNo: "PB-20260823-003",
    guest: "이서연",
    room: "독채펜션 A",
    date: "2026-09-05 - 2026-09-07",
    option: "바베큐 19:00",
    channel: "네이버 검색",
    amount: 620000,
    status: "운영자확인",
    nextAction: "객실 가능 여부 확인"
  }
];

export const paymentMethodCards = [
  {
    title: "신용카드",
    body: "토스페이먼츠 결제창 또는 SDK로 카드 결제를 요청하고 승인 결과를 저장합니다.",
    status: "MVP 연결"
  },
  {
    title: "간편결제",
    body: "토스페이, 네이버페이 등 간편결제 수단을 결제 준비 단계에서 선택하게 합니다.",
    status: "확장 예정"
  },
  {
    title: "가상계좌",
    body: "예약요청형 고객에게 입금기한이 있는 가상계좌 결제 링크를 발송합니다.",
    status: "운영 옵션"
  },
  {
    title: "현금영수증",
    body: "현금성 결제의 개인/사업자 발행 정보를 주문에 저장한 뒤 발행 API로 확장합니다.",
    status: "필수"
  }
];

export const settlementPreviewRows = [
  { label: "총 결제금액", amount: 2430000 },
  { label: "플랫폼 수수료 8%", amount: -194400 },
  { label: "결제 수수료 예상", amount: -70470 },
  { label: "사장님 정산예정", amount: 2165130 }
];
