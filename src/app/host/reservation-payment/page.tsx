import Link from "next/link";
import { formatWon } from "@/lib/local-quote";
import {
  paymentMethodCards,
  reservationPaymentMetrics,
  reservationPaymentRows,
  reservationPaymentStages,
  settlementPreviewRows
} from "@/lib/reservation-payment-program";

export default function ReservationPaymentProgramPage() {
  return (
    <main>
      <section className="guide-hero reservation-payment-hero">
        <div>
          <p className="muted">PenBa TV Reservation Payment Program</p>
          <h1>예약 결제 프로그램</h1>
          <p>
            유튜브에서 들어온 고객이 날짜와 객실을 고른 뒤 예약 선점, 결제 준비, 결제 승인, 알림톡, 정산까지 이어지는 운영 화면입니다.
          </p>
        </div>
        <div className="host-nav">
          <Link href="/booking-calendar-status?accommodationId=baebang-alps">예약 현황</Link>
          <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=program_preview&utm_campaign=booking_payment">
            고객 예약
          </Link>
          <Link href="/host/rooms">운영 콘솔</Link>
          <Link href="/host/core-features">기능 구조</Link>
        </div>
      </section>

      <section className="reservation-payment-metrics" aria-label="예약 결제 요약">
        {reservationPaymentMetrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <b>{metric.value}</b>
            <small>{metric.detail}</small>
          </div>
        ))}
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>예약 결제 처리 흐름</h2>
          <span>가능 여부 → 선점 → 결제 → 확정</span>
        </div>
        <div className="payment-stage-grid">
          {reservationPaymentStages.map((stage) => (
            <article className="payment-stage-card" key={stage.step}>
              <span>{stage.step}</span>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
              <code>{stage.api}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>예약 결제 보드</h2>
          <span>고객별 상태와 다음 처리</span>
        </div>
        <div className="payment-board">
          {reservationPaymentRows.map((row) => (
            <article className="payment-board-row" key={row.bookingNo}>
              <div>
                <span className={`payment-status ${row.status}`}>{row.status}</span>
                <h3>{row.guest}</h3>
                <p>
                  {row.room} · {row.date}
                </p>
                <small>
                  {row.option} · {row.channel}
                </small>
              </div>
              <div>
                <b>{formatWon(row.amount)}</b>
                <span>{row.bookingNo}</span>
              </div>
              <Link href="/host/rooms">{row.nextAction}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section payment-program-split">
        <div>
          <div className="section-head">
            <h2>결제수단</h2>
            <span>카드 · 간편결제 · 현금영수증</span>
          </div>
          <div className="payment-method-grid">
            {paymentMethodCards.map((card) => (
              <article className="payment-method-card" key={card.title}>
                <span>{card.status}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="settlement-preview-card">
          <span>정산 미리보기</span>
          <h2>사장님 정산예정 금액</h2>
          {settlementPreviewRows.map((row) => (
            <div className={row.amount > 0 ? "" : "minus"} key={row.label}>
              <span>{row.label}</span>
              <b>{formatWon(row.amount)}</b>
            </div>
          ))}
          <p>
            실제 운영에서는 결제 승인 데이터와 플랫폼 수수료, 지급대행 셀러 정보를 분리해 정산 대사 화면으로 확장합니다.
          </p>
        </div>
      </section>

      <section className="program-action-band">
        <div>
          <span>다음 개발 단계</span>
          <h2>토스페이먼츠 실결제 키를 연결하면 결제창 호출과 승인 저장까지 이어집니다.</h2>
        </div>
        <div className="penba-actions">
          <Link className="hero-action" href="/booking-calendar-status?accommodationId=baebang-alps">
            예약현황에서 테스트
          </Link>
          <Link className="ghost-action" href="/host/rate-calendar">
            요금/옵션 설정
          </Link>
        </div>
      </section>
    </main>
  );
}
