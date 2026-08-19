import Image from "next/image";
import Link from "next/link";
import {
  mockPartnerProperties,
  penbaVideoFeed,
  reservationModeLabels
} from "@/lib/platform-data";
import { formatWon } from "@/lib/local-quote";

const categoryLinks = [
  ["독채", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=private"],
  ["바베큐", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=bbq"],
  ["글램핑", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=glamping"],
  ["저수지뷰", "/stays/baebang-alps?utm_source=penbatv&utm_medium=home_category&utm_campaign=view"],
  ["가족단체", "/stays/river-forest-stay?utm_source=penbatv&utm_medium=home_category&utm_campaign=family"]
];

const bookingFlow = [
  "유튜브에서 숙소 분위기 확인",
  "펜바TV 링크로 예약 가능한 날짜 조회",
  "객실 사진과 내부/외부 영상 확인",
  "인원과 바베큐 옵션 선택",
  "결제 후 내예약에서 바로 확인"
];

const trustItems = [
  ["영상 확인", "실제 공간을 먼저 보고 선택"],
  ["예약 가능일", "막힌 날짜는 선택 차단"],
  ["간편 로그인", "네이버·카카오로 빠른 가입"],
  ["내예약", "결제 후 일정과 옵션 확인"]
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
          <b>영상으로 보고 바로 예약</b>
        </Link>
        <nav className="main-home-nav" aria-label="상단 바로가기">
          <a href="#featured-stays">숙소찾기</a>
          <a href="#video-stories">영상보기</a>
          <Link className="main-reserve-link" href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=top_booking&utm_campaign=${heroProperty.id}`}>
            예약하기
          </Link>
        </nav>
        <div className="main-home-account" aria-label="회원 메뉴">
          <Link className="naver-login" href="/auth?provider=naver">네이버로 시작</Link>
          <Link className="kakao-login" href="/auth?provider=kakao">카카오로 시작</Link>
          <Link href="/my">MY</Link>
        </div>
      </header>

      <section className="main-home-hero" aria-label="펜바TV 메인">
        <div className="main-hero-copy">
          <span>YOUTUBE TO BOOKING</span>
          <h1>영상으로 확인하고, 날짜 보고, 바로 예약하는 펜션 플랫폼</h1>
          <p>
            펜바TV는 유튜브에서 본 펜션과 바베큐장을 고객 예약으로 연결합니다. 사진만 보고 고르는 불안함을 줄이고,
            실제 영상과 객실 정보를 확인한 뒤 예약 가능한 날짜만 선택하게 만듭니다.
          </p>
          <div className="main-hero-actions">
            <Link href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=hero_booking&utm_campaign=${heroProperty.id}`}>
              지금 예약하기
            </Link>
            <a href="#video-stories">영상 먼저 보기</a>
            <Link href="/auth?provider=kakao">간편 가입</Link>
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
            <span>{heroProperty.area} · {formatWon(heroProperty.minPrice)}부터 · 바베큐 가능</span>
          </div>
        </div>
      </section>

      <section className="main-search-panel" aria-label="예약 검색">
        <div>
          <span>빠른 예약 검색</span>
          <h2>언제, 몇 명이 떠나세요?</h2>
        </div>
        <form action={`/stays/${heroProperty.id}`} method="get">
          <input type="hidden" name="start" value="booking" />
          <input type="hidden" name="utm_source" value="penbatv" />
          <input type="hidden" name="utm_medium" value="home_search" />
          <input type="hidden" name="utm_campaign" value={heroProperty.id} />
          <label>
            지역
            <select name="area" defaultValue="asan">
              <option value="asan">충남 아산·천안</option>
              <option value="hongcheon">강원 홍천</option>
              <option value="namhae">경남 남해</option>
            </select>
          </label>
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
          <label>
            옵션
            <select name="option" defaultValue="bbq">
              <option value="bbq">바베큐 포함</option>
              <option value="fire">불멍 포함</option>
              <option value="room">숙박만</option>
            </select>
          </label>
          <button type="submit">예약 가능 숙소 보기</button>
        </form>
      </section>

      <section className="main-trust-strip" aria-label="서비스 핵심">
        {trustItems.map(([title, body]) => (
          <article key={title}>
            <b>{title}</b>
            <span>{body}</span>
          </article>
        ))}
      </section>

      <section className="main-category-strip" aria-label="검색 카테고리">
        {categoryLinks.map(([label, href]) => (
          <Link href={href} key={label}>{label}</Link>
        ))}
      </section>

      <section className="main-section" id="featured-stays" aria-label="추천 숙소">
        <div className="main-section-head">
          <div>
            <span>FEATURED STAYS</span>
            <h2>이번 주 바로 보기 좋은 숙소</h2>
          </div>
          <Link href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=featured_more&utm_campaign=${heroProperty.id}`}>
            예약 가능한 날짜 보기
          </Link>
        </div>
        <div className="main-property-grid">
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
                <span>{index === 0 ? "오늘 예약 가능" : reservationModeLabels[property.reservationMode]}</span>
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
                  <small>영상 {property.videoLinks.length}개</small>
                </div>
                <div className="main-card-actions">
                  <Link href={`/stays/${property.id}?start=booking&utm_source=penbatv&utm_medium=main_card_reserve&utm_campaign=${property.id}`}>
                    예약하기
                  </Link>
                  <a href={property.featuredVideoUrl} target="_blank" rel="noreferrer">
                    영상보기
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="main-section main-story-board" aria-label="예약 흐름">
        <div>
          <span>HOW IT WORKS</span>
          <h2>유튜브에서 보고 온 고객이 헤매지 않게</h2>
          <p>메인, 숙소 상세, 예약, 결제, 내예약까지 같은 흐름으로 이어지게 설계합니다.</p>
        </div>
        <ol className="main-flow-list">
          {bookingFlow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="main-section" id="video-stories" aria-label="배방알프스 유튜브 영상">
        <div className="main-section-head">
          <div>
            <span>VIDEO STORIES</span>
            <h2>전체·외부·내부·바베큐를 영상으로 먼저 보기</h2>
          </div>
          <Link href={`/stays/${heroProperty.id}?start=booking&utm_source=penbatv&utm_medium=video_reserve&utm_campaign=${heroProperty.id}`}>
            영상 보고 예약하기
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

      <section className="main-partner-band" aria-label="입점 제안">
        <div>
          <span>FOR PARTNERS</span>
          <h2>펜션 사장님이라면 영상 홍보와 예약결제를 함께 시작하세요.</h2>
          <p>입점 신청 후 객실, 사진, 영상, 요금, 예약 현황을 직접 관리할 수 있는 화면으로 연결됩니다.</p>
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
