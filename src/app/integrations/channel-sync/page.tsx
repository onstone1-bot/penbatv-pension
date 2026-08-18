import Link from "next/link";

const syncMetrics = [
  { label: "연동 대상", value: "4개", detail: "네이버/야놀자/여기어때/iCal" },
  { label: "동기화 방식", value: "iCal", detail: "초기 버전 추천" },
  { label: "충돌 기준", value: "날짜 겹침", detail: "room_blocks 반영" },
  { label: "운영 상태", value: "설계", detail: "파일럿 후 개발" }
];

const channels = [
  { name: "네이버예약", method: "iCal 또는 수동 차단일", risk: "실시간성 제한, 중복예약 주의" },
  { name: "야놀자", method: "iCal feed 확인", risk: "채널 정책과 API 제공 여부 확인 필요" },
  { name: "여기어때", method: "iCal feed 확인", risk: "요금 동기화는 별도 검토" },
  { name: "수기 전화예약", method: "사장님 직접 차단", risk: "입력 누락 시 중복예약 발생" }
];

const syncFlow = [
  "외부 채널 예약 캘린더 URL 등록",
  "주기적으로 예약된 날짜를 가져와 room_blocks에 저장",
  "펜바TV 고객 달력은 room_blocks를 포함해 가능 여부 계산",
  "펜바TV 예약 확정 시 사장님에게 외부 채널 차단 안내",
  "정식 버전에서는 양방향 동기화 가능 여부 검토"
];

export default function ChannelSyncPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero system">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 4 Day 19</p>
          <h1>외부채널 연동 준비</h1>
          <p>
            네이버예약, 야놀자, 여기어때 같은 외부 예약 채널의 예약일을 펜바TV 달력에 반영해 중복예약을 줄이는 구조입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {syncMetrics.map((metric) => (
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
          <h2>채널별 연동 기준</h2>
          <span>초기에는 차단일 동기화부터</span>
        </div>
        <div className="campaign-table">
          {channels.map((channel) => (
            <div key={channel.name}>
              <b>{channel.name}</b>
              <span>{channel.method}</span>
              <span>{channel.risk}</span>
              <strong>room_blocks</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-section ops-process-panel">
        <div>
          <h2>동기화 흐름</h2>
          <p>초기 MVP에서는 외부 예약을 가져와 펜바TV에서 막는 단방향 연동부터 시작하는 것이 안전합니다.</p>
        </div>
        <ol>
          {syncFlow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
