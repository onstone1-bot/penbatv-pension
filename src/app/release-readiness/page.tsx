import Link from "next/link";

const readinessMetrics = [
  { label: "구현 화면", value: "12일차", detail: "고객/사장님/운영자" },
  { label: "검증 명령", value: "2개", detail: "typecheck + build" },
  { label: "필수 환경변수", value: "5개", detail: "Supabase/Toss/Admin" },
  { label: "배포 상태", value: "준비", detail: "Sites 공개 URL 갱신 필요" }
];

const testChecklist = [
  "고객홈에서 일정, 객실, 인원, 옵션 선택이 자연스럽게 이어지는지 확인",
  "/api/availability와 /api/quote가 서버 기준 결과를 반환하는지 확인",
  "토스 테스트 결제창 진입과 payments/confirm 검증 흐름 확인",
  "사장님 콘솔에서 사진, 영상, 네이버 후기, 주변 정보 입력 확인",
  "운영자 화면에서 예약, 결제, 정산, 캠페인 지표 확인"
];

const envItems = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TOSS_PAYMENTS_CLIENT_KEY",
  "TOSS_PAYMENTS_SECRET_KEY"
];

const handoffItems = [
  "로컬 실행: npm.cmd run dev",
  "브라우저 확인: http://localhost:3000",
  "타입 검사: npm.cmd run typecheck",
  "프로덕션 빌드: npm.cmd run build",
  "공개 배포 후 고객 URL 다시 확인"
];

export default function ReleaseReadinessPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero system">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 2 Day 12</p>
          <h1>테스트·배포·인수인계 준비</h1>
          <p>
            아드님이 로컬에서 실행하고 디버깅하며, 공개 URL로 배포하기 전에 확인해야 할 테스트와 환경변수, 인수인계 항목입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {readinessMetrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <b>{metric.value}</b>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section owner-dashboard-grid">
        <article className="ops-card">
          <h2>테스트 체크리스트</h2>
          <div className="task-list">
            {testChecklist.map((item) => (
              <label key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </article>
        <article className="ops-card">
          <h2>환경변수</h2>
          <div>
            {envItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>인수인계 실행 순서</h2>
          <span>VS Code 기준</span>
        </div>
        <div className="pipeline-strip">
          {handoffItems.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item}</b>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
