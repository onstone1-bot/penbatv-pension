import type { SupabaseClient } from "@supabase/supabase-js";
import { enumerateNights, isWeekendNight } from "@/lib/date";
import type { Database } from "@/lib/supabase/database.types";
import type { ISODateString } from "@/lib/types";

type Client = SupabaseClient<Database>;
type RateRow = Database["public"]["Tables"]["room_rates"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type OptionRow = Database["public"]["Tables"]["booking_options"]["Row"];
type CampaignRow = Database["public"]["Tables"]["youtube_campaigns"]["Row"];

const DEFAULT_EXTRA_ADULT_PRICE = 20000;
const DEFAULT_EXTRA_CHILD_PRICE = 10000;

export type QuoteOptionItem = {
  optionId: string;
  quantity: number;
};

export type RoomQuoteInput = {
  roomId: string;
  checkIn: ISODateString;
  checkOut: ISODateString;
  adultCount?: number;
  childCount?: number;
  optionItems?: QuoteOptionItem[];
  utmCode?: string | null;
  utmCampaign?: string | null;
};

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

function normalizeOptionItems(items: QuoteOptionItem[] = []) {
  return items
    .map((item) => ({
      optionId: item.optionId,
      quantity: Math.max(1, Math.trunc(item.quantity || 1))
    }))
    .filter((item) => item.optionId);
}

function calculateGuestAmount(input: {
  adultCount: number;
  childCount: number;
  standardCapacity: number;
  extraAdultPrice?: number | null;
  extraChildPrice?: number | null;
}) {
  const adultCount = Math.max(1, input.adultCount);
  const childCount = Math.max(0, input.childCount);
  const totalGuests = adultCount + childCount;
  const extraGuestCount = Math.max(0, totalGuests - input.standardCapacity);

  if (extraGuestCount === 0) {
    return {
      baseGuestCount: Math.min(totalGuests, input.standardCapacity),
      extraGuestCount: 0,
      guestAmount: 0
    };
  }

  const includedAdults = Math.min(adultCount, input.standardCapacity);
  const includedChildren = Math.max(0, input.standardCapacity - includedAdults);
  const extraAdultCount = Math.max(0, adultCount - includedAdults);
  const extraChildCount = Math.max(0, childCount - includedChildren);
  const adultPrice = input.extraAdultPrice ?? DEFAULT_EXTRA_ADULT_PRICE;
  const childPrice = input.extraChildPrice ?? DEFAULT_EXTRA_CHILD_PRICE;

  return {
    baseGuestCount: input.standardCapacity,
    extraGuestCount,
    extraAdultCount,
    extraChildCount,
    guestAmount: extraAdultCount * adultPrice + extraChildCount * childPrice
  };
}

async function getOptionQuote(
  supabase: Client,
  accommodationId: string,
  optionItems: QuoteOptionItem[]
) {
  const normalizedItems = normalizeOptionItems(optionItems);

  if (normalizedItems.length === 0) {
    return {
      optionItems: [],
      optionAmount: 0
    };
  }

  const ids = [...new Set(normalizedItems.map((item) => item.optionId))];
  const { data, error } = await supabase
    .from("booking_options")
    .select("id, name, price")
    .eq("accommodation_id", accommodationId)
    .eq("status", "active")
    .in("id", ids);

  if (error) throw error;

  const optionById = new Map((data as Pick<OptionRow, "id" | "name" | "price">[]).map((option) => [option.id, option]));
  const quotedItems = normalizedItems.map((item) => {
    const option = optionById.get(item.optionId);

    if (!option) {
      throw new Error(`Invalid booking option: ${item.optionId}`);
    }

    return {
      optionId: option.id,
      name: option.name,
      quantity: item.quantity,
      unitPrice: option.price,
      amount: option.price * item.quantity
    };
  });

  return {
    optionItems: quotedItems,
    optionAmount: quotedItems.reduce((sum, item) => sum + item.amount, 0)
  };
}

async function getYoutubeDiscount(
  supabase: Client,
  roomId: string,
  code: string | null | undefined
) {
  if (!code) return null;

  const { data, error } = await supabase
    .from("youtube_campaigns")
    .select("code, title, room_id, coupon_amount")
    .eq("code", code)
    .eq("status", "active");

  if (error) throw error;
  const campaign = (data as Pick<CampaignRow, "code" | "title" | "room_id" | "coupon_amount">[]).find(
    (item) => item.room_id === roomId || item.room_id === null
  );

  if (!campaign) return null;

  return {
    code: campaign.code,
    title: campaign.title,
    amount: campaign.coupon_amount
  };
}

export async function getRoomQuote(supabase: Client, input: RoomQuoteInput) {
  const { data, error } = await supabase
    .from("rooms")
    .select("id, accommodation_id, base_price, weekend_extra, standard_capacity, max_capacity, room_rates(*)")
    .eq("id", input.roomId)
    .single();

  if (error) {
    throw error;
  }

  const room = data as unknown as Pick<
    RoomRow,
    "id" | "accommodation_id" | "base_price" | "weekend_extra" | "standard_capacity" | "max_capacity"
  > & {
    extra_adult_price?: number | null;
    extra_child_price?: number | null;
    room_rates?: RateRow[];
  };
  const adultCount = Math.max(1, input.adultCount ?? 1);
  const childCount = Math.max(0, input.childCount ?? 0);
  const totalGuests = adultCount + childCount;

  if (totalGuests > room.max_capacity) {
    throw new Error(`Selected guest count exceeds max capacity ${room.max_capacity}.`);
  }

  const roomQuote = quoteRoomNights({
    room,
    rates: room.room_rates ?? [],
    checkIn: input.checkIn,
    checkOut: input.checkOut
  });
  const guestQuote = calculateGuestAmount({
    adultCount,
    childCount,
    standardCapacity: room.standard_capacity,
    extraAdultPrice: room.extra_adult_price,
    extraChildPrice: room.extra_child_price
  });
  const optionQuote = await getOptionQuote(supabase, room.accommodation_id, input.optionItems ?? []);
  const discount = await getYoutubeDiscount(supabase, room.id, input.utmCode ?? input.utmCampaign);
  const discountAmount = Math.min(discount?.amount ?? 0, roomQuote.roomAmount + guestQuote.guestAmount + optionQuote.optionAmount);
  const totalAmount = Math.max(
    0,
    roomQuote.roomAmount + guestQuote.guestAmount + optionQuote.optionAmount - discountAmount
  );

  return {
    roomId: room.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adultCount,
    childCount,
    nights: roomQuote.nights,
    items: roomQuote.items,
    roomAmount: roomQuote.roomAmount,
    baseGuestCount: guestQuote.baseGuestCount,
    extraGuestCount: guestQuote.extraGuestCount,
    guestAmount: guestQuote.guestAmount,
    optionItems: optionQuote.optionItems,
    optionAmount: optionQuote.optionAmount,
    discount,
    discountAmount,
    totalAmount,
    priceAuthority: "server"
  };
}
