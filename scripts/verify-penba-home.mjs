import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const homePage = read("src/app/page.tsx");
const platformData = read("src/lib/platform-data.ts");
const hostProperties = read("src/app/host/properties/HostPropertiesClient.tsx");
const css = read("src/app/globals.css");

for (const required of [
  "영상으로 보고 예약하는 펜션·바베큐 플랫폼",
  "home-search",
  "categoryItems",
  "유튜브 영상 모아보기",
  "추천 컬렉션",
  "펜바TV 매거진",
  "home-bottom-tabs"
]) {
  assert(homePage.includes(required), `Missing PenBa home guard: ${required}`);
}

for (const required of ["PartnerVideoLink", "videoLinks", "penbaVideoFeed", "유튜브 광고 연동"]) {
  assert(platformData.includes(required), `Missing video data guard: ${required}`);
}

assert(hostProperties.includes("videoLinks"), "Missing onboarding default videoLinks.");

for (const required of [
  ".home-search",
  ".hero-video-stack",
  ".category-grid",
  ".youtube-link-grid",
  ".collection-grid",
  ".magazine-list",
  ".partner-center-band",
  ".home-bottom-tabs"
]) {
  assert(css.includes(required), `Missing PenBa home CSS guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "penba-campingfriend-style-home",
      guards: [
        "search-hero",
        "category-navigation",
        "multi-youtube-links",
        "pension-bbq-collections",
        "partner-center",
        "mobile-bottom-tabs"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
