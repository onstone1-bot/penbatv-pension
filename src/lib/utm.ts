import type { StayLinkParams } from "@/lib/types";

export function parseStayLinkParams(url: string | URL): StayLinkParams {
  const parsed = typeof url === "string" ? new URL(url) : url;
  const params = parsed.searchParams;

  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    roomId: params.get("room")
  };
}

export function parseStayLinkSearchParams(params: URLSearchParams): StayLinkParams {
  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    roomId: params.get("room")
  };
}

export function isYoutubeCampaign(code: string | null | undefined) {
  return Boolean(code && (code.startsWith("campheaven_") || code.startsWith("shorts_") || code.startsWith("roomtour_")));
}

export function buildStayLinkUrl(baseUrl: string, input: { campaignCode: string; roomId?: string }) {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", "youtube");
  url.searchParams.set("utm_medium", "video");
  url.searchParams.set("utm_campaign", input.campaignCode);

  if (input.roomId) {
    url.searchParams.set("room", input.roomId);
  }

  return url.toString();
}

export function normalizeCampaignCode(code: string | null | undefined) {
  return code?.trim() || null;
}
