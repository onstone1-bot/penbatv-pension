import Link from "next/link";
import {
  hdwebBenchmarkFeatures,
  penbaDesignFilters,
  penbaDesignTemplates
} from "@/lib/hdweb-design-benchmark";

export default function DesignBenchmarkPage() {
  return (
    <main>
      <section className="guide-hero design-benchmark-hero">
        <div>
          <p className="muted">HDWEB Pension Design Benchmark</p>
          <h1>펜바TV 펜션 디자인 선택형 화면</h1>
          <p>
            현대이지웹의 업종별 펜션 디자인 구조를 참고해, 펜바TV 입점 사장님이 영상형·예약형·바베큐형 상세페이지를 고르는
            템플릿 화면으로 구성합니다.
          </p>
        </div>
        <div className="host-nav">
          <Link href="/host/properties">입점 등록</Link>
          <Link href="/host/make24-benchmark">입점 제안</Link>
          <Link href="/booking-calendar-status?accommodationId=87">예약 달력</Link>
          <Link href="/">고객 홈</Link>
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>업종별 디자인 필터</h2>
          <span>펜션·캠핑장 특화</span>
        </div>
        <div className="design-filter-row">
          {penbaDesignFilters.map((filter, index) => (
            <span className={index === 0 ? "active" : ""} key={filter}>
              {filter}
            </span>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>기능소개</h2>
          <span>HDWEB 구조를 펜바TV식으로 변환</span>
        </div>
        <div className="design-feature-grid">
          {hdwebBenchmarkFeatures.map((feature, index) => (
            <article className="design-feature-card" key={feature.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.hdweb}</p>
              <b>{feature.penba}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>최근 디자인</h2>
          <span>펜바TV 상세페이지 템플릿</span>
        </div>
        <div className="design-template-grid">
          {penbaDesignTemplates.map((template) => (
            <article className="design-template-card" key={template.code}>
              <Link
                className="design-template-image"
                href="/host/properties"
                style={{ backgroundImage: `url(${template.image})` }}
                aria-label={`${template.name} 선택`}
              >
                <span>{template.code}</span>
              </Link>
              <div>
                <span>{template.target}</span>
                <h3>{template.name}</h3>
                <strong>{template.price}</strong>
                <div className="property-tags">
                  {template.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="design-template-actions">
                  <Link href="/host/properties">템플릿 선택</Link>
                  <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=design_template&utm_campaign=preview">
                    미리보기
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="calendar-status-note">
        <b>펜바TV 적용 포인트</b>
        <p>
          단순 홈페이지 템플릿 선택이 아니라, 선택한 디자인이 유튜브 영상 배치, 객실 예약 달력, 바베큐 타임슬롯, 결제 옵션 노출
          방식까지 바꾸는 사장님용 설정 화면으로 확장합니다.
        </p>
      </section>
    </main>
  );
}
