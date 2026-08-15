"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatWon } from "@/lib/local-quote";
import { mockRooms } from "@/lib/mock-data";

type OptionPricingMode = "fixed_set" | "per_person";
type SyncPolicy = "import_only" | "two_way_later";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const channelPresets = ["네이버예약", "야놀자", "여기어때", "Airbnb", "수기 등록"];

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateFromISO(value: string) {
  return new Date(`${value}T00:00:00`);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(date);
}

function buildMonthDays(monthDate: Date) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      iso: toISODate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthDate.getMonth(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    };
  });
}

function normalizeRange(start: string, end: string) {
  return dateFromISO(start).getTime() <= dateFromISO(end).getTime()
    ? { startDate: start, endDate: end }
    : { startDate: end, endDate: start };
}

function countDayTypes(startDate: string, endDate: string) {
  let current = dateFromISO(startDate);
  const end = dateFromISO(endDate);
  let weekdayCount = 0;
  let weekendCount = 0;

  while (current.getTime() <= end.getTime()) {
    const day = current.getDay();
    if (day === 0 || day === 6) weekendCount += 1;
    else weekdayCount += 1;
    current = addDays(current, 1);
  }

  return { weekdayCount, weekendCount };
}

export function HostRateCalendarClient() {
  const [selectedRoomId, setSelectedRoomId] = useState(mockRooms[0]?.id ?? "");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2026, 6, 1));
  const [dragStart, setDragStart] = useState("2026-07-15");
  const [dragEnd, setDragEnd] = useState("2026-08-15");
  const [isDragging, setIsDragging] = useState(false);
  const [seasonName, setSeasonName] = useState("여름 성수기");
  const [weekdayPrice, setWeekdayPrice] = useState(200000);
  const [weekendPrice, setWeekendPrice] = useState(400000);
  const [optionName, setOptionName] = useState("바베큐 숯+그릴");
  const [optionPricingMode, setOptionPricingMode] = useState<OptionPricingMode>("fixed_set");
  const [optionUnitPrice, setOptionUnitPrice] = useState(30000);
  const [guestCount, setGuestCount] = useState(4);
  const [setCount, setSetCount] = useState(1);
  const [syncChannel, setSyncChannel] = useState(channelPresets[0]);
  const [icalUrl, setIcalUrl] = useState("");
  const [syncPolicy, setSyncPolicy] = useState<SyncPolicy>("import_only");

  const days = useMemo(() => buildMonthDays(calendarMonth), [calendarMonth]);
  const range = normalizeRange(dragStart, dragEnd);
  const dayCounts = countDayTypes(range.startDate, range.endDate);
  const optionTotal =
    optionPricingMode === "per_person" ? optionUnitPrice * guestCount : optionUnitPrice * setCount;
  const selectedRoom = mockRooms.find((room) => room.id === selectedRoomId) ?? mockRooms[0];

  const roomRateInsert = {
    roomId: selectedRoomId,
    startDate: range.startDate,
    endDate: range.endDate,
    rateType: "seasonal",
    nightlyPrice: weekdayPrice,
    weekendExtra: Math.max(0, weekendPrice - weekdayPrice),
    priority: 20,
    memo: seasonName
  };

  const daySplitPreview = [
    {
      dayType: "평일",
      count: dayCounts.weekdayCount,
      nightlyPrice: weekdayPrice,
      amount: dayCounts.weekdayCount * weekdayPrice
    },
    {
      dayType: "주말",
      count: dayCounts.weekendCount,
      nightlyPrice: weekendPrice,
      amount: dayCounts.weekendCount * weekendPrice
    }
  ];

  function dayClassName(dayIso: string, inMonth: boolean) {
    const date = dateFromISO(dayIso).getTime();
    const start = dateFromISO(range.startDate).getTime();
    const end = dateFromISO(range.endDate).getTime();
    const classes = ["rate-day"];

    if (!inMonth) classes.push("muted-day");
    if (date >= start && date <= end) classes.push("selected");
    if (date === start) classes.push("range-start");
    if (date === end) classes.push("range-end");

    return classes.join(" ");
  }

  function beginRange(dayIso: string) {
    setIsDragging(true);
    setDragStart(dayIso);
    setDragEnd(dayIso);
  }

  function moveRange(dayIso: string) {
    if (!isDragging) return;
    setDragEnd(dayIso);
  }

  function endRange(dayIso: string) {
    setDragEnd(dayIso);
    setIsDragging(false);
  }

  return (
    <main>
      <section className="panel">
        <p className="muted">Owner UX Lab</p>
        <h1>요금·옵션·외부달력 설정</h1>
        <p className="muted">
          사장님이 기간을 드래그하고 성수기 요금, 바베큐 옵션, 외부 예약 달력 연동을 한 화면에서 입력하는 운영 폼입니다.
        </p>
        <div className="host-nav">
          <Link href="/host/properties">펜션 등록</Link>
          <Link href="/host/rooms">예약 운영 콘솔</Link>
          <Link href="/host/launch-plan">런칭 가이드</Link>
        </div>
      </section>

      <section className="rate-layout">
        <div className="rate-calendar-panel">
          <div className="section-head">
            <h2>달력 드래그 요금 설정</h2>
            <span>{selectedRoom?.name}</span>
          </div>
          <div className="form-grid">
            <label>
              <span>방·사이트</span>
              <select value={selectedRoomId} onChange={(event) => setSelectedRoomId(event.target.value)}>
                {mockRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>기간명</span>
              <input value={seasonName} onChange={(event) => setSeasonName(event.target.value)} />
            </label>
          </div>
          <div className="calendar-toolbar">
            <button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
              ‹
            </button>
            <b>{formatMonth(calendarMonth)}</b>
            <button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
              ›
            </button>
          </div>
          <div className="rate-weekdays">
            {weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="rate-calendar-grid" onPointerLeave={() => setIsDragging(false)}>
            {days.map((day) => (
              <button
                className={dayClassName(day.iso, day.inMonth)}
                key={day.iso}
                onPointerDown={() => beginRange(day.iso)}
                onPointerEnter={() => moveRange(day.iso)}
                onPointerUp={() => endRange(day.iso)}
                type="button"
              >
                <span>{day.day}</span>
                {day.isWeekend && <small>주말</small>}
              </button>
            ))}
          </div>
          <div className="rate-summary">
            <div>
              <span>선택 기간</span>
              <b>
                {range.startDate} - {range.endDate}
              </b>
            </div>
            <div>
              <span>평일/주말</span>
              <b>
                {dayCounts.weekdayCount}일 / {dayCounts.weekendCount}일
              </b>
            </div>
          </div>
        </div>

        <aside className="rate-side-panel">
          <h2>요금 입력</h2>
          <label>
            <span>평일 요금</span>
            <input
              type="number"
              min={0}
              step={10000}
              value={weekdayPrice}
              onChange={(event) => setWeekdayPrice(Number(event.target.value))}
            />
          </label>
          <label>
            <span>주말 요금</span>
            <input
              type="number"
              min={0}
              step={10000}
              value={weekendPrice}
              onChange={(event) => setWeekendPrice(Number(event.target.value))}
            />
          </label>
          <div className="insert-preview">
            <span>room_rates insert preview</span>
            <pre>{JSON.stringify(roomRateInsert, null, 2)}</pre>
          </div>
          <div className="split-preview">
            {daySplitPreview.map((row) => (
              <div key={row.dayType}>
                <b>{row.dayType}</b>
                <span>
                  {row.count}일 · {formatWon(row.nightlyPrice)} · {formatWon(row.amount)}
                </span>
              </div>
            ))}
          </div>
          <button className="primary-action" type="button">
            이 기간을 [{seasonName}]로 설정
          </button>
        </aside>
      </section>

      <section className="rate-layout compact">
        <div className="rate-side-panel">
          <h2>바베큐 옵션 과금</h2>
          <label>
            <span>옵션명</span>
            <input value={optionName} onChange={(event) => setOptionName(event.target.value)} />
          </label>
          <div className="mode-grid">
            <button
              className={optionPricingMode === "fixed_set" ? "mode-card active" : "mode-card"}
              onClick={() => setOptionPricingMode("fixed_set")}
              type="button"
            >
              <span>추천</span>
              <b>세트당 정액제</b>
              <small>숯, 그릴, 집게처럼 묶음 단가가 명확한 옵션에 적합합니다.</small>
            </button>
            <button
              className={optionPricingMode === "per_person" ? "mode-card active" : "mode-card"}
              onClick={() => setOptionPricingMode("per_person")}
              type="button"
            >
              <span>인원 연동</span>
              <b>1인당 과금</b>
              <small>조식, 수건 추가, 체험처럼 인원에 따라 원가가 늘어나는 옵션에 적합합니다.</small>
            </button>
          </div>
          <div className="form-grid">
            <label>
              <span>단가</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={optionUnitPrice}
                onChange={(event) => setOptionUnitPrice(Number(event.target.value))}
              />
            </label>
            <label>
              <span>{optionPricingMode === "per_person" ? "인원" : "세트 수"}</span>
              <input
                type="number"
                min={1}
                value={optionPricingMode === "per_person" ? guestCount : setCount}
                onChange={(event) =>
                  optionPricingMode === "per_person"
                    ? setGuestCount(Number(event.target.value))
                    : setSetCount(Number(event.target.value))
                }
              />
            </label>
          </div>
          <div className="rate-summary">
            <div>
              <span>{optionName}</span>
              <b>{formatWon(optionTotal)}</b>
            </div>
          </div>
        </div>

        <div className="rate-side-panel">
          <h2>외부 달력 연동</h2>
          <p className="muted">
            초기 버전은 iCal 가져오기 전용으로 중복 예약을 막고, 채널별 정식 API는 제휴 문서 확보 후 양방향으로 확장합니다.
          </p>
          <div className="form-grid">
            <label>
              <span>채널</span>
              <select value={syncChannel} onChange={(event) => setSyncChannel(event.target.value)}>
                {channelPresets.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>연동 방식</span>
              <select value={syncPolicy} onChange={(event) => setSyncPolicy(event.target.value as SyncPolicy)}>
                <option value="import_only">iCal 가져오기 전용</option>
                <option value="two_way_later">양방향 API 추후 전환</option>
              </select>
            </label>
          </div>
          <label>
            <span>iCal URL</span>
            <input
              value={icalUrl}
              onChange={(event) => setIcalUrl(event.target.value)}
              placeholder="https://.../calendar.ics"
            />
          </label>
          <div className="insert-preview">
            <span>calendar_sync_sources insert preview</span>
            <pre>
              {JSON.stringify(
                {
                  roomId: selectedRoomId,
                  channel: syncChannel,
                  syncPolicy,
                  icalUrl: icalUrl || null,
                  intervalMinutes: 30,
                  mapsTo: "room_blocks"
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
