# 펜바TV 2주차 8일~14일 예약결제 확정 보완

## 목표

2주차는 고객이 날짜와 객실을 선택한 뒤 결제 준비, 결제 성공, 실패/취소/만료, 수동 계좌이체, 내예약 확인까지 이어지는 흐름을 운영 가능한 수준으로 단단하게 만드는 주차다.

## 8일차: 토스 결제 준비 API 정리

- `/api/payments/prepare`는 서버에서 hold 유효성, 객실, 일정, 인원, 옵션을 다시 확인한다.
- 화면에서 받은 금액은 신뢰하지 않고 `/api/quote`와 동일한 서버 계산값을 저장한다.
- 결제 주문은 `payment_orders`에 저장된다.
- 결제 준비 이벤트는 `payment_order_events`에 `prepared`로 남긴다.

## 9일차: 결제 성공 후 예약 확정 처리

- `/api/payments/confirm`은 저장된 `order_id`와 서버 금액을 비교한다.
- 금액이 맞고 결제 승인이 완료되면 `bookings`를 생성한다.
- 예약 상태는 `confirmed`, 결제 상태는 `paid`가 된다.
- 예약 확정 이벤트는 `payment_order_events`에 `paid`로 남긴다.

## 10일차: 결제 실패/취소/만료 처리

- 결제 실패 페이지에서 `failed` 또는 `cancelled` 상태를 저장한다.
- 결제 준비 주문이 만료되면 `expired_at`, `last_error`를 저장한다.
- 만료된 주문은 다시 결제 확정할 수 없도록 막는다.
- 실패/취소/만료 사유는 `payment_order_events`에 남긴다.

## 11일차: 수동 계좌이체 예약대기 처리

- `manual_bank_transfer`는 즉시 결제완료가 아니라 `waiting_deposit` 상태가 된다.
- 수동 계좌이체 입금 기한은 `PENBATV_BANK_DEPOSIT_DUE_HOURS` 기준으로 계산한다.
- 입금대기 주문은 `deposit_due_at`에 마감시간을 저장한다.

## 12일차: 네이버페이/실시간 계좌이체 확장 구조

- 결제 provider는 `card`, `naverpay`, `tosspay`, `vbank`, `realtime_transfer`, `manual_bank_transfer`를 지원한다.
- 토스 키가 있으면 토스 결제창으로, 없으면 mock 결제로 동작한다.
- 네이버페이는 토스 easyPay `NAVERPAY` 확장 구조를 유지한다.
- 실시간 계좌이체는 토스 method `TRANSFER` 구조를 유지한다.

## 13일차: 고객 내예약 실데이터 연결

- `/api/my/reservations`는 `bookings`, `rooms`, `accommodations`, `payments`를 조회한다.
- 로그인 고객은 추후 `customer_id` 기준으로 조회한다.
- 비로그인 데모 조회는 휴대폰 번호 기준으로 제한 조회한다.

## 14일차: 결제·예약 통합 QA

- 기존 `npm run verify:week2:payment` 검증 기준에 결제 이벤트 로그, 수동 계좌이체 입금기한, 주문 만료 처리를 추가했다.
- `npm run typecheck`, `npm run build`, `npm audit`와 함께 실행해 회귀를 확인한다.

## 로컬 산출물

- `supabase/migrations/20260821100000_week2_payment_reservation_hardening.sql`
- `docs/week2-payment-reservation-hardening.md`
- `src/lib/payments/orders.ts`
- `src/lib/payments/provider.ts`
- `src/lib/payments/confirm.ts`
- `src/app/payments/fail/page.tsx`
- `src/app/payments/success/page.tsx`
- `scripts/verify-week2-payment-flow.mjs`

## 운영 전 주의사항

- 운영 DB에 migration 적용 전 Supabase 백업과 SQL 리뷰가 필요하다.
- 결제 검증은 반드시 서버에서 처리해야 한다.
- 수동계좌이체는 입금 확인 전 예약을 확정으로 보여주면 안 된다.
- 공개 자동배포는 마지막 차수에 진행한다.
