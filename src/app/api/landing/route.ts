import { NextResponse } from "next/server";
import { createBookingDraft } from "@/lib/booking-draft";
import { parseStayLinkSearchParams } from "@/lib/utm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accommodationId = url.searchParams.get("stay") ?? "baebang-alps";
  const params = parseStayLinkSearchParams(url.searchParams);

  return NextResponse.json({
    draft: createBookingDraft({ ...params, accommodationId })
  });
}
