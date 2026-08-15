"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BookingDraft } from "@/lib/booking-draft";
import type { BookingOption, DatePreset, Room, Stay, YoutubeVideo } from "@/lib/mock-data";
import { formatWon, quoteLocalRoom, quoteOptions, youtubeCoupon } from "@/lib/local-quote";
import type { ISODateString } from "@/lib/types";

type Screen = "home" | "detail" | "booking" | "mine";
type BookingStep = 1 | 2 | 3 | 4 | 5;
type RangeAvailability = "idle" | "checking" | "available" | "unavailable" | "unknown";
type BookingMode = "request" | "instant";

type LocalBooking = {
  bookingNo: string;
  holdId: string | null;
  holdExpiresAt: string | null;
  paymentSessionId: string | null;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  guestName: string;
  utmCode: string | null;
};

type PaymentProvider = "card" | "naverpay" | "tosspay" | "vbank";

type ActiveHold = {
  id: string;
  expiresAt: string;
};

type HoldResponse = {
  hold?: {
    id: string;
    expires_at: string;
  } | null;
  error?: unknown;
};

type PaymentPrepareResponse = {
  payment?: {
    id: string;
    status: "ready";
    mode: "mock" | "toss";
    orderId?: string;
    checkout?: {
      type: "mock" | "toss-window";
      url: string | null;
      clientKey: string | null;
      method: "CARD" | "VIRTUAL_ACCOUNT" | null;
      successUrl: string;
      failUrl: string;
    };
  };
  error?: unknown;
};

type AvailabilityResponse = {
  availability?: {
    available: boolean;
    blockedReason: string | null;
  };
  error?: unknown;
};

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

type Props = {
  stay: Stay;
  rooms: Room[];
  options: BookingOption[];
  videos: YoutubeVideo[];
  datePresets: DatePreset[];
  initialDraft: BookingDraft;
};

const customerJourney = [
  {
    step: "01",
    title: "영상 확인",
    body: "캠핑천국 리뷰에서 본 공간을 그대로 방·사이트 상세로 연결합니다."
  },
  {
    step: "02",
    title: "날짜 확인",
    body: "달력에서 체크인과 체크아웃을 고르고 예약 가능 여부를 먼저 봅니다."
  },
  {
    step: "03",
    title: "예약 방식 선택",
    body: "운영자 확정 후 결제하거나, 가능한 기간은 바로 결제로 진행합니다."
  }
];

