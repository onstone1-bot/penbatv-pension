import Link from "next/link";
import { penbaVideoFeed } from "@/lib/platform-data";
import { formatWon } from "@/lib/local-quote";

const marketingMetrics = [
  { label: "영상 조회", value: "12,480", detail: "롱폼+쇼츠 합산" },
  { label: "링크 클릭", value: "1,284", detail: "유튜브 설명란" },
  { label: "예약 전환", value: "9건", detail: "UTM 기준" },
  { label: "전환 매출", value: "3,060,000원", detail: "배방 알프스" }
];

const performanceRows = [
  { title: "전체 공간 소개", views: 5200, clicks: 610, bookings: 4, revenue: 1360000 },
  { title: "바베큐 마당 쇼츠", views: 3100, clicks: 318, bookings: 3, revenue: 1020000 },
  { title: "객실 내부 미리보기", views: 2240, clicks: 206, bookings: 2, revenue: 680000 },
  { title: "간판과 진입로", views: 1940, clicks: 150, bookings: 0, revenue: 0 }
];

const actionRules = [
  "조회수보다 예약 링크 클릭률을 우선 확인",
  "클릭은 높은데 예약이 낮으면 객실 사진/달력/가격 구간 점검",
  "예약 전환이 높은 영상은 고정 댓글과 설명란 상단에 예약 링크 배치",
  "지역 키워드가 있는 제목은 네이버 검색 유입과 함께 비교"
];

export default function YoutubePerformancePage() {
  const videos = penbaVideoFeed.slice(0, 4);

  return (
    <main className="ops-page">
      <section className="ops-hero admin">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 4 Day 18</p>
          <h1>유튜브 마케팅 성과</h1>
          <p>
            영상별 조회수, 설명란 링크 클릭, 예약 전환, 매출을 연결해서 어떤 영상이 실제 예약으로 이어지는지 확인합니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {marketingMetrics.map((metric) => (
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
          <h2>영상별 성과</h2>
          <span>조회 · 클릭 · 예약 · 매출</span>
        </div>
        <div className="campaign-table">
          {performanceRows.map((row) => (
            <div key={row.title}>
              <b>{row.title}</b>
              <span>{row.views.toLocaleString()} 조회</span>
              <span>{row.clicks.toLocaleString()} 클릭 · {row.bookings}건 예약</span>
              <strong>{formatWon(row.revenue)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-section owner-dashboard-grid">
        <article className="ops-card">
          <h2>개선 규칙</h2>
          <div className="task-list">
            {actionRules.map((rule) => (
              <label key={rule}>
                <input type="checkbox" defaultChecked />
                <span>{rule}</span>
              </label>
            ))}
          </div>
        </article>
        <article className="ops-card">
          <h2>대표 영상</h2>
          <div>
            {videos.map((video) => (
              <span key={video.title}>{video.tag}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
