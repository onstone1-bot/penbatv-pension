"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BookingDraft } from "@/lib/booking-draft";
import type { BookingOption, DatePreset, NaverLink, NearbyPlace, Room, Stay, YoutubeVideo } from "@/lib/mock-data";
import { formatWon, quoteLocalRoom, quoteOptions, youtubeCoupon } from "@/lib/local-quote";
import type { ISODateString } from "@/lib/types";

type Screen = "home" | "detail" | "booking" | "mine" | "my";
type HomeTab = "booking" | "story";
type BookingStep = 1 | 2 | 3 | 4 | 5;
type RangeAvailability = "idle" | "checking" | "available" | "unavailable" | "unknown";
type DayAvailabilityStatus = "checking" | "available" | "unavailable" | "unknown";
type BookingMode = "request" | "instant";
type VideoCategory = YoutubeVideo["category"];
type BarbecueSlot = "17:00" | "18:00" | "19:00" | "none";

type LocalBooking = {
  bookingId: string | null;
  bookingNo: string;
  holdId: string | null;
  holdExpiresAt: string | null;
  paymentSessionId: string | null;
  status: "paid" | "waiting_deposit" | "request";
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  guestName: string;
  utmCode: string | null;
  barbecueSlot: BarbecueSlot;
};

type PaymentProvider = "card" | "naverpay" | "tosspay" | "vbank" | "realtime_transfer" | "manual_bank_transfer";

type ActiveHold = {
  id: string;
  expiresAt: string;
};

type HoldResponse = {
  hold?: {
    id: string;
    expires_at: string;
  } | null;
  quote?: ServerQuote;
  error?: unknown;
};

type PaymentPrepareResponse = {
  payment?: {
    id: string;
    status: "ready";
    mode: "mock" | "toss" | "manual";
    amount: number;
    orderId?: string;
    orderName?: string;
    checkout?: {
      type: "mock" | "toss-window" | "manual-bank-transfer";
      url: string | null;
      clientKey: string | null;
      method: "CARD" | "VIRTUAL_ACCOUNT" | "TRANSFER" | null;
      easyPay: "NAVERPAY" | "TOSSPAY" | null;
      successUrl: string;
      failUrl: string;
      bankTransfer: {
        bankName: string;
        accountNo: string;
        holderName: string;
        depositDueHours: number;
      } | null;
    };
  };
  error?: unknown;
};

type PaymentConfirmResponse = {
  status?: "paid" | "failed" | "waiting_deposit";
  bookingId?: string;
  bookingNo?: string | null;
  idempotent?: boolean;
  error?: unknown;
};

type AvailabilityResponse = {
  availability?: {
    available: boolean;
    blockedReason: string | null;
  };
  error?: unknown;
};

type CalendarAvailabilityResponse = {
  days?: Array<{
    date: string;
    roomId: string;
    available: boolean;
    blockedReason: string | null;
  }>;
  error?: unknown;
};

type ServerQuote = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
  nights: number;
  roomAmount: number;
  guestAmount: number;
  optionAmount: number;
  discountAmount: number;
  totalAmount: number;
  optionItems: Array<{
    optionId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  priceAuthority: "server";
};

type QuoteResponse = {
  quote?: ServerQuote;
  error?: unknown;
};

type QuoteStatus = "idle" | "loading" | "ready" | "fallback";

type TossPaymentMethod = "CARD" | "VIRTUAL_ACCOUNT" | "TRANSFER";

type TossPaymentRequest = {
  method: TossPaymentMethod;
  amount: {
    currency: "KRW";
    value: number;
  };
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerName?: string;
  customerMobilePhone?: string;
  card?: {
    flowMode: "DEFAULT" | "DIRECT";
    easyPay?: "NAVERPAY" | "TOSSPAY";
  };
  sandbox?: {
    paymentResult: "SUCCESS" | "FAIL";
  };
};

type TossPaymentInstance = {
  requestPayment(input: TossPaymentRequest): Promise<void>;
};

type TossPaymentsInstance = {
  payment(input: { customerKey: string }): TossPaymentInstance;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

class ApiResponseError extends Error {
  constructor(
    readonly status: number,
    readonly payload: unknown
  ) {
    super(`API request failed with status ${status}`);
  }
}

const emptyRoom: Room = {
  id: "empty",
  name: "준비 중",
  type: "camp_site",
  basePrice: 0,
  weekendExtra: 0,
  standardCapacity: 1,
  maxCapacity: 1,
  description: "등록된 방·사이트가 없습니다.",
  tags: [],
  amenities: [],
  images: [],
  rates: []
};

const emptyDate: DatePreset = {
  id: "empty",
  checkIn: "2026-08-20",
  checkOut: "2026-08-21",
  label: "일정 준비 중"
};

const fallbackUnavailableDaysByRoom: Record<string, string[]> = {
  A: ["2026-08-24", "2026-08-25", "2026-09-05", "2026-09-06"],
  B: ["2026-08-28", "2026-08-30"]
};

type Props = {
  stay: Stay;
  rooms: Room[];
  options: BookingOption[];
  videos: YoutubeVideo[];
  naverLinks: NaverLink[];
  nearbyPlaces: NearbyPlace[];
  datePresets: DatePreset[];
  initialDraft: BookingDraft;
  initialScreen?: Extract<Screen, "home" | "booking">;
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
  initialBookingMode?: BookingMode;
};

const customerJourney = [
  {
    step: "01",
    title: "유튜브에서 실제 영상 확인",
    body: "전체 투어, 외부 동선, 내부 객실 영상을 먼저 보고 설명란의 펜바TV 링크로 들어옵니다."
  },
  {
    step: "02",
    title: "펜바TV 고객 홈 도착",
    body: "영상에서 본 숙소의 고객 홈으로 바로 이동해 방 사진과 예약 가능 여부를 확인합니다."
  },
  {
    step: "03",
    title: "사진·영상 확인 후 예약 진행",
    body: "일정과 인원을 먼저 고른 뒤 객실 사진과 영상을 확인하고 결제 방식으로 이어집니다."
  }
];

const videoCategoryTabs: Array<{
  id: VideoCategory;
  label: string;
  helper: string;
}> = [
  {
    id: "all",
    label: "전체",
    helper: "숙소 전체 분위기"
  },
  {
    id: "exterior",
    label: "외부",
    helper: "마당·바베큐·진입로"
  },
  {
    id: "interior",
    label: "내부",
    helper: "객실·이용 안내"
  }
];

const bookingModeChoices: Array<{
  id: BookingMode;
  title: string;
  body: string;
  badge: string;
}> = [
  {
    id: "request",
    title: "예약 요청",
    body: "펜션 운영자가 객실 상태를 확인한 뒤 결제 안내를 보내는 방식입니다.",
    badge: "초기 MVP 추천"
  },
  {
    id: "instant",
    title: "바로 결제",
    body: "예약 가능 기간을 15분간 선점하고 결제까지 이어가는 방식입니다.",
    badge: "자동 확정"
  }
];

const paymentProviderChoices: Array<{
  id: PaymentProvider;
  label: string;
  helper: string;
}> = [
  { id: "card", label: "신용/체크카드", helper: "토스페이먼츠 카드 결제창" },
  { id: "naverpay", label: "네이버페이", helper: "간편결제 선택. 실운영은 가맹/PG 설정 필요" },
  { id: "tosspay", label: "토스페이", helper: "토스 간편결제" },
  { id: "realtime_transfer", label: "실시간 계좌이체", helper: "토스페이먼츠 TRANSFER 결제수단" },
  { id: "vbank", label: "가상계좌", helper: "PG 가상계좌 발급 후 입금 확인" },
  { id: "manual_bank_transfer", label: "수동 계좌이체", helper: "운영자 입금 확인 후 예약 확정" }
];

const bookingStepLabels: Array<{
  step: BookingStep;
  label: string;
}> = [
  { step: 1, label: "일정" },
  { step: 2, label: "인원/옵션" },
  { step: 3, label: "객실/영상" },
  { step: 4, label: "결제" },
  { step: 5, label: "완료" }
];

const weekOneBookingMilestones = [
  "1일차 홈 단순화",
  "2일차 상세 정리",
  "3일차 달력 상태",
  "4일차 날짜 차단",
  "5일차 객실/옵션",
  "6일차 서버 견적",
  "7일차 모바일 QA"
];

const barbecueSlots: Array<{
  id: BarbecueSlot;
  label: string;
  helper: string;
}> = [
  { id: "17:00", label: "17:00", helper: "이른 저녁" },
  { id: "18:00", label: "18:00", helper: "추천" },
  { id: "19:00", label: "19:00", helper: "여유 입실" }
];

function paymentActionLabel(provider: PaymentProvider) {
  if (provider === "manual_bank_transfer") return "입금대기 예약 접수";
  if (provider === "realtime_transfer") return "계좌이체 결제 진행";
  if (provider === "naverpay") return "네이버페이 결제 진행";
  if (provider === "tosspay") return "토스페이 결제 진행";
  if (provider === "vbank") return "가상계좌 발급 진행";
  return "카드 결제 진행";
}

function loadTossPaymentsScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Toss Payments SDK can only be loaded in the browser."));
  }

  if (window.TossPayments) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.tosspayments.com/v2/standard"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Toss Payments SDK.")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load Toss Payments SDK.")), {
      once: true
    });
    document.head.appendChild(script);
  });
}

