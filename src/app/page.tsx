import Image from "next/image";
import Link from "next/link";
import {
  mockPartnerProperties,
  penbaVideoFeed,
  reservationModeLabels
} from "@/lib/platform-data";
import { formatWon } from "@/lib/local-quote";

const quickLinks = [
  {
    title: "고객 화면",
    body: "유튜브 설명란 링크를 누른 고객이 사진, 영상, 일정, 객실, 결제까지 진행합니다.",
    href: "/stays/baebang-alps?utm_source=penbatv&utm_medium=main_customer&utm_campaign=baebang-alps",
    action: "예약 시연"
  },
  {
    title: "사장님 관리",
    body: "객실, 요금, 사진, 영상, 후기, 주변정보와 예약 현황을 관리합니다.",
    href: "/host/rooms",
    action: "관리화면"
  },
  {
    title: "운영자 관리",
    body: "입점 승인, 전체 예약, 결제, 정산, 유튜브 성과를 확인합니다.",
    href: "/admin/operations",
    action: "운영화면"
  }
];

const reservationSteps = [
  "유튜브 영상 시청",
  "설명란 펜바TV 링크 클릭",
  "숙소 홈에서 사진·영상 확인",
  "달력에서 가능일 선택",
  "객실·인원·옵션 선택",
  "서버 견적 확인 후 결제"
];

