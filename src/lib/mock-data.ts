export type Stay = {
  id: string;
  name: string;
  area: string;
  address: string;
  concept: string;
  rating: number;
  reviewCount: number;
  heroUrl: string;
  featuredVideoUrl?: string;
  featuredVideoTitle?: string;
};

export type RoomImage = {
  url: string;
  caption: string;
  isCover: boolean;
};

export type RoomRate = {
  startDate: string;
  endDate: string;
  rateType: "base" | "seasonal" | "special";
  nightlyPrice: number;
  weekendExtra: number;
  priority: number;
};

export type Room = {
  id: string;
  name: string;
  type: "private_house" | "glamping" | "camp_site";
  basePrice: number;
  weekendExtra: number;
  standardCapacity: number;
  maxCapacity: number;
  description: string;
  tags: string[];
  amenities: string[];
  images: RoomImage[];
  rates: RoomRate[];
};

export type BookingOption = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type YoutubeVideo = {
  code: string;
  url?: string;
  thumbnailUrl?: string;
  title: string;
  tag: string;
  category: "all" | "exterior" | "interior";
  description: string;
  roomId: string;
};

export type DatePreset = {
  id: string;
  checkIn: string;
  checkOut: string;
  label: string;
};

export const mockStay: Stay = {
  id: "baebang-alps",
  name: "배방알프스",
  area: "충남 아산 배방",
  address: "충남 아산시 배방읍 고불로231번길 38",
  concept: "수철저수지를 마주 보는 독채와 소나무 정원 속 글램핑",
  rating: 4.8,
  reviewCount: 126,
  heroUrl: "/penba/sign.jpg",
  featuredVideoUrl: "https://youtu.be/CGOBDAEbBqc?si=JWTxP0M5IANq39vC",
  featuredVideoTitle: "배방알프스 전체 공간 소개"
};

export const mockRooms: Room[] = [
  {
    id: "A",
    name: "독채펜션",
    type: "private_house",
    basePrice: 250000,
    weekendExtra: 100000,
    standardCapacity: 6,
    maxCapacity: 10,
    description:
      "저수지 통창 목조 독채와 개별 바비큐장을 갖춘 단체형 공간입니다. 영상에서 본 거실, 주방, 야외 데크 동선 그대로 예약할 수 있습니다.",
    tags: ["수철저수지 통창", "화목난로", "단체 모임", "개별 바비큐"],
    amenities: ["화목난로", "노래방 음향", "주방", "개별 바비큐", "주차 4대"],
    images: [
      {
        url: "/penba/interior-3.jpg",
        caption: "독채펜션 외부",
        isCover: true
      },
      {
        url: "/penba/interior-2.jpg",
        caption: "통창 거실",
        isCover: false
      }
    ],
    rates: [
      {
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        rateType: "base",
        nightlyPrice: 250000,
        weekendExtra: 100000,
        priority: 0
      },
      {
        startDate: "2026-07-15",
        endDate: "2026-08-31",
        rateType: "seasonal",
        nightlyPrice: 300000,
        weekendExtra: 120000,
        priority: 10
      }
    ]
  },
  {
    id: "B",
    name: "돔 글램핑",
    type: "glamping",
    basePrice: 180000,
    weekendExtra: 60000,
    standardCapacity: 2,
    maxCapacity: 4,
    description:
      "소나무 정원 속 개별 화로대가 있는 돔 글램핑입니다. 커플, 친구 여행, 짧은 불멍 숙박에 맞춘 공간입니다.",
    tags: ["돔 글램핑", "개별 화로대", "불멍", "커플"],
    amenities: ["개별 화로대", "냉난방", "무선 인터넷", "공용 샤워실", "주차 1대"],
    images: [
      {
        url: "/penba/glamping-yard.jpg",
        caption: "돔 글램핑 전경",
        isCover: true
      },
      {
        url: "/penba/bbq-deck.jpg",
        caption: "야간 불멍",
        isCover: false
      }
    ],
    rates: [
      {
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        rateType: "base",
        nightlyPrice: 180000,
        weekendExtra: 60000,
        priority: 0
      },
      {
        startDate: "2026-07-15",
        endDate: "2026-08-31",
        rateType: "seasonal",
        nightlyPrice: 220000,
        weekendExtra: 80000,
        priority: 10
      }
    ]
  }
];

export const mockOptions: BookingOption[] = [
  {
    id: "bbq",
    name: "참숯 바비큐 세트",
    description: "참숯, 그릴, 집게 포함",
    price: 30000
  },
  {
    id: "fire",
    name: "불멍 장작 세트",
    description: "장작 10kg, 착화제 포함",
    price: 15000
  },
  {
    id: "early",
    name: "얼리 체크인",
    description: "13시 입실",
    price: 20000
  }
];

