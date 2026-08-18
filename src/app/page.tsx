import Link from "next/link";
import {
  adPlanLabels,
  mockPartnerProperties,
  partnerStatusLabels,
  penbaVideoFeed,
  reservationModeLabels
} from "@/lib/platform-data";
import { formatWon } from "@/lib/local-quote";

const platformMetrics = [
  { label: "입점 펜션", value: `${mockPartnerProperties.length}곳` },
  { label: "연결 영상", value: `${penbaVideoFeed.length}개` },
  { label: "핵심 포맷", value: "유튜브 → 예약" }
];

const categoryItems = [
  { label: "독채펜션", initial: "독", href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=category&utm_campaign=private" },
  { label: "바베큐장", initial: "BBQ", href: "/host/core-features" },
  { label: "계곡펜션", initial: "계", href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=category&utm_campaign=valley" },
  { label: "가족단체", initial: "가", href: "/stays/river-forest-stay?utm_source=penbatv&utm_medium=category&utm_campaign=family" },
  { label: "오션뷰", initial: "바", href: "/stays/ocean-cabin-house?utm_source=penbatv&utm_medium=category&utm_campaign=ocean" },
  { label: "불멍", initial: "불", href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=category&utm_campaign=fire" },
  { label: "바로결제", initial: "결", href: "/stays/river-forest-stay?utm_source=penbatv&utm_medium=category&utm_campaign=instant" },
  { label: "입점문의", initial: "입", href: "/host/properties" }
];

const quickCollections = [
  {
    title: "바베큐가 좋은 펜션",
    eyebrow: "BBQ Collection",
    body: "숯, 그릴, 이용 시간까지 예약 화면에서 바로 확인",
    href: "/booking-calendar-status?accommodationId=87"
  },
  {
    title: "유튜브로 검증한 숙소",
    eyebrow: "PenBa TV",
    body: "영상 보고 객실 소개와 예약 달력으로 자연스럽게 연결",
    href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=collection&utm_campaign=video"
  },
  {
    title: "사장님 파트너 센터",
    eyebrow: "Partner",
    body: "펜션 등록, 영상 링크, 예약결제 운영 구조 관리",
    href: "/host/properties"
  }
];

const magazineItems = [
  {
    title: "펜션 홍보 영상은 객실보다 동선이 먼저입니다",
    body: "유튜브에서 들어온 고객은 주차, 입실, 바베큐장, 객실 순서로 확인하면 예약 전환이 빨라집니다.",
    date: "2026.08.15"
  },
  {
    title: "바베큐 옵션은 세트형부터 시작하세요",
    body: "초기 MVP에서는 숯·그릴 세트 정액제가 사장님과 고객 모두 이해하기 쉽습니다.",
    date: "2026.08.15"
  }
];

const realPhotoStories = [
  {
    title: "저수지 뷰가 보이는 독채 내부",
    label: "객실",
    image: "/penba/interior-3.jpg"
  },
  {
    title: "비와 햇빛을 막아주는 바베큐 데크",
    label: "BBQ",
    image: "/penba/bbq-deck.jpg"
  },
  {
    title: "글램핑 감성이 섞인 야외 공간",
    label: "마당",
    image: "/penba/glamping-yard.jpg"
  },
  {
    title: "펜션 앞 저수지와 산 풍경",
    label: "풍경",
    image: "/penba/reservoir.jpg"
  },
  {
    title: "꽃길 따라 올라가는 펜션 진입로",
    label: "진입",
    image: "/penba/entrance-road.jpg"
  },
  {
    title: "위에서 내려다보는 정원과 데크",
    label: "정원",
    image: "/penba/overlook.jpg"
  }
];

const roleShortcuts = [
  {
    title: "고객 화면",
    label: "Customer",
    body: "유튜브에서 들어온 고객이 숙소 영상, 객실 사진, 날짜, 인원, 옵션을 보고 예약결제로 이어지는 화면입니다.",
    href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=main_role_customer&utm_campaign=baebang-alps",
    action: "예약 화면 보기"
  },
  {
    title: "사장님 관리화면",
    label: "Owner",
    body: "객실, 사진, 유튜브 영상, 네이버 후기, 주변정보, 부대옵션을 등록하고 고객 화면 노출을 확인합니다.",
    href: "/host/rooms",
    action: "운영 콘솔 열기"
  },
  {
    title: "운영자 관리화면",
    label: "Operator",
    body: "입점 숙소, 예약 현황, 결제 프로그램, 운영 지표를 확인하고 플랫폼 운영 흐름을 관리합니다.",
    href: "/host/core-features",
    action: "관리 화면 열기"
  }
];

const memberBenefits = [
  {
    title: "예약 확인 및 변경",
    body: "예약번호를 몰라도 로그인 후 체크인 일정, 객실, 결제 상태, 바베큐 시간을 바로 확인합니다."
  },
  {
    title: "찜한 펜션 관리",
    body: "유튜브로 보고 마음에 든 펜션과 객실을 저장하고 다음 방문 때 이어서 예약합니다."
  },
  {
    title: "예약자 정보 저장",
    body: "이름, 연락처, 기본 인원, 차량 정보를 저장해 다음 예약 입력 시간을 줄입니다."
  },
  {
    title: "알림과 결제 관리",
    body: "입실 안내, 바베큐 이용 시간, 결제/환불 상태를 MY 화면에서 한 번에 확인합니다."
  }
];

const authRoleStructure = [
  {
    role: "고객",
    entry: "네이버/카카오 간편가입",
    allowed: "예약확인, 찜, 결제/환불 확인, MY 정보관리",
    next: "/my"
  },
  {
    role: "사장님",
    entry: "입점 승인 후 파트너 계정",
    allowed: "객실/요금/사진/영상/예약현황/주변정보 관리",
    next: "/host/rooms"
  },
  {
    role: "운영자",
    entry: "내부 관리자 권한",
    allowed: "입점 승인, 전체 예약/결제/정산/성과 집계",
    next: "/host/core-features"
  }
];

const customerOperationStructure = [
  {
    title: "고객 정보관리",
    label: "Week 1 Day 3",
    href: "/my",
    body: "예약자 프로필, 차량, 결제수단, 알림 수신, 찜한 숙소를 한곳에서 관리합니다."
  },
  {
    title: "고객홈 탭 구조",
    label: "Week 1 Day 4",
    href: "/customer-home",
    body: "홈, 객실, 예약, 내예약, MY 하단 탭을 기준으로 고객 화면 이동 구조를 정리합니다."
  }
];

const platformStructure = [
  {
    title: "고객 예약 구조",
    label: "Customer Flow",
    href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=week1_structure_customer&utm_campaign=baebang-alps",
    body: "유튜브에서 들어온 고객이 영상, 사진, 달력, 객실, 옵션, 결제까지 이어지는 예약 중심 화면입니다.",
    items: ["고객홈", "객실", "예약", "내예약", "MY"]
  },
  {
    title: "사장님 운영 구조",
    label: "Owner Flow",
    href: "/host/owner-dashboard",
    body: "사장님이 숙소 자료를 등록하고 고객 화면에 노출될 객실, 사진, 영상, 옵션을 관리하는 화면입니다.",
    items: ["숙소 정보", "객실 관리", "영상 관리", "예약 현황", "운영 집계"]
  },
  {
    title: "운영자 관리 구조",
    label: "Operator Flow",
    href: "/admin/operations",
    body: "펜바TV 운영자가 입점, 예약, 결제, 정산, 유튜브 성과를 전체 관점에서 관리하는 화면입니다.",
    items: ["입점 승인", "전체 예약", "결제 관리", "정산", "성과 집계"]
  }
];

const buildReworkStructure = [
  {
    title: "공통 DB/API 구조",
    label: "Week 1 Day 5",
    href: "/system-architecture",
    body: "예약 가능 여부, 견적, 홀드, 결제, 정산까지 서버 기준으로 처리되는 데이터 구조입니다."
  },
  {
    title: "입점제안 관리",
    label: "Week 1 Day 6",
    href: "/host/proposals",
    body: "펜션 사장님 문의부터 검수, 촬영, 입점 승인, 고객 화면 오픈까지 관리합니다."
  },
  {
    title: "사장님 운영집계",
    label: "Week 1 Day 7",
    href: "/host/owner-dashboard",
    body: "사장님이 예약, 매출, 객실 노출, 유튜브 성과를 확인하는 파트너 대시보드입니다."
  },
  {
    title: "운영자 운영집계",
    label: "Week 1 Day 8",
    href: "/admin/operations",
    body: "펜바TV 운영자가 전체 입점, 예약, 결제, 정산, 캠페인을 통합 관리합니다."
  }
];

const extendedImplementationStructure = [
  {
    title: "예약 운영 고도화",
    label: "Week 2 Day 9",
    href: "/reservation-operations",
    body: "달력, 객실 가능 여부, 바베큐 타임슬롯, 예약 홀드 만료를 운영 기준으로 정리합니다."
  },
  {
    title: "결제·정산 관리",
    label: "Week 2 Day 10",
    href: "/host/payment-settlement",
    body: "토스 결제 승인, 네이버페이/계좌이체 확장, 환불, 사장님 정산 흐름을 관리합니다."
  },
  {
    title: "알림톡·CS 운영",
    label: "Week 2 Day 11",
    href: "/host/notifications",
    body: "예약 완료, 입실 안내, 바베큐 리마인드, 실패 알림 재발송 대기열을 설계합니다."
  },
  {
    title: "테스트·배포 준비",
    label: "Week 2 Day 12",
    href: "/release-readiness",
    body: "로컬 검증, 공개 배포, 환경변수, 인수인계 체크리스트를 한 화면에 정리합니다."
  }
];

const launchHardeningStructure = [
  {
    title: "예약결제 QA 시나리오",
    label: "Week 3 Day 13",
    href: "/qa/reservation-payment",
    body: "고객 유입부터 결제 완료, 실패, 만료, 중복예약 차단까지 테스트 시나리오를 정리합니다."
  },
  {
    title: "콘텐츠 운영 스튜디오",
    label: "Week 3 Day 14",
    href: "/host/content-studio",
    body: "유튜브 전체/외부/내부 영상, 객실 사진, 네이버 후기, 주변정보 게시 상태를 관리합니다."
  },
  {
    title: "권한·보안 점검",
    label: "Week 3 Day 15",
    href: "/admin/security",
    body: "고객, 사장님, 운영자 권한과 관리자 API, 결제 키, 감사로그 점검 기준을 잡습니다."
  },
  {
    title: "런칭 리허설",
    label: "Week 3 Day 16",
    href: "/launch-rehearsal",
    body: "첫 입점 펜션 오픈 전 운영자, 사장님, 고객 관점의 최종 리허설 순서를 확인합니다."
  }
];

const pilotScaleStructure = [
  {
    title: "파일럿 숙소 운영",
    label: "Week 4 Day 17",
    href: "/pilot-operations",
    body: "첫 입점 펜션을 기준으로 예약, 촬영, 사장님 응대, 고객 CS를 파일럿 운영합니다."
  },
  {
    title: "유튜브 마케팅 성과",
    label: "Week 4 Day 18",
    href: "/marketing/youtube-performance",
    body: "영상별 조회, 클릭, 예약 전환, 매출을 보고 어떤 콘텐츠가 예약으로 이어지는지 확인합니다."
  },
  {
    title: "외부채널 연동 준비",
    label: "Week 4 Day 19",
    href: "/integrations/channel-sync",
    body: "네이버예약, 야놀자, 여기어때, iCal 차단일을 펜바TV 예약 가능 여부에 반영하는 구조입니다."
  },
  {
    title: "정식 운영 로드맵",
    label: "Week 4 Day 20",
    href: "/operations-roadmap",
    body: "파일럿 이후 충청권 펜션 확장, 광고 상품화, 정산 자동화, 운영 인력 계획을 정리합니다."
  }
];

const weekOnePlan = [
  { day: "1일차", title: "메인홈 구조 확정", status: "완료" },
  { day: "2일차", title: "회원/권한 구조 설계", status: "완료" },
  { day: "3일차", title: "고객 정보관리 설계", status: "완료" },
  { day: "4일차", title: "고객홈 탭 구조 정리", status: "완료" },
  { day: "5일차", title: "공통 DB/API 구조", status: "완료" },
  { day: "6일차", title: "입점제안 관리", status: "완료" },
  { day: "7일차", title: "사장님 운영집계", status: "완료" },
  { day: "8일차", title: "운영자 운영집계", status: "완료" },
  { day: "9일차", title: "예약 운영 고도화", status: "완료" },
  { day: "10일차", title: "결제·정산 관리", status: "완료" },
  { day: "11일차", title: "알림톡·CS 운영", status: "완료" },
  { day: "12일차", title: "테스트·배포 준비", status: "완료" },
  { day: "13일차", title: "예약결제 QA", status: "완료" },
  { day: "14일차", title: "콘텐츠 운영", status: "완료" },
  { day: "15일차", title: "권한·보안 점검", status: "완료" },
  { day: "16일차", title: "런칭 리허설", status: "완료" },
  { day: "17일차", title: "파일럿 숙소 운영", status: "완료" },
  { day: "18일차", title: "유튜브 성과 분석", status: "완료" },
  { day: "19일차", title: "외부채널 연동", status: "완료" },
  { day: "20일차", title: "정식 운영 로드맵", status: "완료" }
];

export default function HomePage() {
  const heroProperty = mockPartnerProperties[0];
  const representativeProperties = mockPartnerProperties.slice(0, 3);
  const featuredVideos = penbaVideoFeed.filter((video) => video.propertyId === "baebang-alps").slice(0, 9);

  return (
    <main className="penba-home">
      <header className="penba-topbar" aria-label="펜바TV 상단 회원 메뉴">
        <Link className="penba-brand" href="/">
          펜바TV
        </Link>
        <nav className="member-auth-actions" aria-label="회원가입과 로그인">
          <Link className="member-login-link" href="/auth?mode=login">
            로그인
          </Link>
          <Link className="naver-auth-link" href="/auth?provider=naver">
            네이버 본인인증 가입
          </Link>
          <Link className="kakao-auth-link" href="/auth?provider=kakao">
            카카오 간편가입
          </Link>
        </nav>
      </header>

      <section className="penba-hero platform-style">
        <div>
          <p className="muted">PenBa TV Premium Pension</p>
          <h1>영상으로 보고 예약하는 펜션·바베큐 플랫폼</h1>
          <p>
            유튜브 숏폼과 롱폼 영상을 여러 개 연결해 숙소 매력을 먼저 보여주고, 날짜·객실·바베큐장 예약결제로 바로 이어갑니다.
          </p>
          <form className="home-search" action={`/stays/${heroProperty.id}`}>
            <input name="q" placeholder="어디로 힐링 펜션을 떠날까요?" aria-label="펜션 검색" />
            <button type="submit">검색</button>
          </form>
        </div>
        <div className="hero-video-stack">
          {featuredVideos.slice(0, 3).map((video) => (
            <a href={video.url} target="_blank" rel="noreferrer" key={`${video.propertyId}-${video.title}`}>
              <span style={{ backgroundImage: `url(${video.thumbnailUrl ?? video.heroUrl})` }} />
              <b>{video.tag}</b>
              <small>{video.duration}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="member-benefit-panel" id="member-benefits" aria-label="회원가입 후 이용 기능">
        <div>
          <span>Member Experience</span>
          <h2>네이버·카카오 본인인증으로 가입하고 예약을 편하게 관리합니다.</h2>
          <p>
            실제 운영 단계에서는 네이버/카카오 인증으로 본인 확인 후, 고객 MY에서 예약확인, 찜, 결제·환불, 알림 정보를 관리하는 구조로 확장합니다.
          </p>
        </div>
        <div className="member-benefit-grid">
          {memberBenefits.map((benefit) => (
            <article key={benefit.title}>
              <b>{benefit.title}</b>
              <small>{benefit.body}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-structure-panel" aria-label="2일차 회원과 권한 구조">
        <div className="section-head">
          <h2>회원·권한 구조</h2>
          <span>1주차 2일차 · 가입 후 화면 분기</span>
        </div>
        <div className="auth-role-grid">
          {authRoleStructure.map((item) => (
            <Link className="auth-role-card" href={item.next} key={item.role}>
              <span>{item.entry}</span>
              <h3>{item.role}</h3>
              <p>{item.allowed}</p>
            </Link>
          ))}
        </div>
        <div className="auth-flow-band">
          <b>기본 흐름</b>
          <span>유튜브 유입</span>
          <span>네이버/카카오 가입</span>
          <span>역할 확인</span>
          <span>고객 MY 또는 관리화면 이동</span>
          <Link href="/auth">회원가입 설계 화면 보기</Link>
        </div>
      </section>

      <section className="customer-rework-panel" aria-label="3일차와 4일차 고객 화면 재정비">
        <div className="section-head">
          <h2>고객 화면 재정비</h2>
          <span>3일차 · 고객 정보관리 / 4일차 · 고객홈 탭 구조</span>
        </div>
        <div className="customer-rework-grid">
          {customerOperationStructure.map((item) => (
            <Link className="customer-rework-card" href={item.href} key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <b>화면 보기</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="build-rework-panel" aria-label="5일차부터 8일차 운영 구조 재정비">
        <div className="section-head">
          <h2>운영 구조 재정비</h2>
          <span>5일차 · DB/API / 6일차 · 입점 / 7일차 · 사장님 / 8일차 · 운영자</span>
        </div>
        <div className="build-rework-grid">
          {buildReworkStructure.map((item) => (
            <Link className="build-rework-card" href={item.href} key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <b>화면 보기</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="build-rework-panel" aria-label="9일차부터 12일차 서비스 운영 구현">
        <div className="section-head">
          <h2>서비스 운영 구현</h2>
          <span>9일차 · 예약 / 10일차 · 결제정산 / 11일차 · 알림CS / 12일차 · 배포준비</span>
        </div>
        <div className="build-rework-grid">
          {extendedImplementationStructure.map((item) => (
            <Link className="build-rework-card" href={item.href} key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <b>화면 보기</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="build-rework-panel" aria-label="13일차부터 16일차 런칭 고도화">
        <div className="section-head">
          <h2>런칭 고도화</h2>
          <span>13일차 · QA / 14일차 · 콘텐츠 / 15일차 · 보안 / 16일차 · 리허설</span>
        </div>
        <div className="build-rework-grid">
          {launchHardeningStructure.map((item) => (
            <Link className="build-rework-card" href={item.href} key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <b>화면 보기</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="build-rework-panel" aria-label="17일차부터 20일차 파일럿 확장 운영">
        <div className="section-head">
          <h2>파일럿 확장 운영</h2>
          <span>17일차 · 파일럿 / 18일차 · 마케팅 / 19일차 · 채널연동 / 20일차 · 로드맵</span>
        </div>
        <div className="build-rework-grid">
          {pilotScaleStructure.map((item) => (
            <Link className="build-rework-card" href={item.href} key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <b>화면 보기</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="role-shortcut-panel" aria-label="고객, 사장님, 운영자 바로가기">
        <div className="section-head">
          <h2>역할별 바로가기</h2>
          <span>고객 화면 · 사장님 관리화면 · 운영자 관리화면</span>
        </div>
        <div className="role-shortcut-grid">
          {roleShortcuts.map((shortcut) => (
            <Link className="role-shortcut-card" href={shortcut.href} key={shortcut.title}>
              <span>{shortcut.label}</span>
              <h3>{shortcut.title}</h3>
              <p>{shortcut.body}</p>
              <b>{shortcut.action}</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="market-section structure-rework-panel" aria-label="1주차 전체 구조 재정비">
        <div className="section-head">
          <h2>플랫폼 구조 한눈에</h2>
          <span>1주차 1일차 · 메인홈 구조 확정</span>
        </div>
        <div className="structure-map-grid">
          {platformStructure.map((item) => (
            <Link className="structure-map-card" href={item.href} key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div>
                {item.items.map((label) => (
                  <b key={label}>{label}</b>
                ))}
              </div>
            </Link>
          ))}
        </div>
        <div className="week-one-strip" aria-label="1주차 개발 순서">
          {weekOnePlan.map((step) => (
            <article className={step.status === "진행중" ? "active" : ""} key={step.day}>
              <span>{step.day}</span>
              <b>{step.title}</b>
              <small>{step.status}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="market-section top-property-showcase">
        <div className="section-head">
          <h2>입점 숙소 대표화면</h2>
          <span>영상 광고에서 바로 연결되는 3개 예약 화면</span>
        </div>
        <div className="property-grid">
          {representativeProperties.map((property) => (
            <article className="property-card" key={property.id}>
              <Link
                className="property-image"
                href={`/stays/${property.id}?utm_source=penbatv&utm_medium=main_top_property&utm_campaign=${property.id}`}
                style={{ backgroundImage: `url(${property.heroUrl})` }}
                aria-label={`${property.name} 예약 화면 보기`}
              />
              <div className="property-body">
                <div className="property-title">
                  <div>
                    <span>{property.area}</span>
                    <h3>{property.name}</h3>
                  </div>
                  <b>{partnerStatusLabels[property.status]}</b>
                </div>
                <p>{property.concept}</p>
                <div className="property-tags">
                  {property.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <dl className="property-format">
                  <div>
                    <dt>광고</dt>
                    <dd>{adPlanLabels[property.adPlan]}</dd>
                  </div>
                  <div>
                    <dt>예약</dt>
                    <dd>{reservationModeLabels[property.reservationMode]}</dd>
                  </div>
                  <div>
                    <dt>영상</dt>
                    <dd>{property.videoLinks.length}개</dd>
                  </div>
                </dl>
                <div className="property-actions">
                  <b>{formatWon(property.minPrice)}~</b>
                  <Link href={`/stays/${property.id}?utm_source=penbatv&utm_medium=main_top_property&utm_campaign=${property.id}`}>
                    예약 화면
                  </Link>
                  <Link href={`/booking-calendar-status?accommodationId=${property.id}`}>
                    예약 현황
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="market-metrics" aria-label="펜바TV 운영 지표">
        {platformMetrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <b>{metric.value}</b>
          </div>
        ))}
      </section>

      <section className="market-section">
        <div className="section-head">
          <h2>배방알프스 실제 사진</h2>
          <span>객실·바베큐장·저수지·진입로</span>
        </div>
        <div className="real-photo-grid">
          {realPhotoStories.map((photo) => (
            <article className="real-photo-card" key={photo.title}>
              <div style={{ backgroundImage: `url(${photo.image})` }} />
              <span>{photo.label}</span>
              <h3>{photo.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="category-grid" aria-label="펜션 검색 카테고리">
        {categoryItems.map((item) => (
          <Link href={item.href} key={item.label}>
            <span>{item.initial}</span>
            <b>{item.label}</b>
          </Link>
        ))}
      </section>

      <section className="market-section">
        <div className="section-head">
          <h2>펜바TV 숏폼 피드</h2>
          <span>영상 보고 예약 연결</span>
        </div>
        <div className="shorts-feed">
          {mockPartnerProperties.map((property) => (
            <Link
              className="short-card"
              href={`/stays/${property.id}?utm_source=penbatv&utm_medium=shorts&utm_campaign=${property.id}`}
              key={property.id}
              style={{ backgroundImage: `url(${property.heroUrl})` }}
            >
              <span className="short-badge">PENBA TV</span>
              <div>
                <b>{property.featuredVideoTitle}</b>
                <small>
                  {property.area} · {reservationModeLabels[property.reservationMode]}
                </small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="market-section">
        <div className="section-head">
          <h2>유튜브 영상 모아보기</h2>
          <span>숙소별 여러 영상 링크</span>
        </div>
        <div className="youtube-link-grid">
          {featuredVideos.map((video) => (
            <article className="youtube-link-card" key={`${video.propertyId}-${video.title}`}>
              <a className="youtube-thumb" href={video.url} target="_blank" rel="noreferrer" style={{ backgroundImage: `url(${video.thumbnailUrl ?? video.heroUrl})` }}>
                <span>PLAY</span>
              </a>
              <div>
                <span>{video.propertyName} · {video.area}</span>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <div className="youtube-card-actions">
                  <a href={video.url} target="_blank" rel="noreferrer">
                    유튜브 보기
                  </a>
                  <Link href={`/stays/${video.propertyId}?utm_source=penbatv&utm_medium=youtube_link&utm_campaign=${video.propertyId}`}>
                    예약 화면
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="market-section">
        <div className="section-head">
          <h2>추천 컬렉션</h2>
          <span>펜션·바베큐 특화</span>
        </div>
        <div className="collection-grid">
          {quickCollections.map((collection) => (
            <Link className="collection-card" href={collection.href} key={collection.title}>
              <span>{collection.eyebrow}</span>
              <h3>{collection.title}</h3>
              <p>{collection.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="market-section">
        <div className="section-head">
          <h2>펜바TV 매거진</h2>
          <span>영상 광고와 예약 운영 팁</span>
        </div>
        <div className="magazine-list">
          {magazineItems.map((item) => (
            <article key={item.title}>
              <span>{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-center-band">
        <div>
          <span>Business Partnership</span>
          <h2>펜션 사장님, 유튜브 홍보와 예약결제를 한 번에 시작하세요.</h2>
        </div>
        <div className="penba-actions">
          <Link className="hero-action" href="/host/properties">
            펜션 등록하기
          </Link>
          <Link className="ghost-action" href="/host/core-features">
            예약결제 구조 보기
          </Link>
          <Link className="ghost-action" href="/host/reservation-payment">
            예약 결제 프로그램
          </Link>
          <Link className="ghost-action" href="/host/make24-benchmark">
            입점 제안 보기
          </Link>
          <Link className="ghost-action" href="/host/design-benchmark">
            디자인 선택
          </Link>
        </div>
      </section>

      <nav className="home-bottom-tabs" aria-label="펜바TV 모바일 메뉴">
        <Link className="on" href="/">
          홈
        </Link>
        <Link href="/customer-home">고객홈</Link>
        <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=home_bottom_reserve&utm_campaign=baebang-alps">
          예약
        </Link>
        <Link href="/my">내예약</Link>
        <Link href="/my">MY</Link>
      </nav>
    </main>
  );
}
