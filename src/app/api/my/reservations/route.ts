import { NextResponse } from "next/server";
import { getCustomerReservations } from "@/lib/customer-reservations";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const guestPhone = url.searchParams.get("phone");

  try {
    const result = await getCustomerReservations({
      guestPhone,
      limit: 20
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reservation lookup error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
