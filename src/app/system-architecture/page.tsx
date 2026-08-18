import Link from "next/link";

const dataGroups = [
  {
    title: "숙소/객실",
    tables: ["accommodations", "rooms", "room_images", "room_rates", "booking_options"],
    body: "고객 화면에 노출되는 숙소, 객실, 사진, 요금, 부대옵션의 기준 데이터입니다."
  },
  {
    title: "예약 엔진",
    tables: ["booking_holds", "bookings", "booking_option_items", "room_blocks"],
    body: "날짜 겹침, 결제 전 임시점유, 예약확정, 외부채널 차단일을 관리합니다."
  },
  {
    title: "영상/유입",
    tables: ["youtube_campaigns", "utm_events", "naver_links", "nearby_places"],
    body: "유튜브 링크, UTM 추적, 네이버 후기, 주변 여행 정보를 고객 화면과 연결합니다."
  },
  {
    title: "결제/정산",
    tables: ["payment_orders", "payments", "settlements"],
    body: "결제 준비, 승인 검증, 결제 결과 저장, 사장님 정산 예정금액을 분리합니다."
  }
];

const apiGroups = [
  {
    title: "예약 가능 여부",
    apis: ["GET /api/availability", "POST /api/booking-holds", "GET /api/availability/barbecue-timeslots"]
  },
  {
    title: "견적/결제",
    apis: ["POST /api/quote", "POST /api/payments/prepare", "POST /api/payments/confirm"]
  },
  {
    title: "사장님 관리",
    apis: ["POST /api/host/accommodations", "POST /api/host/rooms", "POST /api/host/youtube-campaigns"]
  },
  {
    title: "콘텐츠 관리",
    apis: ["POST /api/host/naver-links", "POST /api/host/nearby-places", "POST /api/utm-events"]
  }
];

const processSteps = [
  "고객이 유튜브 설명란에서 UTM 링크로 유입",
  "고객홈에서 객실과 일정 선택",
  "서버가 /api/availability와 /api/quote로 가능 여부와 금액 계산",
  "결제 전 /api/booking-holds로 임시 점유 생성",
  "결제 승인 후 bookings, payments, settlements에 확정 데이터 저장"
];

export default function SystemArchitecturePage() {
  return (
    <main className="ops-page">
      <section className="ops-hero system">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 1 Day 5</p>
          <h1>공통 DB/API 구조</h1>
          <p>
            고객 화면, 사장님 관리화면, 운영자 화면이 같은 예약·결제 데이터를 바라보도록 기준 테이블과 API 흐름을 정리합니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>데이터 그룹</h2>
          <span>Supabase PostgreSQL 기준</span>
        </div>
        <div className="ops-card-grid">
          {dataGroups.map((group) => (
            <article className="ops-card" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.body}</p>
              <div>
                {group.tables.map((table) => (
                  <span key={table}>{table}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>API 그룹</h2>
          <span>서버 기준 계산과 검증</span>
        </div>
        <div className="api-flow-grid">
          {apiGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              {group.apis.map((api) => (
                <code key={api}>{api}</code>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section ops-process-panel">
        <div>
          <h2>예약결제 처리 순서</h2>
          <p>
            금액과 예약 가능 여부는 브라우저가 아니라 서버 API에서 다시 계산합니다. 고객이 화면 값을 조작해도 서버 계산값을 기준으로 결제와 예약을 확정합니다.
          </p>
        </div>
        <ol>
          {processSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
