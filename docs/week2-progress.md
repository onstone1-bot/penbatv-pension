# 2주차 개발 진행 결과

일자: 2026-08-14

## 목표

1주차에 만든 DB/API 기반 위에 실제 고객용 웹앱 화면과 운영자 방 관리 화면을 구현한다. 유튜브 유입 UTM 흐름, 방/사이트 소개, 예약 옵션 선택, 예약 전환 흐름을 캠핑친구형 모바일 경험에 맞춰 구성한다.

## 구현 화면

### 고객 웹앱

경로:

```text
/stays/baebang-alps?utm_source=youtube&utm_medium=video&utm_campaign=campheaven_room_01&room=A
```

구현:

- 캠핑친구형 고객 홈: 검색바, 카테고리 칩, 유튜브 영상 카드
- 방/사이트 카드와 상세 소개
- 영상 체크인, 날짜 선택, 방/사이트 선택
- 인원/옵션 선택
- 예약자 정보와 결제 하단 시트
- mock 결제 완료와 MY 예약 화면
- 하단 탭: 홈, 검색, 내예약, 캠프, MY

주요 파일:

- `src/app/stays/[id]/page.tsx`
- `src/app/stays/[id]/StayAppClient.tsx`
- `src/lib/mock-data.ts`
- `src/lib/local-quote.ts`

### 운영자 기본 화면

경로:

```text
/host/rooms
```

구현:

- 방/사이트 목록
- 기본 요금, 주말 요금, 기준 인원, 이미지 수, 요금 규칙 수 표시
- 화면용 숨기기 mock 액션

주요 파일:

- `src/app/host/rooms/page.tsx`
- `src/app/host/rooms/HostRoomsClient.tsx`

## API 연동 준비

고객 화면은 Supabase 데이터를 먼저 시도하고, 환경변수/RLS/Data API 노출/데이터 부재로 실패하면 mock 데이터로 대체한다. 다음 API와 필드 구조도 계속 맞춰 둔다.

- `GET /api/accommodations/:id`
- `GET /api/accommodations/:id/rooms`
- `GET /api/accommodations/:id/options`
- `GET /api/rooms/:id`
- `GET /api/availability`
- `GET /api/quote`
- `POST /api/booking-holds`
- `POST /api/payments/prepare`
- `POST /api/utm-events`

추가 구현:

- `src/lib/stay-page-data.ts`
- 숙소, 방/사이트, 이미지, 요금, 예약 옵션, 유튜브 캠페인 조회
- DB 이미지 URL이 샘플 도메인일 경우 화면용 mock 이미지 fallback
- `amenities` JSON 배열을 고객 화면 문자열 배열로 변환
- 서버 컴포넌트에서 읽고 클라이언트 화면에는 직렬화 가능한 props만 전달

## 패키지 및 빌드 정리

- `package-lock.json` 생성 완료
- `node_modules` 재설치 완료
- React/Node 타입 패키지 추가 완료
- TypeScript를 Next.js 빌드 호환 버전인 `5.9.3`으로 고정
- Supabase 수동 타입 정의를 Next/Supabase 클라이언트가 인식하는 구조로 보정
- 방 상세 조회, 운영자 방 수정, 이미지 수정, UTM 이벤트 API 타입 오류 수정
- 고객 예약 화면 데이터를 Supabase 우선 로딩 구조로 전환
- 고객 예약 완료 흐름을 예약 hold 생성 이후 결제 준비 API 호출 순서로 전환
- `/api/payments/prepare` mock 결제 세션 API 추가
- 인원/옵션 선택 이후 결제 정보 단계 진입 전 `GET /api/availability` 확인 연결
- active hold/confirmed booking/room block으로 불가 응답이 오면 결제 단계 진입 차단
- 예약 hold 생성 시 `409` 중복 선점 응답이 오면 mock 결제 완료로 넘어가지 않고 날짜 재선택 안내
- 390px 모바일 화면 대응 CSS 추가
- 모바일 viewport 설정 추가
- 하단 탭 safe-area, 입력창 16px, 긴 문구 줄바꿈, 예약 버튼 disabled 상태 보정
- `verify:mobile` 검증 스크립트 추가
- 옵션 선택 이후 결제 정보 단계 진입 시점에 예약 hold 생성
- 결제 정보 화면에 15분 hold 카운트다운 표시
- hold 만료 시 결제 진행 버튼 비활성화 및 날짜 재선택 안내
- 예약 완료 로컬 저장 데이터에 `holdExpiresAt` 추가
- 결제 provider 모듈 분리
- `/api/payments/prepare`를 provider 기반 응답으로 확장
- `/api/payments/confirm` Toss confirm/mock confirm 라우트 추가
- Toss 환경변수(`TOSS_PAYMENTS_CLIENT_KEY`, `TOSS_PAYMENTS_SECRET_KEY`)가 있으면 Toss 결제창/confirm 전환 준비
- Toss 키가 없으면 기존 mock 결제 흐름 유지
- Toss successUrl/failUrl return page 추가
- `/payments/success`에서 `paymentKey`, `orderId`, `amount` 확인 후 confirm 처리
- `/payments/fail`에서 실패 코드/메시지 표시 및 재예약 경로 제공
- 실제 운영 시 서버 저장 금액과 redirect 금액 비교가 필요하다는 검증 placeholder 반영
- `payment_orders` 서버 저장 테이블 추가
- 결제 준비 시 `orderId`, 금액, provider, hold, checkout 정보를 service role로 저장 시도
- 결제 승인 시 서버 저장 금액과 redirect `amount` 비교
- 금액 불일치 또는 ready 상태가 아닌 주문은 confirm 차단
- 저장소 환경변수가 없으면 mock 흐름을 유지하되 `orderStorage.persisted=false`로 상태 반환

