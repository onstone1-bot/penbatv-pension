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
.version-banner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;border:2px solid rgba(197,31,31,.22);border-radius:14px;background:#fff7f2;padding:13px 15px;color:#8f3f20;font-weight:950}.version-banner small{color:var(--muted);font-weight:800}.route-focus{display:grid;grid-template-columns:minmax(0,.9fr)minmax(0,1.1fr);gap:14px;margin-top:18px;border:1px solid rgba(15,90,71,.14);border-radius:16px;background:#fff;padding:18px}.route-focus h2,.route-focus p{margin:0}.route-focus h2{font-size:28px}.route-focus p{margin-top:8px}.route-task-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.route-task-grid a,.route-task-grid span{display:grid;gap:6px;border:1px solid var(--line);border-radius:12px;background:#f8faf9;padding:13px;text-decoration:none}.route-task-grid b{color:var(--green)}.route-focus.customer{background:linear-gradient(135deg,#fff,#edf7f2)}.route-focus.host{background:linear-gradient(135deg,#fff,#fff8e8)}.route-focus.admin{background:linear-gradient(135deg,#fff,#eef3f7)}.route-focus.auth{background:linear-gradient(135deg,#fff,#f9f1d2)}
.metrics,.cards,.templates,.features,.packages,.photos,.flow-grid,.video-category-grid,.room-media-grid{display:grid;gap:12px;margin-top:14px}.metrics{grid-template-columns:repeat(3,1fr)}.cards,.templates,.photos,.flow-grid,.video-category-grid{grid-template-columns:repeat(3,1fr)}.features{grid-template-columns:repeat(2,1fr)}.packages{grid-template-columns:repeat(3,1fr)}.room-media-grid{grid-template-columns:repeat(2,1fr)}.metric,.card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px}.metric b{display:block;margin-top:6px;font-size:24px}.section{margin-top:22px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.section h2{margin:0}.chip{border-radius:999px;background:#edf7f2;color:var(--green);padding:7px 9px;font-size:12px;font-weight:900}.image-card{overflow:hidden;padding:0}.image-card .image{display:block;min-height:210px;background-size:cover;background-position:center;text-decoration:none}.image-card .body{padding:14px}.photo{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.photo .image{min-height:220px;background-size:cover;background-position:center}.photo span,.photo h3{margin-left:12px;margin-right:12px}.photo h3{font-size:17px}.price{font-size:20px;font-weight:900}
.flow-card strong{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--green);color:#fff}.flow-card h3{margin:12px 0 8px}.video-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.video-tabs span{border:1px solid var(--line);border-radius:999px;background:#fff;padding:9px 12px;font-weight:900}.video-tabs .on{background:var(--green);color:#fff}.category-card{overflow:hidden;padding:0}.category-card .image{min-height:190px;background-size:cover;background-position:center}.category-card .body{padding:16px}.room-choice-card{overflow:hidden;padding:0}.room-choice-card .media{display:grid;grid-template-columns:1.1fr .9fr;gap:0}.room-choice-card .main-photo,.room-choice-card .side-photo{min-height:210px}.room-choice-card .main-photo,.room-choice-card .side-photo span{background-size:cover;background-position:center}.room-choice-card .side-photo{display:grid;grid-template-rows:1fr 1fr}.room-choice-card .side-photo span{display:block}.room-choice-card .body{padding:16px}.room-choice-card .actions{margin-top:12px}.mini-video-list{display:grid;gap:8px;margin-top:12px}.mini-video-list a{display:grid;grid-template-columns:86px 1fr;gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:8px;text-decoration:none}.mini-video-list span{min-height:58px;border-radius:8px;background-size:cover;background-position:center}
.checkout-demo{display:grid;grid-template-columns:300px 1fr;gap:14px}.checkout-side,.checkout-main{border:1px solid var(--line);border-radius:14px;background:#fff;padding:18px}.checkout-steps{display:grid;gap:8px}.checkout-steps div{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px}.checkout-steps b{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--green);color:#fff}.checkout-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.checkout-grid div{border:1px solid var(--line);border-radius:10px;background:#f8faf9;padding:12px}.checkout-grid span{display:block;color:var(--muted);font-size:12px;font-weight:900}.checkout-grid strong{display:block;margin-top:5px}.checkout-media{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}.checkout-media article{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.checkout-media .image{min-height:180px;background-size:cover;background-position:center}.checkout-media .body{padding:12px}.checkout-total{display:grid;gap:8px;border:1px solid rgba(15,90,71,.18);border-radius:12px;background:#f7fbf9;padding:14px}.checkout-total div,.checkout-total strong{display:flex;justify-content:space-between;gap:10px}.checkout-total strong{border-top:1px solid var(--line);padding-top:10px;color:var(--green);font-size:22px}
.booking-form-demo{display:grid;gap:14px}.booking-form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.booking-field{border:1px solid var(--line);border-radius:12px;background:#fff;padding:13px}.booking-field span{display:block;color:var(--muted);font-size:12px;font-weight:900}.booking-field b{display:block;margin-top:6px;font-size:16px}.booking-room-pick{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.booking-room-pick article{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.booking-room-pick .image{min-height:170px;background-size:cover;background-position:center}.booking-room-pick .body{padding:13px}.booking-room-pick h3{margin:6px 0}.guest-option-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.guest-box,.option-box{border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px}.guest-row,.option-row-demo{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0}.guest-row+ .guest-row,.option-row-demo+ .option-row-demo{border-top:1px solid var(--line)}.option-row-demo b{color:var(--green)}.booking-form-total{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid rgba(15,90,71,.18);border-radius:12px;background:#f7fbf9;padding:15px}.booking-form-total b{color:var(--green);font-size:26px}
.booking-demo-top{display:grid;grid-template-columns:1.1fr .9fr;gap:14px}.booking-demo-calendar,.booking-demo-summary{border:1px solid var(--line);border-radius:14px;background:#fff;padding:14px}.date-button-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.demo-date,.demo-room,.demo-option,.demo-step{border:1px solid var(--line);border-radius:11px;background:#fff;color:var(--ink);font:inherit;font-weight:900;cursor:pointer}.demo-date{min-height:66px;padding:9px;text-align:left}.demo-date small,.demo-room small{display:block;margin-top:4px;color:var(--muted);font-size:12px}.demo-date.active,.demo-room.active,.demo-option.active{border-color:var(--green);background:#edf7f2;color:var(--green)}.demo-date[data-status="reserved"],.demo-date[data-status="blocked"]{background:#f6f6f6;color:#8a8a8a}.date-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.date-inputs label{display:grid;gap:5px;color:var(--muted);font-size:12px;font-weight:900}.date-inputs input{width:100%;border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit}.demo-room-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px}.demo-room{overflow:hidden;padding:0;text-align:left}.demo-room .image{min-height:126px;background-size:cover;background-position:center}.demo-room .room-body{display:grid;gap:4px;padding:12px}.demo-room .room-status{font-size:12px;color:var(--green)}.demo-room.unavailable .room-status{color:#a33a1f}.demo-room.unavailable{opacity:.72}.summary-lines{display:grid;gap:8px}.summary-lines div{display:flex;justify-content:space-between;gap:10px}.demo-guest-panel,.demo-option-panel{display:grid;gap:8px}.demo-guest-row{display:grid;grid-template-columns:1fr 34px 38px 34px;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:10px}.demo-step{width:34px;height:34px;border-radius:50%;padding:0}.option-button-grid{display:grid;gap:8px}.demo-option{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:11px 12px;text-align:left}.booking-demo-message{border-radius:12px;background:#fff8e8;color:#875a00;padding:12px;font-weight:900}.booking-demo-message.ok{background:#edf7f2;color:var(--green)}.booking-demo-message.no{background:#fff0ec;color:#a33a1f}.booking-demo-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.booking-demo-actions .disabled{pointer-events:none;opacity:.45}
.booking-panel{display:grid;grid-template-columns:minmax(0,.9fr)minmax(360px,1.1fr);gap:16px;border:1px solid rgba(15,90,71,.16);border-radius:16px;background:#fff;padding:18px}.booking-panel h2{margin:7px 0 10px;font-size:25px}.booking-panel p{margin:0;color:var(--muted);line-height:1.6}.booking-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.booking-grid label{border:1px solid var(--line);border-radius:10px;background:#f8faf9;padding:12px}.booking-grid span,.pay-card span{display:block;color:var(--muted);font-size:12px;font-weight:900}.booking-grid strong{display:block;margin-top:5px}.pay-card{display:grid;gap:10px}.pay-card>div{display:flex;align-items:center;justify-content:space-between;gap:12px}.pay-card .total{border-top:1px solid var(--line);padding-top:12px}.pay-card .total strong{color:var(--green);font-size:24px}.methods{display:flex!important;flex-wrap:wrap;justify-content:flex-start!important;gap:8px}.methods span{border-radius:999px;background:#edf7f2;color:var(--green);padding:7px 9px}.pay-actions{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}.pay-actions a{border-radius:10px;padding:13px;text-align:center;text-decoration:none;font-weight:900}.pay-actions a:first-child{background:var(--green);color:#fff}.pay-actions a:last-child{border:1px solid var(--line);color:var(--ink)}
.live-checkout{display:grid;grid-template-columns:minmax(0,.95fr)minmax(320px,.75fr);gap:14px}.live-form,.live-receipt{border:1px solid var(--line);border-radius:14px;background:#fff;padding:18px}.live-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.live-form label{display:grid;gap:6px;color:var(--muted);font-size:12px;font-weight:900}.live-form input,.live-form select{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit}.payment-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.payment-methods label{border:1px solid var(--line);border-radius:12px;background:#f8faf9;padding:12px;color:var(--ink);cursor:pointer}.payment-methods input{width:auto;margin-right:6px}.live-receipt{position:sticky;top:12px;height:max-content}.live-receipt h2,.live-form h2{margin-top:0}.receipt-lines{display:grid;gap:9px}.receipt-lines div,.receipt-lines strong{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid var(--line);padding-bottom:8px}.receipt-lines strong{border:0;color:var(--green);font-size:22px}.complete-box{border:1px solid rgba(15,90,71,.18);border-radius:14px;background:#edf7f2;padding:16px;color:var(--green);font-weight:900}.reservation-list{display:grid;gap:10px}.reservation-list article{border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px}.reservation-list h3,.reservation-list p{margin:0}.reservation-list p{margin-top:6px}.form-message{margin-top:12px;border-radius:10px;background:#fff8e8;color:#7b4e00;padding:10px;font-weight:900}.form-message.ok{background:#edf7f2;color:var(--green)}.form-message.no{background:#fff0ec;color:#a33a1f}
.calendar{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#fff;margin-top:14px}.calendar-grid{display:grid;grid-template-columns:190px repeat(7,110px);min-width:960px}.cal-head,.date,.room,.cell{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:10px;min-height:72px}.cal-head,.date{background:#f8faf9;font-weight:900}.cell{text-align:center;text-decoration:none}.available{background:#edf7f2;color:var(--green)}.few{background:#fff8e8;color:#875a00}.reserved{background:#fff0ec;color:#a33a1f}.blocked{background:#eef2f6;color:#405161}.wait{background:#f5efff;color:#67409b}.bottom{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(1080px,100%);display:grid;grid-template-columns:repeat(5,1fr);gap:6px;border-top:1px solid var(--line);background:rgba(255,255,255,.96);padding:8px 12px}.bottom a{border-radius:10px;padding:10px 6px;text-align:center;text-decoration:none;color:var(--muted);font-size:12px;font-weight:900}.bottom a.on{background:#edf7f2;color:var(--green)}
.public-customer-app{max-width:960px;padding-bottom:96px}.customer-home-topbar{position:sticky;top:10px;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;border:1px solid rgba(15,90,71,.14);border-radius:14px;background:rgba(255,255,255,.94);padding:12px 14px;box-shadow:var(--shadow);backdrop-filter:blur(14px)}.customer-home-topbar a{border-radius:999px;background:var(--green);color:#fff;padding:9px 12px;text-decoration:none;font-size:12px;font-weight:900}.customer-home-topbar span{color:var(--muted);font-size:13px;font-weight:900}.stay-hero-public{position:relative;overflow:hidden;display:grid;align-items:end;min-height:330px;margin-bottom:14px;border-radius:20px;background-size:cover;background-position:center;box-shadow:var(--shadow)}.stay-hero-public:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.58))}.stay-hero-public .hero-copy{position:relative;padding:26px;color:#fff}.stay-hero-public span{display:inline-flex;border-radius:999px;background:rgba(255,255,255,.18);padding:8px 10px;font-size:12px;font-weight:900}.stay-hero-public h1{margin:10px 0 8px;font-size:42px;line-height:1.1}.stay-hero-public p{max-width:660px;margin:0;line-height:1.6}.home-content-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}.home-content-tabs a{border:1px solid var(--line);border-radius:12px;background:#fff;padding:13px;text-align:center;text-decoration:none;font-weight:900}.home-content-tabs .active{background:var(--green);color:#fff}.public-customer-app .booking-form-demo{margin-top:0}.public-proof{margin-top:16px;border:1px solid rgba(15,90,71,.14);border-radius:14px;background:#fff;padding:16px}.public-proof h2{margin:0 0 10px}.public-proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.public-proof-grid a,.public-proof-grid article{display:grid;gap:8px;border:1px solid var(--line);border-radius:12px;background:#f8faf9;padding:12px;text-decoration:none}.public-proof-grid span{height:130px;border-radius:10px;background-size:cover;background-position:center}.public-proof-grid b,.public-proof-grid small{display:block}.public-proof-grid small{color:var(--muted);line-height:1.45}.public-route-hero{margin-top:0;background-image:linear-gradient(135deg,rgba(255,255,255,.96),rgba(237,247,242,.88)),var(--route-image)}.public-route-hero h1{font-size:40px}.public-notice{border:1px solid rgba(15,90,71,.14);border-radius:14px;background:#edf7f2;padding:14px;color:var(--green);font-weight:900}.form-grid-demo{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.form-grid-demo label{display:grid;gap:6px;border:1px solid var(--line);border-radius:12px;background:#fff;padding:12px;color:var(--muted);font-size:12px;font-weight:900}.form-grid-demo input,.form-grid-demo textarea,.form-grid-demo select{width:100%;border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit;color:var(--ink)}.form-grid-demo textarea{min-height:86px;resize:vertical}.wide-field{grid-column:1/-1}.status-table{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff}.status-row{display:grid;grid-template-columns:1.1fr .8fr .8fr 1fr;gap:8px;border-bottom:1px solid var(--line);padding:12px}.status-row:last-child{border-bottom:0}.status-row.header{background:#f8faf9;font-weight:900}.status-row b{color:var(--green)}
@media(max-width:720px){.shell{padding-inline:14px}.hero,.metrics,.cards,.templates,.features,.packages,.photos,.flow-grid,.video-category-grid,.room-media-grid,.booking-panel,.booking-grid,.pay-actions,.checkout-demo,.checkout-grid,.checkout-media,.booking-form-grid,.booking-room-pick,.guest-option-grid,.booking-demo-top,.date-button-grid,.date-inputs,.demo-room-grid,.booking-demo-actions,.route-focus,.route-task-grid,.live-checkout,.live-form-grid,.payment-methods,.public-proof-grid,.form-grid-demo,.status-row{grid-template-columns:1fr}.hero h1{font-size:32px}.video-stack a{grid-template-columns:72px 1fr auto}.section-head{display:block}.bottom{grid-template-columns:repeat(5,1fr)}.room-choice-card .media{grid-template-columns:1fr}.room-choice-card .side-photo{grid-template-columns:1fr 1fr;grid-template-rows:1fr}.room-choice-card .main-photo,.room-choice-card .side-photo{min-height:170px}.live-receipt{position:static}.public-customer-app{padding-inline:14px}.customer-home-topbar{top:6px}.stay-hero-public{min-height:286px;margin-inline:-2px}.stay-hero-public h1{font-size:30px}.home-content-tabs{grid-template-columns:1fr 1fr}.public-route-hero h1{font-size:30px}}
`;

const siteVersionLabel = "공개 배포 정비 v22 · 로컬 시연 흐름 반영";

const routes = {
  "/": {
    title: "펜바TV 펜션 예약 플랫폼",
    subtitle: "펜션 영상이 고객 예약결제로 이어지는 펜바TV",
    body: "의뢰자 시연용 메인 화면입니다. 유튜브 설명란 링크로 들어온 고객이 숙소 영상과 객실 사진을 확인하고, 달력에서 가능한 날짜를 고른 뒤 객실·인원·바베큐 옵션을 선택해 결제까지 진행합니다."
  },
  "/platform-guide": {
    title: "펜바TV 플랫폼 설명용 기존 메인",
    subtitle: "펜바TV 전체 구조를 설명하는 기존 메인 화면",
    body: "이 화면은 플랫폼의 큰 그림을 설명할 때 쓰는 별도 페이지입니다. 고객, 사장님, 운영자 구조와 MVP 기준, 개발 일정, 예약결제 프로그램 범위를 한 화면에서 설명합니다."
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
  "/checkout": {
    title: "펜바TV 예약 결제",
    subtitle: "선택한 일정과 객실로 결제를 진행합니다",
    body: "고객이 선택한 날짜, 객실, 인원, 바베큐 옵션, 금액을 확인하고 결제수단과 예약자 정보를 입력한 뒤 예약을 확정하는 화면입니다."
  },
  "/booking-complete": {
    title: "펜바TV 예약 완료",
    subtitle: "예약 신청과 결제 시뮬레이션이 완료되었습니다",
    body: "고객 예약이 완료되면 내예약 화면과 사장님 예약 현황에 반영되는 흐름을 보여주는 완료 화면입니다."
  },
  "/host/rooms": {
    title: "사장님 등록·운영 작업대",
    subtitle: "객실·사진·유튜브·옵션 등록 후 고객 홈 자동 반영",
    body: "펜션 사장님이 객실, 내부·외부 사진, 유튜브 영상, 바베큐 옵션을 등록하면 고객 예약 홈에서 객실 선택과 영상 확인, 예약 결제 흐름으로 이어지는 구조입니다."
  },
  "/host/core-features": {
    title: "핵심 기능 요구사항",
    subtitle: "예약 엔진·결제·관리자·알림톡",
    body: "날짜별 객실 중복 예약 방지, 바베큐 타임슬롯, 현금영수증, 관리자 통계, 카카오 알림톡 구조를 정리했습니다."
  },
  "/stays/baebang-alps": {
    title: "배방 알프스 고객 예약 화면",
    subtitle: "배방 알프스 사진·영상 확인 후 예약결제",
    body: "유튜브 설명란에서 들어온 고객이 배방 알프스의 전체·외부·내부 영상과 객실 사진을 확인하고 날짜, 객실, 인원, 바베큐 옵션, 결제까지 진행하는 고객 예약 화면입니다."
  },
  "/customer-home": {
    title: "펜바TV 고객홈",
    subtitle: "홈·객실·예약·내예약·MY 고객 탭 구조",
    body: "고객이 영상에서 본 숙소를 기준으로 객실, 예약 가능일, 내예약, MY 정보를 하단 탭으로 오가며 예약결제를 진행합니다."
  },
  "/auth": {
    title: "펜바TV 회원가입·로그인",
    subtitle: "네이버·카카오 본인인증 가입과 역할 분리",
    body: "고객은 네이버와 카카오 간편가입으로 예약 확인과 찜, MY 정보를 관리하고, 사장님과 운영자는 권한에 맞는 관리 화면으로 이동합니다."
  },
  "/my": {
    title: "펜바TV MY·내예약",
    subtitle: "예약 확인·찜·결제상태·회원정보 관리",
    body: "고객이 본인의 예약 내역, 결제 상태, 찜한 숙소, 예약자 정보, 알림 설정을 확인하는 화면입니다."
  },
  "/host/proposals": {
    title: "펜바TV 입점 제안 관리",
    subtitle: "무료촬영 제안부터 입점 승인까지",
    body: "펜션 사장님 문의를 접수하고 무료촬영, 자료수집, 검수, 디자인 선택, 예약결제 테스트, 고객홈 오픈까지 단계별로 관리합니다."
  },
  "/host/properties": {
    title: "펜바TV 펜션 입점 등록",
    subtitle: "숙소 기본정보와 예약 운영 기준 등록",
    body: "사장님이 상호, 주소, 객실 수, 예약 정책, 연락처, 디자인 선택, 촬영 자료를 등록하는 입점 준비 화면입니다."
  },
  "/host/owner-dashboard": {
    title: "펜바TV 사장님 예약 현황",
    subtitle: "예약·매출·객실 노출·유튜브 유입 확인",
    body: "사장님이 본인 숙소의 예약 현황, 결제 상태, 객실별 노출, 유튜브 유입, 해야 할 일을 확인하는 파트너 대시보드입니다."
  },
  "/host/payment-settlement": {
    title: "펜바TV 결제·정산 관리",
    subtitle: "결제수단별 매출과 사장님 정산 예정금액",
    body: "카드, 간편결제, 계좌이체 결제 상태와 예약 확정 여부, 취소·환불, 사장님별 정산 예정금액을 확인하는 화면입니다."
  },
  "/host/notifications": {
    title: "펜바TV 알림 관리",
    subtitle: "예약 완료·입실 안내·바베큐 리마인드",
    body: "예약 완료, 입실 전 안내, 바베큐장 이용 시간, 수동 계좌이체 입금 요청을 알림톡 또는 문자로 발송하는 운영 화면입니다."
  },
  "/admin/operations": {
    title: "펜바TV 운영자 관리화면",
    subtitle: "입점·예약·결제·정산·유튜브 성과 통합 관리",
    body: "운영자가 전체 입점 숙소, 전체 예약 현황, 결제 상태, 정산 예정금액, 유튜브 UTM 전환 성과를 확인하는 화면입니다."
  },
  "/system-architecture": {
    title: "펜바TV 시스템 구조",
    subtitle: "고객홈·예약엔진·결제·관리자 데이터 흐름",
    body: "Next.js 화면, Supabase 데이터베이스, 토스페이먼츠 결제, 예약 가능 여부 계산, 사장님 관리와 운영자 관리가 어떻게 연결되는지 설명하는 화면입니다."
  },
  "/reservation-operations": {
    title: "펜바TV 예약 운영 정책",
    subtitle: "중복예약 방지·예약 홀드·확정·취소 처리",
    body: "날짜별 객실 가능 여부, 결제 전 예약 선점, 결제 성공 후 예약 확정, 실패·취소·만료 처리 기준을 정리한 운영 화면입니다."
  },
  "/qa/reservation-payment": {
    title: "예약결제 QA 시나리오",
    subtitle: "고객 선택부터 결제 검증까지 테스트",
    body: "날짜 선택, 객실 선택, 인원·옵션 금액 변경, 서버 견적, 결제창 호출, 결제 성공·실패·취소 처리를 검증하는 시나리오입니다."
  },
  "/marketing/youtube-performance": {
    title: "유튜브 유입 성과",
    subtitle: "영상별 UTM 유입과 예약 전환",
    body: "유튜브 설명란, 쇼츠, 고정 댓글 링크를 통해 들어온 고객의 조회, 예약 시작, 결제 완료 전환을 확인하는 화면입니다."
  },
  "/integrations/channel-sync": {
    title: "외부 예약 연동",
    subtitle: "네이버·야놀자·떠나요 차단일 동기화",
    body: "외부 예약 채널의 iCal 또는 예약 차단일 데이터를 가져와 펜바TV 달력에서 이미 예약된 날짜를 선택하지 못하게 하는 확장 구조입니다."
  },
  "/release-readiness": {
    title: "파일럿 오픈 준비",
    subtitle: "첫 숙소 운영 리허설과 공개 배포 점검",
    body: "배방 알프스 첫 파일럿 오픈 전 모바일 QA, 결제 테스트, 사장님 예약 확인, 알림 발송, 공개 URL 확인 항목을 정리합니다."
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

const bookingDemoScript = `
(() => {
  const root = document.querySelector("[data-booking-demo]");
  if (!root) return;

  const rooms = {
    A: {
      name: "독채펜션 A",
      base: 350000,
      standard: 4,
      capacity: 8,
      status: {
        "2026-08-20": "reserved",
        "2026-08-21": "reserved",
        "2026-08-22": "available",
        "2026-08-23": "few",
        "2026-08-24": "blocked",
        "2026-08-25": "available",
        "2026-08-26": "available"
      }
    },
    B: {
      name: "돔 글램핑 B",
      base: 220000,
      standard: 2,
      capacity: 4,
      status: {
        "2026-08-20": "available",
        "2026-08-21": "few",
        "2026-08-22": "wait",
        "2026-08-23": "available",
        "2026-08-24": "available",
        "2026-08-25": "available",
        "2026-08-26": "reserved"
      }
    }
  };

  const optionPrices = {
    bbq: 30000,
    fire: 15000,
    early: 20000
  };

  const optionLabels = {
    bbq: "참숯 바비큐 세트",
    fire: "불멍 장작 세트",
    early: "얼리 체크인"
  };

  const statusLabels = {
    available: "예약가능",
    few: "잔여소량",
    reserved: "예약완료",
    blocked: "마감",
    wait: "예약대기"
  };

  const state = {
    checkIn: "2026-08-22",
    checkOut: "2026-08-23",
    room: "A",
    adults: 4,
    children: 0,
    options: new Set(["bbq"])
  };

  const won = (value) => value.toLocaleString("ko-KR") + "원";
  const dayMs = 24 * 60 * 60 * 1000;
  const nights = () => Math.max(1, Math.round((new Date(state.checkOut) - new Date(state.checkIn)) / dayMs));
  const nextDate = (date) => {
    const value = new Date(date);
    value.setDate(value.getDate() + 1);
    return value.toISOString().slice(0, 10);
  };
  const roomStatus = (roomId) => rooms[roomId].status[state.checkIn] || "available";
  const canBook = () => ["available", "few"].includes(roomStatus(state.room));
  const selectedOptions = () => Array.from(state.options);

  function totalAmount() {
    const room = rooms[state.room];
    const overGuests = Math.max(0, state.adults + state.children - room.standard);
    const extraGuests = overGuests * 20000 * nights();
    const options = selectedOptions().reduce((sum, key) => sum + optionPrices[key], 0);
    const youtubeDiscount = 10000;
    return room.base * nights() + extraGuests + options - youtubeDiscount;
  }

  function setText(selector, text) {
    const el = root.querySelector(selector);
    if (el) el.textContent = text;
  }

  function update() {
    if (new Date(state.checkOut) <= new Date(state.checkIn)) {
      state.checkOut = nextDate(state.checkIn);
    }

    root.querySelector("#demo-checkin").value = state.checkIn;
    root.querySelector("#demo-checkout").value = state.checkOut;

    root.querySelectorAll("[data-date]").forEach((button) => {
      button.classList.toggle("active", button.dataset.date === state.checkIn);
    });

    root.querySelectorAll("[data-room]").forEach((button) => {
      const roomId = button.dataset.room;
      const status = roomStatus(roomId);
      button.classList.toggle("active", roomId === state.room);
      button.classList.toggle("unavailable", !["available", "few"].includes(status));
      const statusEl = button.querySelector(".room-status");
      if (statusEl) statusEl.textContent = statusLabels[status];
    });

    root.querySelectorAll("[data-option]").forEach((button) => {
      button.classList.toggle("active", state.options.has(button.dataset.option));
    });

    const optionText = selectedOptions().map((key) => optionLabels[key]).join(", ") || "선택 없음";
    const availability = roomStatus(state.room);
    const message = root.querySelector("[data-message]");
    if (message) {
      message.className = "booking-demo-message " + (canBook() ? "ok" : "no");
      message.textContent = canBook()
        ? "선택한 일정은 예약 가능합니다. 결제 진행 버튼에 선택값이 반영됩니다."
        : "선택한 객실은 이 날짜에 예약이 어렵습니다. 다른 날짜나 객실을 선택하세요.";
    }

    setText("[data-summary-date]", state.checkIn + " - " + state.checkOut + " · " + nights() + "박");
    setText("[data-summary-room]", rooms[state.room].name + " · " + statusLabels[availability]);
    setText("[data-summary-guests]", "성인 " + state.adults + "명 · 아동 " + state.children + "명");
    setText("[data-summary-options]", optionText);
    setText("[data-summary-total]", won(totalAmount()));
    setText("[data-adults]", String(state.adults));
    setText("[data-children]", String(state.children));

    const checkout = root.querySelector("[data-checkout-link]");
    if (checkout) {
      const params = new URLSearchParams({
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        room: state.room,
        adults: String(state.adults),
        children: String(state.children),
        options: selectedOptions().join(","),
        amount: String(totalAmount()),
        utm_source: "penbatv",
        utm_medium: "interactive_booking_demo",
        utm_campaign: "baebang-alps"
      });
      checkout.href = "/checkout?" + params.toString();
      checkout.classList.toggle("disabled", !canBook());
      checkout.textContent = canBook() ? "이 조건으로 결제 진행" : "예약 불가 - 조건 변경";
    }
  }

  root.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      state.checkIn = button.dataset.date;
      state.checkOut = nextDate(state.checkIn);
      update();
    });
  });

  root.querySelectorAll("[data-room]").forEach((button) => {
    button.addEventListener("click", () => {
      state.room = button.dataset.room;
      update();
    });
  });

  root.querySelectorAll("[data-guest]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.guest;
      const delta = Number(button.dataset.delta);
      if (key === "adults") state.adults = Math.max(1, state.adults + delta);
      if (key === "children") state.children = Math.max(0, state.children + delta);
      update();
    });
  });

  root.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.option;
      if (state.options.has(key)) state.options.delete(key);
      else state.options.add(key);
      update();
    });
  });

  root.querySelector("#demo-checkin").addEventListener("change", (event) => {
    state.checkIn = event.target.value;
    update();
  });

  root.querySelector("#demo-checkout").addEventListener("change", (event) => {
    state.checkOut = event.target.value;
    update();
  });

  update();
})();
`;

const checkoutScript = `
(() => {
  const params = new URLSearchParams(location.search);
  const rooms = { A: "독채펜션 A", B: "돔 글램핑 B" };
  const optionLabels = { bbq: "참숯 바비큐 세트", fire: "불멍 장작 세트", early: "얼리 체크인" };
  const won = (value) => Number(value || 0).toLocaleString("ko-KR") + "원";
  const data = {
    checkIn: params.get("checkIn") || "2026-08-22",
    checkOut: params.get("checkOut") || "2026-08-23",
    room: params.get("room") || "A",
    adults: params.get("adults") || "4",
    children: params.get("children") || "0",
    options: params.get("options") || "bbq",
    amount: params.get("amount") || "370000"
  };

  function setText(selector, text) {
    document.querySelectorAll(selector).forEach((el) => { el.textContent = text; });
  }

  function optionText() {
    return data.options.split(",").filter(Boolean).map((key) => optionLabels[key] || key).join(", ") || "선택 없음";
  }

  function sync() {
    setText("[data-pay-dates]", data.checkIn + " - " + data.checkOut);
    setText("[data-pay-room]", rooms[data.room] || data.room);
    setText("[data-pay-guests]", "성인 " + data.adults + "명 · 아동 " + data.children + "명");
    setText("[data-pay-options]", optionText());
    setText("[data-pay-amount]", won(data.amount));
    const hidden = document.querySelector("[data-booking-json]");
    if (hidden) hidden.value = JSON.stringify(data);
  }

  const form = document.querySelector("[data-checkout-form]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const guestName = String(formData.get("guestName") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const method = String(formData.get("paymentMethod") || "card");
      const message = document.querySelector("[data-form-message]");
      if (!guestName || !phone) {
        if (message) {
          message.className = "form-message no";
          message.textContent = "예약자명과 연락처를 입력해야 예약을 확정할 수 있습니다.";
        }
        return;
      }
      const booking = {
        id: "PB-" + Date.now().toString().slice(-8),
        property: "배방알프스",
        room: rooms[data.room] || data.room,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: "성인 " + data.adults + "명 · 아동 " + data.children + "명",
        options: optionText(),
        amount: data.amount,
        guestName,
        phone,
        method,
        status: method === "bank" ? "입금대기" : "결제완료",
        createdAt: new Date().toLocaleString("ko-KR")
      };
      const list = JSON.parse(localStorage.getItem("penbaReservations") || "[]");
      list.unshift(booking);
      localStorage.setItem("penbaReservations", JSON.stringify(list.slice(0, 10)));
      if (message) {
        message.className = "form-message ok";
        message.textContent = "예약이 저장되었습니다. 내예약 화면에서 바로 확인할 수 있습니다.";
      }
      setTimeout(() => {
        location.href = "/booking-complete?id=" + encodeURIComponent(booking.id);
      }, 450);
    });
  }

  const listRoot = document.querySelector("[data-my-reservations]");
  if (listRoot) {
    const list = JSON.parse(localStorage.getItem("penbaReservations") || "[]");
    if (!list.length) {
      listRoot.innerHTML = '<article><h3>아직 저장된 예약이 없습니다.</h3><p>고객 예약 화면에서 날짜와 객실을 선택한 뒤 결제까지 진행하면 이곳에 표시됩니다.</p><a class="btn" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=my_empty&utm_campaign=baebang-alps">예약하러 가기</a></article>';
    } else {
      listRoot.innerHTML = list.map((item) => '<article><span class="chip">' + item.status + '</span><h3>' + item.property + ' · ' + item.room + '</h3><p>' + item.checkIn + ' - ' + item.checkOut + '<br>' + item.guests + '<br>' + item.options + '</p><div class="price">' + won(item.amount) + '</div><p>예약자: ' + item.guestName + ' · ' + item.phone + '</p></article>').join("");
    }
  }

  const complete = document.querySelector("[data-complete-id]");
  if (complete) {
    complete.textContent = params.get("id") || "방금 생성된 예약";
  }

  sync();
})();
`;

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

const mainProperties = [
  ["배방 알프스", "충남 아산 배방", "숲과 계곡을 함께 즐기는 독채 펜션과 글램핑", "180,000원~", "요청+바로결제", images.sign, "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=main_property&utm_campaign=baebang-alps"],
  ["리버 포레스트 스테이", "강원 홍천", "강변 데크와 가족형 객실을 묶은 주말 캠핑 펜션", "150,000원~", "바로결제", images.glamping, "/stays/river-forest-stay?start=booking&utm_source=penbatv&utm_medium=main_property&utm_campaign=river-forest-stay"],
  ["오션 캐빈 하우스", "경남 남해", "바다 전망 객실과 숯불 바비큐를 강조한 감성 펜션", "130,000원~", "예약요청", images.reservoir, "/stays/ocean-cabin-house?start=booking&utm_source=penbatv&utm_medium=main_property&utm_campaign=ocean-cabin-house"]
];

function sectionMainShortcuts() {
  const shortcuts = [
    ["고객 화면", "유튜브 설명란 링크를 누른 고객이 사진, 영상, 일정, 객실, 결제까지 진행합니다.", "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=main_customer&utm_campaign=baebang-alps", "예약 시연"],
    ["사장님 관리", "객실, 요금, 사진, 영상, 후기, 주변정보와 예약 현황을 관리합니다.", "/host/rooms", "관리화면"],
    ["운영자 관리", "입점 승인, 전체 예약, 결제, 정산, 유튜브 성과를 확인합니다.", "/admin/operations", "운영화면"]
  ];
  return `<section class="section"><div class="section-head"><h2>시연 바로가기</h2><span class="muted">고객 · 사장님 · 운영자</span></div><div class="cards">${shortcuts.map(([title, body, href, action]) => `<article class="card"><span class="chip">${action}</span><h3>${title}</h3><p>${body}</p><a class="btn" href="${href}">${title} 보기</a></article>`).join("")}</div></section>`;
}

function sectionMainProperties() {
  return `<section class="section"><div class="section-head"><h2>상단에서 바로 보여줄 3개 숙소</h2><a class="btn alt" href="/host/properties">입점 등록</a></div><div class="cards">${mainProperties.map(([name, area, body, price, mode, image, href]) => `<article class="card image-card"><a class="image" href="${href}" style="background-image:url('${image}')"></a><div class="body"><span class="chip">${area}</span><h3>${name}</h3><p>${body}</p><div class="price">${price}</div><p><b>${mode}</b></p><div class="actions"><a class="btn" href="${href}">예약 화면</a><a class="btn alt" href="/booking-calendar-status">예약 현황</a></div></div></article>`).join("")}</div></section>`;
}

function sectionMainScenario() {
  const steps = [
    ["01", "유튜브 영상 시청", "전체, 외부, 내부 영상을 보고 실제 공간을 먼저 확인합니다."],
    ["02", "설명란 펜바TV 링크 클릭", "영상에서 본 숙소의 고객 예약 홈으로 바로 이동합니다."],
    ["03", "사진·영상 재확인", "객실 내부, 바베큐장, 마당, 저수지 전망을 다시 확인합니다."],
    ["04", "예약 가능일 선택", "달력에서 예약마감 날짜는 막고 가능한 날짜만 선택합니다."],
    ["05", "객실·인원·옵션 선택", "객실, 인원, 바베큐 숯불세트, 불멍 장작 등을 선택합니다."],
    ["06", "서버 견적 후 결제", "서버 금액을 기준으로 테스트 결제와 예약 확정까지 진행합니다."]
  ];
  return `<section class="section"><div class="section-head"><h2>유튜브에서 예약결제까지</h2><span class="muted">오늘 설명할 실제 시나리오</span></div><div class="flow-grid">${steps.map(([step, title, body]) => `<article class="card flow-card"><strong>${step}</strong><h3>${title}</h3><p>${body}</p></article>`).join("")}</div></section>`;
}

function routeFocus(pathname) {
  if (pathname.startsWith("/stays") || pathname === "/customer-home") {
    return {
      type: "customer",
      eyebrow: "고객 예약 화면",
      title: "날짜 선택, 객실 선택, 사진·영상 확인, 결제가 한 흐름으로 이어집니다.",
      body: "유튜브 설명란에서 들어온 고객이 가장 먼저 보는 화면입니다. 화면 이동 확인을 위해 고객 예약에 필요한 항목을 첫 섹션에 모았습니다.",
      tasks: [
        ["예약일정", "예약완료 날짜는 선택 불가, 가능일만 선택"],
        ["객실", "독채펜션 A와 돔 글램핑 B 사진·영상 확인"],
        ["인원/옵션", "성인·아동·바베큐·불멍 선택"],
        ["결제", "선택값을 결제 진행 화면으로 전달"]
      ]
    };
  }
  if (pathname.startsWith("/host")) {
    return {
      type: "host",
      eyebrow: "사장님 관리 화면",
      title: "객실, 요금, 사진, 유튜브, 예약 현황을 사장님이 직접 관리합니다.",
      body: "입점한 펜션 사장님이 보는 화면입니다. 고객 화면과 다르게 등록·수정·운영 현황 중심으로 보여줍니다.",
      tasks: [
        ["객실 등록", "객실명, 기준인원, 최대인원, 요금 입력"],
        ["사진/영상", "내부·외부 사진과 유튜브 링크 분류"],
        ["예약 현황", "날짜별 예약 가능 여부와 결제 상태 확인"],
        ["주변정보", "네이버 블로그, 리뷰, 맛집, 관광지 등록"]
      ]
    };
  }
  if (pathname.startsWith("/admin")) {
    return {
      type: "admin",
      eyebrow: "운영자 관리 화면",
      title: "전체 입점, 예약, 결제, 정산, 유튜브 전환 성과를 통합 관리합니다.",
      body: "펜바TV 운영자가 보는 화면입니다. 여러 펜션을 유치했을 때 전체 현황과 승인 흐름을 확인합니다.",
      tasks: [
        ["입점 승인", "신청 숙소 검토와 오픈 상태 관리"],
        ["전체 예약", "숙소별 예약·취소·결제 상태 집계"],
        ["정산", "사장님별 정산 예정금액 확인"],
        ["유튜브 성과", "UTM 유입과 예약 전환 분석"]
      ]
    };
  }
  if (pathname === "/auth" || pathname === "/my") {
    return {
      type: "auth",
      eyebrow: "회원·MY 화면",
      title: "네이버·카카오 간편가입 후 예약 확인과 찜, 회원정보를 관리합니다.",
      body: "고객이 편하게 가입하고 예약 내역을 다시 찾을 수 있게 만드는 회원 관리 화면입니다.",
      tasks: [
        ["간편가입", "네이버·카카오 본인인증 진입"],
        ["내예약", "예약번호, 결제상태, 입실정보 확인"],
        ["찜", "관심 숙소 저장"],
        ["회원정보", "예약자 정보와 알림 설정 관리"]
      ]
    };
  }
  return {
    type: "customer",
    eyebrow: "펜바TV 설명 화면",
    title: "이 화면은 펜바TV의 전체 구조와 MVP 개발 범위를 설명합니다.",
    body: "고객, 사장님, 운영자의 화면이 어떻게 연결되는지 시연용으로 정리했습니다.",
    tasks: [
      ["고객", "유튜브에서 예약결제까지"],
      ["사장님", "입점 등록과 예약 관리"],
      ["운영자", "전체 관리와 정산"],
      ["개발", "MVP 우선순위와 일정"]
    ]
  };
}

function sectionRouteFocus(pathname) {
  const focus = routeFocus(pathname);
  return `<section class="route-focus ${focus.type}"><div><span class="eyebrow">${focus.eyebrow}</span><h2>${focus.title}</h2><p>${focus.body}</p></div><div class="route-task-grid">${focus.tasks.map(([title, body]) => `<span><b>${title}</b><small>${body}</small></span>`).join("")}</div></section>`;
}

function sectionHome() {
  return `
  <section class="metrics" aria-label="펜바TV 운영 지표">
    <div class="metric"><span class="muted">입점 펜션</span><b>3곳</b></div>
    <div class="metric"><span class="muted">연결 영상</span><b>9개</b></div>
    <div class="metric"><span class="muted">핵심 포맷</span><b>유튜브 → 예약</b></div>
  </section>
  <section class="section"><div class="section-head"><h2>유튜브 영상 모아보기</h2><span class="muted">숙소별 여러 영상 링크</span></div>
    <div class="video-tabs"><span class="on">전체</span><span>외부</span><span>내부</span></div>
    <div class="cards">${videos.map(([title, label, , image, url]) => `<article class="card image-card"><a class="image" href="${url}" target="_blank" rel="noreferrer" style="background-image:url('${image}')"></a><div class="body"><span class="chip">${label}</span><h3>${title}</h3><p>실제 유튜브 영상 설명란에서 펜바TV 고객 홈으로 들어오고, 같은 화면에서 객실 선택과 예약·결제를 이어갑니다.</p><div class="actions"><a class="btn" href="${url}" target="_blank" rel="noreferrer">유튜브 보기</a><a class="btn alt" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=youtube_description&utm_campaign=baebang-alps">예약 홈 이동</a></div></div></article>`).join("")}</div>
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
    return `<article class="card room-choice-card"><div class="media"><div class="main-photo" style="background-image:url('${room.cover}')"></div><div class="side-photo">${room.photos.map((photo) => `<span style="background-image:url('${photo}')"></span>`).join("")}</div></div><div class="body"><span class="chip">${room.type}</span><h3>${room.name}</h3><p>${room.body}</p><div class="price">${room.price}</div><div class="mini-video-list">${matchedVideos.map(([title, label, , image, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span style="background-image:url('${image}')"></span><b>${label} · ${title}</b></a>`).join("")}</div><div class="actions"><a class="btn" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=room_media&utm_campaign=baebang-alps&room=${index === 0 ? "A" : "B"}">객실 상세 보기</a><a class="btn alt" href="/booking-calendar-status">예약 현황 보기</a></div></div></article>`;
  }).join("")}</div></section>`;
}

function sectionPriorityCheckout() {
  return `<section class="section"><div class="section-head"><h2>예약결제 시스템 우선 구현</h2><span class="muted">일정 → 객실 → 사진/영상 → 결제</span></div><div class="checkout-demo"><aside class="checkout-side"><span class="eyebrow">고객 예약 단계</span><h3>유튜브에서 들어온 고객이 결제까지 가는 순서</h3><div class="checkout-steps"><div><b>1</b><span>예약 가능한 일정 선택</span></div><div><b>2</b><span>객실 선택</span></div><div><b>3</b><span>내부·외부 사진과 영상 확인</span></div><div><b>4</b><span>바베큐 옵션과 결제수단 선택</span></div></div></aside><div class="checkout-main"><div class="checkout-grid"><div><span>일정</span><strong>2026-08-22 토 · 1박</strong></div><div><span>객실</span><strong>독채펜션 A</strong></div><div><span>바베큐</span><strong>18:00 - 21:00</strong></div><div><span>결제</span><strong>신용카드/간편결제</strong></div></div><div class="checkout-media"><article><div class="image" style="background-image:url('${checkoutDemo.interior}')"></div><div class="body"><span class="chip">내부 사진</span><h3>객실 내부 확인</h3><p>통창, 침실, 거실 구조를 확인하고 같은 객실로 예약합니다.</p></div></article><article><div class="image" style="background-image:url('${checkoutDemo.videoThumb}')"></div><div class="body"><span class="chip">전체 영상</span><h3>유튜브 영상 확인</h3><p>전체, 외부, 내부 영상으로 실제 공간을 검증한 뒤 결제합니다.</p></div></article></div><div class="checkout-total"><div><span>객실 요금</span><b>350,000원</b></div><div><span>바베큐 숯불세트</span><b>30,000원</b></div><div><span>유튜브 유입 할인</span><b>-10,000원</b></div><strong><span>총 결제금액</span><b>370,000원</b></strong></div><div class="actions" style="margin-top:12px"><a class="btn" href="/host/reservation-payment">예약결제 진행</a><a class="btn alt" href="/booking-calendar-status">예약 현황 확인</a></div></div></div></section>`;
}

function sectionCustomerBookingForm() {
  const dates = [
    ["2026-08-20", "8/20 목", "예약완료", "reserved"],
    ["2026-08-21", "8/21 금", "예약완료", "reserved"],
    ["2026-08-22", "8/22 토", "예약가능", "available"],
    ["2026-08-23", "8/23 일", "잔여소량", "few"],
    ["2026-08-24", "8/24 월", "마감", "blocked"],
    ["2026-08-25", "8/25 화", "예약가능", "available"],
    ["2026-08-26", "8/26 수", "예약가능", "available"]
  ];
  return `<section class="section booking-form-demo" data-booking-demo><div class="section-head"><h2>예약하기</h2><span class="muted">날짜 클릭 · 객실상태 · 인원/옵션 금액반영</span></div><div class="booking-demo-top"><div class="booking-demo-calendar"><h3>예약일정 선택</h3><div class="date-button-grid">${dates.map(([value, labelText, status, code]) => `<button class="demo-date${value === "2026-08-22" ? " active" : ""}" type="button" data-date="${value}" data-status="${code}"><b>${labelText}</b><small>${status}</small></button>`).join("")}</div><div class="date-inputs"><label>체크인<input id="demo-checkin" type="date" value="2026-08-22"></label><label>체크아웃<input id="demo-checkout" type="date" value="2026-08-23"></label></div></div><div class="booking-demo-summary"><h3>예약 선택값</h3><div class="summary-lines"><div><span>일정</span><b data-summary-date>2026-08-22 - 2026-08-23 · 1박</b></div><div><span>객실</span><b data-summary-room>독채펜션 A · 예약가능</b></div><div><span>인원</span><b data-summary-guests>성인 4명 · 아동 0명</b></div><div><span>부대옵션</span><b data-summary-options>참숯 바비큐 세트</b></div></div></div></div><div class="booking-start-block"><b>객실 선택</b><div class="demo-room-grid"><button class="demo-room active" type="button" data-room="A"><span class="image" style="background-image:url('${bookingFormDemo.interior}')"></span><span class="room-body"><strong>독채펜션 A</strong><small>기준 4인 · 최대 8인 · 350,000원~</small><small class="room-status">예약가능</small></span></button><button class="demo-room" type="button" data-room="B"><span class="image" style="background-image:url('${bookingFormDemo.glamping}')"></span><span class="room-body"><strong>돔 글램핑 B</strong><small>기준 2인 · 최대 4인 · 220,000원~</small><small class="room-status">예약대기</small></span></button></div></div><div class="guest-option-grid"><div class="guest-box demo-guest-panel"><h3>인원 선택</h3><div class="demo-guest-row"><span>성인</span><button class="demo-step" type="button" data-guest="adults" data-delta="-1">-</button><b data-adults>4</b><button class="demo-step" type="button" data-guest="adults" data-delta="1">+</button></div><div class="demo-guest-row"><span>아동</span><button class="demo-step" type="button" data-guest="children" data-delta="-1">-</button><b data-children>0</b><button class="demo-step" type="button" data-guest="children" data-delta="1">+</button></div></div><div class="option-box demo-option-panel"><h3>부대선택</h3><div class="option-button-grid"><button class="demo-option active" type="button" data-option="bbq"><span>참숯 바비큐 세트</span><b>30,000원</b></button><button class="demo-option" type="button" data-option="fire"><span>불멍 장작 세트</span><b>15,000원</b></button><button class="demo-option" type="button" data-option="early"><span>얼리 체크인</span><b>20,000원</b></button></div></div></div><div class="booking-demo-message ok" data-message>선택한 일정은 예약 가능합니다. 결제 진행 버튼에 선택값이 반영됩니다.</div><div class="booking-form-total"><span>총 결제 예정금액</span><b data-summary-total>370,000원</b></div><div class="booking-demo-actions"><a class="btn" data-checkout-link href="/checkout?checkIn=2026-08-22&checkOut=2026-08-23&room=A&adults=4&children=0&options=bbq&amount=370000&utm_source=penbatv&utm_medium=interactive_booking_demo&utm_campaign=baebang-alps">이 조건으로 결제 진행</a><a class="btn alt" href="/booking-calendar-status">예약 가능 날짜 보기</a></div></section>`;
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
  return `<section class="section booking-panel"><div><span class="eyebrow">빠른 예약결제</span><h2>예약 가능한 날짜를 확인하고 바로 결제 단계로 이동합니다.</h2><p>유튜브에서 들어온 고객이 이 화면에서 날짜, 객실, 바베큐 시간, 결제수단, 총액을 한 번에 확인하도록 구성했습니다.</p></div><div class="pay-card"><div class="booking-grid"><label><span>체크인</span><strong>2026-08-22</strong></label><label><span>객실</span><strong>독채펜션 A</strong></label><label><span>바베큐장</span><strong>18:00 - 21:00</strong></label><label><span>인원</span><strong>성인 4명</strong></label></div><div><span>객실 요금</span><b>250,000원</b></div><div><span>바베큐 숯불세트</span><b>30,000원</b></div><div><span>유튜브 유입 할인</span><b>-10,000원</b></div><div class="total"><span>총 결제 예정금액</span><strong>270,000원</strong></div><div class="methods"><span>신용카드</span><span>간편결제</span><span>현금영수증</span></div><div class="pay-actions"><a href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=calendar_direct_booking&utm_campaign=baebang-alps&room=A&checkIn=2026-08-22">예약/결제 진행</a><a href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=calendar_payment_preview&utm_campaign=baebang-alps">상세 예약 화면</a></div></div></section>`;
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

function sectionMemberDemo() {
  const items = [
    ["네이버 간편가입", "본인인증 후 예약자 정보를 자동 입력합니다.", "/auth?provider=naver"],
    ["카카오 간편가입", "모바일 고객이 빠르게 로그인하고 예약을 이어갑니다.", "/auth?provider=kakao"],
    ["내예약 확인", "예약번호, 결제상태, 입실 안내, 바베큐 시간을 확인합니다.", "/my"],
    ["찜한 숙소", "관심 펜션을 저장하고 다음 예약 때 다시 볼 수 있습니다.", "/my"]
  ];
  return `<section class="section"><div class="section-head"><h2>회원가입·고객 정보 관리</h2><span class="muted">간편가입 · 내예약 · 찜 · MY</span></div><div class="cards">${items.map(([title, body, href]) => `<article class="card"><span class="chip">Member</span><h3>${title}</h3><p>${body}</p><a class="btn" href="${href}">${title} 보기</a></article>`).join("")}</div></section>`;
}

function sectionCheckoutLive() {
  return `<section class="section live-checkout"><form class="live-form" data-checkout-form><span class="eyebrow">예약 결제</span><h2>예약자 정보와 결제수단을 입력하세요</h2><div class="live-form-grid"><label>예약자명<input name="guestName" placeholder="홍길동" autocomplete="name"></label><label>연락처<input name="phone" placeholder="010-0000-0000" autocomplete="tel"></label><label>이메일<input name="email" placeholder="guest@example.com" autocomplete="email"></label><label>현금영수증<select name="cashReceipt"><option>미발행</option><option>개인 소득공제</option><option>사업자 지출증빙</option></select></label></div><h3>결제수단</h3><div class="payment-methods"><label><input type="radio" name="paymentMethod" value="card" checked>신용카드</label><label><input type="radio" name="paymentMethod" value="naverpay">네이버페이</label><label><input type="radio" name="paymentMethod" value="bank">수동 계좌이체</label></div><input type="hidden" data-booking-json><button class="btn" type="submit">결제하고 예약 확정</button><div class="form-message" data-form-message>현재 공개 시연용은 실제 카드 승인 대신 브라우저에 예약을 저장합니다.</div></form><aside class="live-receipt"><span class="eyebrow">선택한 예약</span><h2>결제 예정 내역</h2><div class="receipt-lines"><div><span>일정</span><b data-pay-dates></b></div><div><span>객실</span><b data-pay-room></b></div><div><span>인원</span><b data-pay-guests></b></div><div><span>옵션</span><b data-pay-options></b></div><strong><span>총 결제금액</span><b data-pay-amount></b></strong></div><div class="actions" style="margin-top:14px"><a class="btn alt" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=checkout_back&utm_campaign=baebang-alps">예약 조건 다시 선택</a></div></aside></section>`;
}

