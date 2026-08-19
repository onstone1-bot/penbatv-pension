import { z } from "zod";

export const roomTypeSchema = z.enum(["private_house", "glamping", "camp_site"]);

export const createAccommodationSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  area: z.string().min(1),
  address: z.string().nullable().optional(),
  concept: z.string().nullable().optional(),
  heroUrl: z.string().url().optional(),
  ownerName: z.string().min(1),
  ownerPhone: z.string().min(1),
  roomCount: z.number().int().min(0).default(0),
  minPrice: z.number().int().min(0).default(0),
  adPlan: z.enum(["basic", "youtube_boost", "premium"]).default("basic"),
  reservationMode: z.enum(["request", "instant", "hybrid"]).default("request"),
  commissionRate: z.number().min(0).max(30).default(8),
  tags: z.array(z.string()).default([]),
  featuredVideoUrl: z.string().url().or(z.literal("")).default(""),
  featuredVideoTitle: z.string().default("펜바TV 단독 촬영 영상"),
  status: z.enum(["draft", "review", "active", "paused"]).default("review")
});

export const updateAccommodationSchema = createAccommodationSchema
  .omit({ id: true, ownerName: true, ownerPhone: true })
  .partial()
  .extend({
    status: z.enum(["active", "hidden", "draft", "review", "paused"]).optional()
  });

export const createRoomSchema = z.object({
  id: z.string().min(1),
  accommodationId: z.string().min(1),
  name: z.string().min(1),
  type: roomTypeSchema,
  basePrice: z.number().int().min(0),
  weekendExtra: z.number().int().min(0).default(0),
  standardCapacity: z.number().int().min(1),
  maxCapacity: z.number().int().min(1),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  amenities: z.array(z.record(z.string(), z.unknown())).default([])
});

export const updateRoomSchema = createRoomSchema
  .omit({ id: true, accommodationId: true })
  .partial()
  .extend({
    status: z.enum(["active", "hidden"]).optional()
  });

export const createRoomImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isCover: z.boolean().default(false)
});

export const updateRoomImageSchema = createRoomImageSchema.partial();

export const createRoomRateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rateType: z.enum(["base", "seasonal", "special"]).default("seasonal"),
  nightlyPrice: z.number().int().min(0),
  weekendExtra: z.number().int().min(0).default(0),
  priority: z.number().int().default(0),
  memo: z.string().nullable().optional()
});

export const createBookingOptionSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().int().min(0),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(["active", "hidden"]).default("active")
});

export const createYoutubeCampaignSchema = z.object({
  code: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  title: z.string().min(1),
  videoUrl: z.string().url().or(z.literal("")).default(""),
  roomId: z.string().nullable().optional(),
  category: z.enum(["all", "exterior", "interior"]).default("all"),
  tag: z.string().min(1).default("YouTube"),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().url().or(z.literal("")).default(""),
  couponAmount: z.number().int().min(0).default(0),
  status: z.enum(["active", "ended"]).default("active")
});

export const createNaverLinkSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  accommodationId: z.string().min(1),
  roomId: z.string().nullable().optional(),
  type: z.enum(["blog", "review"]),
  title: z.string().min(1),
  url: z.string().url(),
  author: z.string().min(1).default("네이버"),
  excerpt: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(["active", "hidden"]).default("active")
});

export const createNearbyPlaceSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  accommodationId: z.string().min(1),
  type: z.enum(["attraction", "restaurant"]),
  name: z.string().min(1),
  category: z.string().min(1),
  address: z.string().nullable().optional(),
  distanceLabel: z.string().nullable().optional(),
  travelTime: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  url: z.string().url().or(z.literal("")).default(""),
  mapUrl: z.string().url().or(z.literal("")).default(""),
  imageUrl: z.string().url().or(z.string().startsWith("/")).or(z.literal("")).default(""),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(["active", "hidden"]).default("active")
});


export const createPartnerInquirySchema = z.object({
  stayName: z.string().min(1).max(80),
  area: z.string().min(1).max(80),
  ownerName: z.string().max(40).nullable().optional(),
  ownerPhone: z.string().min(8).max(30),
  email: z.string().email().or(z.literal("")).nullable().optional(),
  operationType: z.enum(["pension_bbq", "pension", "bbq", "glamping"]).default("pension_bbq"),
  roomCount: z.number().int().min(0).max(200).default(0),
  bbqType: z.string().max(80).nullable().optional(),
  externalChannels: z.array(z.string().min(1).max(30)).max(8).default([]),
  message: z.string().max(1000).nullable().optional(),
  source: z.string().max(60).default("partner_inquiry")
});

export const updateCustomerProfileSchema = z.object({
  name: z.string().min(1).max(40),
  phone: z.string().min(8).max(30),
  email: z.string().email().or(z.literal("")).nullable().optional(),
  notificationEnabled: z.boolean().default(true),
  cashReceiptType: z.enum(["none", "personal", "business"]).default("none"),
  cashReceiptValue: z.string().max(40).nullable().optional()
});
