# Day 3~5 진행 결과

일자: 2026-08-14

## Day 3: 예약 가능 여부 계산 로직

완료:

- 날짜 유틸 추가
  - `enumerateNights`
  - `isWeekendNight`
  - `rangesOverlap`
  - `assertValidDateRange`
- 예약 가능 여부 로직 보강
  - 확정 예약
  - 살아 있는 booking hold
  - 운영자 room block
- booking hold 생성 API 추가
  - `POST /api/booking-holds`
- 만료 hold 정리 API 추가
  - `POST /api/availability/expire-holds`
  - 관리자 토큰 필요
- 날짜별 객실 요금 계산 로직 추가
  - `room_rates` 우선순위 적용
  - 주말 추가 요금 적용

주요 파일:

- `src/lib/date.ts`
- `src/lib/availability.ts`
- `src/lib/pricing.ts`
- `src/app/api/booking-holds/route.ts`
- `src/app/api/availability/expire-holds/route.ts`

## Day 4: 방/사이트/이미지 관리 구조

완료:

- 운영자 API 가드 추가
  - `x-admin-token` 헤더
  - `STAYLINK_ADMIN_API_TOKEN` 환경변수
- 방/사이트 운영자 API 추가
  - `GET /api/host/rooms`
  - `POST /api/host/rooms`
  - `PATCH /api/host/rooms/:id`
  - `DELETE /api/host/rooms/:id`
- 이미지 관리 API 추가
  - `POST /api/host/rooms/:id/images`
  - `PATCH /api/host/images/:id`
  - `DELETE /api/host/images/:id`
- 요금 규칙 추가 API
  - `POST /api/host/rooms/:id/rates`
- 방 목록/상세 고객 API는 이미지와 요금 규칙을 포함하도록 확장 완료

주요 파일:

- `src/lib/admin-auth.ts`
- `src/lib/schemas.ts`
- `src/app/api/host/rooms/route.ts`
- `src/app/api/host/rooms/[id]/route.ts`
- `src/app/api/host/rooms/[id]/images/route.ts`
- `src/app/api/host/images/[id]/route.ts`
- `src/app/api/host/rooms/[id]/rates/route.ts`

## Day 5: 유튜브 UTM 처리와 예약 draft 연결

완료:

- UTM 파라미터 파서 확장
- 예약 draft 모델 추가
- `/stays/:id` 랜딩 페이지 추가
- 유튜브 링크 진입 시 다음 값을 localStorage에 저장
  - 숙소 ID
  - 방/사이트 ID
  - UTM source
  - UTM medium
  - UTM campaign
- 랜딩 이벤트 저장 호출
  - `POST /api/utm-events`
- draft 확인용 API 추가
  - `GET /api/landing`

링크 예시:

```text
/stays/baebang-alps?utm_source=youtube&utm_medium=video&utm_campaign=campheaven_room_01&room=A
```

주요 파일:

- `src/lib/booking-draft.ts`
- `src/lib/utm.ts`
- `src/app/stays/[id]/page.tsx`
- `src/app/stays/[id]/StayLandingClient.tsx`
- `src/app/api/landing/route.ts`

## 패키지 설치 상태

아직 미완료:

- `package-lock.json` 미생성
- `node_modules`는 부분 설치 상태
- `npm.cmd run typecheck`는 `tsc` 미설치로 실패

권장 조치:

1. `node_modules` 정리
2. `npm.cmd install --no-audit --no-fund` 재실행
3. `npm.cmd run typecheck`
4. `npm.cmd run build`

## 정적 검증

설치 없이 가능한 검증:

- 파일 존재 확인
- DB 필수 테이블 포함 확인
- FK 생성 순서 확인

아직 필요한 검증:

- TypeScript typecheck
- Next.js build
- Supabase 실제 DB 적용
- `supabase db advisors`

