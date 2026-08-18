import Link from "next/link";

const qaMetrics = [
  { label: "핵심 시나리오", value: "8개", detail: "성공/실패/만료 포함" },
  { label: "중복예약 방지", value: "필수", detail: "hold + booking + block" },
  { label: "결제 검증", value: "서버 기준", detail: "금액 조작 차단" },
  { label: "테스트 상태", value: "준비", detail: "수동 QA 진행 가능" }
];

const qaScenarios = [
  {
    title: "유튜브 유입 예약 성공",
    steps: ["UTM 링크 진입", "일정 선택", "객실 선택", "옵션 선택", "결제 성공", "내예약 확인"],
    expected: "booking, payment, utm_event가 같은 흐름으로 남아야 합니다."
  },
  {
    title: "이미 예약된 날짜 차단",
    steps: ["예약 완료된 날짜 선택", "객실 가능 여부 조회", "선택 버튼 비활성화"],
    expected: "고객이 예약불가 날짜를 결제 단계로 넘길 수 없어야 합니다."
  },
  {
    title: "홀드 만료",
    steps: ["예약 홀드 생성", "결제하지 않고 대기", "만료 후 다시 조회"],
    expected: "만료된 홀드는 가능 객실 계산에서 제외되어야 합니다."
  },
  {
    title: "결제 실패",
    steps: ["결제창 진입", "결제 실패", "fail 페이지 이동", "예약 미확정"],
    expected: "결제 실패 시 booking 확정과 정산 데이터가 생기면 안 됩니다."
  }
];

const qaChecklist = [
  "브라우저 금액 조작 후에도 /api/quote 서버 금액이 기준인지 확인",
  "체크아웃 날짜가 체크인보다 빠른 경우 차단",
  "최대 인원 초과 시 객실 선택 차단",
  "바베큐 타임슬롯 예약/차단 상태가 화면에 반영",
  "수동 계좌이체는 입금 확인 전 예약확정으로 바뀌지 않음"
];

export default function ReservationPaymentQaPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero system">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 3 Day 13</p>
          <h1>예약결제 QA 시나리오</h1>
          <p>
            유튜브 유입부터 예약 완료까지 고객이 실제로 겪는 흐름을 기준으로, 중복예약과 결제 오류를 사전에 잡는 테스트 화면입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {qaMetrics.map((metric) => (
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
          <h2>핵심 테스트 시나리오</h2>
          <span>고객 흐름 기준</span>
        </div>
        <div className="ops-card-grid">
          {qaScenarios.map((scenario) => (
            <article className="ops-card" key={scenario.title}>
              <h3>{scenario.title}</h3>
              <div>
                {scenario.steps.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>
              <p>{scenario.expected}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section ops-process-panel">
        <div>
          <h2>QA 체크리스트</h2>
          <p>이 항목들이 통과되어야 첫 펜션 예약결제 운영을 안정적으로 시작할 수 있습니다.</p>
        </div>
        <div className="task-list">
          {qaChecklist.map((item) => (
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