const operatorShortcuts = [
  {
    title: "입점 제안",
    body: "펜션 사장님에게 보여줄 촬영, 예약결제, 운영 패키지 제안 화면",
    href: "/host/make24-benchmark"
  },
  {
    title: "디자인 선택",
    body: "영상형, 예약형, 바베큐형 상세페이지 템플릿을 고르는 화면",
    href: "/host/design-benchmark"
  },
  {
    title: "예약 현황",
    body: "객실과 바베큐장 날짜별 예약 가능 여부를 확인하는 달력",
    href: "/booking-calendar-status?accommodationId=baebang-alps"
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

function youtubeEmbedUrl(url?: string) {
  if (!url) return null;

  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function StayAppClient({ stay, rooms, options, videos, datePresets, initialDraft }: Props) {
  const initialRoomId = initialDraft.roomId ?? rooms[0]?.id ?? "";
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [selectedDateId, setSelectedDateId] = useState(datePresets[0]?.id ?? "");
  const [selectedCheckIn, setSelectedCheckIn] = useState(datePresets[0]?.checkIn ?? emptyDate.checkIn);
  const [selectedCheckOut, setSelectedCheckOut] = useState(datePresets[0]?.checkOut ?? emptyDate.checkOut);
  const [calendarMonth, setCalendarMonth] = useState(() => dateFromISO(datePresets[0]?.checkIn ?? emptyDate.checkIn));
  const [rangeAvailability, setRangeAvailability] = useState<RangeAvailability>("idle");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["bbq"]);
  const [adultCount, setAdultCount] = useState(4);
  const [childCount, setChildCount] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("card");
  const [bookingMode, setBookingMode] = useState<BookingMode>("request");
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<LocalBooking | null>(null);
  const [holdMessage, setHoldMessage] = useState<string | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [activeHold, setActiveHold] = useState<ActiveHold | null>(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? emptyRoom;
  const selectedDate = {
    id: selectedDateId || "custom",
    checkIn: selectedCheckIn,
    checkOut: selectedCheckOut,
    label: formatRangeLabel(selectedCheckIn, selectedCheckOut)
  };
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const roomQuote = useMemo(
    () =>
      quoteLocalRoom(
        selectedRoom,
        selectedCheckIn as ISODateString,
        selectedCheckOut as ISODateString
      ),
    [selectedRoom, selectedCheckIn, selectedCheckOut]
  );
  const optionAmount = quoteOptions(options, selectedOptions);
  const coupon = youtubeCoupon(initialDraft.utmCode);
  const totalAmount = Math.max(0, roomQuote.roomAmount + optionAmount - coupon);
  const featuredEmbedUrl = youtubeEmbedUrl(stay.featuredVideoUrl);

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

  function chooseVideo(video: YoutubeVideo) {
    setSelectedRoomId(video.roomId);
    setScreen("detail");
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

    setSelectedCheckOut(isoDate);
  }

  function chooseRoomForBooking(roomId: string) {
    setSelectedRoomId(roomId);
    setAvailabilityMessage(null);
    setActiveHold(null);
  }

  function moveCalendarMonth(amount: number) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function calendarClassName(dayIso: string, inMonth: boolean) {
    const date = dateFromISO(dayIso).getTime();
    const checkIn = dateFromISO(selectedCheckIn).getTime();
    const checkOut = dateFromISO(selectedCheckOut).getTime();
    const classes = ["calendar-day"];

    if (!inMonth) classes.push("muted-day");
    if (date === checkIn) classes.push("range-start");
    if (date === checkOut) classes.push("range-end");
    if (date > checkIn && date < checkOut) classes.push("in-range");

    return classes.join(" ");
  }

  async function checkSelectedAvailability() {
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

    setIsSubmittingBooking(true);
    setHoldMessage(
      bookingMode === "instant"
        ? "예약 재고를 15분간 잠금 처리했습니다."
        : "예약 요청이 접수되었습니다. 운영자 확인 후 결제 안내를 발송합니다."
    );
    let holdId = activeHold?.id ?? null;
    let holdExpiresAt = activeHold?.expiresAt ?? null;
    let paymentSessionId: string | null = null;

    if (bookingMode === "instant" && holdSecondsLeft === 0) {
      setHoldMessage("Booking hold expired. Please choose the date again.");
      setIsSubmittingBooking(false);
      return;
    }

    if (bookingMode === "instant") {
      try {
        const holdPayload = await postJson<HoldResponse>("/api/booking-holds", {
          roomId: selectedRoom.id,
          checkIn: selectedDate.checkIn,
          checkOut: selectedDate.checkOut,
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
      } catch (error) {
        if (error instanceof ApiResponseError && error.status === 409) {
          setAvailabilityMessage("Selected dates were just held or booked. Please choose another date.");
          setIsSubmittingBooking(false);
          return;
        }

        setHoldMessage("Live hold is unavailable. Continuing with local mock booking.");
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
          guestName: guestName || null,
          guestPhone: guestPhone || null,
          utmCode: initialDraft.utmCode
        });
        paymentSessionId = paymentPayload.payment?.id ?? null;
        if (paymentPayload.payment?.mode === "toss") {
          setHoldMessage("Toss payment session is ready. Connect the client SDK requestPayment next.");
        }
      } catch {
        setHoldMessage("Payment preparation is unavailable. Saved as local mock booking.");
      }
    }

    const createdBooking = {
      bookingNo: `STAY-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-0001`,
      holdId,
      holdExpiresAt,
      paymentSessionId,
      roomName: selectedRoom.name,
      checkIn: selectedDate.checkIn,
      checkOut: selectedDate.checkOut,
      totalAmount,
      guestName: guestName || "홍길동",
      utmCode: initialDraft.utmCode
    };
    localStorage.setItem("staylink.lastBooking", JSON.stringify(createdBooking));
    setBooking(createdBooking);
    setBookingStep(5);
    setIsSubmittingBooking(false);
  }

  return (
    <main className="app-shell">
      {screen === "home" && (
        <>
          <section className="stay-hero" style={{ backgroundImage: `url(${stay.heroUrl})` }}>
            <div className="hero-copy">
              <span>펜바TV 단독 촬영 · 영상 검증 예약</span>
              <h1>{stay.name}</h1>
              <p>{stay.concept}</p>
            </div>
          </section>

          <section className="quick-search">
            <div>
              <b>{stay.area}</b>
              <span>{selectedDate.label} · 성인 {adultCount + childCount}명</span>
            </div>
            <button onClick={() => goBooking(selectedRoomId, 1)}>검색</button>
          </section>

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

          <section className="operator-shortcuts" aria-label="펜바TV 운영 바로가기">
            <div className="section-head">
              <h2>입점 운영 기능</h2>
              <span>제안 · 디자인 · 예약현황</span>
            </div>
            <div className="operator-shortcut-grid">
              {operatorShortcuts.map((item) => (
                <Link href={item.href} key={item.title}>
                  <b>{item.title}</b>
                  <small>{item.body}</small>
                </Link>
              ))}
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
                  <b>{stay.featuredVideoTitle ?? "사장님이 유튜브 링크를 등록하면 영상이 자동으로 표시됩니다."}</b>
                </div>
              )}
            </div>
            <div className="video-list">
              {videos.map((video) => {
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
                      <b>{video.title}</b>
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
              <h2>방·사이트</h2>
              <span>{rooms.length}개 공간</span>
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
                    <div className="card-actions">
                      <b>{formatWon(room.basePrice)}~</b>
                      <button onClick={() => goBooking(room.id, 1)}>예약</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
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
          <div className="video-check">
            <b>영상 체크포인트</b>
            <p>입구·주차 → 방/사이트 간격 → 바비큐 → 샤워실 → 밤 불멍 순서로 확인하고 같은 공간을 예약합니다.</p>
          </div>
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
          <div className="steps">
            {[1, 2, 3, 4, 5].map((step) => (
              <span className={bookingStep >= step ? "on" : ""} key={step} />
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
                    key={day.iso}
                    onClick={() => chooseCalendarDate(day.iso)}
                  >
                    <span>{day.day}</span>
                  </button>
                ))}
              </div>
              <div className={`availability-summary ${rangeAvailability}`}>
                <span>선택 기간</span>
                <b>{selectedDate.label}</b>
                <small>
                  {rangeAvailability === "checking" && "예약 여부 확인 중"}
                  {rangeAvailability === "available" && "예약 가능"}
                  {rangeAvailability === "unavailable" && "예약 불가"}
                  {rangeAvailability === "unknown" && "실시간 확인 필요"}
                  {rangeAvailability === "idle" && "날짜를 선택하세요"}
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
                disabled={rangeAvailability === "checking" || rangeAvailability === "unavailable"}
                onClick={() => setBookingStep(2)}
              >
                다음
              </button>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="flow-card">
              <h2>방·사이트를 선택하세요</h2>
              {rooms.map((room) => (
                <button
                  className={selectedRoomId === room.id ? "choice active" : "choice"}
                  key={room.id}
                  onClick={() => chooseRoomForBooking(room.id)}
                >
                  {room.name} · {formatWon(room.basePrice)}~
                </button>
              ))}
              <button className="primary-action" onClick={() => setBookingStep(3)}>
                다음
              </button>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="flow-card">
              <h2>인원과 옵션</h2>
              <div className="counter-row">
                <span>성인</span>
                <button onClick={() => setAdultCount(Math.max(1, adultCount - 1))}>-</button>
                <b>{adultCount}</b>
                <button onClick={() => setAdultCount(adultCount + 1)}>+</button>
              </div>
              <div className="counter-row">
                <span>아동</span>
                <button onClick={() => setChildCount(Math.max(0, childCount - 1))}>-</button>
                <b>{childCount}</b>
                <button onClick={() => setChildCount(childCount + 1)}>+</button>
              </div>
              {options.map((option) => (
                <label className="option-row" key={option.id}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={(event) =>
                      setSelectedOptions((current) =>
                        event.target.checked
                          ? [...current, option.id]
                          : current.filter((id) => id !== option.id)
                      )
                    }
                  />
                  <span>
                    <b>{option.name}</b>
                    <small>{option.description}</small>
                  </span>
                  <strong>{formatWon(option.price)}</strong>
                </label>
              ))}
              {availabilityMessage && <p className="status-note">{availabilityMessage}</p>}
              <button className="primary-action" onClick={goPaymentStep} disabled={isSubmittingBooking}>
                다음
              </button>
            </div>
          )}

          {bookingStep === 4 && (
            <div className="flow-card">
              <h2>예약자 정보와 예약 방식</h2>
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
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as PaymentProvider)}
                >
                  <option value="card">카드</option>
                  <option value="naverpay">네이버페이</option>
                  <option value="tosspay">토스페이</option>
                  <option value="vbank">가상계좌</option>
                </select>
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
              <p className="policy-note">결제 전 취소·환불 규정과 정숙 시간 정책을 확인했습니다.</p>
              {bookingMode === "instant" && holdSecondsLeft !== null && (
                <div className="hold-timer">
                  <span>Hold expires in</span>
                  <b>{formatCountdown(holdSecondsLeft)}</b>
                </div>
              )}
              {availabilityMessage && <p className="status-note">{availabilityMessage}</p>}
              <button
                className="primary-action"
                onClick={completeBooking}
                disabled={isSubmittingBooking || (bookingMode === "instant" && holdSecondsLeft === 0)}
              >
                {bookingMode === "instant" ? "Mock 결제 완료" : "예약 요청 보내기"}
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
              <strong>{formatWon(booking?.totalAmount ?? totalAmount)}</strong>
              <button className="primary-action" onClick={() => setScreen("mine")}>
                내 예약 보기
              </button>
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
            </div>
          ) : (
            <p className="description">아직 예약 내역이 없습니다.</p>
          )}
        </section>
      )}

      <nav className="bottom-tabs">
        <button className={screen === "home" ? "on" : ""} onClick={() => setScreen("home")}>
          홈
        </button>
        <button onClick={() => goBooking(selectedRoomId, 1)}>검색</button>
        <button className={screen === "mine" ? "on" : ""} onClick={() => setScreen("mine")}>
          내예약
        </button>
        <button>캠우</button>
        <button>MY</button>
      </nav>
    </main>
  );
}