## 검증

통과:

- `npm.cmd run verify:week1`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run dev`
- `GET /stays/baebang-alps?...` 로컬 응답 `200`
- `GET /host/rooms` 로컬 응답 `200`
- `verify:week1`에 `src/lib/stay-page-data.ts`와 고객 페이지 데이터 연결 검증 추가
- `POST /api/payments/prepare` 로컬 응답 `201`
- `GET /api/availability?...` 로컬 JSON 오류 응답 확인
- 고객 예약 화면 로컬 응답 `200` 재확인
- `npm.cmd run verify:mobile`
- 고객 예약 화면 viewport 메타 응답 확인
- hold timer CSS guard 검증 추가
- `POST /api/payments/prepare` checkout/orderId 응답 확인
- `POST /api/payments/confirm` mock paid 응답 확인
- `GET /payments/success?...` 로컬 응답 `200`
- `GET /payments/fail?...` 로컬 응답 `200`
- `POST /api/payments/prepare` `orderStorage` 응답 확인
- `payment_orders` RLS enable/schema 검증 추가

빌드 결과:

- `/stays/[id]` 동적 고객 예약 화면 빌드 확인
- `/host/rooms` 운영자 화면 정적 빌드 확인
- 예약/객실/UTM/운영자 API 라우트 빌드 확인
- 결제 준비 API 라우트 빌드 확인
- Supabase 환경변수가 없어도 고객 화면 fallback 렌더링 확인
- Supabase 환경변수가 없어도 availability API 오류가 JSON으로 반환되고 고객 화면은 mock fallback 유지
- 390px 모바일 CSS guard와 production build 동시 통과
- hold countdown UI 포함 production build 통과
- `/api/payments/confirm` 포함 production build 통과
- `/payments/success`, `/payments/fail` 포함 production build 통과
- `payment_orders` 금액 검증 로직 포함 production build 통과

## 다음 작업

- 데스크톱/태블릿 프레임 세부 확인
- 실제 Supabase 프로젝트 연결 후 RLS/Data API 노출 상태에서 조회 검증
- 예약 hold 생성/만료를 실제 DB에서 검증
- Toss/NaverPay 클라이언트 SDK 결제창 호출 화면 연결
- 실제 Supabase service role 환경에서 `payment_orders` insert/update 검증
- 운영자 방/이미지/요금 등록 폼 고도화

## 2026-08-15 추가 개선

- 고객 예약 1단계를 달력식 날짜 범위 선택 UI로 개선
- 체크인/체크아웃 선택 범위를 달력 셀에서 시각적으로 표시
- 선택 기간 변경 시 `GET /api/availability`로 예약 가능 여부 자동 확인
- 예약 가능, 예약 불가, 실시간 확인 필요 상태를 예약 화면 안에 즉시 표시
- 예약 불가 상태에서는 다음 단계 진입 버튼 비활성화
- 기존 추천 날짜는 가로 chip 버튼으로 유지해 빠른 선택 가능
- 모바일 390px 기준 달력 셀/상태 요약 CSS guard 검증 항목 추가
