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
  thumbnailUrl?: string;
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

export const baebangAlpsYoutubeLinks: PartnerVideoLink[] = [
  {
    title: "배방알프스 전체 공간 소개",
    url: "https://youtu.be/CGOBDAEbBqc?si=JWTxP0M5IANq39vC",
    tag: "롱폼",
    duration: "YouTube",
    thumbnailUrl: "https://img.youtube.com/vi/CGOBDAEbBqc/hqdefault.jpg",
    description: "유튜브 롱폼 영상에서 숙소 분위기를 확인하고 예약 화면으로 연결"
  },
  {
    title: "배방알프스 저수지 전망 쇼츠",
    url: "https://youtube.com/shorts/SLUDFGDzoZ4?si=U0vwkdsFVzgJCF34",
    tag: "Shorts",
    duration: "숏폼",
    thumbnailUrl: "https://img.youtube.com/vi/SLUDFGDzoZ4/hqdefault.jpg",
    description: "저수지와 산 풍경을 빠르게 보여주는 유튜브 쇼츠"
  },
  {
    title: "바베큐 마당 동선 쇼츠",
    url: "https://youtube.com/shorts/lVz-IlPW6VQ?si=XL6QDkUJ_yvLfJXS",
    tag: "BBQ",
    duration: "숏폼",
    thumbnailUrl: "https://img.youtube.com/vi/lVz-IlPW6VQ/hqdefault.jpg",
    description: "바베큐장 이용 전 마당과 외부 동선을 먼저 확인"
  },
  {
    title: "글램핑 감성 공간 쇼츠",
    url: "https://youtube.com/shorts/BMnTeq-tTO4?si=ykqRHyCeiKGHtFUt",
    tag: "공간",
    duration: "숏폼",
    thumbnailUrl: "https://img.youtube.com/vi/BMnTeq-tTO4/hqdefault.jpg",
    description: "글램핑 감성이 섞인 외부 공간을 영상으로 소개"
  },
  {
    title: "객실 내부 미리보기 쇼츠",
    url: "https://youtube.com/shorts/PkQPdz4WHps?si=9_eRkV4G0koGCuUF",
    tag: "객실",
    duration: "숏폼",
    thumbnailUrl: "https://img.youtube.com/vi/PkQPdz4WHps/hqdefault.jpg",
    description: "독채 객실 내부와 가족 이용 포인트를 짧게 확인"
  },
  {
    title: "야외 바베큐 감성 쇼츠",
    url: "https://youtube.com/shorts/FMibcJCCSx8?si=FWKicOupJBEzLghE",
    tag: "바베큐",
    duration: "숏폼",
    thumbnailUrl: "https://img.youtube.com/vi/FMibcJCCSx8/hqdefault.jpg",
    description: "숯불세트와 야외 바베큐 분위기를 예약 전에 확인"
  },
  {
    title: "간판과 진입로 쇼츠",
    url: "https://youtube.com/shorts/KDs0V0NGYTA?si=73c1245O_7C7GvL8",
    tag: "진입",
    duration: "숏폼",
    thumbnailUrl: "https://img.youtube.com/vi/KDs0V0NGYTA/hqdefault.jpg",
    description: "처음 방문 고객을 위한 간판, 진입로, 주차 동선 안내"
  },
  {
    title: "배방알프스 공간 투어",
    url: "https://youtu.be/prvj3pzAokA?si=4xrKXIZZD1Ppu_Xf",
    tag: "투어",
    duration: "YouTube",
    thumbnailUrl: "https://img.youtube.com/vi/prvj3pzAokA/hqdefault.jpg",
    description: "객실과 외부 공간을 이어서 보는 예약 전 확인 영상"
  },
  {
    title: "바베큐장 이용 안내 영상",
    url: "https://youtu.be/auNckmC4O1s?si=QRqRTmdQ8xgOeYFT",
    tag: "이용안내",
    duration: "YouTube",
    thumbnailUrl: "https://img.youtube.com/vi/auNckmC4O1s/hqdefault.jpg",
    description: "바베큐장 이용 방식과 옵션 결제로 이어지는 안내 영상"
  }
];

export const mockPartnerProperties: PartnerProperty[] = [
  {
    id: "baebang-alps",
    name: "배방 알프스",
    area: "충남 아산 배방",
    address: "충남 아산시 배방읍 고불로 31번길 38",
    concept: "숲과 계곡을 함께 즐기는 독채 펜션과 글램핑",
    rating: 4.8,
    reviewCount: 126,
    heroUrl: "/penba/sign.jpg",
    ownerName: "김대표",
    ownerPhone: "010-1234-5678",
    roomCount: 2,
    minPrice: 180000,
    adPlan: "youtube_boost",
    reservationMode: "hybrid",
    commissionRate: 8,
    status: "active",
    tags: ["유튜브 리뷰", "독채", "바비큐", "불멍"],
    featuredVideoUrl: baebangAlpsYoutubeLinks[0].url,
    featuredVideoTitle: baebangAlpsYoutubeLinks[0].title,
    videoLinks: baebangAlpsYoutubeLinks
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
      "/penba/glamping-yard.jpg",
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
      "/penba/reservoir.jpg",
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
