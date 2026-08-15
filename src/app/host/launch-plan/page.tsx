import Link from "next/link";
import { contentActionPlan, coreArchitecture, launchTimeline, techStack } from "@/lib/penbatv-plan";

export default function LaunchPlanPage() {
  return (
    <main>
      <section className="guide-hero">
        <div>
          <p className="muted">PenBa TV Launch Guide</p>
          <h1>펜바TV 웹앱 아키텍처와 콘텐츠 런칭 플랜</h1>
          <p>
            직접 코딩하는 Next.js/Supabase 기반으로 영상 중심 예약 플랫폼을 만들고, 촬영 콘텐츠 확보와 웹앱 오픈을 함께 굴러가게 하는 실행안입니다.
          </p>
        </div>
        <div className="host-nav">
          <Link href="/">펜바TV 홈</Link>
          <Link href="/host/properties">펜션 등록</Link>
          <Link href="/host/rooms">운영 콘솔</Link>
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>추천 기술 스택</h2>
          <span>개발자 구현 기준</span>
        </div>
        <div className="guide-grid">
          {techStack.map((stack) => (
            <article className="stack-card" key={stack.title}>
              <span>{stack.title}</span>
              <h3>{stack.name}</h3>
              <p>{stack.body}</p>
              <div className="property-tags">
                {stack.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>핵심 시스템 구조</h2>
          <span>등록 → 영상 → 예약 → 정산</span>
        </div>
        <div className="architecture-list">
          {coreArchitecture.map((item, index) => (
            <div className="architecture-row" key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <b>{item.title}</b>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>콘텐츠 액션 플랜</h2>
          <span>오픈 전 영상 쌓기</span>
        </div>
        <div className="action-plan-grid">
          {contentActionPlan.map((item) => (
            <article className="action-card" key={item.phase}>
              <span>{item.phase}</span>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <small>{item.product}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>런칭 타임라인</h2>
          <span>콘텐츠팀 + 개발팀</span>
        </div>
        <div className="timeline-table">
          {launchTimeline.map((item) => (
            <div className="timeline-row" key={item.period}>
              <b>{item.period}</b>
              <span>{item.contentTeam}</span>
              <span>{item.productTeam}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="settlement-note">
          <b>결제/정산 구현 메모</b>
          <p>
            Toss 결제창과 결제 승인은 기존 예약 결제 흐름에 연결하고, 사장님에게 지급하는 정산은 지급대행 셀러 등록, 잔액 조회,
            지급 요청, 웹훅 처리를 별도 모듈로 분리합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
