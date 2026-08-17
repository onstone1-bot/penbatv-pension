"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  mockOptions,
  mockRooms,
  mockVideos,
  type BookingOption,
  type Room,
  type YoutubeVideo
} from "@/lib/mock-data";
import { formatWon } from "@/lib/local-quote";

type RequestStatus = "확인필요" | "결제대기" | "확정";
type VideoCategory = YoutubeVideo["category"];

type RoomForm = {
  accommodationId: string;
  id: string;
  name: string;
  type: Room["type"];
  basePrice: number;
  weekendExtra: number;
  standardCapacity: number;
  maxCapacity: number;
  description: string;
  tags: string;
  amenities: string;
};

type ImageForm = {
  roomId: string;
  url: string;
  caption: string;
  sortOrder: number;
  isCover: boolean;
};

type VideoForm = {
  roomId: string;
  code: string;
  title: string;
  url: string;
  tag: string;
  category: VideoCategory;
  description: string;
  couponAmount: number;
};

type OptionForm = {
  accommodationId: string;
  id: string;
  name: string;
  description: string;
  price: number;
  sortOrder: number;
};

const reservationRequests: Array<{
  id: string;
  guest: string;
  roomId: string;
  date: string;
  channel: string;
  amount: number;
  status: RequestStatus;
}> = [
  {
    id: "RQ-2401",
    guest: "김민지",
    roomId: "A",
    date: "2026-08-20 - 2026-08-22",
    channel: "YouTube campheaven_room_01",
    amount: 620000,
    status: "확인필요"
  },
  {
    id: "RQ-2402",
    guest: "박준호",
    roomId: "B",
    date: "2026-08-28 - 2026-08-29",
    channel: "Naver keyword",
    amount: 275000,
    status: "결제대기"
  },
  {
    id: "RQ-2403",
    guest: "이서연",
    roomId: "A",
    date: "2026-09-05 - 2026-09-07",
    channel: "Direct",
    amount: 700000,
    status: "확정"
  }
];

const blockedDays = [
  { roomId: "A", date: "2026-08-24", reason: "청소/시설 점검" },
  { roomId: "B", date: "2026-08-30", reason: "프라이빗 행사" }
];

const operationChecklist = [
  "입점 펜션 기본 정보 등록",
  "객실/사이트 등록 후 고객 화면 노출 확인",
  "객실별 내부/외부 사진 URL 연결",
  "전체/외부/내부 유튜브 영상 연결",
  "바베큐·불멍·얼리체크인 옵션 등록",
  "달력 요금과 예약막기까지 최종 확인"
];

const initialRoomForm: RoomForm = {
  accommodationId: "baebang-alps",
  id: "",
  name: "",
  type: "private_house",
  basePrice: 220000,
  weekendExtra: 80000,
  standardCapacity: 4,
  maxCapacity: 8,
  description: "",
  tags: "독채, 바베큐, 가족",
  amenities: "개별 바베큐, 주방, 주차"
};

const initialImageForm: ImageForm = {
  roomId: mockRooms[0]?.id ?? "A",
  url: "",
  caption: "",
  sortOrder: 10,
  isCover: false
};

const initialVideoForm: VideoForm = {
  roomId: mockRooms[0]?.id ?? "A",
  code: "",
  title: "",
  url: "",
  tag: "외부",
  category: "exterior",
  description: "",
  couponAmount: 10000
};

const initialOptionForm: OptionForm = {
  accommodationId: "baebang-alps",
  id: "",
  name: "",
  description: "",
  price: 30000,
  sortOrder: 10
};

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `item-${Date.now()}`;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cover(room: Room) {
  return room.images.find((image) => image.isCover)?.url ?? room.images[0]?.url ?? "/penba/sign.jpg";
}

function roomTypeLabel(type: Room["type"]) {
  return {
    private_house: "독채",
    glamping: "글램핑",
    camp_site: "캠핑사이트"
  }[type];
}

function youtubeThumb(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  return match?.[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : undefined;
}

async function postHostJson(url: string, adminToken: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(typeof payload.error === "string" ? payload.error : "host api request failed");
  }

  return response.json();
}

