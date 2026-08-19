import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const baseUrl = process.env.STAYLINK_VERIFY_BASE_URL ?? "http://localhost:3000";
const accommodationId = process.env.STAYLINK_VERIFY_ACCOMMODATION_ID ?? "baebang-alps";
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const roomId = `qa-week3-room-${suffix}`;
const optionId = `qa-week3-option-${suffix}`;
const campaignCode = `qa_week3_video_${suffix.replace(/-/g, "_")}`;
const naverLinkId = `qa-week3-naver-${suffix}`;
const placeId = `qa-week3-place-${suffix}`;

function assertFileIncludes(relativePath, markers) {
  const content = fs.readFileSync(path.join(root, relativePath), "utf8");
  const missing = markers.filter((marker) => !content.includes(marker));

  if (missing.length > 0) {
    throw new Error(relativePath + " is missing week 3 markers: " + missing.join(", "));
  }
}

assertFileIncludes("src/app/host/rooms/HostRoomsClient.tsx", [
  "weekThreeManagementMilestones",
  "15일차",
  "21일차",
  "week-three-host-status",
  "week-three-host-kpis",
  "숙소 기본정보 등록/수정",
  "객실 사진 업로드/대표사진",
  "네이버 블로그/리뷰",
  "주변 맛집/가볼만한곳"
]);

assertFileIncludes("src/app/globals.css", [
  "week-three-host-status",
  "week-three-host-kpis",
  "week-three-host-head"
]);

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const splitAt = trimmed.indexOf("=");
    if (splitAt === -1) continue;

    const key = trimmed.slice(0, splitAt).trim();
    let value = trimmed.slice(splitAt + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

async function requestJson(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": process.env.STAYLINK_ADMIN_API_TOKEN,
      "x-penbatv-role": "host",
      ...(init.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${response.status} ${pathname}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function cleanup(supabase) {
  await supabase.from("nearby_places").delete().eq("id", placeId);
  await supabase.from("naver_links").delete().eq("id", naverLinkId);
  await supabase.from("youtube_campaigns").delete().eq("code", campaignCode);
  await supabase.from("booking_options").delete().eq("id", optionId);
  await supabase.from("room_images").delete().eq("room_id", roomId);
  await supabase.from("room_rates").delete().eq("room_id", roomId);
  await supabase.from("rooms").delete().eq("id", roomId);
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminToken = process.env.STAYLINK_ADMIN_API_TOKEN;

if (!supabaseUrl || !serviceRoleKey || !adminToken) {
  throw new Error("Supabase URL, service role key, and STAYLINK_ADMIN_API_TOKEN are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

try {
  await cleanup(supabase);

  const accommodation = await requestJson(`/api/host/accommodations/${accommodationId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: "아산 배방알프스",
      area: "충남 아산 배방",
      address: "충남 아산시 배방읍 고불로231번길 38",
      concept: "저수지 전망 독채와 바베큐 특화 펜션",
      status: "active"
    })
  });

  if (accommodation.accommodation?.id !== accommodationId) {
    throw new Error("Accommodation update failed.");
  }

  const room = await requestJson("/api/host/rooms", {
    method: "POST",
    body: JSON.stringify({
      id: roomId,
      accommodationId,
      name: "3주차 QA 객실",
      type: "private_house",
      basePrice: 210000,
      weekendExtra: 70000,
      standardCapacity: 4,
      maxCapacity: 8,
      description: "3주차 사장님 관리 QA용 객실입니다.",
      tags: ["QA", "독채"],
      amenities: [{ name: "개별 바베큐" }, { name: "주차" }]
    })
  });

  if (room.room?.id !== roomId) throw new Error("Room create failed.");

  const updatedRoom = await requestJson(`/api/host/rooms/${roomId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: "3주차 QA 객실 수정",
      basePrice: 220000,
      weekendExtra: 80000,
      status: "active"
    })
  });

  if (updatedRoom.room?.base_price !== 220000) throw new Error("Room update failed.");

  const image = await requestJson(`/api/host/rooms/${roomId}/images`, {
    method: "POST",
    body: JSON.stringify({
      url: "https://example.com/week3-room.jpg",
      caption: "3주차 대표사진",
      sortOrder: 1,
      isCover: true
    })
  });

  if (!image.image?.id || image.image.is_cover !== true) throw new Error("Room image create failed.");

  const option = await requestJson(`/api/host/accommodations/${accommodationId}/options`, {
    method: "POST",
    body: JSON.stringify({
      id: optionId,
      name: "3주차 QA 바베큐 세트",
      description: "사장님 관리 QA용 옵션",
      price: 33000,
      sortOrder: 99,
      status: "active"
    })
  });

  if (option.option?.id !== optionId) throw new Error("Option upsert failed.");

  const video = await requestJson("/api/host/youtube-campaigns", {
    method: "POST",
    body: JSON.stringify({
      code: campaignCode,
      title: "3주차 QA 외부 영상",
      videoUrl: "https://youtu.be/CGOBDAEbBqc",
      roomId,
      category: "exterior",
      tag: "외부",
      description: "외부 동선 확인",
      thumbnailUrl: "https://img.youtube.com/vi/CGOBDAEbBqc/hqdefault.jpg",
      couponAmount: 10000,
      status: "active"
    })
  });

  if (video.campaign?.code !== campaignCode) throw new Error("Youtube campaign upsert failed.");

  const naver = await requestJson("/api/host/naver-links", {
    method: "POST",
    body: JSON.stringify({
      id: naverLinkId,
      accommodationId,
      roomId,
      type: "blog",
      title: "3주차 QA 네이버 블로그",
      url: "https://blog.naver.com/",
      author: "네이버 블로그",
      excerpt: "QA 링크",
      rating: null,
      publishedAt: "2026-08-18",
      sortOrder: 99,
      status: "active"
    })
  });

  if (naver.link?.id !== naverLinkId) throw new Error("Naver link upsert failed.");

  const nearby = await requestJson("/api/host/nearby-places", {
    method: "POST",
    body: JSON.stringify({
      id: placeId,
      accommodationId,
      type: "restaurant",
      name: "3주차 QA 맛집",
      category: "한식",
      address: "충남 아산",
      distanceLabel: "차량 약 10분",
      travelTime: "10분",
      description: "QA용 주변 맛집",
      url: "https://map.naver.com/",
      mapUrl: "https://map.naver.com/",
      imageUrl: "https://example.com/week3-place.jpg",
      sortOrder: 99,
      status: "active"
    })
  });

  if (nearby.place?.id !== placeId) throw new Error("Nearby place upsert failed.");

  const hiddenRoom = await requestJson(`/api/host/rooms/${roomId}`, {
    method: "DELETE"
  });

  if (hiddenRoom.room?.status !== "hidden") throw new Error("Room hide failed.");

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        accommodationId,
        checked: [
          "accommodation-update",
          "room-create-update-hide",
          "image-create-cover",
          "youtube-link-upsert",
          "naver-link-upsert",
          "nearby-place-upsert",
          "option-upsert"
        ],
        roomId,
        imageId: image.image.id,
        optionId,
        campaignCode,
        naverLinkId,
        placeId,
        checkedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
} finally {
  await cleanup(supabase);
}
