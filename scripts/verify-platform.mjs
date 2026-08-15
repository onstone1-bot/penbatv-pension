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
const propertyClient = read("src/app/host/properties/HostPropertiesClient.tsx");
const launchPlan = read("src/app/host/launch-plan/page.tsx");
const launchData = read("src/lib/penbatv-plan.ts");
const apiRoute = read("src/app/api/host/accommodations/route.ts");
const schemas = read("src/lib/schemas.ts");
const css = read("src/app/globals.css");

for (const required of [
  "mockPartnerProperties",
  "adPlanLabels",
  "reservationModeLabels",
  "PartnerProperty",
  "featuredVideoUrl",
  "featuredVideoTitle"
]) {
  assert(platformData.includes(required), `Missing platform data guard: ${required}`);
}

for (const required of [
  "PenBa TV",
  "펜바TV 숏폼 피드",
  "shorts-feed",
  "펜션 등록하기",
  "예약 화면"
]) {
  assert(homePage.includes(required), `Missing marketplace home guard: ${required}`);
}

for (const required of [
  "펜션 입점 등록",
  "기본 정보 입력",
  "등록 미리보기",
  "입점 펜션 등록",
  "유튜브 링크",
  "adminToken"
]) {
  assert(propertyClient.includes(required), `Missing property onboarding guard: ${required}`);
}

for (const required of [
  "techStack",
  "coreArchitecture",
  "contentActionPlan",
  "launchTimeline"
]) {
  assert(launchData.includes(required), `Missing launch data guard: ${required}`);
}

for (const required of [
  "펜바TV 웹앱 아키텍처",
  "추천 기술 스택",
  "콘텐츠 액션 플랜",
  "런칭 타임라인",
  "settlement-note"
]) {
  assert(launchPlan.includes(required), `Missing launch plan guard: ${required}`);
}

for (const required of ["createAccommodationSchema", "ownerName", "reservationMode", "commissionRate", "featuredVideoUrl"]) {
  assert(schemas.includes(required), `Missing accommodation schema guard: ${required}`);
}

for (const required of ["POST", "accommodations", "requireAdminToken", "onboarding"]) {
  assert(apiRoute.includes(required), `Missing host accommodation API guard: ${required}`);
}

for (const required of [
  ".market-hero",
  ".penba-hero",
  ".shorts-feed",
  ".featured-video",
  ".property-grid",
  ".onboarding-layout",
  ".property-form",
  ".property-table",
  ".guide-hero",
  ".timeline-row"
]) {
  assert(css.includes(required), `Missing platform CSS guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "multi-property-platform",
      guards: [
        "marketplace-home",
        "partner-property-format",
        "property-onboarding-form",
        "host-accommodation-api",
        "responsive-platform-layout"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
