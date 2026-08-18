import { createBookingDraft } from "@/lib/booking-draft";
import { getStayPageData } from "@/lib/stay-page-data";
import { StayAppClient } from "./StayAppClient";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

function shouldOpenBooking(query: Record<string, string | string[] | undefined>) {
  const start = first(query.start);
  const medium = first(query.utm_medium);
  const campaign = first(query.utm_campaign);

  return (
    start === "booking" ||
    medium === "reservation_payment" ||
    medium === "interactive_booking_demo" ||
    campaign === "checkout"
  );
}

export default async function StayLandingPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const data = await getStayPageData(id);
  const draft = createBookingDraft({
    accommodationId: id,
    roomId: first(query.room),
    utmSource: first(query.utm_source),
    utmMedium: first(query.utm_medium),
    utmCampaign: first(query.utm_campaign)
  });

  return (
    <StayAppClient
      stay={data.stay}
      rooms={data.rooms}
      options={data.options}
      videos={data.videos}
      naverLinks={data.naverLinks}
      nearbyPlaces={data.nearbyPlaces}
      datePresets={data.datePresets}
      initialDraft={draft}
      initialScreen={shouldOpenBooking(query) ? "booking" : "home"}
      initialCheckIn={first(query.checkIn)}
      initialCheckOut={first(query.checkOut)}
      initialBookingMode={shouldOpenBooking(query) ? "instant" : "request"}
    />
  );
}
