import { mockPartnerProperties } from "@/lib/platform-data";
import { createAdminClient } from "@/lib/supabase/admin";

export type CustomerPreferenceSummary = {
  notificationEnabled: boolean;
  cashReceiptType: "none" | "personal" | "business";
  cashReceiptValue: string | null;
  defaultAdultCount: number;
  defaultChildCount: number;
};

export type CustomerStaySummary = {
  id: string;
  name: string;
  area: string;
  heroUrl: string;
  source: string;
  createdAt: string;
  lastViewedAt?: string;
  viewCount?: number;
};

type RawCustomerPreferences = {
  notification_enabled: boolean;
  cash_receipt_type: CustomerPreferenceSummary["cashReceiptType"];
  cash_receipt_value: string | null;
  default_adult_count: number;
  default_child_count: number;
};

type RawFavoriteStay = {
  id: string;
  accommodation_id: string;
  source: string;
  created_at: string;
};

type RawRecentStay = RawFavoriteStay & {
  view_count: number;
  last_viewed_at: string;
};

type RawAccommodation = {
  id: string;
  name: string;
  area: string;
};

const defaultPreferences: CustomerPreferenceSummary = {
  notificationEnabled: true,
  cashReceiptType: "none",
  cashReceiptValue: null,
  defaultAdultCount: 2,
  defaultChildCount: 0
};

function mockStayMap() {
  return new Map(mockPartnerProperties.map((stay) => [stay.id, stay]));
}

function stayFallback(id: string) {
  const found = mockStayMap().get(id);

  return {
    id,
    name: found?.name ?? id,
    area: found?.area ?? "지역 확인 필요",
    heroUrl: found?.heroUrl ?? "/penba/sign.jpg"
  };
}

export async function getCustomerEngagement(customerId: string | null | undefined) {
  if (!customerId) {
    return {
      preferences: defaultPreferences,
      favorites: mockPartnerProperties.slice(0, 3).map((stay) => ({
        id: stay.id,
        name: stay.name,
        area: stay.area,
        heroUrl: stay.heroUrl,
        source: "demo",
        createdAt: new Date(0).toISOString()
      })),
      recentStays: [] as CustomerStaySummary[]
    };
  }

  const supabase = createAdminClient() as any;
  const [preferencesResult, favoritesResult, recentResult] = await Promise.all([
    supabase
      .from("customer_preferences")
      .select("notification_enabled, cash_receipt_type, cash_receipt_value, default_adult_count, default_child_count")
      .eq("customer_id", customerId)
      .maybeSingle(),
    supabase
      .from("customer_favorites")
      .select("id, accommodation_id, source, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("customer_recent_stays")
      .select("id, accommodation_id, source, view_count, last_viewed_at, created_at")
      .eq("customer_id", customerId)
      .order("last_viewed_at", { ascending: false })
      .limit(10)
  ]);

  if (preferencesResult.error) throw preferencesResult.error;
  if (favoritesResult.error) throw favoritesResult.error;
  if (recentResult.error) throw recentResult.error;

  const favoriteRows = (favoritesResult.data ?? []) as RawFavoriteStay[];
  const recentRows = (recentResult.data ?? []) as RawRecentStay[];
  const accommodationIds = Array.from(
    new Set([
      ...favoriteRows.map((row) => row.accommodation_id),
      ...recentRows.map((row) => row.accommodation_id)
    ])
  );
  const accommodationResult =
    accommodationIds.length > 0
      ? await supabase.from("accommodations").select("id, name, area").in("id", accommodationIds)
      : { data: [], error: null };

  if (accommodationResult.error) throw accommodationResult.error;

  const accommodationRows = (accommodationResult.data ?? []) as RawAccommodation[];
  const accommodationById = new Map(accommodationRows.map((stay) => [stay.id, stay]));
  const rawPreferences = preferencesResult.data as RawCustomerPreferences | null;
  const preferences = rawPreferences
    ? {
        notificationEnabled: rawPreferences.notification_enabled,
        cashReceiptType: rawPreferences.cash_receipt_type,
        cashReceiptValue: rawPreferences.cash_receipt_value,
        defaultAdultCount: rawPreferences.default_adult_count,
        defaultChildCount: rawPreferences.default_child_count
      }
    : defaultPreferences;

  return {
    preferences,
    favorites: favoriteRows.map((row) => {
      const fallback = stayFallback(row.accommodation_id);
      const stay = accommodationById.get(row.accommodation_id);

      return {
        id: row.accommodation_id,
        name: stay?.name ?? fallback.name,
        area: stay?.area ?? fallback.area,
        heroUrl: fallback.heroUrl,
        source: row.source,
        createdAt: row.created_at
      };
    }),
    recentStays: recentRows.map((row) => {
      const fallback = stayFallback(row.accommodation_id);
      const stay = accommodationById.get(row.accommodation_id);

      return {
        id: row.accommodation_id,
        name: stay?.name ?? fallback.name,
        area: stay?.area ?? fallback.area,
        heroUrl: fallback.heroUrl,
        source: row.source,
        createdAt: row.created_at,
        lastViewedAt: row.last_viewed_at,
        viewCount: row.view_count
      };
    })
  };
}
