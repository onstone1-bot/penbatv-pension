import type { SupabaseClient } from "@supabase/supabase-js";
import { enumerateNights, isWeekendNight } from "@/lib/date";
import type { Database } from "@/lib/supabase/database.types";
import type { ISODateString } from "@/lib/types";

type Client = SupabaseClient<Database>;
type RateRow = Database["public"]["Tables"]["room_rates"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];

function pickRateForNight(rates: RateRow[], date: ISODateString) {
  return rates
    .filter((rate) => rate.start_date <= date && rate.end_date >= date)
    .sort((a, b) => b.priority - a.priority)[0];
}

export function quoteRoomNights(input: {
  room: Pick<RoomRow, "base_price" | "weekend_extra">;
  rates: RateRow[];
  checkIn: ISODateString;
  checkOut: ISODateString;
}) {
  const nights = enumerateNights(input.checkIn, input.checkOut);
  const items = nights.map((date) => {
    const rate = pickRateForNight(input.rates, date);
    const nightlyPrice = rate?.nightly_price ?? input.room.base_price;
    const weekendExtra = isWeekendNight(date) ? rate?.weekend_extra ?? input.room.weekend_extra : 0;

    return {
      date,
      nightlyPrice,
      weekendExtra,
      amount: nightlyPrice + weekendExtra,
      rateType: rate?.rate_type ?? "base"
    };
  });

  return {
    nights: items.length,
    items,
    roomAmount: items.reduce((sum, item) => sum + item.amount, 0)
  };
}

export async function getRoomQuote(
  supabase: Client,
  roomId: string,
  checkIn: ISODateString,
  checkOut: ISODateString
) {
  const { data, error } = await supabase
    .from("rooms")
    .select("id, base_price, weekend_extra, room_rates(*)")
    .eq("id", roomId)
    .single();

  if (error) {
    throw error;
  }

  const room = data as unknown as Pick<RoomRow, "base_price" | "weekend_extra"> & {
    room_rates?: RateRow[];
  };

  return quoteRoomNights({
    room,
    rates: room.room_rates ?? [],
    checkIn,
    checkOut
  });
}
