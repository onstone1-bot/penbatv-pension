import Link from "next/link";
import { mockPartnerProperties, penbaVideoFeed } from "@/lib/platform-data";

const tabs = [
  {
    name: "홈",
    title: "유튜브에서 들어온 첫 화면",
    body: "대표 영상, 숙소 핵심 사진, 가격 시작점, 예약 CTA를 먼저 보여줍니다."
  },
  {
    name: "객실",
    title: "객실 사진과 영상 확인",
    body: "일정과 인원을 선택한 뒤 예약 가능한 객실만 보여주고 내부/외부 사진을 확인합니다."
  },
  {
    name: "예약",
    title: "달력과 옵션 선택",
    body: "예약불가 날짜를 막고 인원, 바베큐 시간, 숯불세트 등 부대옵션을 선택합니다."
  },
  {
    name: "내예약",
    title: "예약 상태 확인",
    body: "예약번호, 결제 상태, 입실일, 바베큐 시간을 고객이 직접 확인합니다."
  },
  {
    name: "MY",
    title: "내 정보관리",
    body: "예약자 정보, 결제수단, 알림, 찜한 숙소, 최근 본 영상을 관리합니다."
  }
];

const flowSteps = [
  "유튜브 설명란 펜바TV 링크 클릭",
  "고객홈에서 전체/외부/내부 영상 확인",
  "달력으로 예약 가능 일정 선택",
  "객실 사진과 옵션 확인",
  "결제 후 내예약/MY에서 관리"
];

export default function CustomerHomePage() {
  const mainStay = mockPartnerProperties[0];
  const videos = penbaVideoFeed.filter((video) => video.propertyId === mainStay.id).slice(0, 4);

  return (
    <main className="customer-blueprint-page">
      <section className="customer-blueprint-hero">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 1 Day 4</p>
          <h1>고객홈 탭 구조 설계</h1>
          <p>
            고객이 유튜브에서 유입된 뒤 홈, 객실, 예약, 내예약, MY를 오가며 자연스럽게 예약결제까지 진행하는 화면 구조입니다.
          </p>
        </div>
        <div className="customer-phone-preview">
          <span style={{ backgroundImage: `url(${mainStay.heroUrl})` }} />
          <b>{mainStay.name}</b>
          <small>영상 보고 바로 예약</small>
          <div>
            {["홈", "객실", "예약", "내예약", "MY"].map((tab) => (
              <em key={tab}>{tab}</em>
            ))}
          </div>
        </div>
      </section>

      <section className="customer-blueprint-section">
        <div className="section-head">
          <h2>하단 탭 설계</h2>
          <span>고객 앱처럼 쓰는 5개 메뉴</span>
        </div>
        <div className="customer-tab-grid">
          {tabs.map((tab) => (
            <article key={tab.name}>
              <span>{tab.name}</span>
              <h3>{tab.title}</h3>
              <p>{tab.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="customer-blueprint-section customer-flow-panel">
        <div>
          <h2>예약 전환 흐름</h2>
          <p>
            고객홈은 설명 페이지가 아니라 예약을 시작하는 화면입니다. 영상 확인, 일정 선택, 객실 확인, 결제, 사후관리까지 한 흐름으로 연결합니다.
          </p>
        </div>
        <ol>
          {flowSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="customer-blueprint-section">
        <div className="section-head">
          <h2>고객홈 영상 배치</h2>
          <span>전체 · 외부 · 내부 · 바베큐</span>
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

      <nav className="customer-demo-bottom-tabs" aria-label="고객홈 하단 탭 예시">
        <Link className="on" href="/customer-home">홈</Link>
        <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=customer_tab_rooms&utm_campaign=baebang-alps">객실</Link>
        <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=customer_tab_booking&utm_campaign=baebang-alps">예약</Link>
        <Link href="/my">내예약</Link>
        <Link href="/my">MY</Link>
      </nav>
    </main>
  );
}
