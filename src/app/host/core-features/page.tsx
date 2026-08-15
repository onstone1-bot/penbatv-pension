import Link from "next/link";
import {
  adminMetrics,
  barbecueSlots,
  coreFeatureModules,
  customerStats,
  notificationTemplates
} from "@/lib/core-features";

const statusLabel = {
  implemented: "구현됨",
  mvp: "MVP",
  planned: "예정"
};

export default function CoreFeaturesPage() {
  return (
    <main>
      <section className="guide-hero">
        <div>
          <p className="muted">PenBa TV Core Requirements</p>
          <h1>핵심 기능 요구사항 대시보드</h1>
          <p>
            실시간 예약 엔진, 결제/현금영수증, 관리자 통계, 카카오 알림톡까지 펜바TV 운영에 필요한 기능 범위를
            모듈별로 정리한 화면입니다.
          </p>
        </div>
        <div className="host-nav">
          <Link href="/host/rate-calendar">요금·옵션 설정</Link>
          <Link href="/host/rooms">예약 운영 콘솔</Link>
          <Link href="/host/launch-plan">런칭 가이드</Link>
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>기능 모듈</h2>
          <span>예약·결제·관리·알림</span>
        </div>
        <div className="feature-module-grid">
          {coreFeatureModules.map((module) => (
            <article className="feature-module-card" key={module.title}>
              <span className={`feature-status ${module.status}`}>{statusLabel[module.status]}</span>
              <h3>{module.title}</h3>
              <p>{module.summary}</p>
              <b>요구사항</b>
              <ul>
                {module.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <b>구현 포인트</b>
              <div className="property-tags">
                {module.implementation.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>운영 지표</h2>
          <span>예약 현황 + 매출 + 고객 통계</span>
        </div>
        <div className="host-dashboard-grid">
          {adminMetrics.map((metric) => (
            <div className="host-metric" key={metric.label}>
              <span>{metric.label}</span>
              <b>{metric.value}</b>
              <small>{metric.detail}</small>
            </div>
          ))}
        </div>
        <div className="customer-stat-grid">
          {customerStats.map((stat) => (
            <div key={stat.label}>
              <span>{stat.label}</span>
              <b>{stat.value}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>바베큐장 타임슬롯</h2>
          <span>중복 예약 방지</span>
        </div>
        <div className="timeslot-grid">
          {barbecueSlots.map((slot) => (
            <article className={`timeslot-card ${slot.status}`} key={slot.id}>
              <span>{slot.status}</span>
              <h3>{slot.label}</h3>
              <p>
                {slot.date} · {slot.startTime} - {slot.endTime}
              </p>
              {slot.bookingNo && <small>{slot.bookingNo}</small>}
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="section-head">
          <h2>알림톡 템플릿</h2>
          <span>예약 완료 + 입실 안내 + 바베큐 리마인드</span>
        </div>
        <div className="notification-template-list">
          {notificationTemplates.map((template) => (
            <article className="notification-template-card" key={template.trigger}>
              <span>{template.sendTiming}</span>
              <h3>{template.title}</h3>
              <p>{template.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="settlement-note">
          <b>결제/현금영수증 구현 메모</b>
          <p>
            카드·간편결제는 결제 승인 결과를 저장하고, 계좌이체·가상계좌 등 현금성 결제는 현금영수증 타입과
            customerIdentityNumber를 주문에 저장한 뒤 Toss 현금영수증 발급/조회 API로 연결합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
