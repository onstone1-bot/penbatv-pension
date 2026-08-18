import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/database.types";
import {
  mockDatePresets,
  mockNearbyPlaces,
  mockOptions,
  mockNaverLinks,
  mockRooms,
  mockStay,
  mockVideos,
  type BookingOption,
  type DatePreset,
  type NaverLink,
  type NearbyPlace,
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
type NaverLinkRow = Database["public"]["Tables"]["naver_links"]["Row"];
type NearbyPlaceRow = Database["public"]["Tables"]["nearby_places"]["Row"];

export type StayPageData = {
  stay: Stay;
  rooms: Room[];
  options: BookingOption[];
  videos: YoutubeVideo[];
  naverLinks: NaverLink[];
  nearbyPlaces: NearbyPlace[];
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
    naverLinks: mockNaverLinks,
    nearbyPlaces: mockNearbyPlaces,
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

function mapNaverLink(row: NaverLinkRow, fallback?: NaverLink): NaverLink {
  return {
    id: row.id,
    accommodationId: row.accommodation_id,
    roomId: row.room_id ?? fallback?.roomId ?? null,
    type: row.link_type,
    title: row.title,
    url: row.url,
    author: textOr(row.author, fallback?.author ?? "네이버"),
    excerpt: textOr(row.excerpt, fallback?.excerpt ?? "네이버 외부 후기를 확인할 수 있습니다."),
    rating: row.rating ?? fallback?.rating ?? null,
    publishedAt: row.published_at ?? fallback?.publishedAt ?? null
  };
}

function mapNearbyPlace(row: NearbyPlaceRow, fallback?: NearbyPlace): NearbyPlace {
  return {
    id: row.id,
    accommodationId: row.accommodation_id,
    type: row.place_type,
    name: row.name,
    category: row.category,
    address: textOr(row.address, fallback?.address ?? ""),
    distanceLabel: textOr(row.distance_label, fallback?.distanceLabel ?? ""),
    travelTime: textOr(row.travel_time, fallback?.travelTime ?? ""),
    description: textOr(row.description, fallback?.description ?? "숙소 주변에서 함께 둘러보기 좋은 장소입니다."),
    url: row.url ?? fallback?.url ?? null,
    mapUrl: row.map_url ?? fallback?.mapUrl ?? null,
    imageUrl: row.image_url ?? fallback?.imageUrl ?? null
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
    const [stayResult, roomsResult, optionsResult, campaignsResult, naverLinksResult, nearbyPlacesResult] = await Promise.all([
      supabase.from("accommodations").select("*").eq("id", accommodationId).eq("status", "active").single(),
      supabase.from("rooms").select("*").eq("accommodation_id", accommodationId).eq("status", "active").order("name"),
      supabase
        .from("booking_options")
        .select("*")
        .eq("accommodation_id", accommodationId)
        .eq("status", "active")
        .order("sort_order"),
      supabase.from("youtube_campaigns").select("*").eq("status", "active").order("created_at"),
      supabase
        .from("naver_links")
        .select("*")
        .eq("accommodation_id", accommodationId)
        .eq("status", "active")
        .order("sort_order"),
      supabase
        .from("nearby_places")
        .select("*")
        .eq("accommodation_id", accommodationId)
        .eq("status", "active")
        .order("sort_order")
    ]);

    if (
      stayResult.error ||
      roomsResult.error ||
      optionsResult.error ||
      campaignsResult.error ||
      naverLinksResult.error ||
      nearbyPlacesResult.error
    ) {
      throw new Error(
        resultErrorMessage([
          stayResult.error,
          roomsResult.error,
          optionsResult.error,
          campaignsResult.error,
          naverLinksResult.error,
          nearbyPlacesResult.error
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
      naverLinks:
        naverLinksResult.data?.map((link) =>
          mapNaverLink(link, mockNaverLinks.find((fallback) => fallback.id === link.id))
        ) ?? mockNaverLinks,
      nearbyPlaces:
        nearbyPlacesResult.data?.map((place) =>
          mapNearbyPlace(place, mockNearbyPlaces.find((fallback) => fallback.id === place.id))
        ) ?? mockNearbyPlaces,
      datePresets: mockDatePresets,
      source: "supabase"
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Supabase data error";
    return fallbackData(accommodationId, reason);
  }
}
