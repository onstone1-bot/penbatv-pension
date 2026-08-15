# API 명세 초안

## 고객 API

### `GET /api/accommodations/:id`

숙소 기본 정보를 조회한다.

응답:

```json
{
  "accommodation": {
    "id": "baebang-alps",
    "name": "배방알프스",
    "area": "충남 아산 배방",
    "concept": "수철저수지를 마주 보는 독채와 소나무 정원 속 글램핑"
  }
}
```

### `GET /api/accommodations/:id/rooms`

숙소의 방/사이트 목록, 이미지, 요금 규칙을 조회한다.

### `GET /api/accommodations/:id/options`

예약 옵션 목록을 조회한다.

### `GET /api/rooms/:id`

방/사이트 상세 정보를 조회한다.

### `GET /api/availability`

쿼리:

- `roomId`
- `accommodationId`
- `checkIn`
- `checkOut`

`roomId`가 있으면 단일 방/사이트 가능 여부를 반환하고, `accommodationId`가 있으면 해당 숙소의 방/사이트별 가능 여부를 반환한다.

### `GET /api/quote`

쿼리:

- `roomId`
- `checkIn`
- `checkOut`

응답:

```json
{
  "quote": {
    "nights": 2,
    "roomAmount": 700000,
    "items": [
      {
        "date": "2026-08-20",
        "nightlyPrice": 300000,
        "weekendExtra": 0,
        "amount": 300000,
        "rateType": "seasonal"
      }
    ]
  }
}
```

### `POST /api/booking-holds`

결제 전 재고를 임시 잠금한다.

### `GET /api/campaigns/:code`

유튜브 캠페인을 조회한다.

### `POST /api/utm-events`

랜딩/상세/결제 이벤트를 기록한다.

### `GET /api/landing`

유튜브 랜딩 URL에서 예약 draft를 만들어 반환한다.

## 운영자 API

모든 운영자 API는 `x-admin-token` 헤더가 필요하다.

### `GET /api/host/rooms`

방/사이트 목록을 조회한다.

### `POST /api/host/rooms`

방/사이트를 생성한다.

### `PATCH /api/host/rooms/:id`

방/사이트 정보를 수정한다.

### `DELETE /api/host/rooms/:id`

방/사이트를 soft delete 한다. 실제 삭제가 아니라 `status=hidden` 처리한다.

### `POST /api/host/rooms/:id/images`

방/사이트 이미지를 추가한다.

### `PATCH /api/host/images/:id`

이미지 설명, 정렬, 대표 여부를 수정한다.

### `DELETE /api/host/images/:id`

이미지를 삭제한다.

### `POST /api/host/rooms/:id/rates`

방/사이트 요금 규칙을 추가한다.

### `POST /api/availability/expire-holds`

만료된 booking hold를 정리한다.

