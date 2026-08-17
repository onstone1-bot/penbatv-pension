import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/database.types";
import {
  mockDatePresets,
  mockOptions,
  mockRooms,
  mockStay,
  mockVideos,
  type BookingOption,
  type DatePreset,
  type Room,
  type RoomImage,
  type RoomRate,
  type Stay,
  type YoutubeVideo
} from "@/lib/mock-data";
import { findPartnerProperty } from "@/lib/platform-data";

type AccommodationRow = Database["public"]["Tables"]["accommodations"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type RoomImageRow = Database["public"]["Tables"]["room_images"]["Row"];
type RoomRateRow = Database["public"]["Tables"]["room_rates"]["Row"];
type BookingOptionRow = Database["public"]["Tables"]["booking_options"]["Row"];
type YoutubeCampaignRow = Database["public"]["Tables"]["youtube_campaigns"]["Row"];

export type StayPageData = {
  stay: Stay;
  rooms: Room[];
  options: BookingOption[];
  videos: YoutubeVideo[];
  datePresets: DatePreset[];
  source: "supabase" | "mock";
  fallbackReason?: string;
};

function fallbackData(accommodationId: string, reason?: string): StayPageData {
  const partner = findPartnerProperty(accommodationId);

  return {
    stay: partner ?? { ...mockStay, id: accommodationId },
    rooms: mockRooms,
    options: mockOptions,
    videos: mockVideos,
    datePresets: mockDatePresets,
    source: "mock",
    fallbackReason: reason
  };
}

function textOr(value: string | null | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAmenities(value: Json): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (isRecord(item) && typeof item.name === "string") return item.name;
      return null;
    })
    .filter((item): item is string => Boolean(item));
}

function usableImageUrl(url: string, fallbackUrl?: string) {
  return url.startsWith("https://example.com/") ? fallbackUrl ?? url : url;
}

function youtubeThumb(url: string | null | undefined) {
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  return match?.[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : undefined;
}

function mapImage(row: RoomImageRow, fallback?: RoomImage): RoomImage {
  return {
    url: usableImageUrl(row.url, fallback?.url),
    caption: row.caption ?? fallback?.caption ?? "",
    isCover: row.is_cover
  };
}

function mapRate(row: RoomRateRow): RoomRate {
  return {
    startDate: row.start_date,
    endDate: row.end_date,
    rateType: row.rate_type,
    nightlyPrice: row.nightly_price,
    weekendExtra: row.weekend_extra,
    priority: row.priority
  };
}

function mapRoom(row: RoomRow, images: RoomImageRow[], rates: RoomRateRow[], fallback?: Room): Room {
  const roomImages = images
    .filter((image) => image.room_id === row.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image, index) => mapImage(image, fallback?.images[index]));

  const roomRates = rates
    .filter((rate) => rate.room_id === row.id)
    .sort((a, b) => b.priority - a.priority)
    .map(mapRate);

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    basePrice: row.base_price,
    weekendExtra: row.weekend_extra,
    standardCapacity: row.standard_capacity,
    maxCapacity: row.max_capacity,
    description: textOr(row.description, fallback?.description ?? ""),
    tags: row.tags,
    amenities: normalizeAmenities(row.amenities),
    images: roomImages.length > 0 ? roomImages : fallback?.images ?? [],
    rates: roomRates.length > 0 ? roomRates : fallback?.rates ?? []
  };
}

function mapOption(row: BookingOptionRow, fallback?: BookingOption): BookingOption {
  return {
    id: row.id,
    name: row.name,
    description: textOr(row.description, fallback?.description ?? ""),
    price: row.price
  };
}

function mapVideo(row: YoutubeCampaignRow, fallback?: YoutubeVideo, firstRoomId?: string): YoutubeVideo {
  return {
    code: row.code,
    title: row.title,
    url: row.video_url ?? fallback?.url,
    thumbnailUrl: row.thumbnail_url ?? youtubeThumb(row.video_url) ?? fallback?.thumbnailUrl,
    tag: textOr(row.tag, fallback?.tag ?? "YouTube"),
    category: row.category ?? fallback?.category ?? "all",
    description: textOr(row.description, fallback?.description ?? "Video linked booking campaign"),
    roomId: row.room_id ?? fallback?.roomId ?? firstRoomId ?? ""
  };
}

function mapStay(row: AccommodationRow, accommodationId: string, rooms: Room[]): Stay {
  const firstCover = rooms.flatMap((room) => room.images).find((image) => image.isCover)?.url;

  return {
    id: accommodationId,
    name: row.name,
    area: row.area,
    address: row.address ?? "",
    concept: row.concept ?? "",
    rating: row.rating,
    reviewCount: row.review_count,
    heroUrl: firstCover ?? mockStay.heroUrl
  };
}

function resultErrorMessage(errors: Array<Error | null>) {
  return errors.find(Boolean)?.message ?? "Supabase data is unavailable.";
}

export async function getStayPageData(accommodationId: string): Promise<StayPageData> {
  try {
    const supabase = await createClient();
    const [stayResult, roomsResult, optionsResult, campaignsResult] = await Promise.all([
      supabase.from("accommodations").select("*").eq("id", accommodationId).eq("status", "active").single(),
      supabase.from("rooms").select("*").eq("accommodation_id", accommodationId).eq("status", "active").order("name"),
      supabase
        .from("booking_options")
        .select("*")
        .eq("accommodation_id", accommodationId)
        .eq("status", "active")
        .order("sort_order"),
      supabase.from("youtube_campaigns").select("*").eq("status", "active").order("created_at")
    ]);

    if (stayResult.error || roomsResult.error || optionsResult.error || campaignsResult.error) {
      throw new Error(
        resultErrorMessage([
          stayResult.error,
          roomsResult.error,
          optionsResult.error,
          campaignsResult.error
        ])
      );
    }

    if (!stayResult.data || !roomsResult.data || roomsResult.data.length === 0) {
      throw new Error("Supabase returned no active stay or room data.");
    }

    const roomIds = roomsResult.data.map((room) => room.id);
    const [imagesResult, ratesResult] = await Promise.all([
      supabase.from("room_images").select("*").in("room_id", roomIds).order("sort_order"),
      supabase.from("room_rates").select("*").in("room_id", roomIds).order("priority", { ascending: false })
    ]);

    if (imagesResult.error || ratesResult.error) {
      throw new Error(resultErrorMessage([imagesResult.error, ratesResult.error]));
    }

    const rooms = roomsResult.data.map((room) =>
      mapRoom(
        room,
        imagesResult.data ?? [],
        ratesResult.data ?? [],
        mockRooms.find((fallback) => fallback.id === room.id)
      )
    );

    return {
      stay: mapStay(stayResult.data, accommodationId, rooms),
      rooms,
      options:
        optionsResult.data?.map((option) =>
          mapOption(option, mockOptions.find((fallback) => fallback.id === option.id))
        ) ?? mockOptions,
      videos:
        campaignsResult.data?.map((campaign) =>
          mapVideo(campaign, mockVideos.find((fallback) => fallback.code === campaign.code), rooms[0]?.id)
        ) ?? mockVideos,
      datePresets: mockDatePresets,
      source: "supabase"
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Supabase data error";
    return fallbackData(accommodationId, reason);
  }
}