function sectionBookingComplete() {
  return `<section class="section"><div class="complete-box"><h2>예약이 완료되었습니다.</h2><p>예약번호 <b data-complete-id></b> 가 생성되었습니다. 내예약 화면에서 방금 저장된 예약을 확인할 수 있습니다.</p></div><div class="actions" style="margin-top:14px"><a class="btn" href="/my">내예약 확인</a><a class="btn alt" href="/host/rooms">사장님 예약 현황 보기</a></div></section>`;
}

function sectionMyReservations() {
  return `<section class="section"><div class="section-head"><h2>내예약</h2><span class="muted">방금 결제한 예약이 여기에 저장됩니다</span></div><div class="reservation-list" data-my-reservations></div></section>`;
}

function sectionPublicProof() {
  return `<section class="public-proof"><div class="section-head"><h2>객실 사진·영상 확인</h2><span class="muted">전체 · 외부 · 내부</span></div><div class="public-proof-grid">
    <a href="https://youtu.be/CGOBDAEbBqc?si=JWTxP0M5IANq39vC" target="_blank" rel="noreferrer"><span style="background-image:url('${images.glamping}')"></span><b>전체 투어 영상</b><small>유튜브에서 본 숙소 전체 분위기를 다시 확인합니다.</small></a>
    <a href="https://youtube.com/shorts/SLUDFGDzoZ4?si=U0vwkdsFVzgJCF34" target="_blank" rel="noreferrer"><span style="background-image:url('${images.bbqDeck}')"></span><b>외부·바베큐 영상</b><small>마당, 바베큐장, 진입 동선을 확인합니다.</small></a>
    <a href="https://youtube.com/shorts/lVz-IlPW6VQ?si=XL6QDkUJ_yvLfJXS" target="_blank" rel="noreferrer"><span style="background-image:url('${images.interior3}')"></span><b>객실 내부 영상</b><small>독채펜션 내부와 저수지 전망을 확인합니다.</small></a>
  </div></section>`;
}

