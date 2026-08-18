import Link from "next/link";
import { getAdminOperationsData } from "@/lib/admin-operations-data";
import { ProposalApprovalClient } from "./ProposalApprovalClient";

const proposalMetrics = [
  { label: "신규 문의", value: "8건", detail: "이번 주 접수 데모" },
  { label: "촬영 협의", value: "3건", detail: "일정 조율중 데모" },
  { label: "검수 대기", value: "2건", detail: "사진/요금 확인 데모" },
  { label: "오픈 준비", value: "1건", detail: "결제 테스트 필요 데모" }
];

const proposals = [
  {
    name: "광덕산 계곡 독채",
    area: "천안 광덕",
    status: "무료촬영 제안",
    owner: "최대표",
    need: "객실 사진 부족, 유튜브 홍보 희망",
    next: "현장 촬영 일정 확정"
  },
  {
    name: "송악 저수지 바베큐펜션",
    area: "아산 송악",
    status: "입점 검수",
    owner: "박대표",
    need: "바베큐장 단독 예약 기능 필요",
    next: "요금표와 옵션 등록"
  },
  {
    name: "배방 알프스",
    area: "아산 배방",
    status: "오픈 완료",
    owner: "김대표",
    need: "유튜브 영상과 객실 예약 연결",
    next: "광고 성과 리포트 확인"
  }
];

const pipeline = ["문의 접수", "무료촬영 제안", "자료 수집", "운영자 검수", "결제 테스트", "고객홈 오픈"];

export const dynamic = "force-dynamic";

export default async function HostProposalsPage() {
  const operationsData = await getAdminOperationsData();

  return (
    <main className="ops-page">
      <section className="ops-hero proposal">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 1 Day 6</p>
          <h1>입점제안 관리</h1>
          <p>
            펜션 사장님 문의를 접수하고 무료촬영, 자료수집, 검수, 예약결제 테스트, 고객홈 오픈까지 단계별로 관리합니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {proposalMetrics.map((metric) => (
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
          <h2>입점 파이프라인</h2>
          <span>문의부터 오픈까지</span>
        </div>
        <div className="pipeline-strip">
          {pipeline.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{step}</b>
            </article>
          ))}
        </div>
      </section>

      <ProposalApprovalClient properties={operationsData.properties} />

      <section className="ops-section">
        <div className="section-head">
          <h2>입점 후보</h2>
          <span>사장님 제안 관리</span>
        </div>
        <div className="proposal-list">
          {proposals.map((proposal) => (
            <article key={proposal.name}>
              <span>{proposal.status}</span>
              <div>
                <h3>{proposal.name}</h3>
                <small>
                  {proposal.area} · {proposal.owner}
                </small>
              </div>
              <p>{proposal.need}</p>
              <b>{proposal.next}</b>
              <Link href="/host/properties">등록 화면</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
