import Link from "next/link";

const roadmapMetrics = [
  { label: "1차 목표", value: "3곳", detail: "천안·아산 파일럿" },
  { label: "2차 목표", value: "10곳", detail: "충청권 확장" },
  { label: "수익모델", value: "2개", detail: "예약수수료+광고상품" },
  { label: "운영 기준", value: "월간", detail: "정산/성과 리포트" }
];

const roadmapPhases = [
  {
    title: "파일럿 안정화",
    period: "1개월",
    items: ["배방 알프스 예약 흐름 안정화", "첫 유료 예약 발생", "사장님 피드백 반영"]
  },
  {
    title: "입점 확장",
    period: "2~3개월",
    items: ["천안·아산 펜션 10곳 제안", "무료촬영 패키지 운영", "입점 등록 폼 표준화"]
  },
  {
    title: "광고 상품화",
    period: "3~6개월",
    items: ["유튜브 영상 제작 상품", "상단 추천 노출", "성과 리포트 제공"]
  },
  {
    title: "운영 자동화",
    period: "6개월 이후",
    items: ["정산 자동화", "외부채널 연동", "알림톡 자동화", "운영자 권한 고도화"]
  }
];

const nextDecisions = [
  "첫 무료촬영 대상 펜션 3곳 확정",
  "수수료 정책: 예약수수료와 광고비를 분리할지 결정",
  "결제 정산 주기: 주간/월간 중 사장님에게 제안할 기준 확정",
  "외부 채널 연동 범위: iCal 단방향부터 시작할지 결정",
  "아드님 개발 범위: 데모 유지, DB 실연동, 결제 실연동 순서 확정"
];

export default function OperationsRoadmapPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero proposal">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 4 Day 20</p>
          <h1>정식 운영 로드맵</h1>
          <p>
            파일럿 운영 이후 펜션 입점 확대, 유튜브 광고 상품화, 정산 자동화, 외부채널 연동까지 이어지는 실행 계획입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {roadmapMetrics.map((metric) => (
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
          <h2>단계별 로드맵</h2>
          <span>파일럿에서 정식 운영까지</span>
        </div>
        <div className="ops-card-grid">
          {roadmapPhases.map((phase) => (
            <article className="ops-card" key={phase.title}>
              <h3>{phase.title}</h3>
              <p>{phase.period}</p>
              <div>
                {phase.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section ops-process-panel">
        <div>
          <h2>다음 의사결정</h2>
          <p>20일차 이후 실제 개발과 사업 운영을 이어가기 전에 정해야 할 항목입니다.</p>
        </div>
        <div className="task-list">
          {nextDecisions.map((item) => (
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