function renderDocument(route, pathname, content, active = "홈") {
  const activeClass = (name) => active === name ? " class=\"on\"" : "";
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${route.title}</title><meta name="description" content="${route.body}"><style>${css}</style></head><body><main class="shell">
    <div class="version-banner"><span>${siteVersionLabel}</span><small>공개 URL 경로별 재정비: ${pathname}</small></div>
    ${content}
  </main><nav class="bottom"><a${activeClass("홈")} href="/">홈</a><a${activeClass("객실")} href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=bottom_room&utm_campaign=baebang-alps">객실</a><a${activeClass("예약")} href="/booking-calendar-status">예약</a><a${activeClass("내예약")} href="/my">내예약</a><a${activeClass("사장님")} href="/host/rooms">사장님</a></nav><script>${bookingDemoScript}</script><script>${checkoutScript}</script></body></html>`;
}

function sectionPublicRouteHero(pathname, config = {}) {
  const route = routes[pathname] ?? routes["/"];
  const image = config.image ?? images.sign;
  const eyebrow = config.eyebrow ?? route.title;
  const title = config.title ?? route.subtitle;
  const body = config.body ?? route.body;
  const actions = config.actions ?? [
    ["고객 홈", "/"],
    ["고객 예약 시연", "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=route_hero&utm_campaign=baebang-alps"],
    ["예약 현황", "/booking-calendar-status"]
  ];
  return `<section class="hero public-route-hero" style="--route-image:url('${image}')"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${body}</p><div class="actions">${actions.map(([label, href], index) => `<a class="btn${index === 0 ? "" : " alt"}" href="${href}">${label}</a>`).join("")}</div></div><div class="video-stack">${videos.slice(0, 3).map(([videoTitle, label, , thumb, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span style="background-image:url('${thumb}')"></span><b>${videoTitle}</b><small>${label}</small></a>`).join("")}</div></section>`;
}

function sectionMake24Process() {
  const steps = [
    ["01", "무료 촬영 제안", "첫 입점 펜션은 유튜브 촬영과 고객 예약 홈 구성을 묶어서 제안합니다."],
    ["02", "자료 등록", "사장님이 객실, 요금, 사진, 영상 링크, 바베큐 옵션을 입력합니다."],
    ["03", "디자인 선택", "영상형, 예약형, 바베큐형 중 숙소에 맞는 상세 페이지 포맷을 고릅니다."],
    ["04", "예약결제 테스트", "예약 가능일, 객실 선택, 견적 계산, 결제 진행을 실제 시나리오로 점검합니다."],
    ["05", "유튜브 링크 연결", "영상 설명란과 고정 댓글에서 해당 숙소 고객 홈으로 연결합니다."],
    ["06", "운영 리포트", "예약, 결제, 유튜브 유입, 정산 예정금액을 사장님과 운영자가 확인합니다."]
  ];
  return `<section class="section"><div class="section-head"><h2>입점 제작 과정</h2><span class="muted">촬영 제안부터 고객 예약 오픈까지</span></div><div class="flow-grid">${steps.map(([step, title, body]) => `<article class="card flow-card"><strong>${step}</strong><h3>${title}</h3><p>${body}</p></article>`).join("")}</div></section>`;
}

function sectionHostRegistrationDemo() {
  return `<section class="section"><div class="section-head"><h2>사장님 등록 관리</h2><span class="muted">입력하면 고객 홈에 반영되는 항목</span></div><div class="form-grid-demo">
    <label>숙소명<input value="배방알프스"></label>
    <label>지역<input value="충남 아산 배방"></label>
    <label>객실명<input value="독채펜션 A"></label>
    <label>기준/최대 인원<input value="기준 4명 / 최대 8명"></label>
    <label>대표 유튜브 링크<input value="https://youtu.be/CGOBDAEbBqc"></label>
    <label>영상 분류<select><option>전체 투어 영상</option><option>외부·바베큐</option><option>객실 내부</option></select></label>
    <label class="wide-field">객실 소개<textarea>저수지 전망, 목조 독채, 바베큐 데크를 갖춘 가족·단체형 펜션입니다.</textarea></label>
  </div><div class="actions" style="margin-top:12px"><a class="btn" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=host_preview&utm_campaign=baebang-alps">고객 화면 미리보기</a><a class="btn alt" href="/booking-calendar-status">예약 현황 보기</a></div></section>`;
}

