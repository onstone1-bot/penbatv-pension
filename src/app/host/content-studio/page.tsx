import Link from "next/link";
import { mockPartnerProperties, penbaVideoFeed } from "@/lib/platform-data";

const contentMetrics = [
  { label: "등록 영상", value: `${penbaVideoFeed.length}개`, detail: "전체/외부/내부/바베큐" },
  { label: "대표 이미지", value: "16장", detail: "배방알프스 실사진" },
  { label: "네이버 후기", value: "2건", detail: "블로그/리뷰" },
  { label: "주변 정보", value: "4건", detail: "맛집/가볼만한곳" }
];

const contentBuckets = [
  {
    title: "전체 소개 영상",
    body: "유튜브 설명란에서 들어온 고객에게 숙소 전체 분위기와 예약 이유를 먼저 보여줍니다.",
    items: ["롱폼 대표 영상", "쇼츠 대표 클립", "고정 댓글 예약 링크"]
  },
  {
    title: "외부 공간",
    body: "진입로, 주차, 마당, 바베큐장, 저수지 뷰를 묶어 방문 전 불안을 줄입니다.",
    items: ["간판/진입", "바베큐장", "마당", "풍경"]
  },
  {
    title: "객실 내부",
    body: "고객이 일정과 인원을 고른 뒤 객실 선택 화면에서 확인하는 내부 사진/영상입니다.",
    items: ["거실", "침실", "주방", "화장실"]
  },
  {
    title: "후기와 주변정보",
    body: "네이버 블로그, 리뷰, 주변 맛집, 가볼만한곳은 펜션 소개 하단에서 신뢰를 보강합니다.",
    items: ["블로그", "리뷰", "맛집", "관광지"]
  }
];

export default function ContentStudioPage() {
  const stay = mockPartnerProperties[0];
  const videos = penbaVideoFeed.filter((video) => video.propertyId === stay.id).slice(0, 6);

  return (
    <main className="ops-page">
      <section className="ops-hero owner" style={{ backgroundImage: `linear-gradient(120deg, rgba(255,255,255,.94), rgba(242,250,246,.82)), url(${stay.heroUrl})` }}>
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 3 Day 14</p>
          <h1>콘텐츠 운영 스튜디오</h1>
          <p>
            사장님이 유튜브 영상, 객실 사진, 네이버 후기, 주변 정보를 등록하고 고객 화면 노출 순서를 확인하는 운영 화면입니다.
          </p>
        </div>
      </section>

      <section className="ops-section">
        <div className="ops-metric-grid">
          {contentMetrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <b>{metric.value}</b>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>콘텐츠 묶음</h2>
          <span>고객 예약 화면 노출 기준</span>
        </div>
        <div className="ops-card-grid">
          {contentBuckets.map((bucket) => (
            <article className="ops-card" key={bucket.title}>
              <h3>{bucket.title}</h3>
              <p>{bucket.body}</p>
              <div>
                {bucket.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-section">
        <div className="section-head">
          <h2>영상 게시 상태</h2>
          <span>유튜브 링크 기반</span>
        </div>
        <div className="customer-video-blueprint">
          {videos.map((video) => (
            <a href={video.url} target="_blank" rel="noreferrer" key={video.title}>
              <span style={{ backgroundImage: `url(${video.thumbnailUrl ?? video.heroUrl})` }} />
              <b>{video.tag}</b>
              <small>{video.title}</small>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
