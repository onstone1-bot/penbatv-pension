import Link from "next/link";
import { mockPartnerProperties } from "@/lib/platform-data";

const pilotMetrics = [
  { label: "파일럿 숙소", value: "3곳", detail: "배방 알프스 중심" },
  { label: "무료촬영 후보", value: "5곳", detail: "천안·아산권" },
  { label: "운영 점검", value: "12개", detail: "예약/콘텐츠/CS" },
  { label: "오픈 목표", value: "2주", detail: "첫 예약 전환" }
];

const pilotChecklist = [
  "대표 영상과 쇼츠 링크를 고객홈에 모두 연결",
  "객실별 사진, 요금, 기준/최대 인원 확인",
  "예약 가능 날짜와 차단일을 사장님과 대조",
  "토스 테스트 결제와 수동 계좌이체 흐름 확인",
  "예약 완료 후 사장님 알림과 고객 안내 문구 확인",
  "첫 예약 발생 후 취소/환불 대응 기준 확인"
];

const pilotStages = [
  { title: "1차", body: "배방 알프스 단일 숙소로 고객 예약 흐름 검증" },
  { title: "2차", body: "천안·아산 펜션 2곳을 추가해 입점 등록 방식 검증" },
  { title: "3차", body: "유튜브 광고 링크를 여러 영상에 붙여 유입 성과 비교" },
  { title: "4차", body: "사장님 피드백으로 관리화면 입력 항목 정리" }
];

export default function PilotOperationsPage() {
  return (
    <main className="ops-page">
      <section className="ops-hero proposal">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 4 Day 17</p>
          <h1>파일럿 숙소 운영</h1>
          <p>
            배방 알프스를 첫 기준 숙소로 삼아 실제 예약, 결제, 콘텐츠, CS 흐름을 작은 규모로 먼저 운영해 보는 단계입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {pilotMetrics.map((metric) => (
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
          <h2>파일럿 단계</h2>
          <span>작게 열고 빠르게 수정</span>
        </div>
        <div className="ops-card-grid">
          {pilotStages.map((stage) => (
            <article className="ops-card" key={stage.title}>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section owner-dashboard-grid">
        <article className="ops-card">
          <h2>파일럿 체크리스트</h2>
          <div className="task-list">
            {pilotChecklist.map((item) => (
              <label key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </article>
        <article className="ops-card">
          <h2>대상 숙소</h2>
          <div>
            {mockPartnerProperties.map((property) => (
              <span key={property.id}>{property.name}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
