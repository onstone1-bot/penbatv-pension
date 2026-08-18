import Link from "next/link";
import { formatWon } from "@/lib/local-quote";

const paymentMetrics = [
  { label: "결제대기", value: "6건", detail: "홀드 만료 전" },
  { label: "오늘 승인", value: "3,420,000원", detail: "카드/간편결제" },
  { label: "수동입금 확인", value: "2건", detail: "계좌이체 검수" },
  { label: "정산예정", value: "2,930,000원", detail: "수수료 차감 후" }
];

const paymentMethods = [
  { name: "신용카드", provider: "card", mode: "toss", status: "테스트 결제창 확인됨" },
  { name: "토스페이", provider: "tosspay", mode: "toss", status: "prepare/confirm 구조" },
  { name: "네이버페이", provider: "naverpay", mode: "확장 예정", status: "결제수단 옵션으로 반영" },
  { name: "실시간 계좌이체", provider: "realtime_transfer", mode: "toss", status: "현금영수증 정보 필요" },
  { name: "수동 계좌이체", provider: "manual_bank_transfer", mode: "manual", status: "입금 확인 후 확정" }
];

const settlementRows = [
  { stay: "배방 알프스", gross: 340000, pg: 10200, platform: 27200, payout: 302600, status: "정산예정" },
  { stay: "리버 포레스트", gross: 220000, pg: 6600, platform: 17600, payout: 195800, status: "지급대기" },
  { stay: "오션 캐빈", gross: 180000, pg: 5400, platform: 12600, payout: 162000, status: "보류" }
];

export default function PaymentSettlementPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero admin">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 2 Day 10</p>
          <h1>결제·정산 관리</h1>
          <p>
            결제 준비, PG 승인, 수동입금 확인, 환불, 사장님 정산까지 운영자가 확인할 수 있는 관리 화면입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {paymentMetrics.map((metric) => (
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
          <h2>결제수단 운영</h2>
          <span>card · naverpay · transfer · manual</span>
        </div>
        <div className="api-flow-grid">
          {paymentMethods.map((method) => (
            <article key={method.provider}>
              <h3>{method.name}</h3>
              <code>{method.provider}</code>
              <code>{method.mode}</code>
              <p>{method.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>정산 예시</h2>
          <span>매출 - PG수수료 - 플랫폼수수료</span>
        </div>
        <div className="campaign-table">
          {settlementRows.map((row) => (
            <div key={row.stay}>
              <b>{row.stay}</b>
              <span>총액 {formatWon(row.gross)}</span>
              <span>수수료 {formatWon(row.pg + row.platform)}</span>
              <strong>{formatWon(row.payout)}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
