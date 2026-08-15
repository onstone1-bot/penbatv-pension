export const techStack = [
  {
    title: "Frontend",
    name: "Next.js App Router",
    body: "지역 펜션 SEO, 동적 상세 페이지, 유튜브 유입 랜딩을 같은 구조로 운영합니다.",
    tags: ["SSR", "Dynamic Routing", "SEO"]
  },
  {
    title: "UI",
    name: "CSS + Tailwind 전환 가능",
    body: "현재는 전역 CSS로 빠르게 구현하고, 디자인 시스템이 안정되면 Tailwind 토큰으로 이전합니다.",
    tags: ["Responsive", "Shorts Feed", "Mobile First"]
  },
  {
    title: "Backend & DB",
    name: "Supabase PostgreSQL",
    body: "예약 가능 여부, 객실 요금, 광고 캠페인, 정산 데이터를 관계형 구조로 안전하게 관리합니다.",
    tags: ["PostgreSQL", "RLS", "Admin API"]
  },
  {
    title: "Payments",
    name: "Toss Payments",
    body: "결제 승인과 정산/지급대행을 분리해 구현하고, 사장님 정산은 별도 계약/보안 요건을 반영합니다.",
    tags: ["Payment Window", "Webhook", "Payout"]
  }
];

export const coreArchitecture = [
  {
    title: "펜션 등록",
    body: "사장님이 숙소 기본 정보, 유튜브 링크, 광고 상품, 예약 방식을 입력하면 플랫폼 공통 포맷으로 저장합니다."
  },
  {
    title: "상세 페이지 자동 업데이트",
    body: "등록된 slug를 기준으로 `/stays/[id]` 상세 템플릿에 영상, 객실, 달력, 예약 방식을 자동 바인딩합니다."
  },
  {
    title: "예약/결제",
    body: "예약요청은 운영자 확인형으로, 바로결제는 예약 가능 여부 확인 후 결제 준비/승인 API로 연결합니다."
  },
  {
    title: "정산",
    body: "결제 데이터와 사장님 정산 규칙을 분리하고, 추후 Toss 지급대행 셀러 등록/지급 요청으로 확장합니다."
  }
];

export const contentActionPlan = [
  {
    phase: "1단계",
    title: "포트폴리오용 무료 촬영",
    content: "천안 광덕산 계곡, 아산 송악면 저수지 인근 가족/단체 독채 펜션 2~3곳을 우선 섭외합니다.",
    product: "입점 초안 등록, 유튜브 링크 필드, 영상 배너 템플릿을 먼저 안정화합니다."
  },
  {
    phase: "2단계",
    title: "영상 업로드 및 커뮤니티 빌딩",
    content: "롱폼과 쇼츠를 나누어 업로드하고 고정 댓글로 펜바TV 예약 오픈 예정 링크를 안내합니다.",
    product: "숏폼 피드, UTM 추적, 숙소별 전환 예약 데이터를 확인합니다."
  },
  {
    phase: "3단계",
    title: "플랫폼 오픈",
    content: "확보한 영상을 입점 펜션 상세 페이지에 바인딩하고 예약 링크를 유튜브 설명/댓글에 연결합니다.",
    product: "예약요청, 바로결제, 운영자 예약함, 정산 대사 화면을 순차 오픈합니다."
  }
];

export const launchTimeline = [
  {
    period: "현재~1개월차",
    contentTeam: "천안·아산 힐링 펜션 3곳 섭외 및 무료 촬영/편집",
    productTeam: "DB 구조 설계, 예약 가능 여부, Toss 결제/정산 분리 설계"
  },
  {
    period: "2~3개월차",
    contentTeam: "유튜브 영상 순차 업로드 및 지역 타깃 홍보",
    productTeam: "파트너 등록 폼, 자동 상세 템플릿, 관리자 예약함 완성"
  },
  {
    period: "오픈 시점",
    contentTeam: "고정 댓글/설명란에 펜바TV 예약 링크 연결",
    productTeam: "웹앱 정식 오픈, 예약요청/바로결제/정산 검증 시작"
  }
];