function sectionOwnerReservationStatus() {
  const rows = [
    ["2026-08-22", "독채펜션 A", "김민지", "결제완료"],
    ["2026-08-23", "돔 글램핑 B", "박성훈", "예약대기"],
    ["2026-08-24", "독채펜션 A", "방막기", "마감"]
  ];
  return `<section class="section"><div class="section-head"><h2>사장님 예약 현황</h2><span class="muted">날짜별 예약·결제 상태</span></div><div class="status-table"><div class="status-row header"><span>날짜</span><span>객실</span><span>예약자</span><span>상태</span></div>${rows.map(([date, room, guest, status]) => `<div class="status-row"><span>${date}</span><span>${room}</span><span>${guest}</span><b>${status}</b></div>`).join("")}</div></section>`;
}

function sectionDesignApplication() {
  return `<section class="section"><div class="section-head"><h2>선택한 디자인이 적용되는 위치</h2><span class="muted">고객 홈 자동 반영</span></div><div class="cards">
    <article class="card"><span class="chip">Hero</span><h3>상단 대표 영상·사진</h3><p>사장님이 등록한 대표 이미지와 유튜브 링크가 고객 홈 첫 화면에 반영됩니다.</p></article>
    <article class="card"><span class="chip">Rooms</span><h3>객실 카드</h3><p>객실별 내부·외부 사진과 영상 분류가 객실 선택 단계에 표시됩니다.</p></article>
    <article class="card"><span class="chip">Booking</span><h3>예약 결제</h3><p>선택한 디자인 안에서 달력, 인원, 옵션, 결제 버튼이 자연스럽게 이어집니다.</p></article>
  </div></section>`;
}

