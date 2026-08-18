import Link from "next/link";

const securityMetrics = [
  { label: "권한 역할", value: "3개", detail: "고객/사장님/운영자" },
  { label: "관리 API", value: "분리", detail: "x-admin-token + x-penbatv-role" },
  { label: "결제 키", value: "비공개", detail: "서버 환경변수" },
  { label: "감사로그", value: "예정", detail: "운영 변경 추적" }
];

const rolePolicies = [
  {
    title: "고객",
    allowed: ["숙소 조회", "예약 생성", "내 예약 조회", "MY 정보 수정"],
    blocked: "타 고객 예약, 사장님 콘솔, 운영자 API 접근 차단"
  },
  {
    title: "사장님",
    allowed: ["본인 숙소 관리", "객실/요금/사진/영상 관리", "본인 예약 현황"],
    blocked: "다른 숙소 매출, 전체 정산, 운영자 승인 기능 차단"
  },
  {
    title: "운영자",
    allowed: ["입점 승인", "전체 예약/결제/정산", "캠페인 성과", "CS 대기열"],
    blocked: "결제 비밀키 직접 노출 금지, DB 직접 수정 최소화"
  }
];

const hardeningChecklist = [
  "SUPABASE_SERVICE_ROLE_KEY는 브라우저 번들에 절대 노출하지 않기",
  "관리 API는 현재 x-admin-token과 x-penbatv-role로 보호하고, 이후 Supabase Auth role 기반으로 전환",
  "사장님 API는 host/operator만 허용하고 운영자 집계 API는 operator만 허용",
  "결제 confirm API는 Toss 서버 응답과 주문 금액을 반드시 대조",
  "수동입금 확정, 환불, 정산 변경은 audit log에 기록",
  "운영자 화면은 로그인/권한 확인 전에는 렌더링하지 않기"
];

export default function AdminSecurityPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero admin">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 4 Day 22-28</p>
          <h1>권한·보안 점검</h1>
          <p>
            고객, 사장님, 운영자 권한을 분리하고 결제 키와 관리자 API가 노출되지 않도록 점검하는 내부 보안 기준입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {securityMetrics.map((metric) => (
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
          <h2>역할별 접근 정책</h2>
          <span>RBAC 설계 기준</span>
        </div>
        <div className="ops-card-grid">
          {rolePolicies.map((policy) => (
            <article className="ops-card" key={policy.title}>
              <h3>{policy.title}</h3>
              <div>
                {policy.allowed.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <p>{policy.blocked}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section ops-process-panel">
        <div>
          <h2>보안 체크리스트</h2>
          <p>실제 운영 계정과 결제 키를 연결하기 전에 반드시 확인해야 하는 항목입니다.</p>
        </div>
        <div className="task-list">
          {hardeningChecklist.map((item) => (
            <label key={item}>
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>
    </main>
  );
}
