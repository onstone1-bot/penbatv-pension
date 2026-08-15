import type { Stay } from "@/lib/mock-data";

export type PartnerStatus = "draft" | "review" | "active" | "paused";
export type AdPlan = "basic" | "youtube_boost" | "premium";
export type ReservationMode = "request" | "instant" | "hybrid";

export type PartnerVideoLink = {
  title: string;
  url: string;
  tag: string;
  duration: string;
  description: string;
};

export type PartnerProperty = Stay & {
  ownerName: string;
  ownerPhone: string;
  roomCount: number;
  minPrice: number;
  adPlan: AdPlan;
  reservationMode: ReservationMode;
  commissionRate: number;
  status: PartnerStatus;
  tags: string[];
  featuredVideoUrl: string;
  featuredVideoTitle: string;
  videoLinks: PartnerVideoLink[];
};

export const adPlanLabels: Record<AdPlan, string> = {
  basic: "기본 노출",
  youtube_boost: "유튜브 광고 연동",
  premium: "프리미엄 추천"
};

export const reservationModeLabels: Record<ReservationMode, string> = {
  request: "예약요청",
  instant: "바로결제",
  hybrid: "요청+바로결제"
};

export const partnerStatusLabels: Record<PartnerStatus, string> = {
  draft: "초안",
  review: "검수중",
  active: "노출중",
  paused: "중지"
};

export const mockPartnerProperties: PartnerProperty[] = [
  {
    id: "baebang-alps",
    name: "배방 알프스",
    area: "충남 아산 배방",
    address: "충남 아산시 배방읍 고불로 31번길 38",
    concept: "숲과 계곡을 함께 즐기는 독채 펜션과 글램핑",
    rating: 4.8,
    reviewCount: 126,
    heroUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    ownerName: "김대표",
    ownerPhone: "010-1234-5678",
    roomCount: 2,
    minPrice: 180000,
    adPlan: "youtube_boost",
    reservationMode: "hybrid",
    commissionRate: 8,
    status: "active",
    tags: ["유튜브 리뷰", "독채", "바비큐", "불멍"],
    featuredVideoUrl: "https://www.youtube.com/results?search_query=계곡+독채+펜션+바베큐",
    featuredVideoTitle: "계곡 옆 독채 바베큐 30초 투어",
    videoLinks: [
      {
        title: "계곡 옆 독채 바베큐 30초 투어",
        url: "https://www.youtube.com/results?search_query=계곡+독채+펜션+바베큐",
        tag: "숏폼",
        duration: "0:30",
        description: "유튜브 광고 첫 랜딩용 핵심 영상"
      },
      {
        title: "마당·불멍·바베큐장 동선 보기",
        url: "https://www.youtube.com/results?search_query=펜션+마당+불멍+바베큐",
        tag: "바베큐",
        duration: "1:12",
        description: "바베큐장 이용 시간 예약으로 연결"
      },
      {
        title: "가족 독채 객실 내부 투어",
        url: "https://www.youtube.com/results?search_query=가족+독채+펜션+객실+투어",
        tag: "객실",
        duration: "2:05",
        description: "객실 소개 후 달력 예약 화면으로 연결"
      }
    ]
  },
  {
    id: "river-forest-stay",
    name: "리버 포레스트 스테이",
    area: "강원 홍천",
    address: "강원 홍천군 서면 숲길 24",
    concept: "강변 데크와 가족형 객실을 묶은 주말 캠핑 펜션",
    rating: 4.7,
    reviewCount: 84,
    heroUrl:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1400&q=80",
    ownerName: "이대표",
    ownerPhone: "010-2233-8899",
    roomCount: 5,
    minPrice: 150000,
    adPlan: "premium",
    reservationMode: "instant",
    commissionRate: 10,
    status: "active",
    tags: ["강변", "가족", "바로결제", "프리미엄"],
    featuredVideoUrl: "https://www.youtube.com/results?search_query=강변+데크+펜션+가족여행",
    featuredVideoTitle: "강변 데크와 가족 객실 숏폼",
    videoLinks: [
      {
        title: "강변 데크와 가족 객실 숏폼",
        url: "https://www.youtube.com/results?search_query=강변+데크+펜션+가족여행",
        tag: "숏폼",
        duration: "0:45",
        description: "강변 전망과 객실 분위기를 빠르게 확인"
      },
      {
        title: "아이와 함께 쓰기 좋은 객실 소개",
        url: "https://www.youtube.com/results?search_query=아이와+펜션+가족+객실",
        tag: "가족",
        duration: "1:40",
        description: "가족 고객 타깃 예약 전환용 영상"
      },
      {
        title: "주말 바베큐 세트 이용 가이드",
        url: "https://www.youtube.com/results?search_query=펜션+바베큐+세트+가이드",
        tag: "바베큐",
        duration: "0:58",
        description: "숯·그릴 옵션 결제 화면으로 연결"
      }
    ]
  },
  {
    id: "ocean-cabin-house",
    name: "오션 캐빈 하우스",
    area: "경남 남해",
    address: "경남 남해군 바다로 17",
    concept: "바다 전망 객실과 숯불 바비큐를 강조한 감성 펜션",
    rating: 4.6,
    reviewCount: 57,
    heroUrl:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80",
    ownerName: "박대표",
    ownerPhone: "010-7788-1100",
    roomCount: 4,
    minPrice: 130000,
    adPlan: "basic",
    reservationMode: "request",
    commissionRate: 7,
    status: "review",
    tags: ["바다뷰", "예약요청", "커플", "바비큐"],
    featuredVideoUrl: "https://www.youtube.com/results?search_query=남해+바다뷰+펜션+캐빈",
    featuredVideoTitle: "남해 바다뷰 캐빈 미리보기",
    videoLinks: [
      {
        title: "남해 바다뷰 캐빈 미리보기",
        url: "https://www.youtube.com/results?search_query=남해+바다뷰+펜션+캐빈",
        tag: "오션뷰",
        duration: "0:36",
        description: "바다 전망 중심의 유튜브 유입 영상"
      },
      {
        title: "커플 여행 객실과 테라스 투어",
        url: "https://www.youtube.com/results?search_query=커플+여행+펜션+테라스",
        tag: "커플",
        duration: "1:25",
        description: "커플 고객 예약 요청으로 연결"
      },
      {
        title: "노을 바베큐장 예약 포인트",
        url: "https://www.youtube.com/results?search_query=노을+바베큐장+펜션",
        tag: "바베큐",
        duration: "0:52",
        description: "바베큐 타임슬롯 선택을 유도"
      }
    ]
  }
];

export function findPartnerProperty(id: string) {
  return mockPartnerProperties.find((property) => property.id === id);
}

export const penbaVideoFeed = mockPartnerProperties.flatMap((property) =>
  property.videoLinks.map((video) => ({
    ...video,
    propertyId: property.id,
    propertyName: property.name,
    area: property.area,
    heroUrl: property.heroUrl,
    reservationMode: property.reservationMode
  }))
);
