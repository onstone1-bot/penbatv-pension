import Link from "next/link";
import { barbecueSlots } from "@/lib/core-features";

const reservationMetrics = [
  { label: "선택 가능 객실", value: "2개", detail: "중복 예약 제외" },
  { label: "예약 홀드", value: "10분", detail: "결제 전 임시 점유" },
  { label: "막힌 날짜", value: "4일", detail: "외부 예약/수동 차단" },
  { label: "바베큐 슬롯", value: "3개", detail: "예약/가능/차단 표시" }
];

const engineRules = [
  {
    title: "달력 선택",
    body: "고객이 체크인과 체크아웃을 고르면 서버가 객실별 겹침 예약, 홀드, 차단일을 다시 확인합니다."
  },
  {
    title: "객실 필터",
    body: "일정과 인원 조건에 맞는 객실만 보여주고, 이미 예약된 객실은 선택 버튼을 비활성화합니다."
  },
  {
    title: "옵션 재계산",
    body: "인원 추가요금, 바베큐 옵션, 유튜브 할인은 /api/quote 서버 계산값으로만 반영합니다."
  },
  {
    title: "홀드 만료",
    body: "결제창 진입 전 booking_holds를 만들고, 시간이 지나면 expire-holds가 점유를 해제합니다."
  }
];

const availabilityApis = [
  "GET /api/availability",
  "GET /api/availability/barbecue-timeslots",
  "POST /api/quote",
  "POST /api/booking-holds",
  "POST /api/payments/prepare"
];

export default function ReservationOperationsPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero system">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 2 Day 9</p>
          <h1>예약 운영 고도화</h1>
          <p>
            고객이 날짜, 객실, 인원, 바베큐 옵션을 선택할 때 실제 예약 가능 여부와 서버 견적이 자연스럽게 연결되는 운영 흐름입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {reservationMetrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <b>{metric.value}</b>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>예약 엔진 규칙</h2>
          <span>날짜 · 객실 · 옵션 · 홀드</span>
        </div>
        <div className="ops-card-grid">
          {engineRules.map((rule) => (
            <article className="ops-card" key={rule.title}>
              <h3>{rule.title}</h3>
              <p>{rule.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section owner-dashboard-grid">
        <article className="ops-card wide">
          <h2>바베큐 타임슬롯 예시</h2>
          <div className="owner-room-table">
            {barbecueSlots.map((slot) => (
              <div key={slot.id}>
                <b>{slot.label}</b>
                <span>{slot.date}</span>
                <span>
                  {slot.startTime} - {slot.endTime}
                </span>
                <strong>{slot.status}</strong>
                <small>{slot.bookingNo ?? "예약 가능"}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="ops-card">
          <h2>연결 API</h2>
          <div>
            {availabilityApis.map((api) => (
              <span key={api}>{api}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
