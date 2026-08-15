import { barbecueSlots } from "@/lib/core-features";
import { isWeekendNight } from "@/lib/date";
import { mockRooms, type Room } from "@/lib/mock-data";
import { findPartnerProperty } from "@/lib/platform-data";
import type { ISODateString } from "@/lib/types";

export type CalendarStatus = "available" | "few" | "reserved" | "blocked" | "wait";

export type CalendarStatusCell = {
  date: string;
  day: number;
  weekday: string;
  status: CalendarStatus;
  label: string;
  price: number | null;
  note: string;
};

export type RoomCalendarRow = {
  roomId: string;
  roomName: string;
  roomType: string;
  capacity: string;
  cells: CalendarStatusCell[];
};

export type BarbecueCalendarRow = {
  zoneName: string;
  cells: CalendarStatusCell[];
};

const statusLabels: Record<CalendarStatus, string> = {
  available: "예약가능",
  few: "잔여소량",
  reserved: "예약완료",
  blocked: "마감",
  wait: "대기"
};

const statusNotes: Record<CalendarStatus, string> = {
  available: "바로 예약",
  few: "빠른 예약 권장",
  reserved: "다른 날짜 선택",
  blocked: "판매 중지",
  wait: "문의 필요"
};

const roomTypeLabels: Record<Room["type"], string> = {
  private_house: "독채펜션",
  glamping: "글램핑",
  camp_site: "사이트"
};

const reservedRoomNights = new Set(["A:2026-08-20", "A:2026-08-21", "B:2026-08-28"]);
const blockedRoomNights = new Set(["A:2026-08-24", "B:2026-08-30"]);
const waitRoomNights = new Set(["B:2026-08-22", "A:2026-09-01"]);

export function normalizeCalendarAccommodationId(value?: string) {
  if (!value || value === "87") return "baebang-alps";
  return value;
}

export function addCalendarDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function toCalendarISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromCalendarISO(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function buildCalendarDates(startDate = "2026-08-20", days = 15) {
  const formatter = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });
  const start = dateFromCalendarISO(startDate);

  return Array.from({ length: days }, (_, index) => {
    const date = addCalendarDays(start, index);

    return {
      date: toCalendarISODate(date),
      day: date.getDate(),
      weekday: formatter.format(date)
    };
  });
}

function rateForDate(room: Room, date: string) {
  const rate = room.rates
    .filter((item) => item.startDate <= date && item.endDate >= date)
    .sort((a, b) => b.priority - a.priority)[0];

  const base = rate?.nightlyPrice ?? room.basePrice;
  const weekendExtra = isWeekendNight(date as ISODateString) ? rate?.weekendExtra ?? room.weekendExtra : 0;
  return base + weekendExtra;
}

function roomStatus(roomId: string, date: string, index: number): CalendarStatus {
  const key = `${roomId}:${date}`;
  if (reservedRoomNights.has(key)) return "reserved";
  if (blockedRoomNights.has(key)) return "blocked";
  if (waitRoomNights.has(key)) return "wait";
  if (index % 6 === 4) return "few";
  return "available";
}

export function buildRoomCalendarRows(rooms: Room[] = mockRooms, startDate?: string): RoomCalendarRow[] {
  const dates = buildCalendarDates(startDate);

  return rooms.map((room) => ({
    roomId: room.id,
    roomName: room.name,
    roomType: roomTypeLabels[room.type],
    capacity: `기준 ${room.standardCapacity}명 / 최대 ${room.maxCapacity}명`,
    cells: dates.map((date, index) => {
      const status = roomStatus(room.id, date.date, index);

      return {
        ...date,
        status,
        label: statusLabels[status],
        price: status === "reserved" || status === "blocked" ? null : rateForDate(room, date.date),
        note: statusNotes[status]
      };
    })
  }));
}

export function buildBarbecueCalendarRow(startDate?: string): BarbecueCalendarRow {
  const dates = buildCalendarDates(startDate);

  return {
    zoneName: "공용 바베큐장",
    cells: dates.map((date, index) => {
      const slots = barbecueSlots.filter((slot) => slot.date === date.date);
      const reserved = slots.some((slot) => slot.status === "reserved");
      const blocked = slots.some((slot) => slot.status === "blocked");
      const status: CalendarStatus = blocked ? "blocked" : reserved ? "few" : index % 5 === 3 ? "wait" : "available";

      return {
        ...date,
        status,
        label: status === "few" ? "일부가능" : statusLabels[status],
        price: status === "blocked" ? null : 30000,
        note: status === "few" ? "타임슬롯 확인" : statusNotes[status]
      };
    })
  };
}

export function getCalendarStay(accommodationId?: string) {
  const normalizedId = normalizeCalendarAccommodationId(accommodationId);
  return findPartnerProperty(normalizedId) ?? findPartnerProperty("baebang-alps");
}
