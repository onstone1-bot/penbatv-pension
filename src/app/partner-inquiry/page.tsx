import Link from "next/link";
import { PartnerInquiryClient } from "./PartnerInquiryClient";

const inquirySteps = [
  "펜션 기본정보 접수",
  "유튜브 촬영 가능 여부 확인",
  "객실·바베큐장 자료 등록",
  "예약결제 테스트",
  "펜바TV 고객홈 오픈"
];

const requiredItems = [
  "펜션명과 지역",
  "대표자 연락처",
  "객실 수와 기준 인원",
  "바베큐장 운영 방식",
  "네이버예약 등 외부 예약 사용 여부",
  "유튜브 촬영 희망 일정"
];

export default function PartnerInquiryPage() {
  return (
    <main className="partner-inquiry-page">
      <section className="partner-inquiry-hero">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Partner Inquiry</p>
          <h1>펜션 입점 문의</h1>
          <p>
            펜바TV는 유튜브 영상 홍보와 예약결제를 한 흐름으로 연결합니다. 펜션, 독채 숙소, 바베큐장 운영 사장님이
            문의를 남기면 촬영, 등록, 예약 오픈 절차를 함께 준비합니다.
          </p>
          <div className="partner-inquiry-actions">
            <Link href="/host/properties">입점 등록 데모</Link>
            <Link href="/host/rooms">사장님 관리화면 보기</Link>
          </div>
        </div>
        <div className="partner-inquiry-card">
          <span>무료 촬영 제안</span>
          <b>천안·아산 파일럿 우선 모집</b>
          <small>영상, 객실 사진, 예약 가능일, 바베큐 옵션을 한 화면으로 연결합니다.</small>
        </div>
      </section>

      <section className="partner-inquiry-section">
        <div className="section-head">
          <div>
            <span>PROCESS</span>
            <h2>문의 후 진행 순서</h2>
          </div>
          <Link href="/host/proposals">운영자 입점관리</Link>
        </div>
        <div className="pipeline-strip">
          {inquirySteps.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{step}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-inquiry-section split">
        <PartnerInquiryClient />

        <article className="partner-inquiry-checklist">
          <h2>미리 준비하면 좋은 자료</h2>
          <div>
            {requiredItems.map((item) => (
              <label key={item}>
                <input type="checkbox" defaultChecked />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
