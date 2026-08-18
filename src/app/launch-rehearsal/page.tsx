import Link from "next/link";
import { getLatestPilotRuns } from "@/lib/pilot";
import type { Database } from "@/lib/supabase/database.types";

type PilotRunRow = Database["public"]["Tables"]["pilot_runs"]["Row"];

const rehearsalMetrics = [
  { label: "리허설 역할", value: "3명", detail: "고객/사장님/운영자" },
  { label: "오픈 숙소", value: "1곳", detail: "배방 알프스 기준" },
  { label: "검증 흐름", value: "6단계", detail: "유입부터 알림까지" },
  { label: "오픈 판단", value: "Go/No-Go", detail: "체크리스트 기준" }
];

const rehearsalFlow = [
  "유튜브 영상 설명란 링크 클릭",
  "고객홈에서 영상과 객실 사진 확인",
  "예약 가능 날짜와 객실 선택",
  "결제 테스트 또는 수동입금 예약 진행",
  "사장님 대시보드에서 예약 확인",
  "운영자 화면에서 결제, 정산, 알림 상태 확인"
];

const goNoGo = [
  "고객이 설명 없이 예약 완료까지 갈 수 있는가",
  "사장님이 예약 내용과 고객 연락처를 확인할 수 있는가",
  "운영자가 실패 결제와 알림 실패를 찾을 수 있는가",
  "공개 URL에서 이미지와 유튜브 링크가 모두 정상 동작하는가",
  "아드님이 VS Code에서 로컬 실행과 디버깅을 재현할 수 있는가"
];

const launchApiFlow = [
  "POST /api/notifications/queue",
  "POST /api/notifications/dispatch",
  "POST /api/integrations/ical/sync",
  "GET /api/admin/environment",
  "POST /api/pilot/open"
];

const rehearsalRoles = [
  { role: "고객 역할", task: "유튜브에서 들어왔다고 가정하고 모바일에서 예약 완료까지 진행" },
  { role: "사장님 역할", task: "객실, 사진, 영상, 예약 현황, 알림 대기 내용을 확인" },
  { role: "운영자 역할", task: "입점, 결제, 정산, QA, 보안 체크리스트를 확인" }
];

export const dynamic = "force-dynamic";

export default async function LaunchRehearsalPage() {
  let pilotRuns: PilotRunRow[] = [];

  try {
    pilotRuns = await getLatestPilotRuns(5);
  } catch {
    pilotRuns = [];
  }

  return (
    <main className="ops-page">
      <section className="ops-hero proposal">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 5 Day 34-35</p>
          <h1>런칭 리허설</h1>
          <p>
            첫 입점 펜션을 실제로 오픈하기 전에 고객, 사장님, 운영자 관점에서 예약결제 흐름을 한 번 끝까지 검증합니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {rehearsalMetrics.map((metric) => (
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
          <h2>역할별 리허설</h2>
          <span>고객 · 사장님 · 운영자</span>
        </div>
        <div className="ops-card-grid">
          {rehearsalRoles.map((role) => (
            <article className="ops-card" key={role.role}>
              <h3>{role.role}</h3>
              <p>{role.task}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section ops-process-panel">
        <div>
          <h2>실행 순서</h2>
          <p>이 흐름이 막힘 없이 지나가면 첫 공개 운영을 시작할 수 있습니다.</p>
        </div>
        <ol>
          {rehearsalFlow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>Go/No-Go 판단</h2>
          <span>오픈 전 최종 확인</span>
        </div>
        <div className="task-list">
          {goNoGo.map((item) => (
            <label key={item}>
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>5주차 오픈 API</h2>
          <span>29일차부터 35일차까지</span>
        </div>
        <div className="pipeline-strip">
          {launchApiFlow.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>파일럿 오픈 기록</h2>
          <span>운영자 API 기준</span>
        </div>
        <div className="campaign-table">
          {pilotRuns.map((run) => (
            <div key={run.id}>
              <b>{run.accommodation_id}</b>
              <span>{run.status}</span>
              <span>{run.opened_at ? new Date(run.opened_at).toLocaleString("ko-KR") : "리허설 진행중"}</span>
              <strong>{new Date(run.created_at).toLocaleString("ko-KR")}</strong>
            </div>
          ))}
          {pilotRuns.length === 0 && (
            <div>
              <b>파일럿 기록 없음</b>
              <span>/api/pilot/open에서 체크리스트를 제출하면 리허설 또는 오픈 상태로 기록됩니다.</span>
              <span>모든 체크가 true일 때 파일럿 오픈 처리</span>
              <strong>대기</strong>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
