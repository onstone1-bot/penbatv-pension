
const css = "\n:root{color-scheme:light;--bg:#f5f4f1;--ink:#17211d;--muted:#65726c;--green:#0f5a47;--line:rgba(19,28,24,.12);--red:#c51f1f}\n*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif}a{color:inherit}\n.shell{max-width:1080px;margin:0 auto;padding:34px 18px 96px}.hero,.section,.band{border:1px solid var(--line);border-radius:16px;background:#fff;padding:24px}.hero{display:grid;grid-template-columns:minmax(0,1fr)280px;gap:18px;align-items:end;background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(237,247,242,.84)),url(\"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80\");background-size:cover;background-position:center}.eyebrow,.muted{color:var(--muted);font-size:13px;font-weight:900}.hero h1{margin:8px 0 10px;font-size:42px;line-height:1.08}.hero p,.section p,.card p{color:var(--muted);line-height:1.65}.actions,.chips,.nav{display:flex;flex-wrap:wrap;gap:8px}.btn{border-radius:10px;background:var(--green);color:#fff;padding:12px 14px;text-decoration:none;font-weight:900}.btn.alt{border:1px solid var(--line);background:#fff;color:var(--ink)}.video-stack{display:grid;gap:10px}.video-stack a{display:grid;grid-template-columns:74px 1fr auto;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.58);border-radius:12px;background:rgba(255,255,255,.84);padding:10px;text-decoration:none}.video-stack span{aspect-ratio:16/10;border-radius:8px;background-size:cover;background-position:center}.video-stack small{color:var(--red);font-weight:900}\n.metrics,.cards,.templates,.features,.packages{display:grid;gap:12px;margin-top:14px}.metrics{grid-template-columns:repeat(3,1fr)}.cards,.templates{grid-template-columns:repeat(3,1fr)}.features{grid-template-columns:repeat(2,1fr)}.packages{grid-template-columns:repeat(3,1fr)}.metric,.card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px}.metric b{display:block;margin-top:6px;font-size:24px}.section{margin-top:22px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.section h2{margin:0}.chip{border-radius:999px;background:#edf7f2;color:var(--green);padding:7px 9px;font-size:12px;font-weight:900}.image-card{overflow:hidden;padding:0}.image-card .image{display:block;min-height:210px;background-size:cover;background-position:center;text-decoration:none}.image-card .body{padding:14px}.price{font-size:20px;font-weight:900}\n.calendar{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#fff;margin-top:14px}.calendar-grid{display:grid;grid-template-columns:190px repeat(7,110px);min-width:960px}.cal-head,.date,.room,.cell{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:10px;min-height:72px}.cal-head,.date{background:#f8faf9;font-weight:900}.cell{text-align:center;text-decoration:none}.available{background:#edf7f2;color:var(--green)}.few{background:#fff8e8;color:#875a00}.reserved{background:#fff0ec;color:#a33a1f}.blocked{background:#eef2f6;color:#405161}.wait{background:#f5efff;color:#67409b}.bottom{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(1080px,100%);display:grid;grid-template-columns:repeat(5,1fr);gap:6px;border-top:1px solid var(--line);background:rgba(255,255,255,.96);padding:8px 12px}.bottom a{border-radius:10px;padding:10px 6px;text-align:center;text-decoration:none;color:var(--muted);font-size:12px;font-weight:900}.bottom a.on{background:#edf7f2;color:var(--green)}\n@media(max-width:720px){.shell{padding-inline:14px}.hero,.metrics,.cards,.templates,.features,.packages{grid-template-columns:1fr}.hero h1{font-size:32px}.video-stack a{grid-template-columns:72px 1fr auto}.section-head{display:block}.bottom{grid-template-columns:repeat(5,1fr)}}\n";
const routes = {"/":{"title":"펜바TV 펜션 예약 플랫폼","subtitle":"영상으로 보고 예약하는 펜션·바베큐 플랫폼","body":"유튜브 숏폼과 롱폼 영상을 여러 개 연결해 숙소 매력을 먼저 보여주고, 날짜·객실·바베큐장 예약결제로 바로 이어갑니다."},"/host/make24-benchmark":{"title":"펜션 사장님 입점 제안","subtitle":"유튜브 촬영 + 예약결제 + 관리자 콘솔","body":"메이크24식 사장님 설득 랜딩을 참고해 펜바TV 입점 패키지와 제작 과정을 보여줍니다."},"/host/design-benchmark":{"title":"펜바TV 디자인 선택","subtitle":"영상형·예약형·바베큐형 상세페이지 템플릿","body":"현대이지웹의 펜션 디자인 선택 구조를 펜바TV식 템플릿 선택 화면으로 변환했습니다."},"/booking-calendar-status":{"title":"실시간 예약 현황","subtitle":"객실별 날짜 상태와 바베큐장 타임슬롯","body":"떠나요식 예약 달력 구조를 참고해 예약가능, 잔여소량, 예약완료, 마감, 예약대기 상태를 한눈에 보여줍니다."},"/host/core-features":{"title":"핵심 기능 요구사항","subtitle":"예약 엔진·결제·관리자·알림톡","body":"날짜별 객실 중복 예약 방지, 바베큐 타임슬롯, 현금영수증, 관리자 통계, 카카오 알림톡 구조를 정리했습니다."}};
const videos = [["계곡 옆 독채 바베큐 30초 투어","0:30","https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"],["마당·불멍·바베큐장 동선 보기","1:12","https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=900&q=80"],["가족 독채 객실 내부 투어","2:05","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80"]];
const templates = [["PB1045","영상 히어로형","450,000원","대표 영상이 강한 독채 펜션","https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"],["PB1044","예약 달력 집중형","450,000원","객실 수가 많고 요금 변동이 있는 펜션","https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80"],["PB1042","바베큐 특화형","250,000원","바베큐장과 야외공간이 매력인 숙소","https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=900&q=80"]];
function label(status) {
  return { available: "예약가능", few: "잔여소량", reserved: "예약완료", blocked: "마감", wait: "예약대기" }[status] ?? status;
}
function sectionHome() {
  return `
  <section class="metrics" aria-label="펜바TV 운영 지표">
    <div class="metric"><span class="muted">입점 펜션</span><b>3곳</b></div>
    <div class="metric"><span class="muted">연결 영상</span><b>9개</b></div>
    <div class="metric"><span class="muted">핵심 포맷</span><b>유튜브 → 예약</b></div>
  </section>
  <section class="section"><div class="section-head"><h2>유튜브 영상 모아보기</h2><span class="muted">숙소별 여러 영상 링크</span></div>
    <div class="cards">${videos.map(([title, time, image]) => `<article class="card image-card"><a class="image" href="https://www.youtube.com/results?search_query=${encodeURIComponent(title)}" style="background-image:url('${image}')"></a><div class="body"><span class="chip">${time}</span><h3>${title}</h3><p>영상에서 예약 화면으로 바로 연결되는 펜바TV 광고 포맷입니다.</p><a class="btn" href="/booking-calendar-status">예약 현황</a></div></article>`).join("")}</div>
  </section>`;
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
    <section class="hero"><div><span class="eyebrow">PenBa TV</span><h1>${route.subtitle}</h1><p>${route.body}</p><div class="actions"><a class="btn" href="/">고객 홈</a><a class="btn alt" href="/host/make24-benchmark">입점 제안</a><a class="btn alt" href="/host/design-benchmark">디자인 선택</a><a class="btn alt" href="/booking-calendar-status">예약 현황</a></div></div><div class="video-stack">${videos.map(([title, time, image]) => `<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(title)}"><span style="background-image:url('${image}')"></span><b>${title}</b><small>${time}</small></a>`).join("")}</div></section>
    ${sectionHome()}${sectionCalendar()}${sectionPackages()}${sectionTemplates()}${sectionFeatures()}
    <section class="band section"><h2>외부 공유용 펜바TV 데모</h2><p>이 페이지는 외부에서 바로 볼 수 있는 배포용 버전입니다. 실제 예약결제 연동 전까지는 펜바TV 콘셉트, 입점 제안, 디자인 선택, 예약 현황 흐름을 설명하는 공개 데모로 사용하면 됩니다.</p></section>
  </main><nav class="bottom"><a class="on" href="/">홈</a><a href="/booking-calendar-status">예약</a><a href="/host/make24-benchmark">입점</a><a href="/host/design-benchmark">디자인</a><a href="/host/core-features">기능</a></nav></body></html>`;
}
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    const page = routes[pathname] ? pathname : "/";
    return new Response(render(page), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" }
    });
  }
};
