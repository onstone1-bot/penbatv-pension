import Link from "next/link";
import {
  make24BenchmarkPoints,
  penbaBuildSteps,
  penbaOwnerPackages,
  penbaServiceModules
} from "@/lib/make24-benchmark";

export default function Make24BenchmarkPage() {
  return (
    <main>
      <section className="guide-hero make24-hero">
        <div>
          <p className="muted">MAKE24 Pension Benchmark</p>
          <h1>펜션 사장님 입점 제안 페이지 구조</h1>
          <p>
            메이크24 펜션의 제작 랜딩 구조를 참고해, 펜바TV는 홈페이지 제작보다 유튜브 홍보와 예약결제 운영을 한 번에 제안하는
            사장님용 화면으로 확장합니다.
          </p>
        </div>
        <div className="host-nav">
          <Link href="/host/properties">입점 등록</Link>
          <Link href="/booking-calendar-status?accommodationId=87">예약 달력</Link>
          <Link href="/host/reservation-payment">예약 결제 프로그램</Link>
          <Link href="/host/core-features">핵심 기능</Link>
          <Link href="/host/design-benchmark">디자인 선택</Link>
          <Link href="/">고객 홈</Link>
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>벤치마킹 포인트</h2>
          <span>메이크24 → 펜바TV 적용</span>
        </div>
        <div className="benchmark-grid">
          {make24BenchmarkPoints.map((point) => (
            <article className="benchmark-card" key={point.title}>
              <h3>{point.title}</h3>
              <dl>
                <div>
                  <dt>Make24</dt>
                  <dd>{point.make24}</dd>
                </div>
                <div>
                  <dt>PenBa TV</dt>
                  <dd>{point.penba}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>펜바TV 입점 패키지</h2>
          <span>촬영 + 예약 + 운영</span>
        </div>
        <div className="owner-package-grid">
          {penbaOwnerPackages.map((item) => (
            <article className="owner-package-card" key={item.name}>
              <span>{item.target}</span>
              <h3>{item.name}</h3>
              <strong>{item.price}</strong>
              <ul>
                {item.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>서비스 모듈</h2>
          <span>사장님에게 보여줄 핵심 기능</span>
        </div>
        <div className="service-module-grid">
          {penbaServiceModules.map((module) => (
            <span key={module}>{module}</span>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>입점 제작 과정</h2>
          <span>상담부터 유튜브 링크 노출까지</span>
        </div>
        <div className="build-step-list">
          {penbaBuildSteps.map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{step}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="partner-center-band">
        <div>
          <span>PenBa TV Owner Landing</span>
          <h2>펜션 홈페이지 제작 경쟁이 아니라, 유튜브에서 예약까지 연결하는 입점 상품으로 차별화합니다.</h2>
        </div>
        <div className="penba-actions">
          <Link className="hero-action" href="/host/properties">
            입점 등록하기
          </Link>
          <Link className="ghost-action" href="/host/launch-plan">
            런칭 가이드
          </Link>
        </div>
      </section>
    </main>
  );
}
