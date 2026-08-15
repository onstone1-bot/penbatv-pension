# 고객 화면 API 매핑

대상 화면: `staylink-connected-camping.html` 시안  
대상 구현: `staylink-app`

## 1. 유튜브 랜딩

URL:

```text
/stays/baebang-alps?utm_source=youtube&utm_medium=video&utm_campaign=campheaven_room_01&room=A
```

처리:

- `/stays/[id]/page.tsx`에서 쿼리 파라미터를 읽는다.
- `StayLandingClient`가 예약 draft를 `localStorage`에 저장한다.
- `POST /api/utm-events`로 `landing_view` 이벤트를 저장한다.

## 2. 고객 홈

필요 API:

- `GET /api/accommodations/baebang-alps`
- `GET /api/accommodations/baebang-alps/rooms`
- `GET /api/accommodations/baebang-alps/options`

화면 매핑:

| 화면 요소 | API 필드 |
|---|---|
| 숙소명 | `accommodation.name` |
| 지역 | `accommodation.area` |
| 소개 | `accommodation.concept` |
| 방/사이트 카드 | `rooms[]` |
| 대표 이미지 | `rooms[].room_images[is_cover=true]` |
| 가격 | `rooms[].base_price`, `rooms[].room_rates` |
| 태그 | `rooms[].tags` |
| 옵션 선택 | `options[]` |

## 3. 방/사이트 상세

필요 API:

- `GET /api/rooms/A`
- `GET /api/availability?roomId=A&checkIn=2026-08-20&checkOut=2026-08-22`
- `GET /api/quote?roomId=A&checkIn=2026-08-20&checkOut=2026-08-22`

화면 매핑:

| 화면 요소 | API 필드 |
|---|---|
| 이미지 뷰어 | `room.room_images[]` |
| 설명 | `room.description` |
| 기본 요금 | `room.base_price` |
| 시즌/특가 요금 | `room.room_rates[]` |
| 날짜별 계산 | `quote.items[]` |
| 예약 가능 여부 | `availability.available` |

## 4. 예약 hold

API:

```http
POST /api/booking-holds
Content-Type: application/json

{
  "roomId": "A",
  "checkIn": "2026-08-20",
  "checkOut": "2026-08-22",
  "utmCode": "campheaven_room_01",
  "holdMinutes": 15
}
```

성공:

- `hold` 생성
- `quote` 반환
- 결제 준비 단계로 이동

충돌:

- `409 Conflict`
- `availability.blockedReason` 반환

## 5. 운영자 관리

운영자 API는 `x-admin-token` 헤더가 필요하다.

필수 API:

- `GET /api/host/rooms`
- `POST /api/host/rooms`
- `PATCH /api/host/rooms/:id`
- `POST /api/host/rooms/:id/images`
- `POST /api/host/rooms/:id/rates`

