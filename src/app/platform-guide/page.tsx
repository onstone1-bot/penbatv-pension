import Link from "next/link";

const roleCards = [
  {
    title: "고객 화면",
    body: "유튜브 설명란 링크로 들어온 고객이 홈, 객실, 예약, 내예약, MY를 오가며 예약결제까지 진행합니다.",
    href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=guide_customer&utm_campaign=baebang-alps"
  },
  {
    title: "사장님 관리화면",
    body: "숙소 기본정보, 객실, 사진, 유튜브 영상, 네이버 후기, 주변정보, 예약 현황을 관리합니다.",
    href: "/host/rooms"
  },
  {
    title: "운영자 관리화면",
    body: "입점 승인, 전체 예약, 결제/정산, 유튜브 UTM 유입, 운영 QA를 관리합니다.",
    href: "/admin/operations"
  }
];

const mvpItems = [
  "날짜별 객실 예약 가능 여부",
  "객실/사진/영상 선택 후 예약 진행",
  "서버 기준 견적 계산",
  "결제 후 예약 확정",
  "사장님 예약 현황 확인"
];

const guideSections = [
  {
    title: "1. 홈화면 구성 방안",
    body: "메인 화면은 고객에게는 예약 진입점, 사장님에게는 입점 제안, 운영자에게는 관리 화면으로 나뉘어야 합니다."
  },
  {
    title: "2. 회원가입·고객 정보관리",
    body: "네이버/카카오 간편가입 후 예약 확인, 찜, 결제 상태, 알림 수신, MY 정보를 관리하는 구조입니다."
  },
  {
    title: "3. 고객홈",
    body: "유튜브 영상, 객실 사진, 예약 가능 달력, 객실 선택, 인원/옵션 선택, 결제 버튼을 한 흐름으로 배치합니다."
  },
  {
    title: "4. 입점제안 관리",
    body: "무료촬영 제안, 자료 수집, 디자인 선택, 예약결제 테스트, 오픈 승인까지 파이프라인으로 관리합니다."
  },
  {
    title: "5. 사장님 관리방",
    body: "사장님이 객실, 사진, 영상, 요금, 네이버 블로그/리뷰, 주변 맛집/가볼만한곳을 등록합니다."
  },
  {
    title: "6. 사장님 운영집계",
    body: "객실별 예약, 결제 상태, 매출, 유튜브 유입, 해야 할 일을 한 화면에서 확인합니다."
  },
  {
    title: "7. 운영자 관리방·운영집계",
    body: "전체 숙소, 전체 예약, 결제/정산 예정금액, UTM 전환 성과, 파일럿 QA를 통합 관리합니다."
  }
];

const schedule = [
  ["1주차", "전체 구조 재정비", "메인홈, 회원/권한, 고객홈, 입점제안, 관리화면 구조 확정"],
  ["2주차", "결제와 예약 확정", "토스 결제 준비, 결제 성공/실패/만료, 수동 계좌이체, 내예약 연결"],
  ["3주차", "사장님 관리 실데이터화", "숙소/객실/사진/영상/네이버/주변정보 등록 관리"],
  ["4주차", "회원·권한·운영자", "고객 로그인, 권한 분리, 입점 승인, 예약/정산/UTM 집계"],
  ["5주차", "알림·외부연동·배포", "알림톡, iCal 외부 예약 연동, 모바일 QA, 파일럿 오픈"]
];

export default function PlatformGuidePage() {
  return (
    <main className="penba-main-home">
      <header className="main-home-topbar">
        <Link className="main-home-logo" href="/">
          <span>PenBa TV</span>
          <b>설명용 기존 메인</b>
        </Link>
        <nav aria-label="설명 화면 바로가기">
          <Link href="/">시연 메인</Link>
          <Link href="/host/core-features">핵심 기능</Link>
          <Link href="/host/rooms">사장님 관리</Link>
        </nav>
      </header>

      <section className="main-home-hero" aria-label="기존 메인 설명 화면">
        <div className="main-hero-copy">
          <span>Platform Guide</span>
          <h1>펜바TV 전체 구조를 설명하는 기존 메인 화면</h1>
          <p>
            이 화면은 의뢰자에게 플랫폼의 큰 그림을 설명할 때 쓰는 별도 페이지입니다.
            실제 고객 시연은 메인 화면에서 진행하고, 여기서는 고객/사장님/운영자 구조와 개발 일정, MVP 기준을 설명합니다.
          </p>
          <div className="main-hero-actions">
            <Link href="/">시연 메인으로 이동</Link>
            <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=guide_demo&utm_campaign=baebang-alps">
              고객 예약 흐름 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="main-role-grid" aria-label="역할별 화면 구조">
        {roleCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <span>Role</span>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </Link>
        ))}
      </section>

      <section className="main-section split" aria-label="MVP 기준">
        <div>
          <div className="main-section-head compact">
            <div>
              <span>MVP Priority</span>
              <h2>최소 오픈 필수 기준</h2>
            </div>
          </div>
          <ol className="main-flow-list">
            {mvpItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div className="main-demo-status">
          <span>Demo Use</span>
          <h2>오늘 설명 방식</h2>
          <b>메인: 고객 예약 흐름 시연</b>
          <b>이 화면: 플랫폼 전체 구조 설명</b>
          <b>사장님 화면: 등록·예약 현황 설명</b>
          <b>운영자 화면: 입점·정산·통계 설명</b>
        </div>
      </section>

      <section className="main-section" aria-label="전체 화면 구성 설명">
        <div className="main-section-head">
          <div>
            <span>Screen Architecture</span>
            <h2>화면 개발 구현 범위</h2>
          </div>
        </div>
        <div className="main-property-grid">
          {guideSections.map((section) => (
            <article className="main-property-body" key={section.title}>
              <span>Guide</span>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="main-section" aria-label="개발 일정">
        <div className="main-section-head">
          <div>
            <span>Development Schedule</span>
            <h2>5주 개발 일정 요약</h2>
          </div>
        </div>
        <div className="main-property-grid">
          {schedule.map(([week, title, body]) => (
            <article className="main-property-body" key={week}>
              <span>{week}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="home-bottom-tabs" aria-label="모바일 하단 메뉴">
        <Link href="/">홈</Link>
        <Link className="on" href="/platform-guide">설명</Link>
        <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=guide_bottom_booking&utm_campaign=baebang-alps">
          예약
        </Link>
        <Link href="/host/rooms">사장님</Link>
        <Link href="/admin/operations">운영자</Link>
      </nav>
    </main>
  );
}