function renderHostMake24Page(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "MAKE24 Pension Benchmark",
    title: "펜션 사장님 입점 제안 페이지 구조",
    body: "메이크24식 펜션 제작 제안 화면을 참고하되, 펜바TV는 유튜브 촬영과 예약결제, 사장님 관리화면까지 연결하는 입점 상품으로 보여줍니다.",
    image: images.entrance,
    actions: [["입점 등록", "/host/properties"], ["예약 결제 프로그램", "/host/reservation-payment"], ["디자인 선택", "/host/design-benchmark"], ["고객 홈", "/"]]
  })}${sectionPackages()}${sectionMake24Process()}${sectionHostRegistrationDemo()}${sectionOperations()}`, "사장님");
}

function renderDesignBenchmarkPage(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "HDWEB Design Benchmark",
    title: "펜바TV 펜션 디자인 선택형 화면",
    body: "입점 사장님이 영상형, 예약형, 바베큐형 디자인을 고르면 고객 예약 홈의 첫 화면, 객실 카드, 예약 영역에 같은 방향성이 반영됩니다.",
    image: images.interior3,
    actions: [["입점 등록", "/host/properties"], ["입점 제안", "/host/make24-benchmark"], ["예약 결제 프로그램", "/host/reservation-payment"]]
  })}${sectionTemplates()}${sectionDesignApplication()}${sectionRoomMediaSelection()}`, "사장님");
}

