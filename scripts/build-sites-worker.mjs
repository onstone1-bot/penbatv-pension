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
.metrics,.cards,.templates,.features,.packages,.photos{display:grid;gap:12px;margin-top:14px}.metrics{grid-template-columns:repeat(3,1fr)}.cards,.templates,.photos{grid-template-columns:repeat(3,1fr)}.features{grid-template-columns:repeat(2,1fr)}.packages{grid-template-columns:repeat(3,1fr)}.metric,.card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px}.metric b{display:block;margin-top:6px;font-size:24px}.section{margin-top:22px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.section h2{margin:0}.chip{border-radius:999px;background:#edf7f2;color:var(--green);padding:7px 9px;font-size:12px;font-weight:900}.image-card{overflow:hidden;padding:0}.image-card .image{display:block;min-height:210px;background-size:cover;background-position:center;text-decoration:none}.image-card .body{padding:14px}.photo{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.photo .image{min-height:220px;background-size:cover;background-position:center}.photo span,.photo h3{margin-left:12px;margin-right:12px}.photo h3{font-size:17px}.price{font-size:20px;font-weight:900}
.booking-panel{display:grid;grid-template-columns:minmax(0,.9fr)minmax(360px,1.1fr);gap:16px;border:1px solid rgba(15,90,71,.16);border-radius:16px;background:#fff;padding:18px}.booking-panel h2{margin:7px 0 10px;font-size:25px}.booking-panel p{margin:0;color:var(--muted);line-height:1.6}.booking-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.booking-grid label{border:1px solid var(--line);border-radius:10px;background:#f8faf9;padding:12px}.booking-grid span,.pay-card span{display:block;color:var(--muted);font-size:12px;font-weight:900}.booking-grid strong{display:block;margin-top:5px}.pay-card{display:grid;gap:10px}.pay-card>div{display:flex;align-items:center;justify-content:space-between;gap:12px}.pay-card .total{border-top:1px solid var(--line);padding-top:12px}.pay-card .total strong{color:var(--green);font-size:24px}.methods{display:flex!important;flex-wrap:wrap;justify-content:flex-start!important;gap:8px}.methods span{border-radius:999px;background:#edf7f2;color:var(--green);padding:7px 9px}.pay-actions{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}.pay-actions a{border-radius:10px;padding:13px;text-align:center;text-decoration:none;font-weight:900}.pay-actions a:first-child{background:var(--green);color:#fff}.pay-actions a:last-child{border:1px solid var(--line);color:var(--ink)}
.calendar{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#fff;margin-top:14px}.calendar-grid{display:grid;grid-template-columns:190px repeat(7,110px);min-width:960px}.cal-head,.date,.room,.cell{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:10px;min-height:72px}.cal-head,.date{background:#f8faf9;font-weight:900}.cell{text-align:center;text-decoration:none}.available{background:#edf7f2;color:var(--green)}.few{background:#fff8e8;color:#875a00}.reserved{background:#fff0ec;color:#a33a1f}.blocked{background:#eef2f6;color:#405161}.wait{background:#f5efff;color:#67409b}.bottom{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(1080px,100%);display:grid;grid-template-columns:repeat(5,1fr);gap:6px;border-top:1px solid var(--line);background:rgba(255,255,255,.96);padding:8px 12px}.bottom a{border-radius:10px;padding:10px 6px;text-align:center;text-decoration:none;color:var(--muted);font-size:12px;font-weight:900}.bottom a.on{background:#edf7f2;color:var(--green)}
@media(max-width:720px){.shell{padding-inline:14px}.hero,.metrics,.cards,.templates,.features,.packages,.photos,.booking-panel,.booking-grid,.pay-actions{grid-template-columns:1fr}.hero h1{font-size:32px}.video-stack a{grid-template-columns:72px 1fr auto}.section-head{display:block}.bottom{grid-template-columns:repeat(5,1fr)}}
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
  "/host/core-features": {
    title: "핵심 기능 요구사항",
    subtitle: "예약 엔진·결제·관리자·알림톡",
    body: "날짜별 객실 중복 예약 방지, 바베큐 타임슬롯, 현금영수증, 관리자 통계, 카카오 알림톡 구조를 정리했습니다."
  }
};

const videos = [
  ["배방알프스 전체 공간 소개", "롱폼", "https://img.youtube.com/vi/CGOBDAEbBqc/hqdefault.jpg", "https://youtu.be/CGOBDAEbBqc?si=JWTxP0M5IANq39vC"],
  ["배방알프스 저수지 전망 쇼츠", "Shorts", "https://img.youtube.com/vi/SLUDFGDzoZ4/hqdefault.jpg", "https://youtube.com/shorts/SLUDFGDzoZ4?si=U0vwkdsFVzgJCF34"],
  ["바베큐 마당 동선 쇼츠", "BBQ", "https://img.youtube.com/vi/lVz-IlPW6VQ/hqdefault.jpg", "https://youtube.com/shorts/lVz-IlPW6VQ?si=XL6QDkUJ_yvLfJXS"],
  ["글램핑 감성 공간 쇼츠", "공간", "https://img.youtube.com/vi/BMnTeq-tTO4/hqdefault.jpg", "https://youtube.com/shorts/BMnTeq-tTO4?si=ykqRHyCeiKGHtFUt"],
  ["객실 내부 미리보기 쇼츠", "객실", "https://img.youtube.com/vi/PkQPdz4WHps/hqdefault.jpg", "https://youtube.com/shorts/PkQPdz4WHps?si=9_eRkV4G0koGCuUF"],
  ["야외 바베큐 감성 쇼츠", "바베큐", "https://img.youtube.com/vi/FMibcJCCSx8/hqdefault.jpg", "https://youtube.com/shorts/FMibcJCCSx8?si=FWKicOupJBEzLghE"],
  ["간판과 진입로 쇼츠", "진입", "https://img.youtube.com/vi/KDs0V0NGYTA/hqdefault.jpg", "https://youtube.com/shorts/KDs0V0NGYTA?si=73c1245O_7C7GvL8"],
  ["배방알프스 공간 투어", "투어", "https://img.youtube.com/vi/prvj3pzAokA/hqdefault.jpg", "https://youtu.be/prvj3pzAokA?si=4xrKXIZZD1Ppu_Xf"],
  ["바베큐장 이용 안내 영상", "이용안내", "https://img.youtube.com/vi/auNckmC4O1s/hqdefault.jpg", "https://youtu.be/auNckmC4O1s?si=QRqRTmdQ8xgOeYFT"]
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

function sectionHome() {
  return `
  <section class="metrics" aria-label="펜바TV 운영 지표">
    <div class="metric"><span class="muted">입점 펜션</span><b>3곳</b></div>
    <div class="metric"><span class="muted">연결 영상</span><b>9개</b></div>
    <div class="metric"><span class="muted">핵심 포맷</span><b>유튜브 → 예약</b></div>
  </section>
  <section class="section"><div class="section-head"><h2>유튜브 영상 모아보기</h2><span class="muted">숙소별 여러 영상 링크</span></div>
    <div class="cards">${videos.map(([title, time, image, url]) => `<article class="card image-card"><a class="image" href="${url}" target="_blank" rel="noreferrer" style="background-image:url('${image}')"></a><div class="body"><span class="chip">${time}</span><h3>${title}</h3><p>실제 유튜브 영상에서 예약 화면으로 바로 연결되는 펜바TV 광고 포맷입니다.</p><div class="actions"><a class="btn" href="${url}" target="_blank" rel="noreferrer">유튜브 보기</a><a class="btn alt" href="/booking-calendar-status">예약 현황</a></div></div></article>`).join("")}</div>
  </section>`;
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
  return `<section class="section"><div class="section-head"><h2>입점 운영 기능</h2><span class="muted">제안 · 디자인 · 예약현황</span></div><div class="cards">${items.map(([title, body, href]) => `<article class="card"><span class="chip">PenBa TV</span><h3>${title}</h3><p>${body}</p><a class="btn" href="${href}">${title} 보기</a></article>`).join("")}</div></section>`;
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
    <section class="hero"><div><span class="eyebrow">PenBa TV</span><h1>${route.subtitle}</h1><p>${route.body}</p><div class="actions"><a class="btn" href="/">고객 홈</a><a class="btn alt" href="/host/make24-benchmark">입점 제안</a><a class="btn alt" href="/host/design-benchmark">디자인 선택</a><a class="btn alt" href="/booking-calendar-status">예약 현황</a></div></div><div class="video-stack">${videos.slice(0, 3).map(([title, time, image, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span style="background-image:url('${image}')"></span><b>${title}</b><small>${time}</small></a>`).join("")}</div></section>
    ${sectionHome()}${sectionPhotos()}${sectionCalendar()}${sectionDirectBooking()}${sectionOperations()}${sectionPackages()}${sectionTemplates()}${sectionFeatures()}
    <section class="band section"><h2>외부 공유용 펜바TV 데모</h2><p>이 페이지는 외부에서 바로 볼 수 있는 배포용 버전입니다. 실제 예약결제 연동 전까지는 펜바TV 콘셉트, 입점 제안, 디자인 선택, 예약 현황 흐름을 설명하는 공개 데모로 사용하면 됩니다.</p></section>
  </main><nav class="bottom"><a class="on" href="/">홈</a><a href="/booking-calendar-status">예약</a><a href="/host/make24-benchmark">입점</a><a href="/host/design-benchmark">디자인</a><a href="/host/core-features">기능</a></nav></body></html>`;
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
${label.toString()}
${sectionHome.toString()}
${sectionPhotos.toString()}
${sectionCalendar.toString()}
${sectionDirectBooking.toString()}
${sectionOperations.toString()}
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
