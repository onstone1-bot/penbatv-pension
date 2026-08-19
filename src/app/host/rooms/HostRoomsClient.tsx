"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  mockOptions,
  mockNaverLinks,
  mockNearbyPlaces,
  mockRooms,
  mockVideos,
  type BookingOption,
  type NaverLink,
  type NearbyPlace,
  type Room,
  type Stay,
  type YoutubeVideo
} from "@/lib/mock-data";
import { formatWon } from "@/lib/local-quote";

type RequestStatus = "확인필요" | "결제대기" | "확정";
type VideoCategory = YoutubeVideo["category"];
type NaverLinkType = NaverLink["type"];
type NearbyPlaceType = NearbyPlace["type"];
type ManagementView = "rooms" | "videos" | "naver" | "nearby" | "options";

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

type NaverLinkForm = {
  accommodationId: string;
  roomId: string;
  id: string;
  type: NaverLinkType;
  title: string;
  url: string;
  author: string;
  excerpt: string;
  rating: number;
  publishedAt: string;
  sortOrder: number;
};

type NearbyPlaceForm = {
  accommodationId: string;
  id: string;
  type: NearbyPlaceType;
  name: string;
  category: string;
  address: string;
  distanceLabel: string;
  travelTime: string;
  description: string;
  url: string;
  mapUrl: string;
  imageUrl: string;
  sortOrder: number;
};

type AccommodationForm = {
  id: string;
  name: string;
  area: string;
  address: string;
  concept: string;
  status: "active" | "hidden";
};

type HostRoomsClientProps = {
  initialStay?: Stay;
  initialRooms?: Room[];
  initialOptions?: BookingOption[];
  initialVideos?: YoutubeVideo[];
  initialNaverLinks?: NaverLink[];
  initialNearbyPlaces?: NearbyPlace[];
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
  "네이버 블로그·리뷰 링크 등록",
  "주변 가볼만한곳·주변맛집 등록",
  "바베큐·불멍·얼리체크인 옵션 등록",
  "달력 요금과 예약막기까지 최종 확인"
];

const weekThreeManagementMilestones = [
  { day: "15일차", title: "숙소 기본정보 등록/수정", body: "숙소명, 지역, 주소, 컨셉, 노출 상태를 운영 DB에 저장합니다." },
  { day: "16일차", title: "객실 등록/수정/숨김", body: "객실 타입, 요금, 기준/최대 인원, 편의시설을 등록하고 비공개 처리합니다." },
  { day: "17일차", title: "객실 사진 업로드/대표사진", body: "객실별 이미지 URL과 설명을 등록하고 대표사진을 지정합니다." },
  { day: "18일차", title: "유튜브 링크 등록/분류", body: "전체, 외부, 내부 영상과 객실 연결, 캠페인 코드를 관리합니다." },
  { day: "19일차", title: "네이버 블로그/리뷰", body: "네이버 블로그와 리뷰 링크를 객실 또는 숙소 전체에 연결합니다." },
  { day: "20일차", title: "주변 맛집/가볼만한곳", body: "지도 URL, 거리, 소요시간, 소개 문구를 등록합니다." },
  { day: "21일차", title: "사장님 관리화면 QA", body: "등록, 수정, 비공개, 고객 화면 미리보기까지 통합 점검합니다." }
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

const initialNaverLinkForm: NaverLinkForm = {
  accommodationId: "baebang-alps",
  roomId: mockRooms[0]?.id ?? "A",
  id: "",
  type: "blog",
  title: "",
  url: "",
  author: "네이버 블로그",
  excerpt: "",
  rating: 4.8,
  publishedAt: "2026-08-17",
  sortOrder: 10
};

const initialNearbyPlaceForm: NearbyPlaceForm = {
  accommodationId: "baebang-alps",
  id: "",
  type: "attraction",
  name: "",
  category: "산책·사진",
  address: "",
  distanceLabel: "차량 약 15분",
  travelTime: "15분",
  description: "",
  url: "",
  mapUrl: "https://map.naver.com/",
  imageUrl: "/penba/reservoir.jpg",
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

function naverTypeLabel(type: NaverLinkType) {
  return type === "blog" ? "네이버 블로그" : "네이버 리뷰";
}

function nearbyTypeLabel(type: NearbyPlaceType) {
  return type === "attraction" ? "주변 가볼만한곳" : "주변맛집";
}

async function postHostJson(url: string, adminToken: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken,
      "x-penbatv-role": "host"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(typeof payload.error === "string" ? payload.error : "host api request failed");
  }

  return response.json();
}

async function sendHostJson(
  url: string,
  adminToken: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>
) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken,
      "x-penbatv-role": "host"
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(typeof payload.error === "string" ? payload.error : "host api request failed");
  }

  return response.json();
}

function initialAccommodationForm(stay?: Stay): AccommodationForm {
  return {
    id: stay?.id ?? "baebang-alps",
    name: stay?.name ?? "배방알프스",
    area: stay?.area ?? "충남 아산 배방",
    address: stay?.address ?? "",
    concept: stay?.concept ?? "",
    status: "active"
  };
}

