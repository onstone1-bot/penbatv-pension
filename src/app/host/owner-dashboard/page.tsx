import Link from "next/link";
import { formatWon } from "@/lib/local-quote";
import { getHostDashboardData } from "@/lib/host-dashboard-data";

const ownerTasks = ["성수기 요금표 확인", "바베큐 옵션 재고 확인", "네이버 후기 링크 2건 추가", "주말 예약대기 고객 응대"];

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const data = await getHostDashboardData("baebang-alps");
  const { stay } = data;

  return (
    <main className="ops-page">
      <section className="ops-hero owner" style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,.94), rgba(242,250,246,.82)), url(/penba/reservoir.jpg)" }}>
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">MVP 사장님 예약 현황</p>
          <h1>사장님 운영집계</h1>
          <p>
            {stay.name} 사장님이 예약, 매출, 객실 노출, 유튜브 유입, 해야 할 일을 한 화면에서 확인하는 파트너 대시보드입니다.
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

      <section className="ops-section owner-dashboard-grid">
        <article className="ops-card wide">
          <div className="section-head">
            <h2>객실별 운영 현황</h2>
            <span>노출 · 예약 · 매출</span>
          </div>
          <div className="owner-room-table">
            {data.roomRows.map((row) => (
              <div key={row.room}>
                <b>{row.room}</b>
                <span>{row.views.toLocaleString("ko-KR")} 조회</span>
                <span>{row.bookings}건 예약</span>
                <strong>{formatWon(row.revenue)}</strong>
                <small>{row.status}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="ops-card">
          <h2>오늘 할 일</h2>
          <div className="task-list">
            {ownerTasks.map((task) => (
              <label key={task}>
                <input type="checkbox" />
                <span>{task}</span>
              </label>
            ))}
          </div>
        </article>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>최근 예약 현황</h2>
          <span>고객 · 일정 · 결제상태</span>
        </div>
        <div className="campaign-table owner-reservation-table">
          {data.reservationRows.map((reservation) => (
            <div key={reservation.id}>
              <b>{reservation.roomName}</b>
              <span>{reservation.guestName} · {reservation.guestPhone}</span>
              <span>{reservation.checkIn} - {reservation.checkOut} · {reservation.people}</span>
              <strong>{reservation.status} · {reservation.paymentStatus} · {formatWon(reservation.totalAmount)}</strong>
            </div>
          ))}
          {data.reservationRows.length === 0 && (
            <div>
              <b>예약 없음</b>
              <span>고객이 결제 또는 수동입금을 완료하면 이곳에 예약 현황이 표시됩니다.</span>
              <span>객실별 예약 가능 여부와 연결됩니다.</span>
              <strong>0건</strong>
            </div>
          )}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>영상 성과</h2>
          <span>고객 화면 연결 콘텐츠</span>
        </div>
        <div className="customer-video-blueprint">
          {data.videos.map((video) => (
            <a href={video.url} target="_blank" rel="noreferrer" key={video.title}>
              <span style={{ backgroundImage: `url(${video.thumbnailUrl ?? "/penba/sign.jpg"})` }} />
              <b>{video.tag}</b>
              <small>{video.title}</small>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