export function HostRoomsClient() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [videos, setVideos] = useState<YoutubeVideo[]>(mockVideos);
  const [options, setOptions] = useState<BookingOption[]>(mockOptions);
  const [adminToken, setAdminToken] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(mockRooms[0]?.id ?? "A");
  const [roomForm, setRoomForm] = useState<RoomForm>(initialRoomForm);
  const [imageForm, setImageForm] = useState<ImageForm>(initialImageForm);
  const [videoForm, setVideoForm] = useState<VideoForm>(initialVideoForm);
  const [optionForm, setOptionForm] = useState<OptionForm>(initialOptionForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const requestCount = reservationRequests.filter((request) => request.status === "확인필요").length;
  const waitingPaymentCount = reservationRequests.filter((request) => request.status === "결제대기").length;
  const confirmedAmount = reservationRequests
    .filter((request) => request.status === "확정")
    .reduce((sum, request) => sum + request.amount, 0);

  const roomNameById = useMemo(() => new Map(rooms.map((room) => [room.id, room.name])), [rooms]);
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];
  const selectedRoomVideos = videos.filter((video) => video.roomId === selectedRoomId);
  const previewAccommodationId = roomForm.accommodationId.trim() || optionForm.accommodationId.trim() || "baebang-alps";
  const customerPreviewUrl = `/stays/${previewAccommodationId}?utm_source=penbatv&utm_medium=host_content_preview&utm_campaign=${previewAccommodationId}`;

  function updateRoomField<K extends keyof RoomForm>(key: K, value: RoomForm[K]) {
    setRoomForm((current) => ({ ...current, [key]: value }));
  }

  function updateImageField<K extends keyof ImageForm>(key: K, value: ImageForm[K]) {
    setImageForm((current) => ({ ...current, [key]: value }));
  }

  function updateVideoField<K extends keyof VideoForm>(key: K, value: VideoForm[K]) {
    setVideoForm((current) => ({ ...current, [key]: value }));
  }

  function updateOptionField<K extends keyof OptionForm>(key: K, value: OptionForm[K]) {
    setOptionForm((current) => ({ ...current, [key]: value }));
  }

  async function saveRoom() {
    if (!roomForm.accommodationId.trim() || !roomForm.name.trim()) {
      setMessage("숙소 ID와 객실명은 필수입니다.");
      return;
    }

    const roomId = roomForm.id.trim() || slugify(`${roomForm.accommodationId}-${roomForm.name}`);
    const nextRoom: Room = {
      id: roomId,
      name: roomForm.name.trim(),
      type: roomForm.type,
      basePrice: roomForm.basePrice,
      weekendExtra: roomForm.weekendExtra,
      standardCapacity: roomForm.standardCapacity,
      maxCapacity: Math.max(roomForm.standardCapacity, roomForm.maxCapacity),
      description: roomForm.description || "사장님이 등록한 객실 설명입니다.",
      tags: splitList(roomForm.tags),
      amenities: splitList(roomForm.amenities),
      images: [],
      rates: [
        {
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          rateType: "base",
          nightlyPrice: roomForm.basePrice,
          weekendExtra: roomForm.weekendExtra,
          priority: 0
        }
      ]
    };

    setIsSaving(true);
    setRooms((current) => [nextRoom, ...current.filter((room) => room.id !== nextRoom.id)]);
    setSelectedRoomId(nextRoom.id);
    setImageForm((current) => ({ ...current, roomId: nextRoom.id }));
    setVideoForm((current) => ({ ...current, roomId: nextRoom.id }));

    if (adminToken.trim()) {
      try {
        await postHostJson("/api/host/rooms", adminToken.trim(), {
          id: nextRoom.id,
          accommodationId: roomForm.accommodationId,
          name: nextRoom.name,
          type: nextRoom.type,
          basePrice: nextRoom.basePrice,
          weekendExtra: nextRoom.weekendExtra,
          standardCapacity: nextRoom.standardCapacity,
          maxCapacity: nextRoom.maxCapacity,
          description: nextRoom.description,
          tags: nextRoom.tags,
          amenities: nextRoom.amenities.map((name) => ({ name }))
        });
        setMessage("객실을 화면과 DB에 등록했습니다.");
      } catch {
        setMessage("화면에는 객실을 등록했습니다. 관리자 토큰 또는 DB 저장 상태는 다시 확인해주세요.");
      }
    } else {
      setMessage("객실 초안을 화면에 등록했습니다. 관리자 토큰을 넣으면 DB 저장까지 시도합니다.");
    }

    setRoomForm({ ...initialRoomForm, accommodationId: roomForm.accommodationId });
    setIsSaving(false);
  }

  async function saveImage() {
    if (!imageForm.roomId || !imageForm.url.trim()) {
      setMessage("사진을 연결할 객실과 이미지 URL은 필수입니다.");
      return;
    }

    setIsSaving(true);
    setRooms((current) =>
      current.map((room) =>
        room.id === imageForm.roomId
          ? {
              ...room,
              images: [
                ...room.images.map((image) => ({ ...image, isCover: imageForm.isCover ? false : image.isCover })),
                {
                  url: imageForm.url.trim(),
                  caption: imageForm.caption || "객실 사진",
                  isCover: imageForm.isCover
                }
              ]
            }
          : room
      )
    );

    if (adminToken.trim()) {
      try {
        await postHostJson(`/api/host/rooms/${encodeURIComponent(imageForm.roomId)}/images`, adminToken.trim(), {
          url: imageForm.url.trim(),
          caption: imageForm.caption || null,
          sortOrder: imageForm.sortOrder,
          isCover: imageForm.isCover
        });
        setMessage("객실 사진을 화면과 DB에 등록했습니다.");
      } catch {
        setMessage("화면에는 사진을 등록했습니다. DB 저장은 관리자 토큰 또는 URL 중복 여부를 확인해주세요.");
      }
    } else {
      setMessage("사진 초안을 화면에 등록했습니다. 관리자 토큰을 넣으면 DB 저장까지 시도합니다.");
    }

    setImageForm({ ...initialImageForm, roomId: imageForm.roomId, sortOrder: imageForm.sortOrder + 1 });
    setIsSaving(false);
  }

  async function saveVideo() {
    if (!videoForm.roomId || !videoForm.title.trim() || !videoForm.url.trim()) {
      setMessage("영상 객실, 제목, 유튜브 URL은 필수입니다.");
      return;
    }

    const code = videoForm.code.trim() || slugify(`${videoForm.roomId}-${videoForm.title}`);
    const nextVideo: YoutubeVideo = {
      code,
      title: videoForm.title.trim(),
      url: videoForm.url.trim(),
      thumbnailUrl: youtubeThumb(videoForm.url.trim()),
      tag: videoForm.tag || "YouTube",
      category: videoForm.category,
      description: videoForm.description || "사장님이 등록한 유튜브 영상입니다.",
      roomId: videoForm.roomId
    };

    setIsSaving(true);
    setVideos((current) => [nextVideo, ...current.filter((video) => video.code !== nextVideo.code)]);

    if (adminToken.trim()) {
      try {
        await postHostJson("/api/host/youtube-campaigns", adminToken.trim(), {
          code: nextVideo.code,
          title: nextVideo.title,
          videoUrl: nextVideo.url,
          roomId: nextVideo.roomId,
          category: nextVideo.category,
          tag: nextVideo.tag,
          description: nextVideo.description,
          thumbnailUrl: nextVideo.thumbnailUrl ?? "",
          couponAmount: videoForm.couponAmount,
          status: "active"
        });
        setMessage("유튜브 영상을 화면과 DB 캠페인에 등록했습니다.");
      } catch {
        setMessage("화면에는 영상을 등록했습니다. DB 저장은 관리자 토큰 또는 캠페인 코드 중복 여부를 확인해주세요.");
      }
    } else {
      setMessage("영상 초안을 화면에 등록했습니다. 관리자 토큰을 넣으면 DB 저장까지 시도합니다.");
    }

    setVideoForm({ ...initialVideoForm, roomId: videoForm.roomId, category: videoForm.category, tag: videoForm.tag });
    setIsSaving(false);
  }

  async function saveOption() {
    if (!optionForm.accommodationId.trim() || !optionForm.name.trim()) {
      setMessage("숙소 ID와 옵션명은 필수입니다.");
      return;
    }

    const optionId = optionForm.id.trim() || slugify(optionForm.name);
    const nextOption: BookingOption = {
      id: optionId,
      name: optionForm.name.trim(),
      description: optionForm.description || "사장님이 등록한 부대옵션입니다.",
      price: optionForm.price
    };

    setIsSaving(true);
    setOptions((current) => [nextOption, ...current.filter((option) => option.id !== nextOption.id)]);

    if (adminToken.trim()) {
      try {
        await postHostJson(
          `/api/host/accommodations/${encodeURIComponent(optionForm.accommodationId)}/options`,
          adminToken.trim(),
          {
            id: nextOption.id,
            name: nextOption.name,
            description: nextOption.description,
            price: nextOption.price,
            sortOrder: optionForm.sortOrder,
            status: "active"
          }
        );
        setMessage("부대옵션을 화면과 DB에 등록했습니다.");
      } catch {
        setMessage("화면에는 옵션을 등록했습니다. DB 저장은 관리자 토큰 또는 옵션 ID를 확인해주세요.");
      }
    } else {
      setMessage("옵션 초안을 화면에 등록했습니다. 관리자 토큰을 넣으면 DB 저장까지 시도합니다.");
    }

    setOptionForm({ ...initialOptionForm, accommodationId: optionForm.accommodationId, sortOrder: optionForm.sortOrder + 1 });
    setIsSaving(false);
  }

  function hideRoom(roomId: string) {
    setRooms((current) => current.filter((room) => room.id !== roomId));
  }

  return (
    <main>
      <section className="panel">
        <p className="muted">Step 8 Content Sync</p>
        <h1>사장님 등록·운영 작업대</h1>
        <p className="muted">
          여러 펜션을 입점시킬 때 필요한 객실, 사진, 유튜브 영상, 바베큐 옵션 입력값이 고객 예약 홈에 반영되는 흐름을 맞춥니다.
        </p>
        <div className="host-nav">
          <Link href="/host/properties">펜션 입점 등록</Link>
          <Link href="/host/rate-calendar">요금·옵션 설정</Link>
          <Link href="/host/core-features">핵심 기능</Link>
          <Link href="/host/reservation-payment">예약 결제 프로그램</Link>
          <Link href="/host/make24-benchmark">입점 제안</Link>
          <Link href="/host/design-benchmark">디자인 선택</Link>
          <Link href="/">입점 펜션 목록</Link>
          <Link href="/host/launch-plan">런칭 가이드</Link>
        </div>
      </section>

      <section className="host-dashboard-grid" aria-label="예약 운영 요약">
        <div className="host-metric">
          <span>확인 필요</span>
          <b>{requestCount}건</b>
        </div>
        <div className="host-metric">
          <span>결제 대기</span>
          <b>{waitingPaymentCount}건</b>
        </div>
        <div className="host-metric">
          <span>확정 매출</span>
          <b>{formatWon(confirmedAmount)}</b>
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>7~8단계 등록·자동 반영 흐름</h2>
          <span>입점 후 고객 홈 자동 구성</span>
        </div>
        <div className="onboarding-step-grid">
          {[
            ["01", "펜션 기본 정보", "숙소명, 지역, 주소, 예약 방식"],
            ["02", "객실/사이트", "객실명, 타입, 기준/최대 인원, 요금"],
            ["03", "사진", "대표 이미지, 내부, 외부, 바베큐장"],
            ["04", "유튜브", "전체, 외부, 내부 영상과 객실 연결"],
            ["05", "옵션", "바베큐, 불멍, 얼리체크인, 단독 이용"],
            ["06", "예약 현황", "홀드, 결제대기, 확정 예약 확인"]
          ].map(([step, title, body]) => (
            <article key={step}>
              <span>{step}</span>
              <b>{title}</b>
              <small>{body}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>DB 저장 연결</h2>
          <span>선택 입력</span>
        </div>
        <div className="host-token-row">
          <label>
            <span>관리자 API 토큰</span>
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="입력하면 Supabase 저장까지 시도"
            />
          </label>
          <p>
            토큰이 없으면 화면에서만 등록되는 데모로 동작합니다. 토큰이 있으면 서버 API가 Supabase에 저장을 시도합니다.
          </p>
          <Link className="secondary-action" href={customerPreviewUrl}>
            고객 홈 반영 확인
          </Link>
        </div>
        {message && <p className="status-note">{message}</p>}
      </section>

      <section className="host-form-studio">
        <article className="host-form-card">
          <h2>객실/사이트 등록</h2>
          <div className="form-grid">
            <label>
              <span>숙소 ID</span>
              <input value={roomForm.accommodationId} onChange={(event) => updateRoomField("accommodationId", event.target.value)} />
            </label>
            <label>
              <span>객실 ID</span>
              <input value={roomForm.id} onChange={(event) => updateRoomField("id", event.target.value)} placeholder="비워두면 자동 생성" />
            </label>
            <label>
              <span>객실명</span>
              <input value={roomForm.name} onChange={(event) => updateRoomField("name", event.target.value)} />
            </label>
            <label>
              <span>타입</span>
              <select value={roomForm.type} onChange={(event) => updateRoomField("type", event.target.value as Room["type"])}>
                <option value="private_house">독채</option>
                <option value="glamping">글램핑</option>
                <option value="camp_site">캠핑사이트</option>
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>평일 기본요금</span>
              <input type="number" min={0} step={1000} value={roomForm.basePrice} onChange={(event) => updateRoomField("basePrice", Number(event.target.value))} />
            </label>
            <label>
              <span>주말 추가요금</span>
              <input type="number" min={0} step={1000} value={roomForm.weekendExtra} onChange={(event) => updateRoomField("weekendExtra", Number(event.target.value))} />
            </label>
            <label>
              <span>기준 인원</span>
              <input type="number" min={1} value={roomForm.standardCapacity} onChange={(event) => updateRoomField("standardCapacity", Number(event.target.value))} />
            </label>
            <label>
              <span>최대 인원</span>
              <input type="number" min={1} value={roomForm.maxCapacity} onChange={(event) => updateRoomField("maxCapacity", Number(event.target.value))} />
            </label>
          </div>
          <label>
            <span>객실 설명</span>
            <textarea value={roomForm.description} onChange={(event) => updateRoomField("description", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>태그</span>
              <input value={roomForm.tags} onChange={(event) => updateRoomField("tags", event.target.value)} />
            </label>
            <label>
              <span>편의시설</span>
              <input value={roomForm.amenities} onChange={(event) => updateRoomField("amenities", event.target.value)} />
            </label>
          </div>
          <button className="primary-action" type="button" disabled={isSaving} onClick={saveRoom}>
            객실 등록
          </button>
        </article>

        <article className="host-form-card">
          <h2>객실 사진 등록</h2>
          <div className="form-grid">
            <label>
              <span>연결 객실</span>
              <select value={imageForm.roomId} onChange={(event) => updateImageField("roomId", event.target.value)}>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>정렬</span>
              <input type="number" min={0} value={imageForm.sortOrder} onChange={(event) => updateImageField("sortOrder", Number(event.target.value))} />
            </label>
          </div>
          <label>
            <span>이미지 URL</span>
            <input value={imageForm.url} onChange={(event) => updateImageField("url", event.target.value)} placeholder="/penba/interior-1.jpg 또는 https://..." />
          </label>
          <label>
            <span>사진 설명</span>
            <input value={imageForm.caption} onChange={(event) => updateImageField("caption", event.target.value)} />
          </label>
          <label className="inline-check">
            <input type="checkbox" checked={imageForm.isCover} onChange={(event) => updateImageField("isCover", event.target.checked)} />
            <span>대표 이미지로 지정</span>
          </label>
          <button className="primary-action" type="button" disabled={isSaving} onClick={saveImage}>
            사진 연결
          </button>
        </article>

        <article className="host-form-card">
          <h2>유튜브 영상 연결</h2>
          <div className="form-grid">
            <label>
              <span>연결 객실</span>
              <select value={videoForm.roomId} onChange={(event) => updateVideoField("roomId", event.target.value)}>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>분류</span>
              <select value={videoForm.category} onChange={(event) => updateVideoField("category", event.target.value as VideoCategory)}>
                <option value="all">전체</option>
                <option value="exterior">외부</option>
                <option value="interior">내부</option>
              </select>
            </label>
          </div>
          <label>
            <span>유튜브 URL</span>
            <input value={videoForm.url} onChange={(event) => updateVideoField("url", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>캠페인 코드</span>
              <input value={videoForm.code} onChange={(event) => updateVideoField("code", event.target.value)} placeholder="비워두면 자동 생성" />
            </label>
            <label>
              <span>쿠폰금액</span>
              <input type="number" min={0} step={1000} value={videoForm.couponAmount} onChange={(event) => updateVideoField("couponAmount", Number(event.target.value))} />
            </label>
          </div>
          <label>
            <span>영상 제목</span>
            <input value={videoForm.title} onChange={(event) => updateVideoField("title", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>태그</span>
              <input value={videoForm.tag} onChange={(event) => updateVideoField("tag", event.target.value)} />
            </label>
            <label>
              <span>설명</span>
              <input value={videoForm.description} onChange={(event) => updateVideoField("description", event.target.value)} />
            </label>
          </div>
          <button className="primary-action" type="button" disabled={isSaving} onClick={saveVideo}>
            영상 연결
          </button>
        </article>

        <article className="host-form-card">
          <h2>부대옵션 등록</h2>
          <div className="form-grid">
            <label>
              <span>숙소 ID</span>
              <input value={optionForm.accommodationId} onChange={(event) => updateOptionField("accommodationId", event.target.value)} />
            </label>
            <label>
              <span>옵션 ID</span>
              <input value={optionForm.id} onChange={(event) => updateOptionField("id", event.target.value)} placeholder="bbq-set" />
            </label>
          </div>
          <label>
            <span>옵션명</span>
            <input value={optionForm.name} onChange={(event) => updateOptionField("name", event.target.value)} placeholder="참숯 바베큐 세트" />
          </label>
          <label>
            <span>설명</span>
            <input value={optionForm.description} onChange={(event) => updateOptionField("description", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>금액</span>
              <input type="number" min={0} step={1000} value={optionForm.price} onChange={(event) => updateOptionField("price", Number(event.target.value))} />
            </label>
            <label>
              <span>정렬</span>
              <input type="number" min={0} value={optionForm.sortOrder} onChange={(event) => updateOptionField("sortOrder", Number(event.target.value))} />
            </label>
          </div>
          <button className="primary-action" type="button" disabled={isSaving} onClick={saveOption}>
            옵션 등록
          </button>
        </article>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>방·사이트 관리</h2>
          <span>{rooms.length}개 노출 중</span>
        </div>
        <div className="host-grid">
          {rooms.map((room) => (
            <article className={selectedRoomId === room.id ? "host-card selected" : "host-card"} key={room.id}>
              <div className="host-card-cover" style={{ backgroundImage: `url(${cover(room)})` }} />
              <h2>{room.name}</h2>
              <p className="muted">{room.description}</p>
              <div className="host-meta">
                <span>{roomTypeLabel(room.type)}</span>
                <span>기본 {formatWon(room.basePrice)}</span>
                <span>주말 +{formatWon(room.weekendExtra)}</span>
                <span>기준 {room.standardCapacity}인</span>
                <span>최대 {room.maxCapacity}인</span>
                <span>이미지 {room.images.length}장</span>
                <span>영상 {videos.filter((video) => video.roomId === room.id).length}개</span>
              </div>
              <div className="host-actions">
                <button type="button" onClick={() => setSelectedRoomId(room.id)}>선택</button>
                <button type="button">요금 수정</button>
                <button type="button">차단일 추가</button>
                <button type="button" onClick={() => hideRoom(room.id)}>
                  화면에서 숨기기
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedRoom && (
        <section className="host-section">
          <div className="section-head">
            <h2>{selectedRoom.name} 등록 미리보기</h2>
            <span>고객 화면에 쓰일 자료</span>
          </div>
          <div className="host-preview-grid">
            <article>
              <h3>사진</h3>
              <div className="preview-photo-grid">
                {selectedRoom.images.map((image) => (
                  <span key={image.url} style={{ backgroundImage: `url(${image.url})` }}>
                    <b>{image.caption}</b>
                  </span>
                ))}
              </div>
            </article>
            <article>
              <h3>유튜브 영상</h3>
              <div className="preview-video-list">
                {selectedRoomVideos.map((video) => (
                  <a href={video.url} key={video.code} rel="noreferrer" target="_blank">
                    <span>{video.category === "all" ? "전체" : video.category === "exterior" ? "외부" : "내부"}</span>
                    <b>{video.title}</b>
                    <small>{video.code}</small>
                  </a>
                ))}
              </div>
            </article>
            <article>
              <h3>부대옵션</h3>
              <div className="preview-option-list">
                {options.map((option) => (
                  <div key={option.id}>
                    <span>{option.id}</span>
                    <b>{option.name}</b>
                    <strong>{formatWon(option.price)}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="host-section">
        <div className="section-head">
          <h2>예약 요청함</h2>
          <span>네이버예약 벤치마킹 흐름</span>
        </div>
        <div className="request-list">
          {reservationRequests.map((request) => (
            <article className="request-card" key={request.id}>
              <div>
                <span className={`status-badge ${request.status === "확인필요" ? "urgent" : ""}`}>
                  {request.status}
                </span>
                <h3>{request.guest}</h3>
                <p>
                  {roomNameById.get(request.roomId) ?? request.roomId} · {request.date}
                </p>
                <small>{request.channel}</small>
              </div>
              <strong>{formatWon(request.amount)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>예약 차단일</h2>
          <span>청소·점검·행사</span>
        </div>
        <div className="block-list">
          {blockedDays.map((block) => (
            <div className="block-row" key={`${block.roomId}-${block.date}`}>
              <b>{block.date}</b>
              <span>{roomNameById.get(block.roomId) ?? block.roomId}</span>
              <small>{block.reason}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="host-section">
        <div className="section-head">
          <h2>운영 체크리스트</h2>
          <span>8단계 기준</span>
        </div>
        <div className="check-list">
          {operationChecklist.map((item) => (
            <label key={item}>
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>
    </main>
  );
}
