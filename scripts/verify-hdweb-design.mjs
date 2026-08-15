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

const designData = read("src/lib/hdweb-design-benchmark.ts");
const designPage = read("src/app/host/design-benchmark/page.tsx");
const homePage = read("src/app/page.tsx");
const hostRooms = read("src/app/host/rooms/HostRoomsClient.tsx");
const make24Page = read("src/app/host/make24-benchmark/page.tsx");
const css = read("src/app/globals.css");

for (const required of [
  "hdwebBenchmarkFeatures",
  "penbaDesignTemplates",
  "penbaDesignFilters",
  "객실안내",
  "실시간예약",
  "주변관광지"
]) {
  assert(designData.includes(required), `Missing HDWEB design data guard: ${required}`);
}

for (const required of [
  "HDWEB Pension Design Benchmark",
  "펜바TV 펜션 디자인 선택형 화면",
  "업종별 디자인 필터",
  "최근 디자인",
  "템플릿 선택"
]) {
  assert(designPage.includes(required), `Missing HDWEB design page guard: ${required}`);
}

for (const [label, source] of [
  ["home", homePage],
  ["host console", hostRooms],
  ["make24 benchmark", make24Page]
]) {
  assert(source.includes("/host/design-benchmark"), `Missing design benchmark link in ${label}.`);
}

for (const required of [
  ".design-benchmark-hero",
  ".design-filter-row",
  ".design-feature-grid",
  ".design-template-grid",
  ".design-template-actions"
]) {
  assert(css.includes(required), `Missing HDWEB design CSS guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "hdweb-pension-design-template-benchmark",
      guards: [
        "industry-design-filter",
        "pension-feature-mapping",
        "penba-template-gallery",
        "template-preview-actions",
        "owner-design-selection-flow"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