export function HostRoomsClient({
  initialStay,
  initialRooms,
  initialOptions,
  initialVideos,
  initialNaverLinks,
  initialNearbyPlaces
}: HostRoomsClientProps) {
  const loadedRooms = initialRooms?.length ? initialRooms : mockRooms;
  const [rooms, setRooms] = useState<Room[]>(loadedRooms);
  const [videos, setVideos] = useState<YoutubeVideo[]>(initialVideos?.length ? initialVideos : mockVideos);
  const [naverLinks, setNaverLinks] = useState<NaverLink[]>(initialNaverLinks?.length ? initialNaverLinks : mockNaverLinks);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>(initialNearbyPlaces?.length ? initialNearbyPlaces : mockNearbyPlaces);
  const [options, setOptions] = useState<BookingOption[]>(initialOptions?.length ? initialOptions : mockOptions);
  const [accommodationForm, setAccommodationForm] = useState<AccommodationForm>(initialAccommodationForm(initialStay));
  const [adminToken, setAdminToken] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(loadedRooms[0]?.id ?? "A");
  const [roomForm, setRoomForm] = useState<RoomForm>({
    ...initialRoomForm,
    accommodationId: initialStay?.id ?? "baebang-alps"
  });
  const [imageForm, setImageForm] = useState<ImageForm>({
    ...initialImageForm,
    roomId: loadedRooms[0]?.id ?? "A"
  });
  const [videoForm, setVideoForm] = useState<VideoForm>({
    ...initialVideoForm,
    roomId: loadedRooms[0]?.id ?? "A"
  });
  const [optionForm, setOptionForm] = useState<OptionForm>({
    ...initialOptionForm,
    accommodationId: initialStay?.id ?? "baebang-alps"
  });
  const [naverLinkForm, setNaverLinkForm] = useState<NaverLinkForm>({
    ...initialNaverLinkForm,
    accommodationId: initialStay?.id ?? "baebang-alps",
    roomId: loadedRooms[0]?.id ?? "A"
  });
  const [nearbyPlaceForm, setNearbyPlaceForm] = useState<NearbyPlaceForm>({
    ...initialNearbyPlaceForm,
    accommodationId: initialStay?.id ?? "baebang-alps"
  });
  const [managementView, setManagementView] = useState<ManagementView>("rooms");
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
  const selectedRoomNaverLinks = naverLinks.filter((link) => !link.roomId || link.roomId === selectedRoomId);
  const attractionPlaces = nearbyPlaces.filter((place) => place.type === "attraction");
  const restaurantPlaces = nearbyPlaces.filter((place) => place.type === "restaurant");
  const previewAccommodationId = roomForm.accommodationId.trim() || optionForm.accommodationId.trim() || "baebang-alps";
  const customerPreviewUrl = `/stays/${previewAccommodationId}?utm_source=penbatv&utm_medium=host_content_preview&utm_campaign=${previewAccommodationId}`;
  const visibleContentCount = rooms.length + videos.length + naverLinks.length + nearbyPlaces.length + options.length;
  const managementTabs: Array<{ id: ManagementView; label: string; count: number }> = [
    { id: "rooms", label: "객실", count: rooms.length },
    { id: "videos", label: "영상", count: videos.length },
    { id: "naver", label: "네이버", count: naverLinks.length },
    { id: "nearby", label: "주변정보", count: nearbyPlaces.length },
    { id: "options", label: "옵션", count: options.length }
  ];

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

  function updateNaverLinkField<K extends keyof NaverLinkForm>(key: K, value: NaverLinkForm[K]) {
    setNaverLinkForm((current) => ({ ...current, [key]: value }));
  }

  function updateNearbyPlaceField<K extends keyof NearbyPlaceForm>(key: K, value: NearbyPlaceForm[K]) {
    setNearbyPlaceForm((current) => ({ ...current, [key]: value }));
  }

  function updateAccommodationField<K extends keyof AccommodationForm>(key: K, value: AccommodationForm[K]) {
    setAccommodationForm((current) => ({ ...current, [key]: value }));
  }

  async function saveAccommodation() {
    if (!accommodationForm.id.trim() || !accommodationForm.name.trim() || !accommodationForm.area.trim()) {
      setMessage("숙소 ID, 숙소명, 지역은 필수입니다.");
      return;
    }

    if (!adminToken.trim()) {
      setMessage("숙소 기본정보 수정은 운영 저장 토큰을 입력해야 DB에 반영됩니다.");
      return;
    }

    setIsSaving(true);

    try {
      await sendHostJson(
        `/api/host/accommodations/${encodeURIComponent(accommodationForm.id)}`,
        adminToken.trim(),
        "PATCH",
        {
          name: accommodationForm.name,
          area: accommodationForm.area,
          address: accommodationForm.address || null,
          concept: accommodationForm.concept || null,
          status: accommodationForm.status
        }
      );
      setMessage("숙소 기본정보를 운영 DB에 수정했습니다. 고객 화면 새로고침 시 반영됩니다.");
    } catch {
      setMessage("숙소 기본정보 수정에 실패했습니다. 운영 저장 토큰과 숙소 ID를 확인해주세요.");
    }

    setIsSaving(false);
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
        const payload = {
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
        };
        const existingRoom = rooms.some((room) => room.id === nextRoom.id);

        if (existingRoom) {
          await sendHostJson(`/api/host/rooms/${encodeURIComponent(nextRoom.id)}`, adminToken.trim(), "PATCH", {
            name: nextRoom.name,
            type: nextRoom.type,
            basePrice: nextRoom.basePrice,
            weekendExtra: nextRoom.weekendExtra,
            standardCapacity: nextRoom.standardCapacity,
            maxCapacity: nextRoom.maxCapacity,
            description: nextRoom.description,
            tags: nextRoom.tags,
            amenities: nextRoom.amenities.map((name) => ({ name })),
            status: "active"
          });
        } else {
          await postHostJson("/api/host/rooms", adminToken.trim(), payload);
        }

        setMessage("객실을 화면과 DB에 등록/수정했습니다.");
      } catch {
        setMessage("객실은 운영 화면에 반영했습니다. 운영 DB 저장은 토큰 또는 저장 상태를 확인해주세요.");
      }
    } else {
      setMessage("객실을 임시 저장했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
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
        setMessage("사진은 운영 화면에 반영했습니다. 운영 DB 저장은 토큰 또는 URL 중복 여부를 확인해주세요.");
      }
    } else {
      setMessage("사진을 임시 저장했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
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
        setMessage("영상은 운영 화면에 반영했습니다. 운영 DB 저장은 토큰 또는 캠페인 코드 중복 여부를 확인해주세요.");
      }
    } else {
      setMessage("영상을 임시 저장했습니다. 운영 저장 토큰을 입력하면 DB 캠페인까지 반영됩니다.");
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
        setMessage("옵션은 운영 화면에 반영했습니다. 운영 DB 저장은 토큰 또는 옵션 ID를 확인해주세요.");
      }
    } else {
      setMessage("옵션을 임시 저장했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
    }

    setOptionForm({ ...initialOptionForm, accommodationId: optionForm.accommodationId, sortOrder: optionForm.sortOrder + 1 });
    setIsSaving(false);
  }

  async function saveNaverLink() {
    if (!naverLinkForm.accommodationId.trim() || !naverLinkForm.title.trim() || !naverLinkForm.url.trim()) {
      setMessage("숙소 ID, 제목, 네이버 링크 URL은 필수입니다.");
      return;
    }

    const linkId =
      naverLinkForm.id.trim() || slugify(`${naverLinkForm.type}-${naverLinkForm.roomId || "stay"}-${naverLinkForm.title}`);
    const nextLink: NaverLink = {
      id: linkId,
      accommodationId: naverLinkForm.accommodationId.trim(),
      roomId: naverLinkForm.roomId || null,
      type: naverLinkForm.type,
      title: naverLinkForm.title.trim(),
      url: naverLinkForm.url.trim(),
      author: naverLinkForm.author || naverTypeLabel(naverLinkForm.type),
      excerpt: naverLinkForm.excerpt || "사장님이 등록한 네이버 외부 후기입니다.",
      rating: naverLinkForm.type === "review" ? naverLinkForm.rating : null,
      publishedAt: naverLinkForm.publishedAt || null
    };

    setIsSaving(true);
    setNaverLinks((current) => [nextLink, ...current.filter((link) => link.id !== nextLink.id)]);

    if (adminToken.trim()) {
      try {
        await postHostJson("/api/host/naver-links", adminToken.trim(), {
          id: nextLink.id,
          accommodationId: nextLink.accommodationId,
          roomId: nextLink.roomId,
          type: nextLink.type,
          title: nextLink.title,
          url: nextLink.url,
          author: nextLink.author,
          excerpt: nextLink.excerpt,
          rating: nextLink.rating,
          publishedAt: nextLink.publishedAt,
          sortOrder: naverLinkForm.sortOrder,
          status: "active"
        });
        setMessage("네이버 블로그·리뷰 링크를 화면과 DB에 등록했습니다.");
      } catch {
        setMessage("네이버 링크는 운영 화면에 반영했습니다. 운영 DB 저장은 토큰 또는 URL/ID를 확인해주세요.");
      }
    } else {
      setMessage("네이버 링크를 임시 저장했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
    }

    setNaverLinkForm({
      ...initialNaverLinkForm,
      accommodationId: naverLinkForm.accommodationId,
      roomId: naverLinkForm.roomId,
      type: naverLinkForm.type,
      author: naverTypeLabel(naverLinkForm.type),
      sortOrder: naverLinkForm.sortOrder + 1
    });
    setIsSaving(false);
  }

  async function saveNearbyPlace() {
    if (!nearbyPlaceForm.accommodationId.trim() || !nearbyPlaceForm.name.trim()) {
      setMessage("숙소 ID와 장소명은 필수입니다.");
      return;
    }

    const placeId = nearbyPlaceForm.id.trim() || slugify(`${nearbyPlaceForm.type}-${nearbyPlaceForm.name}`);
    const nextPlace: NearbyPlace = {
      id: placeId,
      accommodationId: nearbyPlaceForm.accommodationId.trim(),
      type: nearbyPlaceForm.type,
      name: nearbyPlaceForm.name.trim(),
      category: nearbyPlaceForm.category || nearbyTypeLabel(nearbyPlaceForm.type),
      address: nearbyPlaceForm.address,
      distanceLabel: nearbyPlaceForm.distanceLabel,
      travelTime: nearbyPlaceForm.travelTime,
      description: nearbyPlaceForm.description || "사장님이 등록한 주변 추천 장소입니다.",
      url: nearbyPlaceForm.url || null,
      mapUrl: nearbyPlaceForm.mapUrl || null,
      imageUrl: nearbyPlaceForm.imageUrl || null
    };

    setIsSaving(true);
    setNearbyPlaces((current) => [nextPlace, ...current.filter((place) => place.id !== nextPlace.id)]);

    if (adminToken.trim()) {
      try {
        await postHostJson("/api/host/nearby-places", adminToken.trim(), {
          id: nextPlace.id,
          accommodationId: nextPlace.accommodationId,
          type: nextPlace.type,
          name: nextPlace.name,
          category: nextPlace.category,
          address: nextPlace.address,
          distanceLabel: nextPlace.distanceLabel,
          travelTime: nextPlace.travelTime,
          description: nextPlace.description,
          url: nextPlace.url ?? "",
          mapUrl: nextPlace.mapUrl ?? "",
          imageUrl: nextPlace.imageUrl ?? "",
          sortOrder: nearbyPlaceForm.sortOrder,
          status: "active"
        });
        setMessage("주변 가볼만한곳·주변맛집을 화면과 DB에 등록했습니다.");
      } catch {
        setMessage("주변정보는 운영 화면에 반영했습니다. 운영 DB 저장은 토큰 또는 장소 ID를 확인해주세요.");
      }
    } else {
      setMessage("주변정보를 임시 저장했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
    }

    setNearbyPlaceForm({
      ...initialNearbyPlaceForm,
      accommodationId: nearbyPlaceForm.accommodationId,
      type: nearbyPlaceForm.type,
      category: nearbyPlaceForm.type === "attraction" ? "산책·사진" : "한식·맛집",
      sortOrder: nearbyPlaceForm.sortOrder + 1
    });
    setIsSaving(false);
  }

  async function hideRoom(roomId: string) {
    setRooms((current) => current.filter((room) => room.id !== roomId));
    setSelectedRoomId((current) => (current === roomId ? rooms.find((room) => room.id !== roomId)?.id ?? "" : current));

    if (adminToken.trim()) {
      try {
        await sendHostJson(`/api/host/rooms/${encodeURIComponent(roomId)}`, adminToken.trim(), "DELETE");
        setMessage("객실을 화면과 운영 DB에서 비공개 처리했습니다.");
      } catch {
        setMessage("객실은 화면에서 비공개 처리했습니다. 운영 DB 반영은 토큰 또는 객실 ID를 확인해주세요.");
      }
      return;
    }

    setMessage("객실을 화면에서 비공개 처리했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
  }

  function loadRoomDraft(room: Room) {
    setSelectedRoomId(room.id);
    setRoomForm({
      accommodationId: previewAccommodationId,
      id: room.id,
      name: room.name,
      type: room.type,
      basePrice: room.basePrice,
      weekendExtra: room.weekendExtra,
      standardCapacity: room.standardCapacity,
      maxCapacity: room.maxCapacity,
      description: room.description,
      tags: room.tags.join(", "),
      amenities: room.amenities.join(", ")
    });
    setImageForm((current) => ({ ...current, roomId: room.id }));
    setVideoForm((current) => ({ ...current, roomId: room.id }));
    setMessage(`${room.name} 객실 정보를 수정폼으로 불러왔습니다.`);
  }

  function loadVideoDraft(video: YoutubeVideo) {
    setSelectedRoomId(video.roomId);
    setVideoForm({
      roomId: video.roomId,
      code: video.code,
      title: video.title,
      url: video.url ?? "",
      tag: video.tag,
      category: video.category,
      description: video.description,
      couponAmount: 10000
    });
    setMessage(`${video.title} 영상을 수정폼으로 불러왔습니다.`);
  }

  function loadOptionDraft(option: BookingOption) {
    setOptionForm({
      accommodationId: previewAccommodationId,
      id: option.id,
      name: option.name,
      description: option.description,
      price: option.price,
      sortOrder: 10
    });
    setMessage(`${option.name} 옵션을 수정폼으로 불러왔습니다.`);
  }

  function loadNaverLinkDraft(link: NaverLink) {
    setNaverLinkForm({
      accommodationId: link.accommodationId,
      roomId: link.roomId ?? "",
      id: link.id,
      type: link.type,
      title: link.title,
      url: link.url,
      author: link.author,
      excerpt: link.excerpt,
      rating: link.rating ?? 4.8,
      publishedAt: link.publishedAt ?? "",
      sortOrder: 10
    });
    if (link.roomId) {
      setSelectedRoomId(link.roomId);
    }
    setMessage(`${link.title} 네이버 링크를 수정폼으로 불러왔습니다.`);
  }

  function loadNearbyPlaceDraft(place: NearbyPlace) {
    setNearbyPlaceForm({
      accommodationId: place.accommodationId,
      id: place.id,
      type: place.type,
      name: place.name,
      category: place.category,
      address: place.address,
      distanceLabel: place.distanceLabel,
      travelTime: place.travelTime,
      description: place.description,
      url: place.url ?? "",
      mapUrl: place.mapUrl ?? "",
      imageUrl: place.imageUrl ?? "",
      sortOrder: 10
    });
    setMessage(`${place.name} 주변정보를 수정폼으로 불러왔습니다.`);
  }

  async function removeVideo(code: string) {
    const video = videos.find((item) => item.code === code);
    setVideos((current) => current.filter((video) => video.code !== code));

    if (adminToken.trim() && video) {
      try {
        await postHostJson("/api/host/youtube-campaigns", adminToken.trim(), {
          code: video.code,
          title: video.title,
          videoUrl: video.url ?? "",
          roomId: video.roomId,
          category: video.category,
          tag: video.tag,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl ?? "",
          couponAmount: 0,
          status: "ended"
        });
        setMessage("영상을 화면과 운영 DB에서 비공개 처리했습니다.");
      } catch {
        setMessage("영상은 화면에서 비공개 처리했습니다. 운영 DB 반영은 토큰 또는 캠페인 코드를 확인해주세요.");
      }
      return;
    }

    setMessage("영상을 화면에서 비공개 처리했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
  }

  async function removeOption(id: string) {
    const option = options.find((item) => item.id === id);
    setOptions((current) => current.filter((option) => option.id !== id));

    if (adminToken.trim() && option) {
      try {
        await postHostJson(
          `/api/host/accommodations/${encodeURIComponent(previewAccommodationId)}/options`,
          adminToken.trim(),
          {
            id: option.id,
            name: option.name,
            description: option.description,
            price: option.price,
            sortOrder: 10,
            status: "hidden"
          }
        );
        setMessage("옵션을 화면과 운영 DB에서 비공개 처리했습니다.");
      } catch {
        setMessage("옵션은 화면에서 비공개 처리했습니다. 운영 DB 반영은 토큰 또는 옵션 ID를 확인해주세요.");
      }
      return;
    }

    setMessage("옵션을 화면에서 비공개 처리했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
  }

  async function removeNaverLink(id: string) {
    const link = naverLinks.find((item) => item.id === id);
    setNaverLinks((current) => current.filter((link) => link.id !== id));

    if (adminToken.trim() && link) {
      try {
        await postHostJson("/api/host/naver-links", adminToken.trim(), {
          id: link.id,
          accommodationId: link.accommodationId,
          roomId: link.roomId ?? null,
          type: link.type,
          title: link.title,
          url: link.url,
          author: link.author,
          excerpt: link.excerpt,
          rating: link.rating ?? null,
          publishedAt: link.publishedAt ?? null,
          sortOrder: 10,
          status: "hidden"
        });
        setMessage("네이버 링크를 화면과 운영 DB에서 비공개 처리했습니다.");
      } catch {
        setMessage("네이버 링크는 화면에서 비공개 처리했습니다. 운영 DB 반영은 토큰 또는 링크 ID를 확인해주세요.");
      }
      return;
    }

    setMessage("네이버 링크를 화면에서 비공개 처리했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
  }

  async function removeNearbyPlace(id: string) {
    const place = nearbyPlaces.find((item) => item.id === id);
    setNearbyPlaces((current) => current.filter((place) => place.id !== id));

    if (adminToken.trim() && place) {
      try {
        await postHostJson("/api/host/nearby-places", adminToken.trim(), {
          id: place.id,
          accommodationId: place.accommodationId,
          type: place.type,
          name: place.name,
          category: place.category,
          address: place.address,
          distanceLabel: place.distanceLabel,
          travelTime: place.travelTime,
          description: place.description,
          url: place.url ?? "",
          mapUrl: place.mapUrl ?? "",
          imageUrl: place.imageUrl ?? "",
          sortOrder: 10,
          status: "hidden"
        });
        setMessage("주변정보를 화면과 운영 DB에서 비공개 처리했습니다.");
      } catch {
        setMessage("주변정보는 화면에서 비공개 처리했습니다. 운영 DB 반영은 토큰 또는 장소 ID를 확인해주세요.");
      }
      return;
    }

    setMessage("주변정보를 화면에서 비공개 처리했습니다. 운영 저장 토큰을 입력하면 DB까지 반영됩니다.");
  }

  return (
    <main className="host-rooms-page">
      <section className="panel host-control-hero">
        <div className="host-hero-copy">
          <div className="host-home-actions" aria-label="펜바TV 바로가기">
            <Link href="/">펜바TV홈</Link>
            <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=host_center&utm_campaign=owner_preview">
              고객 예약화면
            </Link>
          </div>
          <p className="muted">PenBa TV Partner Center</p>
          <h1>{accommodationForm.name} 운영센터</h1>
          <p className="muted">
            유튜브 영상을 보고 들어온 고객에게 노출될 객실, 사진, 영상, 후기, 주변정보, 예약 옵션을 한 화면에서 관리합니다.
          </p>
          <div className="host-live-status" aria-label="운영 상태">
            <span>운영중</span>
            <span>고객 예약 화면 연결</span>
            <span>노출 콘텐츠 {visibleContentCount}개</span>
            <span>오늘 확인 {requestCount}건</span>
          </div>
          <div className="host-nav">
            <Link href="/host/properties">펜션 입점 등록</Link>
            <Link href="/host/rate-calendar">요금·옵션 설정</Link>
            <Link href="/host/core-features">핵심 기능</Link>
            <Link href="/host/reservation-payment">예약 결제 프로그램</Link>
            <Link href="/host/make24-benchmark">입점 제안</Link>
            <Link href="/host/design-benchmark">디자인 선택</Link>
            <Link href="/">펜바TV홈</Link>
            <Link href="/host/launch-plan">런칭 가이드</Link>
          </div>
        </div>
        <div className="host-hero-visual" aria-label="배방알프스 사진">
          <span style={{ backgroundImage: "url(/penba/reservoir.jpg)" }}>
            <b>저수지 전망</b>
          </span>
          <span style={{ backgroundImage: "url(/penba/bbq-yard.jpg)" }}>
            <b>바베큐 마당</b>
          </span>
          <span style={{ backgroundImage: "url(/penba/interior-3.jpg)" }}>
            <b>목조 독채</b>
          </span>
        </div>
      </section>

      <section className="week-three-host-status" aria-label="3주차 사장님 관리 실데이터화 진행 상태">
        <div className="week-three-host-head">
          <span>WEEK 3 · 15~21일차</span>
          <h2>사장님이 직접 등록·수정·비공개 처리하는 운영 콘솔</h2>
          <p>
            이 화면에서 숙소 기본정보, 객실, 사진, 유튜브 영상, 네이버 블로그·리뷰,
            주변 맛집·가볼만한곳, 부대옵션을 등록하면 고객 예약 화면의 상세 콘텐츠로 이어집니다.
          </p>
        </div>
        <ol>
          {weekThreeManagementMilestones.map((milestone) => (
            <li key={milestone.day}>
              <span>{milestone.day}</span>
              <b>{milestone.title}</b>
              <small>{milestone.body}</small>
            </li>
          ))}
        </ol>
        <div className="week-three-host-kpis" aria-label="현재 등록 콘텐츠 요약">
          <div><span>숙소 ID</span><b>{accommodationForm.id}</b></div>
          <div><span>객실</span><b>{rooms.length}개</b></div>
          <div><span>사진</span><b>{rooms.reduce((sum, room) => sum + room.images.length, 0)}장</b></div>
          <div><span>유튜브</span><b>{videos.length}개</b></div>
          <div><span>네이버</span><b>{naverLinks.length}개</b></div>
          <div><span>주변정보</span><b>{nearbyPlaces.length}개</b></div>
        </div>
      </section>
      <section className="host-travel-mood" aria-label="펜션 여행 분위기">
        <article style={{ backgroundImage: "url(/penba/overlook.jpg)" }}>
          <span>소나무 정원</span>
          <b>위에서 내려다보는 조용한 휴식 동선</b>
        </article>
        <article style={{ backgroundImage: "url(/penba/bbq-deck.jpg)" }}>
          <span>개별 바베큐</span>
          <b>숙박과 당일 바베큐 이용을 함께 운영</b>
        </article>
        <article style={{ backgroundImage: "url(/penba/entrance-road.jpg)" }}>
          <span>진입 안내</span>
          <b>고객이 찾아오기 쉬운 현장 사진 구성</b>
        </article>
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
          <h2>운영 업무 흐름</h2>
          <span>등록부터 예약 확인까지</span>
        </div>
        <div className="onboarding-step-grid">
          {[
            ["01", "펜션 정보", "상호, 주소, 예약 정책을 등록합니다."],
            ["02", "객실 관리", "객실명, 인원, 요금, 노출 여부를 관리합니다."],
            ["03", "사진 관리", "대표 이미지와 내부·외부·바베큐장 사진을 연결합니다."],
            ["04", "영상 관리", "전체, 외부, 내부 유튜브 영상을 객실과 연결합니다."],
            ["05", "후기 관리", "네이버 블로그와 리뷰 링크를 고객 화면에 노출합니다."],
            ["06", "주변정보", "가볼만한곳과 맛집을 여행 코스로 구성합니다."],
            ["07", "옵션 관리", "바베큐, 불멍, 얼리체크인 같은 결제 옵션을 관리합니다."],
            ["08", "예약 현황", "예약 요청, 결제 대기, 확정 내역을 확인합니다."]
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
          <h2>운영 저장 상태</h2>
          <span>Supabase 연결</span>
        </div>
        <div className="host-token-row">
          <label>
            <span>운영 저장 토큰</span>
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="입력하면 운영 DB 저장까지 반영"
            />
          </label>
          <p>
            토큰이 입력되면 등록 내용이 서버 API를 통해 운영 DB에 저장됩니다. 토큰이 없을 때는 현재 화면에서 먼저 확인하고 검수할 수 있습니다.
          </p>
          <Link className="secondary-action" href={customerPreviewUrl}>
            고객 예약 화면 확인
          </Link>
        </div>
        {message && <p className="status-note">{message}</p>}
      </section>

      <section className="host-form-layout">
        <article className="host-form-card">
          <h2>숙소 기본정보 등록·수정</h2>
          <div className="form-grid">
            <label>
              <span>숙소 ID</span>
              <input
                value={accommodationForm.id}
                onChange={(event) => updateAccommodationField("id", event.target.value)}
                placeholder="baebang-alps"
              />
            </label>
            <label>
              <span>노출 상태</span>
              <select
                value={accommodationForm.status}
                onChange={(event) => updateAccommodationField("status", event.target.value as AccommodationForm["status"])}
              >
                <option value="active">고객 화면 노출</option>
                <option value="hidden">비공개</option>
              </select>
            </label>
          </div>
          <label>
            <span>숙소명</span>
            <input
              value={accommodationForm.name}
              onChange={(event) => updateAccommodationField("name", event.target.value)}
              placeholder="아산 배방알프스"
            />
          </label>
          <div className="form-grid">
            <label>
              <span>지역</span>
              <input
                value={accommodationForm.area}
                onChange={(event) => updateAccommodationField("area", event.target.value)}
                placeholder="충남 아산 배방"
              />
            </label>
            <label>
              <span>주소</span>
              <input
                value={accommodationForm.address}
                onChange={(event) => updateAccommodationField("address", event.target.value)}
                placeholder="충남 아산시 ..."
              />
            </label>
          </div>
          <label>
            <span>숙소 컨셉</span>
            <input
              value={accommodationForm.concept}
              onChange={(event) => updateAccommodationField("concept", event.target.value)}
              placeholder="저수지 전망 독채와 바베큐 특화 펜션"
            />
          </label>
          <button className="primary-action" type="button" disabled={isSaving} onClick={saveAccommodation}>
            숙소 기본정보 저장
          </button>
        </article>
      </section>

      <section className="host-section owner-console">
        <div className="section-head">
          <h2>콘텐츠 운영 콘솔</h2>
          <span>노출 자료 확인·수정·비공개</span>
        </div>
        <div className="owner-console-summary">
          {managementTabs.map((tab) => (
            <button
              className={managementView === tab.id ? "active" : ""}
              key={tab.id}
              type="button"
              onClick={() => setManagementView(tab.id)}
            >
              <span>{tab.label}</span>
              <b>{tab.count}</b>
            </button>
          ))}
        </div>

        {managementView === "rooms" && (
          <div className="owner-console-list">
            {rooms.length === 0 ? (
              <p className="owner-console-empty">노출 중인 객실이 없습니다. 객실/사이트 등록폼에서 새 객실을 추가해주세요.</p>
            ) : (
              rooms.map((room) => (
                <article className="owner-console-card" key={room.id}>
                  <div className="owner-console-thumb" style={{ backgroundImage: `url(${cover(room)})` }} />
                  <div>
                    <span>{room.id} · {roomTypeLabel(room.type)}</span>
                    <h3>{room.name}</h3>
                    <p>{room.description}</p>
                    <div className="host-meta">
                      <span>기본 {formatWon(room.basePrice)}</span>
                      <span>주말 +{formatWon(room.weekendExtra)}</span>
                      <span>{room.standardCapacity}~{room.maxCapacity}인</span>
                      <span>사진 {room.images.length}장</span>
                      <span>영상 {videos.filter((video) => video.roomId === room.id).length}개</span>
                    </div>
                  </div>
                  <div className="owner-console-actions">
                    <button type="button" onClick={() => loadRoomDraft(room)}>수정폼 불러오기</button>
                    <Link href={`/stays/${previewAccommodationId}?room=${room.id}&utm_source=penbatv&utm_medium=host_room_manage&utm_campaign=${previewAccommodationId}`}>
                      고객 화면 보기
                    </Link>
                    <button type="button" onClick={() => hideRoom(room.id)}>비공개</button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {managementView === "videos" && (
          <div className="owner-console-list">
            {videos.length === 0 ? (
              <p className="owner-console-empty">등록된 유튜브 영상이 없습니다.</p>
            ) : (
              videos.map((video) => (
                <article className="owner-console-card" key={video.code}>
                  <div
                    className="owner-console-thumb video"
                    style={{ backgroundImage: `url(${video.thumbnailUrl ?? youtubeThumb(video.url ?? "") ?? (selectedRoom ? cover(selectedRoom) : "/penba/sign.jpg")})` }}
                  />
                  <div>
                    <span>{video.category === "all" ? "전체" : video.category === "exterior" ? "외부" : "내부"} · {roomNameById.get(video.roomId) ?? video.roomId}</span>
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                    <div className="host-meta">
                      <span>{video.code}</span>
                      <span>{video.tag}</span>
                    </div>
                  </div>
                  <div className="owner-console-actions">
                    <button type="button" onClick={() => loadVideoDraft(video)}>수정폼 불러오기</button>
                    {video.url && <a href={video.url} rel="noreferrer" target="_blank">유튜브 열기</a>}
                    <button type="button" onClick={() => removeVideo(video.code)}>비공개</button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {managementView === "naver" && (
          <div className="owner-console-list">
            {naverLinks.length === 0 ? (
              <p className="owner-console-empty">등록된 네이버 블로그·리뷰 링크가 없습니다.</p>
            ) : (
              naverLinks.map((link) => (
                <article className="owner-console-card compact" key={link.id}>
                  <div>
                    <span>{naverTypeLabel(link.type)} · {link.roomId ? roomNameById.get(link.roomId) ?? link.roomId : "숙소 전체"}</span>
                    <h3>{link.title}</h3>
                    <p>{link.excerpt}</p>
                    <div className="host-meta">
                      <span>{link.author}</span>
                      {link.rating && <span>평점 {link.rating}</span>}
                      {link.publishedAt && <span>{link.publishedAt}</span>}
                    </div>
                  </div>
                  <div className="owner-console-actions">
                    <button type="button" onClick={() => loadNaverLinkDraft(link)}>수정폼 불러오기</button>
                    <a href={link.url} rel="noreferrer" target="_blank">링크 열기</a>
                    <button type="button" onClick={() => removeNaverLink(link.id)}>비공개</button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {managementView === "nearby" && (
          <div className="owner-console-list">
            {nearbyPlaces.length === 0 ? (
              <p className="owner-console-empty">등록된 주변 가볼만한곳·맛집이 없습니다.</p>
            ) : (
              nearbyPlaces.map((place) => (
                <article className="owner-console-card" key={place.id}>
                  <div className="owner-console-thumb" style={{ backgroundImage: `url(${place.imageUrl ?? "/penba/reservoir.jpg"})` }} />
                  <div>
                    <span>{nearbyTypeLabel(place.type)} · {place.category}</span>
                    <h3>{place.name}</h3>
                    <p>{place.description}</p>
                    <div className="host-meta">
                      <span>{place.distanceLabel}</span>
                      <span>{place.travelTime}</span>
                      {place.address && <span>{place.address}</span>}
                    </div>
                  </div>
                  <div className="owner-console-actions">
                    <button type="button" onClick={() => loadNearbyPlaceDraft(place)}>수정폼 불러오기</button>
                    {(place.mapUrl || place.url) && <a href={place.mapUrl ?? place.url ?? "#"} rel="noreferrer" target="_blank">지도·상세 열기</a>}
                    <button type="button" onClick={() => removeNearbyPlace(place.id)}>비공개</button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {managementView === "options" && (
          <div className="owner-console-list">
            {options.length === 0 ? (
              <p className="owner-console-empty">등록된 부대옵션이 없습니다.</p>
            ) : (
              options.map((option) => (
                <article className="owner-console-card compact" key={option.id}>
                  <div>
                    <span>{option.id}</span>
                    <h3>{option.name}</h3>
                    <p>{option.description}</p>
                    <div className="host-meta">
                      <span>{formatWon(option.price)}</span>
                    </div>
                  </div>
                  <div className="owner-console-actions">
                    <button type="button" onClick={() => loadOptionDraft(option)}>수정폼 불러오기</button>
                    <button type="button" onClick={() => removeOption(option.id)}>비공개</button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
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

        <article className="host-form-card">
          <h2>네이버 블로그·리뷰 등록</h2>
          <div className="form-grid">
            <label>
              <span>숙소 ID</span>
              <input value={naverLinkForm.accommodationId} onChange={(event) => updateNaverLinkField("accommodationId", event.target.value)} />
            </label>
            <label>
              <span>연결 객실</span>
              <select value={naverLinkForm.roomId} onChange={(event) => updateNaverLinkField("roomId", event.target.value)}>
                <option value="">숙소 전체</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>구분</span>
              <select
                value={naverLinkForm.type}
                onChange={(event) => {
                  const nextType = event.target.value as NaverLinkType;
                  updateNaverLinkField("type", nextType);
                  updateNaverLinkField("author", naverTypeLabel(nextType));
                }}
              >
                <option value="blog">네이버 블로그</option>
                <option value="review">네이버 리뷰</option>
              </select>
            </label>
            <label>
              <span>링크 ID</span>
              <input value={naverLinkForm.id} onChange={(event) => updateNaverLinkField("id", event.target.value)} placeholder="비워두면 자동 생성" />
            </label>
          </div>
          <label>
            <span>네이버 URL</span>
            <input value={naverLinkForm.url} onChange={(event) => updateNaverLinkField("url", event.target.value)} placeholder="https://blog.naver.com/... 또는 https://map.naver.com/..." />
          </label>
          <label>
            <span>제목</span>
            <input value={naverLinkForm.title} onChange={(event) => updateNaverLinkField("title", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>작성자/출처</span>
              <input value={naverLinkForm.author} onChange={(event) => updateNaverLinkField("author", event.target.value)} />
            </label>
            <label>
              <span>평점</span>
              <input type="number" min={0} max={5} step={0.1} value={naverLinkForm.rating} onChange={(event) => updateNaverLinkField("rating", Number(event.target.value))} />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>작성일</span>
              <input type="date" value={naverLinkForm.publishedAt} onChange={(event) => updateNaverLinkField("publishedAt", event.target.value)} />
            </label>
            <label>
              <span>정렬</span>
              <input type="number" min={0} value={naverLinkForm.sortOrder} onChange={(event) => updateNaverLinkField("sortOrder", Number(event.target.value))} />
            </label>
          </div>
          <label>
            <span>요약 문구</span>
            <input value={naverLinkForm.excerpt} onChange={(event) => updateNaverLinkField("excerpt", event.target.value)} />
          </label>
          <button className="primary-action" type="button" disabled={isSaving} onClick={saveNaverLink}>
            네이버 링크 등록
          </button>
        </article>

        <article className="host-form-card">
          <h2>주변 가볼만한곳·맛집 등록</h2>
          <div className="form-grid">
            <label>
              <span>숙소 ID</span>
              <input value={nearbyPlaceForm.accommodationId} onChange={(event) => updateNearbyPlaceField("accommodationId", event.target.value)} />
            </label>
            <label>
              <span>구분</span>
              <select
                value={nearbyPlaceForm.type}
                onChange={(event) => {
                  const nextType = event.target.value as NearbyPlaceType;
                  updateNearbyPlaceField("type", nextType);
                  updateNearbyPlaceField("category", nextType === "attraction" ? "산책·사진" : "한식·맛집");
                }}
              >
                <option value="attraction">주변 가볼만한곳</option>
                <option value="restaurant">주변맛집</option>
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>장소 ID</span>
              <input value={nearbyPlaceForm.id} onChange={(event) => updateNearbyPlaceField("id", event.target.value)} placeholder="비워두면 자동 생성" />
            </label>
            <label>
              <span>카테고리</span>
              <input value={nearbyPlaceForm.category} onChange={(event) => updateNearbyPlaceField("category", event.target.value)} />
            </label>
          </div>
          <label>
            <span>장소명</span>
            <input value={nearbyPlaceForm.name} onChange={(event) => updateNearbyPlaceField("name", event.target.value)} placeholder="곡교천 은행나무길" />
          </label>
          <label>
            <span>주소</span>
            <input value={nearbyPlaceForm.address} onChange={(event) => updateNearbyPlaceField("address", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>거리 표시</span>
              <input value={nearbyPlaceForm.distanceLabel} onChange={(event) => updateNearbyPlaceField("distanceLabel", event.target.value)} placeholder="차량 약 15분" />
            </label>
            <label>
              <span>소요시간</span>
              <input value={nearbyPlaceForm.travelTime} onChange={(event) => updateNearbyPlaceField("travelTime", event.target.value)} placeholder="15분" />
            </label>
          </div>
          <label>
            <span>소개 문구</span>
            <input value={nearbyPlaceForm.description} onChange={(event) => updateNearbyPlaceField("description", event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>상세 URL</span>
              <input value={nearbyPlaceForm.url} onChange={(event) => updateNearbyPlaceField("url", event.target.value)} placeholder="블로그/홈페이지 링크 선택" />
            </label>
            <label>
              <span>지도 URL</span>
              <input value={nearbyPlaceForm.mapUrl} onChange={(event) => updateNearbyPlaceField("mapUrl", event.target.value)} placeholder="https://map.naver.com/..." />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>이미지 URL</span>
              <input value={nearbyPlaceForm.imageUrl} onChange={(event) => updateNearbyPlaceField("imageUrl", event.target.value)} placeholder="/penba/reservoir.jpg 또는 https://..." />
            </label>
            <label>
              <span>정렬</span>
              <input type="number" min={0} value={nearbyPlaceForm.sortOrder} onChange={(event) => updateNearbyPlaceField("sortOrder", Number(event.target.value))} />
            </label>
          </div>
          <button className="primary-action" type="button" disabled={isSaving} onClick={saveNearbyPlace}>
            주변정보 등록
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
                <span>네이버 {naverLinks.filter((link) => link.roomId === room.id).length}개</span>
                <span>주변 {nearbyPlaces.length}개</span>
              </div>
              <div className="host-actions">
                <button type="button" onClick={() => setSelectedRoomId(room.id)}>선택</button>
                <button type="button" onClick={() => loadRoomDraft(room)}>요금 수정</button>
                <button type="button" onClick={() => setMessage("차단일 관리는 달력에서 날짜를 선택해 예약 불가 상태로 저장하는 방식으로 운영됩니다.")}>
                  차단일 추가
                </button>
                <button type="button" onClick={() => hideRoom(room.id)}>
                  비공개
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
            <article>
              <h3>네이버 블로그·리뷰</h3>
              <div className="preview-naver-list">
                {selectedRoomNaverLinks.map((link) => (
                  <a href={link.url} key={link.id} rel="noreferrer" target="_blank">
                    <span>{naverTypeLabel(link.type)}</span>
                    <b>{link.title}</b>
                    <small>{link.author}</small>
                  </a>
                ))}
              </div>
            </article>
            <article>
              <h3>주변 가볼만한곳·맛집</h3>
              <div className="preview-place-list">
                {[...attractionPlaces.slice(0, 2), ...restaurantPlaces.slice(0, 2)].map((place) => (
                  <a href={place.mapUrl ?? place.url ?? "#"} key={place.id} rel="noreferrer" target="_blank">
                    <span>{nearbyTypeLabel(place.type)} · {place.category}</span>
                    <b>{place.name}</b>
                    <small>{place.distanceLabel || place.travelTime}</small>
                  </a>
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