function renderReservationPaymentPage(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "Reservation Payment Program",
    title: "예약 선점부터 결제 승인과 정산까지",
    body: "고객이 날짜와 객실을 고르면 예약 가능 여부를 확인하고, 결제 전 15분 홀드, 견적 계산, 결제 승인, 예약 확정, 사장님 확인으로 이어집니다.",
    image: images.bbqDeck,
    actions: [["고객 예약 시연", "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=reservation_payment_public&utm_campaign=baebang-alps"], ["결제 화면", "/checkout"], ["예약 현황", "/booking-calendar-status"]]
  })}${sectionPriorityCheckout()}${sectionReservationPaymentProgram()}${sectionCheckoutLive()}`, "예약");
}

function renderBookingCalendarPage(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "Ddnayo Calendar Benchmark",
    title: "객실별 날짜 상태와 바베큐장 타임슬롯",
    body: "떠나요식 예약 달력처럼 날짜별 예약가능, 잔여소량, 예약완료, 마감, 예약대기를 먼저 보여주고 가능한 날짜만 예약 화면으로 연결합니다.",
    image: images.reservoir,
    actions: [["예약 가능한 날짜 선택", "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=calendar_public&utm_campaign=baebang-alps"], ["고객 홈", "/"], ["사장님 현황", "/host/rooms"]]
  })}${sectionCalendar()}${sectionDirectBooking()}${sectionCustomerBookingForm()}`, "예약");
}

