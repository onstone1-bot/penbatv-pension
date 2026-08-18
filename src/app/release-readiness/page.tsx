import Link from "next/link";

const readinessMetrics = [
  { label: "구현 화면", value: "35일차", detail: "고객/사장님/운영자" },
  { label: "검증 명령", value: "4개", detail: "week5 + mobile + build" },
  { label: "필수 환경변수", value: "5개", detail: "Supabase/Admin/기본숙소" },
  { label: "배포 상태", value: "대기", detail: "GitHub push 후 Vercel 자동 배포" }
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
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STAYLINK_DEFAULT_ACCOMMODATION_ID",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STAYLINK_ADMIN_API_TOKEN",
  "TOSS_PAYMENTS_CLIENT_KEY",
  "TOSS_PAYMENTS_SECRET_KEY",
  "PENBATV_BANK_NAME / ACCOUNT / HOLDER"
];

const handoffItems = [
  "로컬 실행: npm.cmd run dev",
  "브라우저 확인: http://localhost:3000",
  "모바일 QA: npm.cmd run verify:mobile",
  "5주차 QA: npm.cmd run verify:week5:launch",
  "프로덕션 빌드: npm.cmd run build",
  "GitHub push 후 Vercel 자동 배포 확인"
];

const deploymentSteps = [
  "GitHub 저장소에 1~5주차 커밋 push",
  "Vercel 프로젝트 Root Directory가 staylink-app인지 확인",
  "Vercel Environment Variables에 Supabase/Admin/Toss 키 입력",
  "Production Deployment 생성 후 /, /stays/baebang-alps, /my, /host/rooms 확인",
  "파일럿 오픈 전 실제 휴대폰 결제/알림/예약 현황을 리허설"
];

export default function ReleaseReadinessPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero system">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 5 Day 32-33</p>
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

      <section className="ops-section ops-process-panel">
        <div>
          <h2>공개 배포 순서</h2>
          <p>5주차 기능 검증이 끝난 뒤 GitHub push와 Vercel 자동 배포로 외부 URL을 갱신합니다.</p>
        </div>
        <ol>
          {deploymentSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
