import type { ISODateString } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseISODate(date: ISODateString) {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO date: ${date}`);
  }

  return parsed;
}

export function assertValidDateRange(checkIn: string, checkOut: string) {
  const start = Date.parse(`${checkIn}T00:00:00.000Z`);
  const end = Date.parse(`${checkOut}T00:00:00.000Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error("checkIn and checkOut must be valid ISO date strings.");
  }

  if (start >= end) {
    throw new Error("checkOut must be later than checkIn.");
  }
}

export function rangesOverlap(
  leftCheckIn: string,
  leftCheckOut: string,
  rightCheckIn: string,
  rightCheckOut: string
) {
  return leftCheckIn < rightCheckOut && leftCheckOut > rightCheckIn;
}

export function enumerateNights(checkIn: ISODateString, checkOut: ISODateString) {
  assertValidDateRange(checkIn, checkOut);

  const nights: ISODateString[] = [];
  let cursor = parseISODate(checkIn).getTime();
  const end = parseISODate(checkOut).getTime();

  while (cursor < end) {
    nights.push(new Date(cursor).toISOString().slice(0, 10) as ISODateString);
    cursor += DAY_MS;
  }

  return nights;
}

export function isWeekendNight(date: ISODateString) {
  const day = parseISODate(date).getUTCDay();
  return day === 5 || day === 6;
}
