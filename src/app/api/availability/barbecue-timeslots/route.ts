import { NextResponse } from "next/server";
import { checkBarbecueSlotAvailability, barbecueSlots } from "@/lib/core-features";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const startTime = url.searchParams.get("startTime");
  const endTime = url.searchParams.get("endTime");

  if (!date) {
    return NextResponse.json({ error: "date is required." }, { status: 400 });
  }

  if (startTime && endTime) {
    return NextResponse.json({
      availability: checkBarbecueSlotAvailability(date, startTime, endTime)
    });
  }

  return NextResponse.json({
    slots: barbecueSlots.filter((slot) => slot.date === date)
  });
}
