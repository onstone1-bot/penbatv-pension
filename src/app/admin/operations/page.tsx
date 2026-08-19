import Link from "next/link";
import { formatWon } from "@/lib/local-quote";
import { getAdminOperationsData } from "@/lib/admin-operations-data";

export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  const data = await getAdminOperationsData();

  return (
    <main className="ops-page">
      <section className="ops-hero admin">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 4 Day 24-28</p>
          <h1>운영자 관리방·운영집계</h1>
          <p>
            펜바TV 운영자가 전체 입점, 예약, 결제, 정산, 유튜브 성과, 장애 대기열을 한 화면에서 보는 내부 운영 대시보드입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {data.metrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <b>{metric.value}</b>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section admin-dashboard-grid">
        <article className="ops-card">
          <h2>운영 대기열</h2>
          <div className="operation-queue-list">
            {data.operationQueues.map((queue) => (
              <div key={queue.label}>
                <b>{queue.label}</b>
                <span>{queue.count}건</span>
                <small>{queue.owner}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="ops-card wide">
          <h2>입점 숙소 상태</h2>
          <div className="admin-property-list">
            {data.properties.map((property) => (
              <Link href={`/stays/${property.id}?utm_source=penbatv&utm_medium=admin_ops&utm_campaign=${property.id}`} key={property.id}>
                <span style={{ backgroundImage: "url(/penba/sign.jpg)" }} />
                <div>
                  <b>{property.name}</b>
                  <small>
                    {property.area} · 객실 {property.roomCount}개 · 등록 {property.createdAt.slice(0, 10)}
                  </small>
                </div>
                <strong>{property.status}</strong>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>최근 입점문의</h2>
          <span>공개 입점문의 페이지 접수건</span>
        </div>
        <div className="campaign-table">
          {data.inquiryRows.map(
            (row: {
              id: string;
              stayName: string;
              area: string;
              ownerName: string;
              operationType: string;
              roomCount: number;
              ownerPhone: string;
              status: string;
              createdAt: string;
            }) => (
              <div key={row.id}>
                <b>{row.stayName}</b>
                <span>{row.area} · {row.ownerName}</span>
                <span>{row.operationType} · 객실 {row.roomCount}개 · {row.ownerPhone}</span>
                <strong>{row.status} · {row.createdAt.slice(0, 10)}</strong>
              </div>
            )
          )}
          {data.inquiryRows.length === 0 && (
            <div>
              <b>입점문의 없음</b>
              <span>/partner-inquiry에서 사장님 문의가 접수되면 표시됩니다.</span>
              <span>무료촬영 후보 관리</span>
              <strong>0건</strong>
            </div>
          )}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>회원·권한 현황</h2>
          <span>고객 · 사장님 · 운영자</span>
        </div>
        <div className="campaign-table">
          {data.roleRows.map((row) => (
            <div key={row.role}>
              <b>{row.role}</b>
              <span>{row.screen}</span>
              <span>{row.apiScope}</span>
              <strong>{row.protection}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>최근 회원가입</h2>
          <span>네이버·카카오 자동가입 확인</span>
        </div>
        <div className="campaign-table">
          {data.memberRows.map((row) => (
            <div key={row.id}>
              <b>{row.role}</b>
              <span>{row.provider} · {row.status}</span>
              <span>가입 {row.joinedAt.slice(0, 10)}</span>
              <strong>{row.lastSignInAt ? `최근 로그인 ${row.lastSignInAt.slice(0, 10)}` : "로그인 이력 확인 필요"}</strong>
            </div>
          ))}
          {data.memberRows.length === 0 && (
            <div>
              <b>회원 데이터 없음</b>
              <span>네이버/카카오 로그인 성공 후 profiles에 자동 저장됩니다.</span>
              <span>Supabase Auth 연결 확인 필요</span>
              <strong>0명</strong>
            </div>
          )}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>전체 예약 현황</h2>
          <span>최근 예약 · 결제상태</span>
        </div>
        <div className="campaign-table">
          {data.reservationRows.map((row) => (
            <div key={row.bookingNo}>
              <b>{row.stayName}</b>
              <span>{row.roomName} · {row.guestName}</span>
              <span>{row.checkIn} - {row.checkOut}</span>
              <strong>{row.status} · {row.paymentStatus} · {formatWon(row.amount)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>결제·정산 예정금액</h2>
          <span>주문 상태 · 예상 지급액</span>
        </div>
        <div className="campaign-table">
          {data.settlementRows.map((row) => (
            <div key={row.orderId}>
              <b>{row.provider}</b>
              <span>{row.status}</span>
              <span>{row.createdAt.slice(0, 10)}</span>
              <strong>{formatWon(row.payoutEstimate)} / {formatWon(row.amount)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>유튜브 UTM 유입/예약 전환</h2>
          <span>방문 · 결제시작 · 예약 · 매출</span>
        </div>
        <div className="campaign-table">
          {data.campaignRows.map((row) => (
            <div key={row.campaign}>
              <b>{row.campaign}</b>
              <span>{row.visits.toLocaleString()} 방문 · 결제시작 {row.starts}</span>
              <span>{row.bookings}건 예약 · 전환 {row.conversionRate}%</span>
              <strong>{formatWon(row.revenue)}</strong>
            </div>
          ))}
          {data.campaignRows.length === 0 && (
            <div>
              <b>UTM 데이터 수집 전</b>
              <span>고객 화면에서 landing_view, payment_started 이벤트가 쌓이면 표시됩니다.</span>
              <span>유튜브 설명란 링크 기준</span>
              <strong>{formatWon(0)}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>4주차 관리자 QA</h2>
          <span>22일차부터 28일차까지</span>
        </div>
        <div className="campaign-table">
          {data.week4QaRows.map((row) => (
            <div key={row.day}>
              <b>{row.day}</b>
              <span>{row.title}</span>
              <span>{row.evidence}</span>
              <strong>{row.status}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
