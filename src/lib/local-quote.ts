import { enumerateNights, isWeekendNight } from "@/lib/date";
import type { BookingOption, Room } from "@/lib/mock-data";
import type { ISODateString } from "@/lib/types";

export function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function rateForDate(room: Room, date: ISODateString) {
  return room.rates
    .filter((rate) => rate.startDate <= date && rate.endDate >= date)
    .sort((a, b) => b.priority - a.priority)[0];
}

export function quoteLocalRoom(room: Room, checkIn: ISODateString, checkOut: ISODateString) {
  const nights = enumerateNights(checkIn, checkOut);
  const items = nights.map((date) => {
    const rate = rateForDate(room, date);
    const nightlyPrice = rate?.nightlyPrice ?? room.basePrice;
    const weekendExtra = isWeekendNight(date) ? rate?.weekendExtra ?? room.weekendExtra : 0;

    return {
      date,
      nightlyPrice,
      weekendExtra,
      amount: nightlyPrice + weekendExtra
    };
  });

  return {
    nights: items.length,
    items,
    roomAmount: items.reduce((sum, item) => sum + item.amount, 0)
  };
}

export function quoteOptions(options: BookingOption[], selectedOptionIds: string[]) {
  return options
    .filter((option) => selectedOptionIds.includes(option.id))
    .reduce((sum, option) => sum + option.price, 0);
}

export function youtubeCoupon(utmCode: string | null) {
  if (!utmCode) return 0;
  return utmCode.startsWith("campheaven_") || utmCode.startsWith("shorts_") || utmCode.startsWith("roomtour_")
    ? 10000
    : 0;
}