function renderHostRoomsPage(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "Owner Workspace",
    title: "객실·사진·유튜브·옵션 등록 후 고객 홈 자동 반영",
    body: "사장님은 이 화면에서 숙소 기본정보, 객실, 사진, 유튜브 영상, 네이버 블로그·리뷰, 주변 맛집과 가볼만한곳을 관리합니다.",
    image: images.interior2,
    actions: [["고객 화면 미리보기", "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=owner_preview&utm_campaign=baebang-alps"], ["예약 현황", "/booking-calendar-status"], ["운영자 관리", "/admin/operations"]]
  })}${sectionHostRegistrationDemo()}${sectionRoomMediaSelection()}${sectionOwnerReservationStatus()}${sectionOperations()}`, "사장님");
}

function renderAdminOperationsPage(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "Admin Operations",
    title: "입점·예약·결제·정산·유튜브 성과 통합 관리",
    body: "운영자는 여러 펜션을 유치했을 때 입점 승인, 전체 예약, 결제 상태, 정산 예정금액, UTM 전환 성과를 한 화면에서 확인합니다.",
    image: images.overlook,
    actions: [["입점 승인 관리", "/host/proposals"], ["예약 결제 현황", "/host/reservation-payment"], ["고객 홈", "/"]]
  })}${sectionAdminDemo()}${sectionReservationPaymentProgram()}${sectionOperations()}`, "사장님");
}

function renderMyPage(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "Member / My Booking",
    title: "예약 확인·찜·결제상태·회원정보 관리",
    body: "네이버·카카오 간편가입 후 고객이 본인의 예약 내역, 결제 상태, 찜한 숙소, 입실 안내를 다시 확인하는 화면입니다.",
    image: images.sign,
    actions: [["고객 예약 시연", "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=my_public&utm_campaign=baebang-alps"], ["예약 현황", "/booking-calendar-status"], ["홈", "/"]]
  })}${sectionMyReservations()}${sectionMemberDemo()}${sectionMainProperties()}`, "내예약");
}

function renderPlatformGuidePage(pathname) {
  const route = routes[pathname];
  return renderDocument(route, pathname, `${sectionPublicRouteHero(pathname, {
    eyebrow: "PenBa TV Planning Guide",
    title: "펜바TV 전체 구조를 설명하는 기존 메인 화면",
    body: "이 페이지는 고객 시연 화면과 별도로, 플랫폼 컨셉과 MVP 개발 범위를 의뢰자에게 설명할 때 사용하는 자료형 화면입니다.",
    image: images.bbqYard,
    actions: [["고객 예약 시연", "/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=guide_public&utm_campaign=baebang-alps"], ["사장님 관리", "/host/rooms"], ["운영자 관리", "/admin/operations"]]
  })}${sectionMainShortcuts()}${sectionMainScenario()}${sectionFeatures()}${sectionMemberDemo()}`, "홈");
}

function renderPublicStayPage(pathname) {
  const route = routes[pathname] ?? routes["/stays/baebang-alps"];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${route.title}</title><meta name="description" content="${route.body}"><style>${css}</style></head><body><main class="public-customer-app">
    <header class="customer-home-topbar"><a href="/">펜바TV 메인홈</a><span>배방알프스 고객홈</span></header>
    <section class="stay-hero-public" style="background-image:url('${images.glamping}')"><div class="hero-copy"><span>펜바TV 단독 촬영 · 영상 검증 예약</span><h1>배방알프스</h1><p>유튜브에서 본 배방알프스의 객실 사진과 영상을 확인하고, 예약 가능한 날짜와 객실·인원·부대옵션을 선택해 결제까지 진행합니다.</p></div></section>
    <section class="home-content-tabs" aria-label="예약과 숙소 정보 탭"><a class="active" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=public_customer&utm_campaign=baebang-alps">예약하기</a><a href="/platform-guide">숙소 둘러보기</a></section>
    ${sectionCustomerBookingForm()}${sectionPublicProof()}${sectionRoomMediaSelection()}
  </main><nav class="bottom"><a href="/">홈</a><a class="on" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=bottom_room&utm_campaign=baebang-alps">객실</a><a href="/booking-calendar-status">예약</a><a href="/my">내예약</a><a href="/host/rooms">사장님</a></nav><script>${bookingDemoScript}</script><script>${checkoutScript}</script></body></html>`;
}

