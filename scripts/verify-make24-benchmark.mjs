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

const benchmarkData = read("src/lib/make24-benchmark.ts");
const benchmarkPage = read("src/app/host/make24-benchmark/page.tsx");
const homePage = read("src/app/page.tsx");
const hostRooms = read("src/app/host/rooms/HostRoomsClient.tsx");
const css = read("src/app/globals.css");

for (const required of [
  "make24BenchmarkPoints",
  "penbaOwnerPackages",
  "penbaBuildSteps",
  "penbaServiceModules",
  "실시간 예약",
  "비대면 결제",
  "SEO"
]) {
  assert(benchmarkData.includes(required), `Missing Make24 benchmark data guard: ${required}`);
}

for (const required of [
  "MAKE24 Pension Benchmark",
  "펜션 사장님 입점 제안 페이지 구조",
  "벤치마킹 포인트",
  "펜바TV 입점 패키지",
  "입점 제작 과정"
]) {
  assert(benchmarkPage.includes(required), `Missing Make24 benchmark page guard: ${required}`);
}

assert(homePage.includes("/host/make24-benchmark"), "Missing home link to Make24 benchmark.");
assert(hostRooms.includes("/host/make24-benchmark"), "Missing host console link to Make24 benchmark.");

for (const required of [
  ".make24-hero",
  ".benchmark-grid",
  ".owner-package-grid",
  ".service-module-grid",
  ".build-step-list"
]) {
  assert(css.includes(required), `Missing Make24 benchmark CSS guard: ${required}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: "make24-pension-owner-landing-benchmark",
      guards: [
        "owner-sales-landing",
        "realtime-booking-message",
        "youtube-production-package",
        "admin-console-service",
        "responsive-seo-positioning"
      ],
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
