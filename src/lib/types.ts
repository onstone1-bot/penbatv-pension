export type ISODateString = `${number}-${number}-${number}`;

export type AvailabilityReason = "confirmed_booking" | "active_hold" | "room_block";

export type AvailabilityResult = {
  roomId: string;
  checkIn: ISODateString;
  checkOut: ISODateString;
  available: boolean;
  blockedReason: AvailabilityReason | null;
};

export type StayLinkParams = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  roomId: string | null;
};