function getOrCreateTossCustomerKey() {
  const storageKey = "penbatv.tossCustomerKey";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `penbatv_${crypto.randomUUID()}`
      : `penbatv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(storageKey, next);
  return next;
}

async function requestTossPayment(input: {
  payment: NonNullable<PaymentPrepareResponse["payment"]>;
  provider: PaymentProvider;
  guestName: string;
  guestPhone: string;
  fallbackOrderName: string;
}) {
  const checkout = input.payment.checkout;
  const clientKey = checkout?.clientKey;
  const orderId = input.payment.orderId;
  const method = checkout?.method;

  if (!clientKey || !orderId || !method) {
    throw new Error("Toss payment session is missing clientKey, orderId, or method.");
  }

  await loadTossPaymentsScript();

  if (!window.TossPayments) {
    throw new Error("Toss Payments SDK was not initialized.");
  }

  const tossPayments = window.TossPayments(clientKey);
  const payment = tossPayments.payment({ customerKey: getOrCreateTossCustomerKey() });
  const phone = input.guestPhone.replace(/\D/g, "");

  await payment.requestPayment({
    method,
    amount: {
      currency: "KRW",
      value: input.payment.amount
    },
    orderId,
    orderName: input.payment.orderName ?? input.fallbackOrderName,
    successUrl: checkout.successUrl,
    failUrl: checkout.failUrl,
    customerName: input.guestName || "예약 고객",
    ...(phone ? { customerMobilePhone: phone } : {}),
    ...(method === "CARD"
      ? {
          card: {
            flowMode: checkout.easyPay ? "DIRECT" as const : "DEFAULT" as const,
            ...(checkout.easyPay ? { easyPay: checkout.easyPay } : {})
          }
        }
      : {}),
    ...(clientKey.startsWith("test_") ? { sandbox: { paymentResult: "SUCCESS" as const } } : {})
  });
}

function cover(room: Room) {
  return room.images.find((image) => image.isCover)?.url ?? room.images[0]?.url;
}

function roomTypeLabel(type: Room["type"]) {
  return {
    private_house: "독채",
    glamping: "글램핑",
    camp_site: "캠핑사이트"
  }[type];
}

async function postJson<T>(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    throw new ApiResponseError(response.status, payload);
  }

  return payload;
}

async function getJson<T>(url: string) {
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    throw new ApiResponseError(response.status, payload);
  }

  return payload;
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dateFromISO(value: string) {
  return new Date(`${value}T00:00:00`);
}

function nightsBetween(checkIn: string, checkOut: string) {
  const ms = dateFromISO(checkOut).getTime() - dateFromISO(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function enumerateStayNights(checkIn: string, checkOut: string) {
  const start = dateFromISO(checkIn);
  const nights = nightsBetween(checkIn, checkOut);

  return Array.from({ length: nights }, (_, index) => toISODate(addDays(start, index)));
}

function formatRangeLabel(checkIn: string, checkOut: string) {
  const checkInDate = dateFromISO(checkIn);
  const checkOutDate = dateFromISO(checkOut);
  const label = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  });

  return `${label.format(checkInDate)} - ${label.format(checkOutDate)} · ${nightsBetween(checkIn, checkOut)}박`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long"
  }).format(date);
}

function buildCalendarDays(monthDate: Date) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      iso: toISODate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthDate.getMonth()
    };
  });
}

function fallbackDayAvailability(roomId: string, isoDate: string): DayAvailabilityStatus {
  return fallbackUnavailableDaysByRoom[roomId]?.includes(isoDate) ? "unavailable" : "available";
}

function youtubeEmbedUrl(url?: string) {
  if (!url) return null;

  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function isBarbecueOption(option: Pick<BookingOption, "id" | "name" | "description">) {
  const text = `${option.id} ${option.name} ${option.description}`.toLowerCase();
  return text.includes("bbq") || text.includes("barbecue") || text.includes("바비큐") || text.includes("바베큐");
}

function naverTypeLabel(type: NaverLink["type"]) {
  return type === "blog" ? "네이버 블로그" : "네이버 리뷰";
}

function nearbyTypeLabel(type: NearbyPlace["type"]) {
  return type === "attraction" ? "주변 가볼만한곳" : "주변맛집";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function displayWithoutStayName(title: string, stayName: string) {
  const spacedStayName = stayName.replace("배방", "배방 ");
  const pattern = new RegExp(`^(${escapeRegExp(stayName)}|${escapeRegExp(spacedStayName)})\\s*`, "i");
  const cleaned = title.replace(pattern, "").trim();

  return cleaned || title;
}

function localBookingNo() {
  return `PBTV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-LOCAL`;
}

export function StayAppClient({
  stay,
  rooms,
  options,
  videos,
  naverLinks,
  nearbyPlaces,
  datePresets,
  initialDraft,
  initialScreen = "home",
  initialCheckIn,
  initialCheckOut,
  initialBookingMode = "request"
}: Props) {
  const initialRoomId = initialDraft.roomId ?? rooms[0]?.id ?? "";
  const initialBarbecueOptionId = options.find(isBarbecueOption)?.id;
  const firstPreset = datePresets.find((date) => date.id === "d2") ?? datePresets[0] ?? emptyDate;
  const firstCheckIn = initialCheckIn ?? firstPreset.checkIn;
  const firstCheckOut = initialCheckOut ?? (initialCheckIn ? toISODate(addDays(dateFromISO(firstCheckIn), 1)) : firstPreset.checkOut);
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [homeTab, setHomeTab] = useState<HomeTab>("booking");
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [selectedDateId, setSelectedDateId] = useState(initialCheckIn ? "custom" : firstPreset.id);
  const [selectedCheckIn, setSelectedCheckIn] = useState(firstCheckIn);
  const [selectedCheckOut, setSelectedCheckOut] = useState(firstCheckOut);
  const [calendarMonth, setCalendarMonth] = useState(() => dateFromISO(firstCheckIn));
  const [dayAvailabilityMap, setDayAvailabilityMap] = useState<Record<string, DayAvailabilityStatus>>({});
  const [rangeAvailability, setRangeAvailability] = useState<RangeAvailability>("idle");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(() =>
    initialBarbecueOptionId ? [initialBarbecueOptionId] : []
  );
  const [adultCount, setAdultCount] = useState(4);
  const [childCount, setChildCount] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("card");
  const [bookingMode, setBookingMode] = useState<BookingMode>(initialBookingMode);
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<LocalBooking | null>(null);
  const [barbecueSlot, setBarbecueSlot] = useState<BarbecueSlot>("18:00");
  const [holdMessage, setHoldMessage] = useState<string | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [activeHold, setActiveHold] = useState<ActiveHold | null>(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<VideoCategory>("all");
  const [serverQuote, setServerQuote] = useState<ServerQuote | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>("idle");
  const [quoteMessage, setQuoteMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);
  const [recentMessage, setRecentMessage] = useState<string | null>(null);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? emptyRoom;
  const selectedDate = {
    id: selectedDateId || "custom",
    checkIn: selectedCheckIn,
    checkOut: selectedCheckOut,
    label: formatRangeLabel(selectedCheckIn, selectedCheckOut)
  };
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const selectedRangeHasUnavailable = useMemo(
    () => enumerateStayNights(selectedCheckIn, selectedCheckOut).some((iso) => dayAvailabilityMap[iso] === "unavailable"),
    [dayAvailabilityMap, selectedCheckIn, selectedCheckOut]
  );

  const roomQuote = useMemo(
    () =>
      quoteLocalRoom(
        selectedRoom,
        selectedCheckIn as ISODateString,
        selectedCheckOut as ISODateString
      ),
    [selectedRoom, selectedCheckIn, selectedCheckOut]
  );
  const selectedOptionItems = useMemo(
    () => selectedOptions.map((optionId) => ({ optionId, quantity: 1 })),
    [selectedOptions]
  );
  const optionById = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);
  const fallbackOptionAmount = quoteOptions(options, selectedOptions);
  const fallbackCoupon = youtubeCoupon(initialDraft.utmCode);
  const optionAmount = serverQuote?.optionAmount ?? fallbackOptionAmount;
  const coupon = serverQuote?.discountAmount ?? fallbackCoupon;
  const guestAmount = serverQuote?.guestAmount ?? 0;
  const totalAmount = serverQuote?.totalAmount ?? Math.max(0, roomQuote.roomAmount + optionAmount - coupon);
  const quoteAuthorityLabel = quoteStatus === "ready" ? "서버 기준 견적" : quoteStatus === "loading" ? "서버 계산 중" : "임시 예상가";
  const quoteAuthorityClass = `quote-authority ${quoteStatus}`;
  const selectedOptionsSummary = selectedOptions.length > 0 ? `${selectedOptions.length}개 옵션 선택` : "부대옵션 없음";
  const guestCount = adultCount + childCount;
  const hasBarbecueOption = selectedOptions.some((optionId) => {
    const option = optionById.get(optionId);
    return option ? isBarbecueOption(option) : isBarbecueOption({ id: optionId, name: "", description: "" });
  });
  const selectedBarbecueLabel = hasBarbecueOption
    ? `${barbecueSlot} 바베큐장`
    : "선택 없음";
  const selectedRoomPreviewImages = selectedRoom.images.slice(0, 4);
  const isActiveHoldExpired = holdSecondsLeft === 0;
  const featuredEmbedUrl = youtubeEmbedUrl(stay.featuredVideoUrl);
  const filteredVideos = useMemo(
    () =>
      selectedVideoCategory === "all"
        ? videos
        : videos.filter((video) => video.category === selectedVideoCategory),
    [selectedVideoCategory, videos]
  );
  const selectedRoomVideos = useMemo(
    () => videos.filter((video) => video.roomId === selectedRoom.id),
    [selectedRoom.id, videos]
  );
  const bookingRoomVideos = selectedRoomVideos.length > 0 ? selectedRoomVideos : videos.slice(0, 2);
  const selectedRoomNaverLinks = useMemo(
    () => naverLinks.filter((link) => !link.roomId || link.roomId === selectedRoom.id),
    [naverLinks, selectedRoom.id]
  );
  const displayTitle = (title: string) => displayWithoutStayName(title, stay.name);

  useEffect(() => {
    const favorites = JSON.parse(window.localStorage.getItem("penbatv.localFavorites") ?? "[]") as string[];
    setIsFavorite(favorites.includes(stay.id));
  }, [stay.id]);

  useEffect(() => {
    let cancelled = false;

    async function recordRecentStay() {
      try {
        const payload = await postJson<{ stored?: boolean; mode?: string }>("/api/my/recent-stays", {
          accommodationId: stay.id,
          roomId: selectedRoom.id,
          source: initialDraft.utmCode ? "youtube_customer_home" : "stay_detail"
        });

        if (cancelled) return;
        setRecentMessage(payload.stored ? "최근 본 숙소가 MY에 저장되었습니다." : "비로그인 상태라 최근 본 숙소는 이 브라우저에만 저장됩니다.");
      } catch {
        if (cancelled) return;
        const storageKey = "penbatv.localRecentStays";
        const previous = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as Array<{ id: string; viewedAt: string }>;
        const next = [{ id: stay.id, viewedAt: new Date().toISOString() }, ...previous.filter((item) => item.id !== stay.id)].slice(0, 10);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        setRecentMessage("최근 본 숙소를 브라우저 데모 정보로 저장했습니다.");
      }
    }

    recordRecentStay();

    return () => {
      cancelled = true;
    };
  }, [initialDraft.utmCode, selectedRoom.id, stay.id]);
  const attractionPlaces = useMemo(
    () => nearbyPlaces.filter((place) => place.type === "attraction"),
    [nearbyPlaces]
  );
  const restaurantPlaces = useMemo(
    () => nearbyPlaces.filter((place) => place.type === "restaurant"),
    [nearbyPlaces]
  );

  useEffect(() => {
    if (!activeHold) {
      setHoldSecondsLeft(null);
      return;
    }

    const updateSecondsLeft = () => {
      const secondsLeft = Math.ceil((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000);
      setHoldSecondsLeft(Math.max(0, secondsLeft));

      if (secondsLeft <= 0) {
        setHoldMessage("Booking hold expired. Please choose the date again.");
      }
    };

    updateSecondsLeft();
    const timer = window.setInterval(updateSecondsLeft, 1000);

    return () => window.clearInterval(timer);
  }, [activeHold]);

  useEffect(() => {
    setActiveHold(null);
    setHoldSecondsLeft(null);
    setHoldMessage(null);
  }, [adultCount, childCount, selectedCheckIn, selectedCheckOut, selectedOptionItems, selectedRoom.id]);

  useEffect(() => {
    if (guestCount <= selectedRoom.maxCapacity) return;

    const overflow = guestCount - selectedRoom.maxCapacity;
    setChildCount((current) => {
      const next = Math.max(0, current - overflow);
      const remainingOverflow = overflow - (current - next);

      if (remainingOverflow > 0) {
        setAdultCount((adultCurrent) => Math.max(1, adultCurrent - remainingOverflow));
      }

      return next;
    });
  }, [guestCount, selectedRoom.maxCapacity]);

  useEffect(() => {
    if (!selectedRoom.id || !selectedCheckIn || !selectedCheckOut) return;

    let cancelled = false;

    async function loadRangeAvailability() {
      setRangeAvailability("checking");

      try {
        const params = new URLSearchParams({
          roomId: selectedRoom.id,
          checkIn: selectedCheckIn,
          checkOut: selectedCheckOut
        });
        const payload = await getJson<AvailabilityResponse>(`/api/availability?${params.toString()}`);

        if (cancelled) return;

        if (payload.availability?.available === false) {
          setRangeAvailability("unavailable");
          setAvailabilityMessage("선택한 기간은 이미 예약 또는 선점되었습니다.");
          return;
        }

        setRangeAvailability("available");
        setAvailabilityMessage("선택한 기간은 예약 가능합니다.");
      } catch {
        if (cancelled) return;
        setRangeAvailability("unknown");
        setAvailabilityMessage("실시간 예약 여부 확인이 필요합니다. 실제 DB 연결 전에는 mock 예약으로 진행됩니다.");
      }
    }

    loadRangeAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedRoom.id, selectedCheckIn, selectedCheckOut]);

  useEffect(() => {
    if (!selectedRoom.id) return;

    let cancelled = false;
    const daysToCheck = calendarDays.map((day) => day.iso);
    const startDate = daysToCheck[0];
    const endDate = toISODate(addDays(dateFromISO(daysToCheck[daysToCheck.length - 1]), 1));

    setDayAvailabilityMap((current) => {
      const next = { ...current };
      for (const iso of daysToCheck) {
        next[iso] = "checking";
      }
      return next;
    });

    async function loadDayAvailability() {
      let entries: Array<readonly [string, DayAvailabilityStatus]>;

      try {
        const params = new URLSearchParams({
          roomId: selectedRoom.id,
          startDate,
          endDate
        });
        const payload = await getJson<CalendarAvailabilityResponse>(
          `/api/availability/calendar?${params.toString()}`
        );
        const statusByDate = new Map(
          (payload.days ?? []).map((day) => [
            day.date,
            day.available ? "available" : "unavailable"
          ] as const)
        );

        entries = daysToCheck.map((iso) => [
          iso,
          statusByDate.get(iso) ?? "unknown"
        ] as const);
      } catch {
        entries = daysToCheck.map((iso) => [
          iso,
          fallbackDayAvailability(selectedRoom.id, iso)
        ] as const);
      }

      if (cancelled) return;

      setDayAvailabilityMap((current) => {
        const next = { ...current };
        for (const [iso, status] of entries) {
          next[iso] = status;
        }
        return next;
      });
    }

    loadDayAvailability();

    return () => {
      cancelled = true;
    };
  }, [calendarDays, selectedRoom.id]);

  useEffect(() => {
    if (!selectedRoom.id || !selectedCheckIn || !selectedCheckOut) return;

    let cancelled = false;

    async function loadServerQuote() {
      setQuoteStatus("loading");
      setQuoteMessage("서버 견적 계산 중입니다.");

      try {
        const payload = await postJson<QuoteResponse>("/api/quote", {
          roomId: selectedRoom.id,
          checkIn: selectedCheckIn,
          checkOut: selectedCheckOut,
          adultCount,
          childCount,
          optionItems: selectedOptionItems,
          utmCode: initialDraft.utmCode,
          utmCampaign: initialDraft.utmCode
        });

        if (cancelled) return;

        if (payload.quote) {
          setServerQuote(payload.quote);
          setQuoteStatus("ready");
          setQuoteMessage("서버 견적이 반영되었습니다.");
          return;
        }

        setServerQuote(null);
        setQuoteStatus("fallback");
        setQuoteMessage("서버 견적을 가져오지 못해 임시 예상가를 표시합니다.");
      } catch {
        if (cancelled) return;
        setServerQuote(null);
        setQuoteStatus("fallback");
        setQuoteMessage("서버 견적을 가져오지 못해 임시 예상가를 표시합니다.");
      }
    }

    loadServerQuote();

    return () => {
      cancelled = true;
    };
  }, [
    adultCount,
    childCount,
    initialDraft.utmCode,
    selectedCheckIn,
    selectedCheckOut,
    selectedOptionItems,
    selectedRoom.id
  ]);

  function chooseVideo(video: YoutubeVideo) {
    setSelectedRoomId(video.roomId);
    setSelectedVideoCategory(video.category);
    setScreen("detail");
  }

  async function toggleFavorite() {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    setFavoriteMessage(nextFavorite ? "찜한 숙소에 저장하는 중입니다." : "찜 해제 중입니다.");

    try {
      await postJson("/api/my/favorites", {
        accommodationId: stay.id,
        action: nextFavorite ? "add" : "remove",
        source: initialDraft.utmCode ? "youtube_customer_home" : "stay_detail"
      });
      setFavoriteMessage(nextFavorite ? "MY 찜한 숙소에 저장되었습니다." : "찜한 숙소에서 해제되었습니다.");
    } catch {
      const storageKey = "penbatv.localFavorites";
      const previous = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as string[];
      const next = nextFavorite
        ? Array.from(new Set([...previous, stay.id]))
        : previous.filter((item) => item !== stay.id);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setFavoriteMessage(nextFavorite ? "비로그인 데모 찜으로 저장했습니다." : "비로그인 데모 찜에서 해제했습니다.");
    }
  }

  function goBooking(roomId = selectedRoomId, step: BookingStep = 1) {
    setSelectedRoomId(roomId);
    setAvailabilityMessage(null);
    setActiveHold(null);
    setBookingStep(step);
    setScreen("booking");
  }

  function chooseDate(dateId: string) {
    const preset = datePresets.find((date) => date.id === dateId);
    if (!preset) return;

    setSelectedDateId(dateId);
    setSelectedCheckIn(preset.checkIn);
    setSelectedCheckOut(preset.checkOut);
    setCalendarMonth(dateFromISO(preset.checkIn));
    setAvailabilityMessage(null);
    setActiveHold(null);
  }

  function chooseCalendarDate(isoDate: string) {
    const dayStatus = dayAvailabilityMap[isoDate];

    if (dayStatus === "unavailable") {
      setAvailabilityMessage("이미 예약된 날짜입니다. 다른 날짜를 선택해주세요.");
      return;
    }

    if (dayStatus === "checking") {
      setAvailabilityMessage("해당 날짜의 예약 가능 여부를 확인 중입니다.");
      return;
    }

    const clicked = dateFromISO(isoDate);
    const currentCheckIn = dateFromISO(selectedCheckIn);
    const currentCheckOut = dateFromISO(selectedCheckOut);
    const hasRange = currentCheckOut.getTime() > currentCheckIn.getTime();

    setSelectedDateId("custom");
    setAvailabilityMessage(null);
    setActiveHold(null);

    if (!hasRange || clicked.getTime() <= currentCheckIn.getTime()) {
      setSelectedCheckIn(isoDate);
      setSelectedCheckOut(toISODate(addDays(clicked, 1)));
      return;
    }

    const hasUnavailableNight = enumerateStayNights(selectedCheckIn, isoDate).some(
      (nightIso) => dayAvailabilityMap[nightIso] === "unavailable"
    );

    if (hasUnavailableNight) {
      setAvailabilityMessage("선택한 기간 중 이미 예약된 날짜가 있습니다. 더 짧은 기간이나 다른 날짜를 선택해주세요.");
      return;
    }

    setSelectedCheckOut(isoDate);
  }

  function chooseRoomForBooking(roomId: string) {
    setSelectedRoomId(roomId);
    setAvailabilityMessage(null);
    setActiveHold(null);
  }

  function toggleOption(optionId: string, checked: boolean) {
    setSelectedOptions((current) =>
      checked ? [...current, optionId] : current.filter((id) => id !== optionId)
    );

    const option = optionById.get(optionId);
    const isBarbecue = option
      ? isBarbecueOption(option)
      : isBarbecueOption({ id: optionId, name: "", description: "" });

    if (isBarbecue && !checked) {
      setBarbecueSlot("none");
      return;
    }

    if (isBarbecue && checked && barbecueSlot === "none") {
      setBarbecueSlot("18:00");
    }
  }

  function moveCalendarMonth(amount: number) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function calendarClassName(dayIso: string, inMonth: boolean) {
    const date = dateFromISO(dayIso).getTime();
    const checkIn = dateFromISO(selectedCheckIn).getTime();
    const checkOut = dateFromISO(selectedCheckOut).getTime();
    const dayStatus = dayAvailabilityMap[dayIso] ?? "checking";
    const classes = ["calendar-day"];

    if (!inMonth) classes.push("muted-day");
    classes.push(dayStatus);
    if (date === checkIn) classes.push("range-start");
    if (date === checkOut) classes.push("range-end");
    if (date > checkIn && date < checkOut) classes.push("in-range");

    return classes.join(" ");
  }

  function calendarDayStatusLabel(dayIso: string) {
    const status = dayAvailabilityMap[dayIso] ?? "checking";

    if (status === "unavailable") return "예약마감";
    if (status === "available") return "가능";
    if (status === "unknown") return "확인필요";
    return "확인중";
  }

  function isCalendarDayDisabled(dayIso: string, inMonth: boolean) {
    const status = dayAvailabilityMap[dayIso] ?? "checking";
    return !inMonth || status === "checking" || status === "unavailable";
  }

  async function checkSelectedAvailability() {
    if (selectedRangeHasUnavailable) {
      setAvailabilityMessage("선택한 기간 중 이미 예약된 날짜가 있습니다. 다른 날짜를 선택해주세요.");
      return false;
    }

    setAvailabilityMessage("실시간 예약 가능 여부를 확인하고 있습니다.");

    try {
      const params = new URLSearchParams({
        roomId: selectedRoom.id,
        checkIn: selectedDate.checkIn,
        checkOut: selectedDate.checkOut
      });
      const payload = await getJson<AvailabilityResponse>(`/api/availability?${params.toString()}`);

      if (payload.availability?.available === false) {
        setAvailabilityMessage("선택한 기간은 이미 예약 또는 선점되었습니다. 다른 날짜를 선택해주세요.");
        return false;
      }

      setAvailabilityMessage("선택한 기간은 예약 가능합니다. 결제 정보를 준비합니다.");
      return true;
    } catch {
      setAvailabilityMessage("실시간 예약 확인이 불안정해 mock 예약 흐름으로 계속 진행합니다.");
      return true;
    }
  }

  async function goPaymentStep() {
    if (isSubmittingBooking) return;

    setIsSubmittingBooking(true);
    const canContinue = await checkSelectedAvailability();

    if (!canContinue) {
      setIsSubmittingBooking(false);
      return;
    }

    setIsSubmittingBooking(false);
    setBookingStep(4);
  }

  async function completeBooking() {
    if (isSubmittingBooking) return;

    if (selectedRangeHasUnavailable || rangeAvailability === "unavailable") {
      setAvailabilityMessage("선택한 기간은 예약할 수 없습니다. 달력에서 예약 가능한 날짜를 다시 선택해주세요.");
      return;
    }

    setIsSubmittingBooking(true);
    setHoldMessage(
      bookingMode === "instant"
        ? "예약 재고를 15분간 잠금 처리했습니다."
        : "예약 요청이 접수되었습니다. 운영자 확인 후 결제 안내를 발송합니다."
    );
    let holdId = activeHold?.id ?? null;
    let holdExpiresAt = activeHold?.expiresAt ?? null;
    let paymentSessionId: string | null = null;
    let confirmedBookingId: string | null = null;
    let confirmedBookingNo: string | null = null;
    let createdBookingStatus: LocalBooking["status"] = bookingMode === "instant" ? "paid" : "request";

    if (bookingMode === "instant") {
      if (activeHold && !isActiveHoldExpired) {
        holdId = activeHold.id;
        holdExpiresAt = activeHold.expiresAt;
        setHoldMessage("Existing booking hold is active. Preparing payment.");
      } else {
        holdId = null;
        holdExpiresAt = null;

        try {
          const holdPayload = await postJson<HoldResponse>("/api/booking-holds", {
            roomId: selectedRoom.id,
            checkIn: selectedDate.checkIn,
            checkOut: selectedDate.checkOut,
            adultCount,
            childCount,
            optionItems: selectedOptionItems,
            utmCode: initialDraft.utmCode,
            holdMinutes: 15
          });
          const hold = holdPayload.hold;

          if (hold) {
            holdId = hold.id;
            holdExpiresAt = hold.expires_at;
            setActiveHold({ id: hold.id, expiresAt: hold.expires_at });
            setHoldMessage("Booking hold created for 15 minutes.");
          }

          if (holdPayload.quote) {
            setServerQuote(holdPayload.quote);
            setQuoteStatus("ready");
            setQuoteMessage("서버 견적이 반영되었습니다.");
          }
        } catch (error) {
          if (error instanceof ApiResponseError && error.status === 409) {
            setAvailabilityMessage("Selected dates were just held or booked. Please choose another date.");
            setIsSubmittingBooking(false);
            return;
          }

          setHoldMessage("Booking hold is unavailable. Please try again before payment.");
          setIsSubmittingBooking(false);
          return;
        }
      }

      if (!holdId) {
        setHoldMessage("Booking hold is required before payment.");
        setIsSubmittingBooking(false);
        return;
      }

      try {
        const paymentPayload = await postJson<PaymentPrepareResponse>("/api/payments/prepare", {
          holdId,
          roomId: selectedRoom.id,
          checkIn: selectedDate.checkIn,
          checkOut: selectedDate.checkOut,
          provider: paymentMethod,
          totalAmount,
          optionAmount,
          discountAmount: coupon,
          adultCount,
          childCount,
          optionItems: selectedOptionItems,
          guestName: guestName || null,
          guestPhone: guestPhone || null,
          utmCode: initialDraft.utmCode
        });
        const payment = paymentPayload.payment;
        paymentSessionId = payment?.id ?? null;
        if (payment?.mode === "manual" && payment.orderId) {
          const confirmPayload = await postJson<PaymentConfirmResponse>("/api/payments/confirm", {
            provider: paymentMethod,
            paymentKey: `manual_${payment.orderId}`,
            orderId: payment.orderId,
            amount: payment.amount
          });

          if (confirmPayload.status !== "waiting_deposit") {
            setHoldMessage("수동계좌이체 입금대기 예약 접수에 실패했습니다. 다시 시도해주세요.");
            setIsSubmittingBooking(false);
            return;
          }

          confirmedBookingId = confirmPayload.bookingId ?? null;
          confirmedBookingNo = confirmPayload.bookingNo ?? null;
          createdBookingStatus = "waiting_deposit";
          const bank = payment.checkout?.bankTransfer;
          setHoldMessage(
            bank
              ? `입금대기 예약이 접수되었습니다. ${bank.bankName} ${bank.accountNo} ${bank.holderName} 앞으로 ${formatWon(payment.amount)}을 ${bank.depositDueHours}시간 안에 입금해주세요.`
              : "입금대기 예약이 접수되었습니다. 운영자 안내 계좌로 입금 후 확인을 기다려주세요."
          );
        } else if (payment?.mode === "mock" && payment.orderId) {
          const confirmPayload = await postJson<PaymentConfirmResponse>("/api/payments/confirm", {
            provider: paymentMethod,
            paymentKey: `mock_${payment.orderId}`,
            orderId: payment.orderId,
            amount: payment.amount
          });

          if (confirmPayload.status !== "paid") {
            setHoldMessage("Mock payment confirmation failed. Please try again.");
            setIsSubmittingBooking(false);
            return;
          }

          confirmedBookingId = confirmPayload.bookingId ?? null;
          confirmedBookingNo = confirmPayload.bookingNo ?? null;
          createdBookingStatus = "paid";
          setHoldMessage("Mock payment confirmed. Booking was saved to the database.");
        } else if (payment?.mode === "toss") {
          setHoldMessage(
            payment.checkout?.method === "TRANSFER"
              ? "실시간 계좌이체 결제 준비가 완료되었습니다. 다음 단계에서 토스 결제창 requestPayment를 연결하면 됩니다."
              : "토스페이먼츠 결제창을 여는 중입니다."
          );

          await requestTossPayment({
            payment,
            provider: paymentMethod,
            guestName,
            guestPhone,
            fallbackOrderName: `${selectedRoom.name} ${selectedDate.checkIn}~${selectedDate.checkOut}`
          });

          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Payment preparation or confirmation failed.";
        setHoldMessage(
          paymentMethod === "card"
            ? `신용카드 결제창을 열지 못했습니다. ${message}`
            : `Payment preparation or confirmation failed. ${message}`
        );
        setIsSubmittingBooking(false);
        return;
      }
    }

    const createdBooking = {
      bookingId: confirmedBookingId,
      bookingNo: confirmedBookingNo ?? localBookingNo(),
      holdId,
      holdExpiresAt,
      paymentSessionId,
      status: createdBookingStatus,
      roomName: selectedRoom.name,
      checkIn: selectedDate.checkIn,
      checkOut: selectedDate.checkOut,
      totalAmount,
      guestName: guestName || "홍길동",
      utmCode: initialDraft.utmCode,
      barbecueSlot
    };
    localStorage.setItem("staylink.lastBooking", JSON.stringify(createdBooking));
    setBooking(createdBooking);
    setBookingStep(5);
    setIsSubmittingBooking(false);
  }

  return (
    <main className="app-shell">
      <header className="customer-home-topbar" aria-label="펜바TV 메인 이동">
        <Link href="/" className="customer-main-home-link">
          펜바TV 메인홈
        </Link>
        <span>{stay.name} 고객홈</span>
      </header>

      {screen === "home" && (
        <>
          <section className="stay-hero" style={{ backgroundImage: `url(${stay.heroUrl})` }}>
            <div className="hero-copy">
              <span>펜바TV 단독 촬영 · 영상 검증 예약</span>
              <h1>{stay.name}</h1>
              <p>{stay.concept}</p>
              <div className="customer-quick-actions">
                <button type="button" className={isFavorite ? "favorite-button active" : "favorite-button"} onClick={toggleFavorite}>
                  {isFavorite ? "찜 해제" : "찜하기"}
                </button>
                <Link href="/my">MY에서 예약·찜 확인</Link>
              </div>
              {(favoriteMessage || recentMessage) && <small className="customer-save-message">{favoriteMessage ?? recentMessage}</small>}
            </div>
          </section>

          <section className="home-content-tabs" aria-label="예약과 숙소 정보 탭">
            <button
              className={homeTab === "booking" ? "active" : ""}
              type="button"
              onClick={() => setHomeTab("booking")}
            >
              예약하기
            </button>
            <button
              className={homeTab === "story" ? "active" : ""}
              type="button"
              onClick={() => setHomeTab("story")}
            >
              숙소 둘러보기
            </button>
          </section>

          {homeTab === "booking" && (
          <section className="booking-start-panel" aria-label="예약 일정, 객실, 인원, 부대옵션 선택">
            <div className="section-head">
              <h2>예약 시작</h2>
              <span>1주차 1~7일차 · 실제 예약 흐름</span>
            </div>

            <div className="week-one-booking-status" aria-label="1주차 예약 흐름 완료 기준">
              <div>
                <span>WEEK 1</span>
                <b>날짜 선택부터 서버 견적까지 한 화면에서 확인</b>
              </div>
              <ol>
                {weekOneBookingMilestones.map((milestone) => (
                  <li key={milestone}>{milestone}</li>
                ))}
              </ol>
            </div>

            <div className="booking-start-summary" aria-label="현재 예약 선택 요약">
              <div>
                <span>일정</span>
                <b>{selectedDate.label}</b>
              </div>
              <div>
                <span>객실</span>
                <b>{selectedRoom.name}</b>
              </div>
              <div>
                <span>인원</span>
                <b>성인 {adultCount} · 아동 {childCount}</b>
              </div>
              <div>
                <span>옵션</span>
                <b>{selectedOptionsSummary}</b>
              </div>
            </div>

            <div className="booking-start-block">
              <b>예약일정 선택</b>
              <div className="booking-start-calendar">
                <div className="calendar-toolbar compact">
                  <button type="button" onClick={() => moveCalendarMonth(-1)} aria-label="이전 달">
                    ‹
                  </button>
                  <b>{monthLabel(calendarMonth)}</b>
                  <button type="button" onClick={() => moveCalendarMonth(1)} aria-label="다음 달">
                    ›
                  </button>
                </div>
                <div className="calendar-weekdays compact">
                  {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                  ))}
                </div>
                <div className="calendar-grid compact">
                  {calendarDays.map((day) => (
                    <button
                      type="button"
                      className={calendarClassName(day.iso, day.inMonth)}
                      disabled={isCalendarDayDisabled(day.iso, day.inMonth)}
                      key={day.iso}
                      onClick={() => chooseCalendarDate(day.iso)}
                      aria-label={`${day.iso} ${calendarDayStatusLabel(day.iso)}`}
                    >
                      <span>{day.day}</span>
                      <small>{calendarDayStatusLabel(day.iso)}</small>
                    </button>
                  ))}
                </div>
                <div className="calendar-legend" aria-label="달력 예약 상태 안내">
                  <span className="legend-available">예약가능</span>
                  <span className="legend-selected">선택일정</span>
                  <span className="legend-unavailable">예약마감</span>
                </div>
              </div>
              <div className={`availability-summary compact ${selectedRangeHasUnavailable ? "unavailable" : rangeAvailability}`}>
                <span>선택 기간</span>
                <b>{selectedDate.label}</b>
                <small>
                  {selectedRangeHasUnavailable
                    ? "선택한 기간 중 예약마감 날짜가 있습니다."
                    : rangeAvailability === "checking"
                      ? "예약 여부 확인 중"
                      : rangeAvailability === "available"
                        ? "예약 가능"
                        : rangeAvailability === "unavailable"
                          ? "예약 불가"
                          : rangeAvailability === "unknown"
                            ? "실시간 확인 필요"
                            : "날짜를 선택하세요"}
                </small>
              </div>
              <div className="booking-start-dates">
                {datePresets.map((date) => (
                  <button
                    className={selectedDateId === date.id ? "active" : ""}
                    key={date.id}
                    type="button"
                    onClick={() => chooseDate(date.id)}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-start-block">
              <b>인원 선택</b>
              <div className="booking-start-guests">
                <div>
                  <span>성인</span>
                  <button type="button" onClick={() => setAdultCount(Math.max(1, adultCount - 1))}>
                    -
                  </button>
                  <strong>{adultCount}</strong>
                  <button type="button" onClick={() => setAdultCount(adultCount + 1)}>
                    +
                  </button>
                </div>
                <div>
                  <span>아동</span>
                  <button type="button" onClick={() => setChildCount(Math.max(0, childCount - 1))}>
                    -
                  </button>
                  <strong>{childCount}</strong>
                  <button type="button" onClick={() => setChildCount(childCount + 1)}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="booking-start-block">
              <b>객실 사진·영상 확인</b>
              <div className="booking-start-rooms">
                {rooms.map((room) => (
                  <button
                    className={selectedRoomId === room.id ? "active" : ""}
                    key={room.id}
                    type="button"
                    onClick={() => chooseRoomForBooking(room.id)}
                  >
                    <span style={{ backgroundImage: `url(${cover(room)})` }} />
                    <strong>{room.name}</strong>
                    <small>
                      기준 {room.standardCapacity}인 · 최대 {room.maxCapacity}인 · {formatWon(room.basePrice)}~
                    </small>
                  </button>
                ))}
              </div>
              <div className="booking-start-room-preview" aria-label={`${selectedRoom.name} 객실 사진과 영상`}>
                <div className="booking-start-photo-strip">
                  {selectedRoomPreviewImages.map((image) => (
                    <span key={image.url} style={{ backgroundImage: `url(${image.url})` }}>
                      <b>{image.caption}</b>
                    </span>
                  ))}
                </div>
                <div className="booking-start-video-strip">
                  {bookingRoomVideos.slice(0, 2).map((video) => (
                    <a href={video.url} key={video.code} target="_blank" rel="noreferrer">
                      <span style={{ backgroundImage: `url(${video.thumbnailUrl ?? cover(selectedRoom)})` }} />
                      <b>{video.tag}</b>
                      <small>{displayTitle(video.title)}</small>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="booking-start-block">
              <b>부대옵션 선택</b>
              <div className="booking-start-options">
                {options.map((option) => (
                  <button
                    className={selectedOptions.includes(option.id) ? "active" : ""}
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setSelectedOptions((current) =>
                        current.includes(option.id)
                          ? current.filter((id) => id !== option.id)
                          : [...current, option.id]
                      )
                    }
                  >
                    <span>{option.name}</span>
                    <strong>{formatWon(option.price)}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-start-total">
              <div>
                <span>예상 결제금액</span>
                <small className={quoteAuthorityClass}>{quoteAuthorityLabel}</small>
              </div>
              <b>{formatWon(totalAmount)}</b>
              {quoteMessage && <small>{quoteMessage}</small>}
            </div>
            <button
              className="primary-action"
              type="button"
              disabled={rangeAvailability === "checking" || rangeAvailability === "unavailable" || selectedRangeHasUnavailable}
              onClick={() => goBooking(selectedRoom.id, 3)}
            >
              객실 사진·영상 확인 후 진행
            </button>
          </section>
          )}

          {homeTab === "story" && (
          <>
          <section className="chip-row">
            {["전체", "독채", "글램핑", "바비큐", "불멍", "오늘가능"].map((chip, index) => (
              <span className={index === 0 ? "chip active" : "chip"} key={chip}>
                {chip}
              </span>
            ))}
          </section>

          <section className="journey-panel" aria-label="유튜브 예약 전환 흐름">
            {customerJourney.map((item) => (
              <div className="journey-item" key={item.step}>
                <span>{item.step}</span>
                <b>{item.title}</b>
                <small>{item.body}</small>
              </div>
            ))}
          </section>

          <section className="youtube-entry-panel" aria-label="유튜브 설명란 고객 유입 흐름">
            <div className="section-head">
              <h2>유튜브 설명란 링크로 들어온 고객 화면</h2>
              <span>영상 확인 후 예약 연결</span>
            </div>
            <p>
              유튜브 영상 설명란에는 이 숙소의 펜바TV 링크가 들어가고, 고객은 여기서 객실 사진과
              관련 영상을 다시 확인한 뒤 일정 선택으로 이동합니다.
            </p>
            <div className="youtube-entry-actions">
              <button type="button" onClick={() => setScreen("detail")}>
                객실 먼저 보기
              </button>
              <button type="button" onClick={() => goBooking(selectedRoom.id, 1)}>
                일정 선택하기
              </button>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>펜바TV 영상으로 먼저 보기</h2>
              <span>유튜브 유입 연결</span>
            </div>
            <div className="featured-video">
              {featuredEmbedUrl ? (
                <iframe
                  src={featuredEmbedUrl}
                  title={stay.featuredVideoTitle ?? `${stay.name} 펜바TV 영상`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="featured-video-fallback" style={{ backgroundImage: `url(${stay.heroUrl})` }}>
                  <span>펜바TV 단독 촬영 영상</span>
                  <b>
                    {stay.featuredVideoTitle
                      ? displayTitle(stay.featuredVideoTitle)
                      : "사장님이 유튜브 링크를 등록하면 영상이 자동으로 표시됩니다."}
                  </b>
                </div>
              )}
            </div>
            <div className="video-category-tabs" aria-label="영상 분류">
              {videoCategoryTabs.map((tab) => (
                <button
                  className={selectedVideoCategory === tab.id ? "active" : ""}
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedVideoCategory(tab.id)}
                >
                  <b>{tab.label}</b>
                  <small>{tab.helper}</small>
                </button>
              ))}
            </div>
            <div className="video-list">
              {filteredVideos.map((video) => {
                const linkedRoom = rooms.find((room) => room.id === video.roomId) ?? rooms[0];
                return (
                  <article className="video-card" key={video.code}>
                    <button
                      className="video-thumb"
                      style={{ backgroundImage: `url(${video.thumbnailUrl ?? cover(linkedRoom)})` }}
                      onClick={() => chooseVideo(video)}
                      aria-label={`${video.title} 객실 보기`}
                    >
                      <i>PLAY</i>
                    </button>
                    <span className="video-copy">
                      <em>{video.tag}</em>
                      <b>{displayTitle(video.title)}</b>
                      <small>{video.description}</small>
                      {video.url ? (
                        <a className="video-open-link" href={video.url} target="_blank" rel="noreferrer">
                          유튜브 영상 열기
                        </a>
                      ) : null}
                    </span>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>네이버 블로그·리뷰로 확인</h2>
              <span>외부 후기 신뢰 자료</span>
            </div>
            <div className="naver-link-list">
              {naverLinks.map((link) => (
                <a className="naver-link-card" href={link.url} key={link.id} target="_blank" rel="noreferrer">
                  <span>{naverTypeLabel(link.type)}</span>
                  <b>{displayTitle(link.title)}</b>
                  <small>{link.excerpt}</small>
                  <em>
                    {link.author}
                    {link.rating ? ` · 평점 ${link.rating.toFixed(1)}` : ""}
                    {link.publishedAt ? ` · ${link.publishedAt}` : ""}
                  </em>
                </a>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>객실 사진 모아보기</h2>
              <span>예약 진행 전 공간 확인</span>
            </div>
            <div className="room-list">
              {rooms.map((room) => (
                <article className="room-card" key={room.id}>
                  <button
                    className="room-image"
                    style={{ backgroundImage: `url(${cover(room)})` }}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setScreen("detail");
                    }}
                  />
                  <div className="room-card-body">
                    <div>
                      <span className="eyebrow">{roomTypeLabel(room.type)}</span>
                      <h3>{room.name}</h3>
                      <p>기준 {room.standardCapacity}인 · 최대 {room.maxCapacity}인</p>
                    </div>
                    <div className="tag-line">
                      {room.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                    <div className="room-photo-strip" aria-label={`${room.name} 사진 미리보기`}>
                      {room.images.map((image) => (
                        <button
                          key={image.url}
                          type="button"
                          style={{ backgroundImage: `url(${image.url})` }}
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setScreen("detail");
                          }}
                          aria-label={`${image.caption} 보기`}
                        />
                      ))}
                    </div>
                    <div className="card-actions">
                      <b>{formatWon(room.basePrice)}~</b>
                      <button
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setScreen("detail");
                        }}
                      >
                        사진·영상 보기
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>주변 가볼만한곳</h2>
              <span>펜션 소개 아래 여행 코스</span>
            </div>
            <div className="nearby-place-list">
              {attractionPlaces.map((place) => (
                <article className="nearby-place-card" key={place.id}>
                  <div style={{ backgroundImage: `url(${place.imageUrl ?? stay.heroUrl})` }} />
                  <span>{nearbyTypeLabel(place.type)} · {place.category}</span>
                  <b>{place.name}</b>
                  <small>{place.distanceLabel || place.travelTime}</small>
                  <p>{place.description}</p>
                  <a href={place.mapUrl ?? place.url ?? "#"} target="_blank" rel="noreferrer">
                    지도/상세 보기
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>주변맛집</h2>
              <span>펜션 소개 아래 맛집 후보</span>
            </div>
            <div className="nearby-place-list">
              {restaurantPlaces.map((place) => (
                <article className="nearby-place-card" key={place.id}>
                  <div style={{ backgroundImage: `url(${place.imageUrl ?? stay.heroUrl})` }} />
                  <span>{nearbyTypeLabel(place.type)} · {place.category}</span>
                  <b>{place.name}</b>
                  <small>{place.distanceLabel || place.travelTime}</small>
                  <p>{place.description}</p>
                  <a href={place.mapUrl ?? place.url ?? "#"} target="_blank" rel="noreferrer">
                    지도/상세 보기
                  </a>
                </article>
              ))}
            </div>
          </section>
          </>
          )}
        </>
      )}

      {screen === "detail" && (
        <section className="detail">
          <button className="back-button" onClick={() => setScreen("home")}>
            이전
          </button>
          <div className="detail-image" style={{ backgroundImage: `url(${cover(selectedRoom)})` }} />
          <div className="section-head">
            <h2>{selectedRoom.name}</h2>
            <span>{formatWon(selectedRoom.basePrice)}~</span>
          </div>
          <p className="description">{selectedRoom.description}</p>
          <div className="room-media-section">
            <div className="section-head">
              <h2>영상과 방 사진</h2>
              <span>객실 선택 시 함께 노출</span>
            </div>
            <div className="room-media-grid">
              {selectedRoom.images.map((image) => (
                <article className="room-media-card" key={image.url}>
                  <div style={{ backgroundImage: `url(${image.url})` }} />
                  <span>{image.caption}</span>
                </article>
              ))}
            </div>
            <div className="room-video-list">
              {selectedRoomVideos.map((video) => (
                <article className="video-card" key={video.code}>
                  <button
                    className="video-thumb"
                    style={{ backgroundImage: `url(${video.thumbnailUrl ?? cover(selectedRoom)})` }}
                    onClick={() => setSelectedVideoCategory(video.category)}
                    aria-label={`${video.title} 분류 보기`}
                  >
                    <i>PLAY</i>
                  </button>
                  <span className="video-copy">
                    <em>{video.tag}</em>
                    <b>{displayTitle(video.title)}</b>
                    <small>{video.description}</small>
                    {video.url ? (
                      <a className="video-open-link" href={video.url} target="_blank" rel="noreferrer">
                        유튜브 영상 열기
                      </a>
                    ) : null}
                  </span>
                </article>
              ))}
            </div>
          </div>
          <div className="video-check">
            <b>영상 체크포인트</b>
            <p>입구·주차 → 방/사이트 간격 → 바비큐 → 샤워실 → 밤 불멍 순서로 확인하고 같은 공간을 예약합니다.</p>
          </div>
          {selectedRoomNaverLinks.length > 0 && (
            <div className="room-naver-section">
              <div className="section-head">
                <h2>네이버 후기</h2>
                <span>{selectedRoom.name} 관련 링크</span>
              </div>
              <div className="naver-link-list compact">
                {selectedRoomNaverLinks.map((link) => (
                  <a className="naver-link-card" href={link.url} key={link.id} target="_blank" rel="noreferrer">
                    <span>{naverTypeLabel(link.type)}</span>
                    <b>{displayTitle(link.title)}</b>
                    <small>{link.excerpt}</small>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="decision-grid">
            <div>
              <span>예약 확정 기준</span>
              <b>달력 가능 상태 + 운영자 최종 확인</b>
            </div>
            <div>
              <span>추천 결제 흐름</span>
              <b>초기에는 예약요청, 성수기에는 바로결제</b>
            </div>
          </div>
          <div className="amenity-grid">
            {selectedRoom.amenities.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="price-box">
            {roomQuote.items.map((item) => (
              <div key={item.date}>
                <span>{item.date}</span>
                <b>{formatWon(item.amount)}</b>
              </div>
            ))}
            <strong>
              <span>{roomQuote.nights}박 합계</span>
              <b>{formatWon(roomQuote.roomAmount)}</b>
            </strong>
          </div>
          <button className="primary-action" onClick={() => goBooking(selectedRoom.id, 1)}>
            이 방·사이트로 예약하기
          </button>
        </section>
      )}

      {screen === "booking" && (
        <section className="booking-flow">
          <button className="back-button" onClick={() => setScreen("home")}>
            홈으로
          </button>
          <div className="booking-flow-summary" aria-label="현재 예약 선택 요약">
            <div>
              <span>일정</span>
              <b>{selectedDate.label}</b>
            </div>
            <div>
              <span>객실</span>
              <b>{selectedRoom.name}</b>
            </div>
            <div>
              <span>인원</span>
              <b>성인 {adultCount}명 · 아동 {childCount}명</b>
            </div>
            <strong>
              <span>결제 예정</span>
              <b>{formatWon(totalAmount)}</b>
              <small className={quoteAuthorityClass}>{quoteAuthorityLabel}</small>
            </strong>
          </div>
          <div className="booking-step-tabs" aria-label="예약 진행 단계">
            {bookingStepLabels.map((item) => (
              <button
                className={bookingStep >= item.step ? "on" : ""}
                key={item.step}
                type="button"
                onClick={() => item.step < bookingStep && setBookingStep(item.step)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {bookingStep === 1 && (
            <div className="flow-card">
              <h2>날짜를 선택하세요</h2>
              <div className="calendar-toolbar">
                <button type="button" onClick={() => moveCalendarMonth(-1)} aria-label="이전 달">
                  ‹
                </button>
                <b>{monthLabel(calendarMonth)}</b>
                <button type="button" onClick={() => moveCalendarMonth(1)} aria-label="다음 달">
                  ›
                </button>
              </div>
              <div className="calendar-weekdays">
                {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {calendarDays.map((day) => (
                  <button
                    type="button"
                    className={calendarClassName(day.iso, day.inMonth)}
                    disabled={isCalendarDayDisabled(day.iso, day.inMonth)}
                    key={day.iso}
                    onClick={() => chooseCalendarDate(day.iso)}
                    aria-label={`${day.iso} ${calendarDayStatusLabel(day.iso)}`}
                  >
                    <span>{day.day}</span>
                    <small>{calendarDayStatusLabel(day.iso)}</small>
                  </button>
                ))}
              </div>
              <div className="calendar-legend" aria-label="달력 예약 상태 안내">
                <span className="legend-available">예약가능</span>
                <span className="legend-selected">선택일정</span>
                <span className="legend-unavailable">예약마감</span>
              </div>
              <div className={`availability-summary ${selectedRangeHasUnavailable ? "unavailable" : rangeAvailability}`}>
                <span>선택 기간</span>
                <b>{selectedDate.label}</b>
                <small>
                  {selectedRangeHasUnavailable
                    ? "선택한 기간 중 예약마감 날짜가 있습니다."
                    : rangeAvailability === "checking"
                      ? "예약 여부 확인 중"
                      : rangeAvailability === "available"
                        ? "예약 가능"
                        : rangeAvailability === "unavailable"
                          ? "예약 불가"
                          : rangeAvailability === "unknown"
                            ? "실시간 확인 필요"
                            : "날짜를 선택하세요"}
                </small>
              </div>
              <div className="preset-row">
              {datePresets.map((date) => (
                <button
                  type="button"
                  className={selectedDateId === date.id ? "preset-chip active" : "preset-chip"}
                  key={date.id}
                  onClick={() => chooseDate(date.id)}
                >
                  {date.label}
                </button>
              ))}
              </div>
              <button
                className="primary-action"
                disabled={rangeAvailability === "checking" || rangeAvailability === "unavailable" || selectedRangeHasUnavailable}
                onClick={() => setBookingStep(2)}
              >
                다음
              </button>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="flow-card">
              <h2>객실과 영상 확인</h2>
              <p className="capacity-note">
                {selectedDate.label} · 성인 {adultCount}명 · 아동 {childCount}명 기준으로 객실을 고르고 사진과 영상을 확인하세요.
              </p>
              <div className="room-choice-list">
                {rooms.map((room) => (
                  <button
                    className={selectedRoomId === room.id ? "booking-room-choice active" : "booking-room-choice"}
                    key={room.id}
                    type="button"
                    onClick={() => chooseRoomForBooking(room.id)}
                  >
                    <span className="booking-room-photo" style={{ backgroundImage: `url(${cover(room)})` }} />
                    <span className="booking-room-copy">
                      <em>{roomTypeLabel(room.type)}</em>
                      <b>{room.name}</b>
                      <small>
                        기준 {room.standardCapacity}인 · 최대 {room.maxCapacity}인 · {formatWon(room.basePrice)}~
                      </small>
                    </span>
                  </button>
                ))}
              </div>
              <div className="booking-room-media" aria-label={`${selectedRoom.name} 사진 미리보기`}>
                {selectedRoomPreviewImages.map((image) => (
                  <span key={image.url} style={{ backgroundImage: `url(${image.url})` }}>
                    <b>{image.caption}</b>
                  </span>
                ))}
              </div>
              <div className="booking-video-pills" aria-label={`${selectedRoom.name} 관련 영상`}>
                {bookingRoomVideos.slice(0, 3).map((video) => (
                  <a href={video.url} key={video.code} rel="noreferrer" target="_blank">
                    <span style={{ backgroundImage: `url(${video.thumbnailUrl ?? cover(selectedRoom)})` }} />
                    <b>{video.tag}</b>
                    <small>{displayTitle(video.title)}</small>
                  </a>
                ))}
              </div>
              <button className="primary-action" onClick={goPaymentStep} disabled={isSubmittingBooking}>
                객실 확인 완료, 결제 정보 입력
              </button>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="flow-card">
              <h2>인원과 옵션</h2>
              <div className="counter-row">
                <span>성인</span>
                <button type="button" onClick={() => setAdultCount(Math.max(1, adultCount - 1))}>-</button>
                <b>{adultCount}</b>
                <button
                  disabled={guestCount >= selectedRoom.maxCapacity}
                  type="button"
                  onClick={() => setAdultCount(adultCount + 1)}
                >
                  +
                </button>
              </div>
              <div className="counter-row">
                <span>아동</span>
                <button type="button" onClick={() => setChildCount(Math.max(0, childCount - 1))}>-</button>
                <b>{childCount}</b>
                <button
                  disabled={guestCount >= selectedRoom.maxCapacity}
                  type="button"
                  onClick={() => setChildCount(childCount + 1)}
                >
                  +
                </button>
              </div>
              <p className={guestCount >= selectedRoom.maxCapacity ? "capacity-note warning" : "capacity-note"}>
                {selectedRoom.name} 최대 {selectedRoom.maxCapacity}명까지 예약할 수 있습니다. 현재 {guestCount}명 선택됨.
              </p>
              {options.map((option) => (
                <label className="option-row" key={option.id}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={(event) => toggleOption(option.id, event.target.checked)}
                  />
                  <span>
                    <b>{option.name}</b>
                    <small>{option.description}</small>
                  </span>
                  <strong>{formatWon(option.price)}</strong>
                </label>
              ))}
              {hasBarbecueOption && (
                <div className="slot-choice-grid" aria-label="바베큐장 이용 시간 선택">
                  {barbecueSlots.map((slot) => (
                    <button
                      className={barbecueSlot === slot.id ? "active" : ""}
                      key={slot.id}
                      type="button"
                      onClick={() => setBarbecueSlot(slot.id)}
                    >
                      <b>{slot.label}</b>
                      <span>{slot.helper}</span>
                    </button>
                  ))}
                </div>
              )}
              {availabilityMessage && <p className="status-note">{availabilityMessage}</p>}
              <button className="primary-action" onClick={() => setBookingStep(3)}>
                인원 선택 완료, 객실 사진·영상 보기
              </button>
            </div>
          )}

          {bookingStep === 4 && (
            <div className="flow-card">
              <h2>예약자 정보와 예약 방식</h2>
              <div className="booking-mini-summary">
                <div>
                  <span>예약내용</span>
                  <b>{selectedRoom.name} · {selectedDate.label}</b>
                </div>
                <div>
                  <span>인원/바베큐</span>
                  <b>
                    성인 {adultCount}명 · 아동 {childCount}명 · {selectedBarbecueLabel}
                  </b>
                </div>
              </div>
              <input placeholder="예약자 이름" value={guestName} onChange={(event) => setGuestName(event.target.value)} />
              <input placeholder="휴대폰 번호" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} />
              <div className="mode-grid">
                {bookingModeChoices.map((mode) => (
                  <button
                    className={bookingMode === mode.id ? "mode-card active" : "mode-card"}
                    key={mode.id}
                    type="button"
                    onClick={() => setBookingMode(mode.id)}
                  >
                    <span>{mode.badge}</span>
                    <b>{mode.title}</b>
                    <small>{mode.body}</small>
                  </button>
                ))}
              </div>
              {bookingMode === "instant" ? (
                <>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as PaymentProvider)}
                  >
                    {paymentProviderChoices.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                  <p className="request-note">
                    {paymentProviderChoices.find((provider) => provider.id === paymentMethod)?.helper}
                  </p>
                </>
              ) : (
                <p className="request-note">
                  운영자가 객실 상태를 확인한 뒤 문자 또는 알림톡으로 결제 링크를 발송합니다.
                </p>
              )}
              <div className="price-box">
                <div>
                  <span>객실 요금</span>
                  <b>{formatWon(roomQuote.roomAmount)}</b>
                </div>
                <div>
                  <span>옵션</span>
                  <b>{formatWon(optionAmount)}</b>
                </div>
                {guestAmount > 0 && (
                  <div>
                    <span>인원 추가요금</span>
                    <b>{formatWon(guestAmount)}</b>
                  </div>
                )}
                {coupon > 0 && (
                  <div>
                    <span>유튜브 쿠폰</span>
                    <b>-{formatWon(coupon)}</b>
                  </div>
                )}
                <strong>
                  <span>총 결제 금액</span>
                  <b>{formatWon(totalAmount)}</b>
                </strong>
              </div>
              {quoteMessage && <p className="status-note">{quoteMessage}</p>}
              <p className="policy-note">결제 전 취소·환불 규정과 정숙 시간 정책을 확인했습니다.</p>
              {bookingMode === "instant" && holdSecondsLeft !== null && (
                <div className="hold-timer">
                  <span>Hold expires in</span>
                  <b>{formatCountdown(holdSecondsLeft)}</b>
                </div>
              )}
              {bookingMode === "instant" && isActiveHoldExpired && (
                <p className="status-note">예약 홀드가 만료되었습니다. 결제 버튼을 다시 눌러 새 홀드를 생성하세요.</p>
              )}
              {availabilityMessage && <p className="status-note">{availabilityMessage}</p>}
              <button
                className="primary-action"
                onClick={completeBooking}
                disabled={isSubmittingBooking}
              >
                {bookingMode === "instant" ? paymentActionLabel(paymentMethod) : "예약 요청 보내기"}
              </button>
            </div>
          )}

          {bookingStep === 5 && (
            <div className="flow-card done">
              <h2>예약 완료</h2>
              <p>{holdMessage}</p>
              <b>{booking?.bookingNo}</b>
              <span>
                {booking?.roomName} · {booking?.checkIn} - {booking?.checkOut}
              </span>
              {booking?.barbecueSlot !== "none" && <span>바베큐장 {booking?.barbecueSlot}</span>}
              <strong>{formatWon(booking?.totalAmount ?? totalAmount)}</strong>
              <Link className="primary-action" href={guestPhone ? `/my?phone=${encodeURIComponent(guestPhone)}` : "/my"}>
                내 예약 보기
              </Link>
            </div>
          )}
        </section>
      )}

      {screen === "mine" && (
        <section className="flow-card">
          <h2>내 예약</h2>
          {booking ? (
            <div className="booking-summary">
              <b>{booking.bookingNo}</b>
              <span>{booking.roomName}</span>
              <span>
                {booking.checkIn} - {booking.checkOut}
              </span>
              <strong>{formatWon(booking.totalAmount)}</strong>
              <span>
                {booking.status === "paid"
                  ? "결제완료"
                  : booking.status === "waiting_deposit"
                    ? "입금대기"
                    : "예약요청"}
              </span>
              {booking.bookingId && <small>DB 예약 ID {booking.bookingId}</small>}
            </div>
          ) : (
            <p className="description">아직 예약 내역이 없습니다.</p>
          )}
        </section>
      )}

      {screen === "my" && (
        <section className="flow-card app-tab-design-card">
          <span className="eyebrow">MY 화면 설계</span>
          <h2>내 정보와 예약 이용 관리</h2>
          <p className="description">
            로그인 이후 고객이 예약자 정보, 결제수단, 알림 수신, 최근 본 숙소를 관리하는 개인 메뉴로 확장합니다.
          </p>
          <div className="my-design-summary">
            <article>
              <span>01</span>
              <b>예약자 프로필</b>
              <small>이름, 연락처, 기본 인원, 차량 정보를 저장합니다.</small>
            </article>
            <article>
              <span>02</span>
              <b>결제·환불 관리</b>
              <small>카드, 네이버페이, 계좌이체 내역과 환불 상태를 확인합니다.</small>
            </article>
            <article>
              <span>03</span>
              <b>알림 설정</b>
              <small>예약 완료, 입실 안내, 바베큐 시간 알림 수신 여부를 관리합니다.</small>
            </article>
            <article>
              <span>04</span>
              <b>최근 본 숙소</b>
              <small>유튜브에서 들어와 확인한 펜션과 객실을 다시 볼 수 있게 합니다.</small>
            </article>
          </div>
        </section>
      )}

      <nav className="bottom-tabs">
        <button className={screen === "home" ? "on" : ""} onClick={() => setScreen("home")}>
          <span className="bottom-tab-mark">홈</span>
          <span className="bottom-tab-label">홈</span>
        </button>
        <button className={screen === "detail" ? "on" : ""} onClick={() => setScreen("detail")}>
          <span className="bottom-tab-mark">방</span>
          <span className="bottom-tab-label">객실</span>
        </button>
        <button className={screen === "booking" ? "on" : ""} onClick={() => goBooking(selectedRoomId, 1)}>
          <span className="bottom-tab-mark">일</span>
          <span className="bottom-tab-label">예약</span>
        </button>
        <button className={screen === "mine" ? "on" : ""} onClick={() => setScreen("mine")}>
          <span className="bottom-tab-mark">예</span>
          <span className="bottom-tab-label">내예약</span>
        </button>
        <button className={screen === "my" ? "on" : ""} onClick={() => setScreen("my")}>
          <span className="bottom-tab-mark">MY</span>
          <span className="bottom-tab-label">MY</span>
        </button>
      </nav>
    </main>
  );
}