export const mockVideos: YoutubeVideo[] = [
  {
    code: "campheaven_room_01",
    url: "https://youtu.be/CGOBDAEbBqc?si=JWTxP0M5IANq39vC",
    thumbnailUrl: "https://img.youtube.com/vi/CGOBDAEbBqc/hqdefault.jpg",
    title: "배방알프스 전체 공간 소개",
    tag: "대표 영상",
    category: "all",
    description: "입구, 주차, 방 내부, 개별 바비큐 동선을 영상처럼 먼저 확인",
    roomId: "A"
  },
  {
    code: "campheaven_reservoir_01",
    url: "https://youtube.com/shorts/SLUDFGDzoZ4?si=U0vwkdsFVzgJCF34",
    thumbnailUrl: "https://img.youtube.com/vi/SLUDFGDzoZ4/hqdefault.jpg",
    title: "저수지 전망과 외부 동선 쇼츠",
    tag: "외부",
    category: "exterior",
    description: "저수지 전망, 진입로, 마당 분위기를 짧은 영상으로 확인",
    roomId: "A"
  },
  {
    code: "campheaven_bbq_01",
    url: "https://youtube.com/shorts/lVz-IlPW6VQ?si=XL6QDkUJ_yvLfJXS",
    thumbnailUrl: "https://img.youtube.com/vi/lVz-IlPW6VQ/hqdefault.jpg",
    title: "바베큐 마당 동선 쇼츠",
    tag: "인기 쇼츠",
    category: "exterior",
    description: "저녁 조리 동선과 화로대 간격을 보고 바로 예약으로 연결",
    roomId: "B"
  },
  {
    code: "campheaven_glamping_01",
    url: "https://youtube.com/shorts/BMnTeq-tTO4?si=ykqRHyCeiKGHtFUt",
    thumbnailUrl: "https://img.youtube.com/vi/BMnTeq-tTO4/hqdefault.jpg",
    title: "글램핑 감성 공간 쇼츠",
    tag: "외부",
    category: "exterior",
    description: "돔 글램핑과 야외 데크, 소나무 정원 분위기를 먼저 확인",
    roomId: "B"
  },
  {
    code: "campheaven_room_inside_01",
    url: "https://youtube.com/shorts/PkQPdz4WHps?si=9_eRkV4G0koGCuUF",
    thumbnailUrl: "https://img.youtube.com/vi/PkQPdz4WHps/hqdefault.jpg",
    title: "객실 내부 미리보기 쇼츠",
    tag: "내부",
    category: "interior",
    description: "거실, 통창, 목조 인테리어, 가족방 구조를 객실 선택 전에 확인",
    roomId: "A"
  },
  {
    code: "campheaven_bbq_night_01",
    url: "https://youtube.com/shorts/FMibcJCCSx8?si=FWKicOupJBEzLghE",
    thumbnailUrl: "https://img.youtube.com/vi/FMibcJCCSx8/hqdefault.jpg",
    title: "야외 바베큐 감성 쇼츠",
    tag: "외부",
    category: "exterior",
    description: "바비큐장 테이블, 화로대, 저녁 분위기를 예약 전에 확인",
    roomId: "B"
  },
  {
    code: "campheaven_route_01",
    url: "https://youtube.com/shorts/KDs0V0NGYTA?si=73c1245O_7C7GvL8",
    thumbnailUrl: "https://img.youtube.com/vi/KDs0V0NGYTA/hqdefault.jpg",
    title: "간판과 진입로 쇼츠",
    tag: "처음 방문",
    category: "exterior",
    description: "체크인, 샤워실, 분리수거, 주변 산책 코스를 짧게 확인",
    roomId: "A"
  },
  {
    code: "campheaven_tour_01",
    url: "https://youtu.be/prvj3pzAokA?si=4xrKXIZZD1Ppu_Xf",
    thumbnailUrl: "https://img.youtube.com/vi/prvj3pzAokA/hqdefault.jpg",
    title: "배방알프스 공간 투어",
    tag: "전체",
    category: "all",
    description: "전체 시설을 둘러본 뒤 고객 홈에서 원하는 객실로 이동",
    roomId: "A"
  },
  {
    code: "campheaven_guide_01",
    url: "https://youtu.be/auNckmC4O1s?si=QRqRTmdQ8xgOeYFT",
    thumbnailUrl: "https://img.youtube.com/vi/auNckmC4O1s/hqdefault.jpg",
    title: "바베큐장 이용 안내 영상",
    tag: "내부",
    category: "interior",
    description: "객실 이용 안내와 바비큐장 예약 전 확인해야 할 이용 기준",
    roomId: "B"
  }
];

export const mockDatePresets: DatePreset[] = [
  {
    id: "d1",
    checkIn: "2026-08-20",
    checkOut: "2026-08-22",
    label: "08.20 목 - 08.22 토 · 2박"
  },
  {
    id: "d2",
    checkIn: "2026-08-28",
    checkOut: "2026-08-29",
    label: "08.28 금 - 08.29 토 · 1박"
  },
  {
    id: "d3",
    checkIn: "2026-09-05",
    checkOut: "2026-09-07",
    label: "09.05 토 - 09.07 월 · 2박"
  }
];