function sectionAdminDemo() {
  const items = [
    ["입점 승인 대기", "5건", "무료촬영 제안, 자료 수집, 검수 단계 확인"],
    ["오늘 예약", "12건", "객실 예약, 바베큐 타임슬롯, 결제 상태 집계"],
    ["정산 예정", "2,430,000원", "사장님별 결제금액과 수수료 차감 전 금액"],
    ["유튜브 전환", "18.4%", "설명란 링크 유입 대비 예약 시작 비율"]
  ];
  return `<section class="section"><div class="section-head"><h2>운영자 통합 집계</h2><span class="muted">입점 · 예약 · 결제 · 정산 · UTM</span></div><div class="metrics">${items.map(([label, value, body]) => `<div class="metric"><span class="muted">${label}</span><b>${value}</b><p>${body}</p></div>`).join("")}</div></section>`;
}

function pageSections(pathname) {
  const focus = routeFocus(pathname);
  if (pathname === "/checkout") {
    return `${sectionCheckoutLive()}${sectionRoomMediaSelection()}`;
  }
  if (pathname === "/booking-complete") {
    return `${sectionBookingComplete()}${sectionMyReservations()}`;
  }
  if (pathname === "/my") {
    return `${sectionMyReservations()}${sectionMemberDemo()}${sectionMainProperties()}`;
  }
  if (focus.type === "customer") {
    return `${sectionCustomerBookingForm()}${sectionRoomMediaSelection()}${sectionVideoCategories()}${sectionPhotos()}${sectionDirectBooking()}`;
  }
  if (focus.type === "host") {
    return `${sectionRouteFocus(pathname)}${sectionOperations()}${sectionReservationPaymentProgram()}${sectionPackages()}${sectionTemplates()}${sectionFeatures()}`;
  }
  if (focus.type === "admin") {
    return `${sectionRouteFocus(pathname)}${sectionAdminDemo()}${sectionReservationPaymentProgram()}${sectionOperations()}`;
  }
  if (focus.type === "auth") {
    return `${sectionRouteFocus(pathname)}${sectionMemberDemo()}${sectionMainProperties()}`;
  }
  return `${sectionRouteFocus(pathname)}${sectionMainShortcuts()}${sectionMainScenario()}${sectionFeatures()}`;
}

function render(pathname) {
  const route = routes[pathname] ?? routes["/"];
  if (pathname.startsWith("/stays/")) {
    return renderPublicStayPage(pathname);
  }
  if (pathname === "/host/make24-benchmark") {
    return renderHostMake24Page(pathname);
  }
  if (pathname === "/host/design-benchmark") {
    return renderDesignBenchmarkPage(pathname);
  }
  if (pathname === "/host/reservation-payment") {
    return renderReservationPaymentPage(pathname);
  }
  if (pathname === "/booking-calendar-status") {
    return renderBookingCalendarPage(pathname);
  }
  if (pathname === "/host/rooms") {
    return renderHostRoomsPage(pathname);
  }
  if (pathname === "/admin/operations") {
    return renderAdminOperationsPage(pathname);
  }
  if (pathname === "/my") {
    return renderMyPage(pathname);
  }
  if (pathname === "/platform-guide") {
    return renderPlatformGuidePage(pathname);
  }
  if (pathname === "/") {
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${route.title}</title><meta name="description" content="${route.body}"><style>${css}</style></head><body><main class="shell">
      <div class="version-banner"><span>${siteVersionLabel}</span><small>메인·고객·사장님·운영자 이동 확인용</small></div>
      <section class="hero"><div><span class="eyebrow">PenBa TV Main Demo</span><h1>${route.subtitle}</h1><p>${route.body}</p><div class="actions"><a class="btn" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=hero_demo&utm_campaign=baebang-alps">고객 예약 시연하기</a><a class="btn alt" href="/host/rooms">사장님 관리 보기</a><a class="btn alt" href="/admin/operations">운영자 관리 보기</a><a class="btn alt" href="/platform-guide">기존 메인 설명 보기</a></div></div><div class="video-stack">${videos.slice(0, 3).map(([title, label, , image, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span style="background-image:url('${image}')"></span><b>${title}</b><small>${label}</small></a>`).join("")}</div></section>
      ${sectionMainShortcuts()}${sectionMainProperties()}${sectionMainScenario()}${sectionHome()}${sectionCustomerBookingForm()}${sectionPhotos()}
      <section class="band section"><h2>오늘 시연 포인트</h2><p>이제 메인 화면은 개발 일정 설명보다 고객 예약 흐름을 먼저 보여줍니다. 고객 화면, 사장님 관리화면, 운영자 관리화면으로 바로 이동하고, 입점 숙소 3개 대표 화면과 유튜브 영상 링크를 한눈에 확인할 수 있습니다.</p></section>
    </main><nav class="bottom"><a class="on" href="/">홈</a><a href="/platform-guide">설명</a><a href="/booking-calendar-status">예약</a><a href="/host/rooms">사장님</a><a href="/admin/operations">운영자</a></nav><script>${bookingDemoScript}</script><script>${checkoutScript}</script></body></html>`;
  }
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${route.title}</title><meta name="description" content="${route.body}"><style>${css}</style></head><body><main class="shell">
    <div class="version-banner"><span>${siteVersionLabel}</span><small>현재 주소: ${pathname}</small></div>
    <section class="hero"><div><span class="eyebrow">PenBa TV</span><h1>${route.subtitle}</h1><p>${route.body}</p><div class="actions"><a class="btn" href="/">고객 홈</a><a class="btn alt" href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=youtube_description&utm_campaign=baebang-alps">객실 선택</a><a class="btn alt" href="/booking-calendar-status">예약 현황</a><a class="btn alt" href="/host/make24-benchmark">입점 제안</a></div></div><div class="video-stack">${videos.slice(0, 3).map(([title, label, , image, url]) => `<a href="${url}" target="_blank" rel="noreferrer"><span style="background-image:url('${image}')"></span><b>${title}</b><small>${label}</small></a>`).join("")}</div></section>
    ${pageSections(pathname)}
    <section class="band section"><h2>외부 공유용 펜바TV 고객 데모</h2><p>이 페이지는 유튜브 설명란 링크를 누른 고객이 보게 될 흐름을 기준으로 구성했습니다. 영상으로 신뢰를 만들고, 객실 사진과 예약 현황을 본 뒤 예약·결제 선택으로 이어지는 구조입니다.</p></section>
  </main><nav class="bottom"><a class="on" href="/">홈</a><a href="/stays/baebang-alps?start=booking&utm_source=penbatv&utm_medium=bottom_room&utm_campaign=baebang-alps">객실</a><a href="/booking-calendar-status">예약</a><a href="/my">내예약</a><a href="/host/rooms">사장님</a></nav><script>${bookingDemoScript}</script><script>${checkoutScript}</script></body></html>`;
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
const siteVersionLabel = ${JSON.stringify(siteVersionLabel)};
const routes = ${JSON.stringify(routes)};
const images = ${JSON.stringify(images)};
const videos = ${JSON.stringify(videos)};
const templates = ${JSON.stringify(templates)};
const photos = ${JSON.stringify(photos)};
const videoCategories = ${JSON.stringify(videoCategories)};
const checkoutDemo = ${JSON.stringify(checkoutDemo)};
const bookingFormDemo = ${JSON.stringify(bookingFormDemo)};
const bookingDemoScript = ${JSON.stringify(bookingDemoScript)};
const checkoutScript = ${JSON.stringify(checkoutScript)};
const roomMedia = ${JSON.stringify(roomMedia)};
const mainProperties = ${JSON.stringify(mainProperties)};
${label.toString()}
${sectionMainShortcuts.toString()}
${sectionMainProperties.toString()}
${sectionMainScenario.toString()}
${routeFocus.toString()}
${sectionRouteFocus.toString()}
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
${sectionMemberDemo.toString()}
${sectionCheckoutLive.toString()}
${sectionBookingComplete.toString()}
${sectionMyReservations.toString()}
${sectionPublicProof.toString()}
${renderDocument.toString()}
${sectionPublicRouteHero.toString()}
${sectionMake24Process.toString()}
${sectionHostRegistrationDemo.toString()}
${sectionOwnerReservationStatus.toString()}
${sectionDesignApplication.toString()}
${renderHostMake24Page.toString()}
${renderDesignBenchmarkPage.toString()}
${renderReservationPaymentPage.toString()}
${renderBookingCalendarPage.toString()}
${renderHostRoomsPage.toString()}
${renderAdminOperationsPage.toString()}
${renderMyPage.toString()}
${renderPlatformGuidePage.toString()}
${renderPublicStayPage.toString()}
${sectionAdminDemo.toString()}
${pageSections.toString()}
${render.toString()}
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\\/$/, "") || "/";
    const page = routes[pathname] || pathname.startsWith("/stays/") ? pathname : "/";
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