const categoryLinks = [
  ["독채펜션", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=private"],
  ["바베큐장", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=bbq"],
  ["글램핑 감성", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=glamping"],
  ["저수지뷰", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=view"],
  ["가족단체", "/stays/river-forest-stay?utm_source=penbatv&utm_medium=home_category&utm_campaign=family"],
  ["바로결제", "/booking-calendar-status?accommodationId=baebang-alps"]
];

const demoChecklist = [
  "날짜별 객실 예약 가능 여부",
  "객실 사진·영상 확인 후 예약 진행",
  "서버 기준 견적 계산",
  "테스트 결제 후 예약 확정",
  "사장님 예약 현황 확인"
];

export default function HomePage() {
  const properties = mockPartnerProperties.slice(0, 3);
  const heroProperty = properties[0];
  const videos = penbaVideoFeed.filter((video) => video.propertyId === "baebang-alps").slice(0, 6);

  return (
    <main className="penba-main-home">
      <header className="main-home-topbar">
        <Link className="main-home-logo" href="/">
          <span>PenBa TV</span>
          <b>펜션·바베큐 예약 플랫폼</b>
        </Link>
        <nav aria-label="상단 바로가기">
          <Link href="/platform-guide">설명용 기존 메인</Link>
          <Link href="/auth?provider=naver">네이버 가입</Link>
          <Link href="/auth?provider=kakao">카카오 가입</Link>
          <Link href="/my">MY</Link>
        </nav>
      </header>

      <section className="main-home-hero" aria-label="펜바TV 메인 소개">
        <div className="main-hero-copy">
          <span>유튜브에서 보고 바로 예약</span>
          <h1>펜션 영상이 고객 예약결제로 이어지는 펜바TV</h1>
          <p>
            의뢰자 시연용 메인 화면입니다. 고객은 유튜브 설명란 링크로 들어와 숙소 영상과 객실 사진을 확인하고,
            달력에서 가능한 날짜를 고른 뒤 객실·인원·바베큐 옵션을 선택해 결제까지 진행합니다.
          </p>
          <div className="main-hero-actions">
            <Link href={`/stays/${heroProperty.id}?utm_source=penbatv&utm_medium=hero_demo&utm_campaign=${heroProperty.id}`}>
              고객 예약 시연하기
            </Link>
            <Link href="/host/rooms">사장님 관리 보기</Link>
            <Link href="/platform-guide">기존 메인 설명 보기</Link>
          </div>
        </div>
        <div className="main-hero-photo">
          <Image
            src="/penba/glamping-yard.jpg"
            alt="배방알프스 글램핑 감성 야외 공간"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 420px"
          />
          <div>
            <b>{heroProperty.name}</b>
            <span>{heroProperty.area} · {formatWon(heroProperty.minPrice)}부터</span>
          </div>
        </div>
      </section>

      <section className="main-role-grid" aria-label="시연 바로가기">
        {quickLinks.map((item) => (
          <Link href={item.href} key={item.title}>
            <span>{item.action}</span>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </Link>
        ))}
      </section>

      <section className="main-section" aria-label="입점 숙소 대표 화면">
        <div className="main-section-head">
          <div>
            <span>입점 숙소 대표화면</span>
            <h2>상단에서 바로 보여줄 3개 숙소</h2>
          </div>
          <Link href="/host/properties">입점 등록</Link>
        </div>
        <div className="main-property-grid">
          {properties.map((property) => (
            <article key={property.id}>
              <Link
                className="main-property-image"
                href={`/stays/${property.id}?utm_source=penbatv&utm_medium=main_property&utm_campaign=${property.id}`}
              >
                <Image
                  src={property.heroUrl}
                  alt={`${property.name} 대표 이미지`}
                  fill
                  sizes="(max-width: 800px) 100vw, 33vw"
                />
              </Link>
              <div className="main-property-body">
                <span>{property.area}</span>
                <h3>{property.name}</h3>
                <p>{property.concept}</p>
                <div className="main-property-tags">
                  {property.tags.slice(0, 4).map((tag) => (
                    <b key={tag}>{tag}</b>
                  ))}
                </div>
                <div className="main-property-bottom">
                  <strong>{formatWon(property.minPrice)}~</strong>
                  <small>{reservationModeLabels[property.reservationMode]}</small>
                </div>
                <div className="main-card-actions">
                  <Link href={`/stays/${property.id}?utm_source=penbatv&utm_medium=main_card_reserve&utm_campaign=${property.id}`}>
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

      <section className="main-section split" aria-label="유튜브 예약 전환 흐름">
        <div>
          <div className="main-section-head compact">
            <div>
              <span>시연 시나리오</span>
              <h2>유튜브에서 예약결제까지</h2>
            </div>
          </div>
          <ol className="main-flow-list">
            {reservationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="main-demo-status">
          <span>MVP 구현 상태</span>
          <h2>오늘 보여줄 수 있는 기능</h2>
          {demoChecklist.map((item) => (
            <b key={item}>{item}</b>
          ))}
        </div>
      </section>

      <section className="main-section" aria-label="배방알프스 유튜브 영상">
        <div className="main-section-head">
          <div>
            <span>YouTube Contents</span>
            <h2>전체·외부·내부 영상 링크</h2>
          </div>
          <Link href={`/stays/${heroProperty.id}?utm_source=penbatv&utm_medium=video_more&utm_campaign=${heroProperty.id}`}>
            영상 보고 예약
          </Link>
        </div>
        <div className="main-video-grid">
          {videos.map((video) => (
            <a href={video.url} target="_blank" rel="noreferrer" key={video.title}>
              <Image
                src={video.thumbnailUrl ?? heroProperty.heroUrl}
                alt={video.title}
                width={360}
                height={210}
                sizes="(max-width: 800px) 100vw, 33vw"
              />
              <span>{video.tag}</span>
              <b>{video.title}</b>
              <small>{video.description}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="main-category-strip" aria-label="검색 카테고리">
        {categoryLinks.map(([label, href]) => (
          <Link href={href} key={label}>{label}</Link>
        ))}
      </section>

      <section className="main-partner-band" aria-label="입점 제안">
        <div>
          <span>Partner Offer</span>
          <h2>펜션 사장님에게는 유튜브 홍보와 예약결제를 함께 제안합니다.</h2>
          <p>입점 제안, 디자인 선택, 객실 등록, 예약 현황 확인까지 운영 화면에서 이어집니다.</p>
        </div>
        <div>
          <Link href="/host/proposals">입점 제안 관리</Link>
          <Link href="/host/design-benchmark">디자인 선택</Link>
          <Link href="/host/owner-dashboard">사장님 예약 현황</Link>
        </div>
      </section>

      <nav className="home-bottom-tabs" aria-label="모바일 하단 메뉴">
        <Link className="on" href="/">홈</Link>
        <Link href="/platform-guide">설명</Link>
        <Link href={`/stays/${heroProperty.id}?utm_source=penbatv&utm_medium=bottom_booking&utm_campaign=${heroProperty.id}`}>
          예약
        </Link>
        <Link href="/my">내예약</Link>
        <Link href="/my">MY</Link>
      </nav>
    </main>
  );
}
