import type { StayLinkParams } from "@/lib/types";

export type BookingDraft = {
  accommodationId: string;
  roomId: string | null;
  utmCode: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  createdAt: string;
};

export function createBookingDraft(input: StayLinkParams & { accommodationId: string }): BookingDraft {
  return {
    accommodationId: input.accommodationId,
    roomId: input.roomId,
    utmCode: input.utmCampaign,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    createdAt: new Date().toISOString()
  };
}

export function serializeBookingDraft(draft: BookingDraft) {
  return JSON.stringify(draft);
}

export function parseBookingDraft(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(value) as BookingDraft;
  } catch {
    return null;
  }
}
