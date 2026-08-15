import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist", "server");

function imageDataUrl(fileName, mime = "image/jpeg") {
  const filePath = path.join(root, "public", "penba", fileName);
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

const images = {
  sign: imageDataUrl("sign.jpg"),
  glamping: imageDataUrl("glamping-yard.jpg"),
  yardFriends: imageDataUrl("yard-friends.jpg"),
  bbqYard: imageDataUrl("bbq-yard.jpg"),
  bbqDeck: imageDataUrl("bbq-deck.jpg"),
  interior1: imageDataUrl("interior-1.jpg"),
  interior2: imageDataUrl("interior-2.jpg"),
  interior3: imageDataUrl("interior-3.jpg"),
  reservoir: imageDataUrl("reservoir.jpg"),
  entrance: imageDataUrl("entrance-road.jpg"),
  overlook: imageDataUrl("overlook.jpg")
};

const css = `
:root{color-scheme:light;--bg:#f5f4f1;--ink:#17211d;--muted:#65726c;--green:#0f5a47;--line:rgba(19,28,24,.12);--red:#c51f1f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit}
.shell{max-width:1080px;margin:0 auto;padding:34px 18px 96px}.hero,.section,.band{border:1px solid var(--line);border-radius:16px;background:#fff;padding:24px}.hero{display:grid;grid-template-columns:minmax(0,1fr)280px;gap:18px;align-items:end;background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(237,247,242,.84)),url("${images.sign}");background-size:cover;background-position:center}.eyebrow,.muted{color:var(--muted);font-size:13px;font-weight:900}.hero h1{margin:8px 0 10px;font-size:42px;line-height:1.08}.hero p,.section p,.card p{color:var(--muted);line-height:1.65}.actions,.chips,.nav{display:flex;flex-wrap:wrap;gap:8px}.btn{border-radius:10px;background:var(--green);color:#fff;padding:12px 14px;text-decoration:none;font-weight:900}.btn.alt{border:1px solid var(--line);background:#fff;color:var(--ink)}.video-stack{display:grid;gap:10px}.video-stack a{display:grid;grid-template-columns:74px 1fr auto;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.58);border-radius:12px;background:rgba(255,255,255,.84);padding:10px;text-decoration:none}.video-stack span{aspect-ratio:16/10;border-radius:8px;background-size:cover;background-position:center}.video-stack small{color:var(--red);font-weight:900}
.metrics,.cards,.templates,.features,.packages,.photos,.flow-grid,.video-category-grid,.room-media-grid{display:grid;gap:12px;margin-top:14px}.metrics{grid-template-columns:repeat(3,1fr)}.cards,.templates,.photos,.flow-grid,.video-category-grid{grid-template-columns:repeat(3,1fr)}.features{grid-template-columns:repeat(2,1fr)}.packages{grid-template-columns:repeat(3,1fr)}.room-media-grid{grid-template-columns:repeat(2,1fr)}.metric,.card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px}.metric b{display:block;margin-top:6px;font-size:24px}.section{margin-top:22px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.section h2{margin:0}.chip{border-radius:999px;background:#edf7f2;color:var(--green);padding:7px 9px;font-size:12px;font-weight:900}.image-card{overflow:hidden;padding:0}.image-card .image{display:block;min-height:210px;background-size:cover;background-position:center;text-decoration:none}.image-card .body{padding:14px}.photo{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.photo .image{min-height:220px;background-size:cover;background-position:center}.photo span,.photo h3{margin-left:12px;margin-right:12px}.photo h3{font-size:17px}.price{font-size:20px;font-weight:900}
.flow-card strong{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--green);color:#fff}.flow-card h3{margin:12px 0 8px}.video-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.video-tabs span{border:1px solid var(--line);border-radius:999px;background:#fff;padding:9px 12px;font-weight:900}.video-tabs .on{background:var(--green);color:#fff}.category-card{overflow:hidden;padding:0}.category-card .image{min-height:190px;background-size:cover;background-position:center}.category-card .body{padding:16px}.room-choice-card{overflow:hidden;padding:0}.room-choice-card .media{display:grid;grid-template-columns:1.1fr .9fr;gap:0}.room-choice-card .main-photo,.room-choice-card .side-photo{min-height:210px}.room-choice-card .main-photo,.room-choice-card .side-photo span{background-size:cover;background-position:center}.room-choice-card .side-photo{display:grid;grid-template-rows:1fr 1fr}.room-choice-card .side-photo span{display:block}.room-choice-card .body{padding:16px}.room-choice-card .actions{margin-top:12px}.mini-video-list{display:grid;gap:8px;margin-top:12px}.mini-video-list a{display:grid;grid-template-columns:86px 1fr;gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:8px;text-decoration:none}.mini-video-list span{min-height:58px;border-radius:8px;background-size:cover;background-position:center}
.checkout-demo{display:grid;grid-template-columns:300px 1fr;gap:14px}.checkout-side,.checkout-main{border:1px solid var(--line);border-radius:14px;background:#fff;padding:18px}.checkout-steps{display:grid;gap:8px}.checkout-steps div{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px}.checkout-steps b{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--green);color:#fff}.checkout-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.checkout-grid div{border:1px solid var(--line);border-radius:10px;background:#f8faf9;padding:12px}.checkout-grid span{display:block;color:var(--muted);font-size:12px;font-weight:900}.checkout-grid strong{display:block;margin-top:5px}.checkout-media{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}.checkout-media article{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.checkout-media .image{min-height:180px;background-size:cover;background-position:center}.checkout-media .body{padding:12px}.checkout-total{display:grid;gap:8px;border:1px solid rgba(15,90,71,.18);border-radius:12px;background:#f7fbf9;padding:14px}.checkout-total div,.checkout-total strong{display:flex;justify-content:space-between;gap:10px}.checkout-total strong{border-top:1px solid var(--line);padding-top:10px;color:var(--green);font-size:22px}
.booking-form-demo{display:grid;gap:14px}.booking-form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.booking-field{border:1px solid var(--line);border-radius:12px;background:#fff;padding:13px}.booking-field span{display:block;color:var(--muted);font-size:12px;font-weight:900}.booking-field b{display:block;margin-top:6px;font-size:16px}.booking-room-pick{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.booking-room-pick article{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.booking-room-pick .image{min-height:170px;background-size:cover;background-position:center}.booking-room-pick .body{padding:13px}.booking-room-pick h3{margin:6px 0}.guest-option-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.guest-box,.option-box{border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px}.guest-row,.option-row-demo{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0}.guest-row+ .guest-row,.option-row-demo+ .option-row-demo{border-top:1px solid var(--line)}.option-row-demo b{color:var(--green)}.booking-form-total{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid rgba(15,90,71,.18);border-radius:12px;background:#f7fbf9;padding:15px}.booking-form-total b{color:var(--green);font-size:26px}
.booking-panel{display:grid;grid-template-columns:minmax(0,.9fr)minmax(360px,1.1fr);gap:16px;border:1px solid rgba(15,90,71,.16);border-radius:16px;background:#fff;padding:18px}.booking-panel h2{margin:7px 0 10px;font-size:25px}.booking-panel p{margin:0;color:var(--muted);line-height:1.6}.booking-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.booking-grid label{border:1px solid var(--line);border-radius:10px;background:#f8faf9;padding:12px}.booking-grid span,.pay-card span{display:block;color:var(--muted);font-size:12px;font-weight:900}.booking-grid strong{display:block;margin-top:5px}.pay-card{display:grid;gap:10px}.pay-card>div{display:flex;align-items:center;justify-content:space-between;gap:12px}.pay-card .total{border-top:1px solid var(--line);padding-top:12px}.pay-card .total strong{color:var(--green);font-size:24px}.methods{display:flex!important;flex-wrap:wrap;justify-content:flex-start!important;gap:8px}.methods span{border-radius:999px;background:#edf7f2;color:var(--green);padding:7px 9px}.pay-actions{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}.pay-actions a{border-radius:10px;padding:13px;text-align:center;text-decoration:none;font-weight:900}.pay-actions a:first-child{background:var(--green);color:#fff}.pay-actions a:last-child{border:1px solid var(--line);color:var(--ink)}
.calendar{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#fff;margin-top:14px}.calendar-grid{display:grid;grid-template-columns:190px repeat(7,110px);min-width:960px}.cal-head,.date,.room,.cell{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:10px;min-height:72px}.cal-head,.date{background:#f8faf9;font-weight:900}.cell{text-align:center;text-decoration:none}.available{background:#edf7f2;color:var(--green)}.few{background:#fff8e8;color:#875a00}.reserved{background:#fff0ec;color:#a33a1f}.blocked{background:#eef2f6;color:#405161}.wait{background:#f5efff;color:#67409b}.bottom{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(1080px,100%);display:grid;grid-template-columns:repeat(5,1fr);gap:6px;border-top:1px solid var(--line);background:rgba(255,255,255,.96);padding:8px 12px}.bottom a{border-radius:10px;padding:10px 6px;text-align:center;text-decoration:none;color:var(--muted);font-size:12px;font-weight:900}.bottom a.on{background:#edf7f2;color:var(--green)}
@media(max-width:720px){.shell{padding-inline:14px}.hero,.metrics,.cards,.templates,.features,.packages,.photos,.flow-grid,.video-category-grid,.room-media-grid,.booking-panel,.booking-grid,.pay-actions,.checkout-demo,.checkout-grid,.checkout-media,.booking-form-grid,.booking-room-pick,.guest-option-grid{grid-template-columns:1fr}.hero h1{font-size:32px}.video-stack a{grid-template-columns:72px 1fr auto}.section-head{display:block}.bottom{grid-template-columns:repeat(5,1fr)}.room-choice-card .media{grid-template-columns:1fr}.room-choice-card .side-photo{grid-template-columns:1fr 1fr;grid-template-rows:1fr}.room-choice-card .main-photo,.room-choice-card .side-photo{min-height:170px}}
`;

const routes = {
  "/": {
    title: "펜바TV 펜션 예약 플랫폼",
    subtitle: "영상으로 보고 예약하는 펜션·바베큐 플랫폼",
    body: "유튜브 숏폼과 롱폼 영상을 여러 개 연결해 숙소 매력을 먼저 보여주고, 날짜·객실·바베큐장 예약결제로 바로 이어갑니다."
  },
  "/host/make24-benchmark": {
    title: "펜션 사장님 입점 제안",
    subtitle: "유튜브 촬영 + 예약결제 + 관리자 콘솔",
    body: "메이크24식 사장님 설득 랜딩을 참고해 펜바TV 입점 패키지와 제작 과정을 보여줍니다."
  },
  "/host/design-benchmark": {
    title: "펜바TV 디자인 선택",
    subtitle: "영상형·예약형·바베큐형 상세페이지 템플릿",
    body: "현대이지웹의 펜션 디자인 선택 구조를 펜바TV식 템플릿 선택 화면으로 변환했습니다."
  },
  "/booking-calendar-status": {
    title: "실시간 예약 현황",
    subtitle: "객실별 날짜 상태와 바베큐장 타임슬롯",
    body: "떠나요식 예약 달력 구조를 참고해 예약가능, 잔여소량, 예약완료, 마감, 예약대기 상태를 한눈에 보여줍니다."
  },
  "/host/reservation-payment": {
    title: "예약 결제 프로그램",
    subtitle: "예약 선점부터 결제 승인과 정산까지",
    body: "유튜브에서 들어온 고객이 날짜와 객실을 고른 뒤 예약 선점, 결제 준비, 결제 승인, 알림톡, 정산까지 이어지는 운영 프로그램입니다."
  },
  "/host/core-features": {
    title: "핵심 기능 요구사항",
    subtitle: "예약 엔진·결제·관리자·알림톡",
    body: "날짜별 객실 중복 예약 방지, 바베큐 타임슬롯, 현금영수증, 관리자 통계, 카카오 알림톡 구조를 정리했습니다."
  }
};

const videos = [
  ["배방알프스 전체 공간 소개", "전체", "all", "https://img.youtube.com/vi/CGOBDAEbBqc/hqdefault.jpg", "https://youtu.be/CGOBDAEbBqc?si=JWTxP0M5IANq39vC"],
  ["배방알프스 저수지 전망 쇼츠", "외부", "exterior", "https://img.youtube.com/vi/SLUDFGDzoZ4/hqdefault.jpg", "https://youtube.com/shorts/SLUDFGDzoZ4?si=U0vwkdsFVzgJCF34"],
  ["바베큐 마당 동선 쇼츠", "외부", "exterior", "https://img.youtube.com/vi/lVz-IlPW6VQ/hqdefault.jpg", "https://youtube.com/shorts/lVz-IlPW6VQ?si=XL6QDkUJ_yvLfJXS"],
  ["글램핑 감성 공간 쇼츠", "외부", "exterior", "https://img.youtube.com/vi/BMnTeq-tTO4/hqdefault.jpg", "https://youtube.com/shorts/BMnTeq-tTO4?si=ykqRHyCeiKGHtFUt"],
  ["객실 내부 미리보기 쇼츠", "내부", "interior", "https://img.youtube.com/vi/PkQPdz4WHps/hqdefault.jpg", "https://youtube.com/shorts/PkQPdz4WHps?si=9_eRkV4G0koGCuUF"],
  ["야외 바베큐 감성 쇼츠", "외부", "exterior", "https://img.youtube.com/vi/FMibcJCCSx8/hqdefault.jpg", "https://youtube.com/shorts/FMibcJCCSx8?si=FWKicOupJBEzLghE"],
  ["간판과 진입로 쇼츠", "외부", "exterior", "https://img.youtube.com/vi/KDs0V0NGYTA/hqdefault.jpg", "https://youtube.com/shorts/KDs0V0NGYTA?si=73c1245O_7C7GvL8"],
  ["배방알프스 공간 투어", "전체", "all", "https://img.youtube.com/vi/prvj3pzAokA/hqdefault.jpg", "https://youtu.be/prvj3pzAokA?si=4xrKXIZZD1Ppu_Xf"],
  ["바베큐장 이용 안내 영상", "내부", "interior", "https://img.youtube.com/vi/auNckmC4O1s/hqdefault.jpg", "https://youtu.be/auNckmC4O1s?si=QRqRTmdQ8xgOeYFT"]
];

const templates = [
  ["PB1045", "영상 히어로형", "450,000원", "대표 영상이 강한 독채 펜션", images.sign],
  ["PB1044", "예약 달력 집중형", "450,000원", "객실 수가 많고 요금 변동이 있는 펜션", images.interior3],
  ["PB1042", "바베큐 특화형", "250,000원", "바베큐장과 야외공간이 매력인 숙소", images.bbqDeck]
];

const photos = [
  ["객실", "저수지 뷰가 보이는 독채 내부", images.interior3],
  ["BBQ", "비와 햇빛을 막아주는 바베큐 데크", images.bbqDeck],
  ["마당", "글램핑 감성이 섞인 야외 공간", images.glamping],
  ["풍경", "펜션 앞 저수지와 산 풍경", images.reservoir],
  ["진입", "꽃길 따라 올라가는 펜션 진입로", images.entrance],
  ["정원", "위에서 내려다보는 정원과 데크", images.overlook]
];

const videoCategories = [
  ["전체", "숙소 전체 분위기와 예약 전 확인할 대표 투어 영상", images.sign, "all"],
  ["외부", "마당, 저수지 전망, 바베큐장, 진입로 중심 쇼츠", images.bbqYard, "exterior"],
  ["내부", "객실 구조, 목조 거실, 이용 안내 중심 영상", images.interior3, "interior"]
];

const checkoutDemo = {
  interior: images.interior3,
  videoThumb: "https://img.youtube.com/vi/CGOBDAEbBqc/hqdefault.jpg"
};

const bookingFormDemo = {
  interior: images.interior3,
  glamping: images.glamping
};

const roomMedia = [
  {
    name: "독채펜션 A",
    type: "내부 중심",
    price: "250,000원~",
    body: "저수지 통창, 목조 거실, 가족·단체 숙박에 맞춘 독채 객실입니다.",
    cover: images.interior3,
    photos: [images.interior2, images.interior1],
    videos: ["배방알프스 전체 공간 소개", "객실 내부 미리보기 쇼츠"]
  },
  {
    name: "돔 글램핑 B",
    type: "외부·바베큐 중심",
    price: "180,000원~",
    body: "소나무 정원과 개별 화로대, 바베큐장 동선이 강한 글램핑 공간입니다.",
    cover: images.glamping,
    photos: [images.bbqDeck, images.bbqYard],
    videos: ["바베큐 마당 동선 쇼츠", "글램핑 감성 공간 쇼츠"]
  }
];

function sectionHome() {
  return `
  <section class="metrics" aria-label="펜바TV 운영 지표">
    <div class="metric"><span class="muted">입점 펜션</span><b>3곳</b></div>
    <div class="metric"><span class="muted">연결 영상</span><b>9개</b></div>
    <div class="metric"><span class="muted">핵심 포맷</span><b>유튜브 → 예약</b></div>
  </section>
  <section class="section"><div class="section-head"><h2>유튜브 영상 모아보기</h2><span class="muted">숙소별 여러 영상 링크</span></div>
    <div class="video-tabs"><span class="on">전체</span><span>외부</span><span>내부</span></div>
    <div class="cards">${videos.map(([title, label, , image, url]) => `<article class="card image-card"><a class="image" href="${url}" target="_blank" rel="noreferrer" style="background-image:url('${image}')"></a><div class="body"><span class="chip">${label}</span><h3>${title}</h3><p>실제 유튜브 영상 설명란에서 펜바TV 고객 홈으로 들어오고, 같은 화면에서 객실 선택과 예약·결제를 이어갑니다.</p><div class="actions"><a class="btn" href="${url}" target="_blank" rel="noreferrer">유튜브 보기</a><a class="btn alt" href="/stays/baebang-alps?utm_source=penbatv&utm_medium=youtube_description&utm_campaign=baebang-alps">예약 홈 이동</a></div></div></article>`).join("")}</div>
  </section>`;
}

function sectionCustomerYoutubeFlow() {
  const steps = [
    ["01", "유튜브 실제 영상 시청", "전체 투어, 외부 바베큐장, 내부 객실 영상을 보고 설명란 링크를 누릅니다."],
    ["02", "펜바TV 고객 홈 진입", "영상에서 본 숙소의 사진, 영상, 객실 정보를 한 화면에서 다시 확인합니다."],
    ["03", "객실 선택 후 예약·결제", "선택한 객실의 영상과 방 사진을 보고 날짜, 옵션, 결제 방식을 선택합니다."]
  ];
  return `<section class="section"><div class="section-head"><h2>유튜브 설명란 링크 유입 구조</h2><span class="muted">영상 → 고객 홈 → 예약·결제</span></div><div class="flow-grid">${steps.map(([step, title, body]) => `<article class="card flow-card"><strong>${step}</strong><h3>${title}</h3><p>${body}</p></article>`).join("")}</div></section>`;
}

function sectionVideoCategories() {
  return `<section class="section"><div class="section-head"><h2>영상 분류</h2><span class="muted">전체 · 외부 · 내부</span></div><div class="video-category-grid">${videoCategories.map(([label, body, image, code]) => `<article class="card category-card"><div class="image" style="background-image:url('${image}')"></div><div class="body"><span class="chip">${label}</span><h3>${label} 영상</h3><p>${body}</p><a class="btn" href="#videos-${code}">${label} 영상 보기</a></div></article>`).join("")}</div></section>`;
}

function sectionRoomMediaSelection() {
  return `<section class="section"><div class="section-head"><h2>객실 선택 화면</h2><span class="muted">방 사진 + 유튜브 영상 + 예약·결제</span></div><div class="room-media-grid">${roomMedia.map((room, index) => {
    const matchedVideos = videos.filter(([title]) => room.videos.includes(title));
    return `<article class="card room-choice-card"><div class="media"><div class="main-photo" style="background-image:url('${room.cover}')"></div><div class="side-photo">${room.photos.map((photo) => `<span style="background-image:url('${photo}')"></span>`).join("")}</div></div><div class="body"><span class="chip">${room.type}</span><h3>${room.name}</h3><p>${room.body}</p><div class="price">${room.price}</div><div class="mini-video-list">${matchedVideos.map(([title, label, , image, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span style="background-image:url('${image}')"></span><b>${label} · ${title}</b></a>`).join("")}</div><div class="actions"><a class="btn" href="/stays/baebang-alps?utm_source=penbatv&utm_medium=room_media&utm_campaign=baebang-alps&room=${index === 0 ? "A" : "B"}">객실 상세 보기</a><a class="btn alt" href="/booking-calendar-status">예약 현황 보기</a></div></div></article>`;
  }).join("")}</div></section>`;
}

function sectionPriorityCheckout() {
  return `<section class="section"><div class="section-head"><h2>예약결제 시스템 우선 구현</h2><span class="muted">일정 → 객실 → 사진/영상 → 결제</span></div><div class="checkout-demo"><aside class="checkout-side"><span class="eyebrow">고객 예약 단계</span><h3>유튜브에서 들어온 고객이 결제까지 가는 순서</h3><div class="checkout-steps"><div><b>1</b><span>예약 가능한 일정 선택</span></div><div><b>2</b><span>객실 선택</span></div><div><b>3</b><span>내부·외부 사진과 영상 확인</span></div><div><b>4</b><span>바베큐 옵션과 결제수단 선택</span></div></div></aside><div class="checkout-main"><div class="checkout-grid"><div><span>일정</span><strong>2026-08-22 토 · 1박</strong></div><div><span>객실</span><strong>독채펜션 A</strong></div><div><span>바베큐</span><strong>18:00 - 21:00</strong></div><div><span>결제</span><strong>신용카드/간편결제</strong></div></div><div class="checkout-media"><article><div class="image" style="background-image:url('${checkoutDemo.interior}')"></div><div class="body"><span class="chip">내부 사진</span><h3>객실 내부 확인</h3><p>통창, 침실, 거실 구조를 확인하고 같은 객실로 예약합니다.</p></div></article><article><div class="image" style="background-image:url('${checkoutDemo.videoThumb}')"></div><div class="body"><span class="chip">전체 영상</span><h3>유튜브 영상 확인</h3><p>전체, 외부, 내부 영상으로 실제 공간을 검증한 뒤 결제합니다.</p></div></article></div><div class="checkout-total"><div><span>객실 요금</span><b>350,000원</b></div><div><span>바베큐 숯불세트</span><b>30,000원</b></div><div><span>유튜브 유입 할인</span><b>-10,000원</b></div><strong><span>총 결제금액</span><b>370,000원</b></strong></div><div class="actions" style="margin-top:12px"><a class="btn" href="/host/reservation-payment">예약결제 진행</a><a class="btn alt" href="/booking-calendar-status">예약 현황 확인</a></div></div></div></section>`;
}

function sectionCustomerBookingForm() {
  return `<section class="section booking-form-demo"><div class="section-head"><h2>예약 정보 입력</h2><span class="muted">예약일정 · 객실 · 인원 · 부대선택</span></div><div class="booking-form-grid"><div class="booking-field"><span>예약일정 선택</span><b>08.22 토 - 08.23 일 · 1박</b></div><div class="booking-field"><span>객실 선택</span><b>독채펜션 A</b></div><div class="booking-field"><span>인원 선택</span><b>성인 4명 · 아동 0명</b></div><div class="booking-field"><span>바베큐 시간</span><b>18:00 - 21:00</b></div></div><div class="booking-room-pick"><article><div class="image" style="background-image:url('${bookingFormDemo.interior}')"></div><div class="body"><span class="chip">선택됨</span><h3>독채펜션 A</h3><p>내부 사진과 전체 영상을 확인하고 예약하는 가족·단체 객실입니다.</p></div></article><article><div class="image" style="background-image:url('${bookingFormDemo.glamping}')"></div><div class="body"><span class="chip">대안 객실</span><h3>돔 글램핑 B</h3><p>외부 바베큐와 글램핑 감성 영상이 연결되는 객실입니다.</p></div></article></div><div class="guest-option-grid"><div class="guest-box"><h3>인원</h3><div class="guest-row"><span>성인</span><b>4명</b></div><div class="guest-row"><span>아동</span><b>0명</b></div></div><div class="option-box"><h3>부대선택</h3><div class="option-row-demo"><span>참숯 바비큐 세트</span><b>30,000원</b></div><div class="option-row-demo"><span>불멍 장작 세트</span><b>15,000원</b></div><div class="option-row-demo"><span>얼리 체크인</span><b>20,000원</b></div></div></div><div class="booking-form-total"><span>총 결제 예정금액</span><b>370,000원</b></div><div class="actions"><a class="btn" href="/host/reservation-payment">이 조건으로 결제 진행</a><a class="btn alt" href="/booking-calendar-status">예약 가능 날짜 보기</a></div></section>`;
}

function sectionPhotos() {
  return `<section class="section"><div class="section-head"><h2>배방알프스 실제 사진</h2><span class="muted">객실·바베큐장·저수지·진입로</span></div><div class="photos">${photos.map(([label, title, image]) => `<article class="photo"><div class="image" style="background-image:url('${image}')"></div><span class="chip">${label}</span><h3>${title}</h3></article>`).join("")}</div></section>`;
}

function sectionCalendar() {
  const dates = ["8/20", "8/21", "8/22", "8/23", "8/24", "8/25", "8/26"];
  const rows = [
    ["독채펜션", ["reserved", "reserved", "available", "few", "blocked", "available", "available"]],
    ["숲 글램핑", ["available", "few", "wait", "available", "available", "available", "reserved"]],
    ["공용 바베큐장", ["few", "available", "available", "wait", "available", "blocked", "available"]]
  ];
  return `<section class="section"><div class="section-head"><h2>실시간 예약 달력</h2><span class="muted">객실 + 바베큐장</span></div><div class="calendar"><div class="calendar-grid"><div class="cal-head">객실/사이트</div>${dates.map((date) => `<div class="date">${date}</div>`).join("")}${rows.map(([name, statuses]) => `<div class="room"><b>${name}</b><br><span class="muted">예약 상태</span></div>${statuses.map((status) => `<a class="cell ${status}" href="/booking-calendar-status"><b>${label(status)}</b><br><span>${status === "reserved" || status === "blocked" ? "다른 날짜" : "예약하기"}</span></a>`).join("")}`).join("")}</div></div></section>`;
}

function sectionDirectBooking() {
  return `<section class="section booking-panel"><div><span class="eyebrow">빠른 예약결제</span><h2>예약 가능한 날짜를 확인하고 바로 결제 단계로 이동합니다.</h2><p>유튜브에서 들어온 고객이 이 화면에서 날짜, 객실, 바베큐 시간, 결제수단, 총액을 한 번에 확인하도록 구성했습니다.</p></div><div class="pay-card"><div class="booking-grid"><label><span>체크인</span><strong>2026-08-22</strong></label><label><span>객실</span><strong>독채펜션 A</strong></label><label><span>바베큐장</span><strong>18:00 - 21:00</strong></label><label><span>인원</span><strong>성인 4명</strong></label></div><div><span>객실 요금</span><b>250,000원</b></div><div><span>바베큐 숯불세트</span><b>30,000원</b></div><div><span>유튜브 유입 할인</span><b>-10,000원</b></div><div class="total"><span>총 결제 예정금액</span><strong>270,000원</strong></div><div class="methods"><span>신용카드</span><span>간편결제</span><span>현금영수증</span></div><div class="pay-actions"><a href="/stays/baebang-alps?utm_source=penbatv&utm_medium=calendar_direct_booking&utm_campaign=baebang-alps&room=A&checkIn=2026-08-22">예약/결제 진행</a><a href="/stays/baebang-alps?utm_source=penbatv&utm_medium=calendar_payment_preview&utm_campaign=baebang-alps">상세 예약 화면</a></div></div></section>`;
}

function sectionOperations() {
  const items = [
    ["입점 제안", "유튜브 촬영, 예약결제, 운영 콘솔 패키지를 사장님에게 제안하는 화면입니다.", "/host/make24-benchmark"],
    ["디자인 선택", "영상형, 예약형, 바베큐형 상세페이지 템플릿을 고르는 화면입니다.", "/host/design-benchmark"],
    ["예약 현황", "객실과 바베큐장 날짜별 예약 가능 여부를 바로 확인하는 달력입니다.", "/booking-calendar-status"]
  ];
  return `<section class="section"><div class="section-head"><h2>사장님용 보조 화면</h2><span class="muted">입점 제안 · 디자인 · 예약 현황</span></div><div class="cards">${items.map(([title, body, href]) => `<article class="card"><span class="chip">PenBa TV</span><h3>${title}</h3><p>${body}</p><a class="btn" href="${href}">${title} 보기</a></article>`).join("")}</div></section>`;
}

function sectionReservationPaymentProgram() {
  const metrics = [["오늘 예약접수", "12건", "유튜브 유입 8건"], ["결제대기", "4건", "총 1,080,000원"], ["결제완료", "7건", "카드 5 · 간편결제 2"], ["정산예정", "2,430,000원", "수수료 차감 전"]];
  const rows = [["PB-20260822-001", "김민지", "독채펜션 A", "결제대기", "270,000원", "결제 링크 재발송"], ["PB-20260822-002", "박성훈", "글램핑 B", "결제완료", "210,000원", "예약 완료 알림톡"], ["PB-20260823-003", "이서연", "독채펜션 A", "운영자확인", "620,000원", "객실 가능 여부 확인"]];
  return `<section class="section"><div class="section-head"><h2>예약 결제 프로그램</h2><span class="muted">예약접수 · 결제대기 · 결제완료 · 정산예정</span></div><div class="metrics">${metrics.map(([label, value, detail]) => `<div class="metric"><span class="muted">${label}</span><b>${value}</b><p>${detail}</p></div>`).join("")}</div><div class="cards">${rows.map(([no, guest, room, status, amount, action]) => `<article class="card"><span class="chip">${status}</span><h3>${guest}</h3><p>${room}<br>${no}</p><div class="price">${amount}</div><a class="btn" href="/host/rooms">${action}</a></article>`).join("")}</div><div class="packages"><article class="card"><span class="chip">01</span><h3>예약 가능 여부 확인</h3><p>객실 예약, 예약 홀드, 방막기, 바베큐 타임슬롯을 동시에 확인합니다.</p></article><article class="card"><span class="chip">02</span><h3>예약 15분 선점</h3><p>바로결제 고객은 결제 전 객실 재고를 잠금 처리합니다.</p></article><article class="card"><span class="chip">03</span><h3>결제 승인 및 정산</h3><p>카드, 간편결제, 현금영수증, 사장님 정산예정 금액을 관리합니다.</p></article></div></section>`;
}

function label(status) {
  return { available: "예약가능", few: "잔여소량", reserved: "예약완료", blocked: "마감", wait: "예약대기" }[status] ?? status;
}

function sectionPackages() {
  return `<section class="section"><div class="section-head"><h2>입점 패키지</h2><span class="muted">촬영 + 예약 + 운영</span></div><div class="packages">
    ${["Starter|입점 무료|숙소 기본 페이지, 대표 유튜브 링크, 예약요청 연결", "YouTube Boost|촬영 패키지|숏폼 촬영, 영상 여러 개 노출, UTM 유입 추적", "Booking Pro|예약결제형|실시간 객실 달력, 바베큐 타임슬롯, 관리자 매출 통계"].map((item) => {
      const [name, price, body] = item.split("|");
      return `<article class="card"><span class="chip">${name}</span><h3>${price}</h3><p>${body}</p><a class="btn" href="/host/make24-benchmark">입점 제안</a></article>`;
    }).join("")}
  </div></section>`;
}

function sectionTemplates() {
  return `<section class="section"><div class="section-head"><h2>디자인 템플릿</h2><span class="muted">영상형·예약형·바베큐형</span></div><div class="templates">
    ${templates.map(([code, name, price, target, image]) => `<article class="card image-card"><a class="image" href="/host/design-benchmark" style="background-image:url('${image}')"></a><div class="body"><span class="chip">${code}</span><h3>${name}</h3><p>${target}</p><div class="price">${price}</div></div></article>`).join("")}
  </div></section>`;
}

function sectionFeatures() {
  const features = ["객실안내", "실시간예약", "예약안내", "전용 갤러리", "서비스안내", "주변관광지", "카카오 알림톡", "SEO/지역 검색"];
  return `<section class="section"><div class="section-head"><h2>기능 소개</h2><span class="muted">펜션 운영 핵심 모듈</span></div><div class="features">${features.map((name) => `<article class="card"><span class="chip">${name}</span><p>펜바TV는 ${name} 기능을 유튜브 유입과 예약결제 흐름에 맞춰 구성합니다.</p></article>`).join("")}</div></section>`;
}

function render(pathname) {
  const route = routes[pathname] ?? routes["/"];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${route.title}</title><meta name="description" content="${route.body}"><style>${css}</style></head><body><main class="shell">
    <section class="hero"><div><span class="eyebrow">PenBa TV</span><h1>${route.subtitle}</h1><p>${route.body}</p><div class="actions"><a class="btn" href="/">고객 홈</a><a class="btn alt" href="/stays/baebang-alps?utm_source=penbatv&utm_medium=youtube_description&utm_campaign=baebang-alps">객실 선택</a><a class="btn alt" href="/booking-calendar-status">예약 현황</a><a class="btn alt" href="/host/make24-benchmark">입점 제안</a></div></div><div class="video-stack">${videos.slice(0, 3).map(([title, label, , image, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span style="background-image:url('${image}')"></span><b>${title}</b><small>${label}</small></a>`).join("")}</div></section>
    ${sectionCustomerBookingForm()}${sectionPriorityCheckout()}${sectionCustomerYoutubeFlow()}${sectionVideoCategories()}${sectionRoomMediaSelection()}${sectionHome()}${sectionPhotos()}${sectionCalendar()}${sectionDirectBooking()}${sectionOperations()}${sectionPackages()}${sectionTemplates()}${sectionFeatures()}
    <section class="band section"><h2>외부 공유용 펜바TV 고객 데모</h2><p>이 페이지는 유튜브 설명란 링크를 누른 고객이 보게 될 흐름을 기준으로 구성했습니다. 영상으로 신뢰를 만들고, 객실 사진과 예약 현황을 본 뒤 예약·결제 선택으로 이어지는 구조입니다.</p></section>
  </main><nav class="bottom"><a class="on" href="/">홈</a><a href="/stays/baebang-alps?utm_source=penbatv&utm_medium=bottom_room&utm_campaign=baebang-alps">객실</a><a href="/booking-calendar-status">예약</a><a href="/host/make24-benchmark">입점</a><a href="/host/core-features">기능</a></nav></body></html>`;
}

const worker = `
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\\/$/, "") || "/";
    const html = ${JSON.stringify(render("__PATH__"))}.replaceAll("__PATH__", pathname);
    const pages = ${JSON.stringify(Object.keys(routes))};
    const selected = pages.includes(pathname) ? pathname : "/";
    return new Response(${JSON.stringify(Object.keys(routes))}.includes(pathname) ? ${JSON.stringify("__HTML__")} : ${JSON.stringify("__HTML__")}, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" }
    });
  }
};
`;

const workerBody = `
const css = ${JSON.stringify(css)};
const routes = ${JSON.stringify(routes)};
const videos = ${JSON.stringify(videos)};
const templates = ${JSON.stringify(templates)};
const photos = ${JSON.stringify(photos)};
const videoCategories = ${JSON.stringify(videoCategories)};
const checkoutDemo = ${JSON.stringify(checkoutDemo)};
const bookingFormDemo = ${JSON.stringify(bookingFormDemo)};
const roomMedia = ${JSON.stringify(roomMedia)};
${label.toString()}
${sectionHome.toString()}
${sectionCustomerYoutubeFlow.toString()}
${sectionVideoCategories.toString()}
${sectionRoomMediaSelection.toString()}
${sectionPriorityCheckout.toString()}
${sectionCustomerBookingForm.toString()}
${sectionPhotos.toString()}
${sectionCalendar.toString()}
${sectionDirectBooking.toString()}
${sectionOperations.toString()}
${sectionReservationPaymentProgram.toString()}
${sectionPackages.toString()}
${sectionTemplates.toString()}
${sectionFeatures.toString()}
${render.toString()}
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\\/$/, "") || "/";
    const page = routes[pathname] ? pathname : "/";
    return new Response(render(page), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" }
    });
  }
};
`;

fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.js"), workerBody);
console.log(JSON.stringify({ ok: true, output: "dist/server/index.js" }, null, 2));
