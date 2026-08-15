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

export default function HomePage() {
  const heroProperty = mockPartnerProperties[0];
  const featuredVideos = penbaVideoFeed.filter((video) => video.propertyId === "baebang-alps").slice(0, 9);

  return (
    <main className="penba-home">
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
          <h2>입점 펜션</h2>
          <span>광고 노출 + 예약결제</span>
        </div>
        <div className="property-grid">
          {mockPartnerProperties.map((property) => (
            <article className="property-card" key={property.id}>
              <Link
                className="property-image"
                href={`/stays/${property.id}?utm_source=penbatv&utm_medium=listing&utm_campaign=${property.id}`}
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
                  <Link href={`/stays/${property.id}?utm_source=penbatv&utm_medium=listing&utm_campaign=${property.id}`}>
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
        <Link href="/host/core-features">예약</Link>
        <Link href="/host/properties">입점</Link>
        <Link href="/host/rooms">관리</Link>
      </nav>
    </main>
  );
}
