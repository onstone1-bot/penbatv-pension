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
