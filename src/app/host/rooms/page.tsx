import { HostRoomsClient } from "./HostRoomsClient";
import { getStayPageData } from "@/lib/stay-page-data";

export const dynamic = "force-dynamic";

export default async function HostRoomsPage() {
  const data = await getStayPageData("baebang-alps");

  return (
    <HostRoomsClient
      initialStay={data.stay}
      initialRooms={data.rooms}
      initialOptions={data.options}
      initialVideos={data.videos}
      initialNaverLinks={data.naverLinks}
      initialNearbyPlaces={data.nearbyPlaces}
    />
  );
}
