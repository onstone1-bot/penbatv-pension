import Image from "next/image";
import Link from "next/link";
import {
  mockPartnerProperties,
  penbaVideoFeed,
  reservationModeLabels
} from "@/lib/platform-data";
import { formatWon } from "@/lib/local-quote";

const quickLinks = [
  ["예약", "#quick-booking"],
  ["숙소", "#featured-stays"],
  ["영상", "#video-stories"],
  ["입점", "/partner-inquiry"]
];

const simpleSteps = ["날짜 선택", "객실 확인", "결제 진행"];

export default function HomePage() {
  const properties = mockPartnerProperties.slice(0, 3);
  const heroProperty = properties[0];
  const videos = penbaVideoFeed.filter((video) => video.propertyId === "baebang-alps").slice(0, 4);

  return (
    <main className="penba-main-home simple-home">
      <header className="main-home-topbar simple-topbar">
        <Link className="main-home-logo" href="/">
          <span>PenBa TV</span>
          <b>펜션·바베큐 예약</b>
        </Link>
        <nav className="main-home-nav" aria-label="상단 바로가기">
          {quickLinks.map(([label, href]) =>
            href.startsWith("#") ? <a href={href} key={label}>{label}</a> : <Link href={href} key={label}>{label}</Link>
          )}
        </nav>
        <div className="main-home-account" aria-label="회원 메뉴">
          <Link className="main-login-link" href="/auth">로그인</Link>
          <Link href="/my">MY</Link>
        </div>
      </header>

      <section className="main-home-hero simple-hero" aria-label="펜바TV 메인">
        <div className="main-hero-copy">
          <span>YOUTUBE TO BOOKING</span>
          <h1>영상 보고 바로 예약</h1>
          <p>유튜브에서 본 펜션을 펜바TV에서 날짜 확인 후 바로 예약합니다.</p>
          <div className="main-hero-actions">
            <Link href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=hero_booking&utm_campaign=${heroProperty.id}`}>
              예약 시작
            </Link>
            <a href="#featured-stays">숙소 보기</a>
          </div>
          <div className="simple-step-row" aria-label="예약 흐름">
            {simpleSteps.map((step, index) => (
              <span key={step}>{index + 1}. {step}</span>
            ))}
          </div>
        </div>
        <Link
          className="main-hero-photo simple-hero-photo"
          href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=hero_photo&utm_campaign=${heroProperty.id}`}
        >
          <Image
            src="/penba/glamping-yard.jpg"
            alt="배방알프스 글램핑 감성 야외 공간"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 460px"
          />
          <div>
            <b>{heroProperty.name}</b>
            <span>{heroProperty.area} · {formatWon(heroProperty.minPrice)}부터</span>
          </div>
        </Link>
      </section>

      <section className="main-search-panel simple-search" id="quick-booking" aria-label="예약 검색">
        <div>
          <span>빠른 예약</span>
          <h2>일정과 인원만 먼저 선택하세요.</h2>
        </div>
        <form action={`/stays/${heroProperty.id}`} method="get">
          <input type="hidden" name="start" value="booking" />
          <input type="hidden" name="utm_source" value="penbatv" />
          <input type="hidden" name="utm_medium" value="home_simple_search" />
          <input type="hidden" name="utm_campaign" value={heroProperty.id} />
          <label>
            체크인
            <input type="date" name="checkIn" defaultValue="2026-08-22" />
          </label>
          <label>
            체크아웃
            <input type="date" name="checkOut" defaultValue="2026-08-23" />
          </label>
          <label>
            인원
            <select name="guests" defaultValue="4">
              <option value="2">2명</option>
              <option value="4">4명</option>
              <option value="6">6명</option>
              <option value="8">8명 이상</option>
            </select>
          </label>
          <button type="submit">예약 가능일 보기</button>
        </form>
      </section>

      <section className="main-section simple-section" id="featured-stays" aria-label="추천 숙소">
        <div className="main-section-head">
          <div>
            <span>STAYS</span>
            <h2>추천 숙소</h2>
          </div>
          <Link href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=featured_more&utm_campaign=${heroProperty.id}`}>
            전체 예약화면
          </Link>
        </div>
        <div className="main-property-grid simple-property-grid">
          {properties.map((property, index) => (
            <article key={property.id}>
              <Link
                className="main-property-image"
                href={`/stays/${property.id}?start=booking&utm_source=penbatv&utm_medium=main_property&utm_campaign=${property.id}`}
              >
                <Image
                  src={property.heroUrl}
                  alt={`${property.name} 대표 이미지`}
                  fill
                  sizes="(max-width: 800px) 100vw, 33vw"
                />
                <span>{index === 0 ? "예약 가능" : reservationModeLabels[property.reservationMode]}</span>
              </Link>
              <div className="main-property-body">
                <span>{property.area}</span>
                <h3>{property.name}</h3>
                <p>{property.concept}</p>
                <div className="main-property-bottom">
                  <strong>{formatWon(property.minPrice)}~</strong>
                  <small>영상 {property.videoLinks.length}개</small>
                </div>
                <div className="main-card-actions">
                  <Link href={`/stays/${property.id}?start=booking&utm_source=penbatv&utm_medium=main_card_reserve&utm_campaign=${property.id}`}>
                    예약하기
                  </Link>
                  <a href={property.featuredVideoUrl} target="_blank" rel="noreferrer">영상</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="main-section simple-section" id="video-stories" aria-label="유튜브 영상">
        <div className="main-section-head">
          <div>
            <span>VIDEOS</span>
            <h2>영상으로 먼저 보기</h2>
          </div>
          <Link href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=video_reserve&utm_campaign=${heroProperty.id}`}>
            보고 예약
          </Link>
        </div>
        <div className="main-video-grid simple-video-grid">
          {videos.map((video) => (
            <a href={video.url} target="_blank" rel="noreferrer" key={video.title}>
              <Image
                src={video.thumbnailUrl ?? heroProperty.heroUrl}
                alt={video.title}
                width={360}
                height={210}
                sizes="(max-width: 800px) 100vw, 25vw"
              />
              <span>{video.tag}</span>
              <b>{video.title}</b>
            </a>
          ))}
        </div>
      </section>

      <section className="main-partner-band simple-partner-band" aria-label="입점 제안">
        <div>
          <span>PARTNER</span>
          <h2>펜션 입점 문의</h2>
          <p>영상 홍보와 예약결제 운영을 함께 시작합니다.</p>
        </div>
        <div>
          <Link href="/partner-inquiry">입점 문의</Link>
          <Link href="/host/rooms">사장님 관리</Link>
        </div>
      </section>

      <nav className="home-bottom-tabs" aria-label="모바일 하단 메뉴">
        <Link className="on" href="/">홈</Link>
        <a href="#featured-stays">숙소</a>
        <Link href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=bottom_booking&utm_campaign=${heroProperty.id}`}>
          예약
        </Link>
        <Link href="/my">내예약</Link>
        <Link href="/my">MY</Link>
      </nav>
    </main>
  );
}