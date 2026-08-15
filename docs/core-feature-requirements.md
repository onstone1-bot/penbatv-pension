# 펜바TV 핵심 기능 요구사항

작성일: 2026-08-15

## 목표

펜바TV는 여러 펜션을 입점시켜 유튜브 영상 광고, 예약, 결제, 알림까지 한 화면 흐름으로 연결하는 웹앱이다. 3주차 구현 범위는 고객이 예약 가능한 날짜와 바베큐장 시간을 확인하고, 운영자가 예약/매출/고객 통계를 확인할 수 있는 기본 포맷을 만드는 것이다.

## 1. 실시간 예약 엔진

### 요구사항

- 날짜별, 객실별 중복 예약 방지
- 바베큐장 날짜별, 타임슬롯별 중복 예약 방지
- 네이버예약, 야놀자 등 외부 채널 예약은 iCal 가져오기를 통해 차단 블록으로 반영
- 고객 예약 단계에서는 결제 전 임시 점유(hold)를 생성하고 만료 시간을 둔다

### 추천 DB 구조

```text
rooms
- id
- property_id
- name
- capacity
- status

bookings
- id
- property_id
- room_id
- customer_id
- check_in
- check_out
- status
- payment_status

booking_holds
- id
- property_id
- room_id
- check_in
- check_out
- expires_at
- session_id

room_blocks
- id
- property_id
- room_id
- blocked_from
- blocked_to
- source
- external_uid

barbecue_zones
- id
- property_id
- name
- capacity
- status

barbecue_time_slots
- id
- barbecue_zone_id
- date
- start_time
- end_time
- status

barbecue_bookings
- id
- booking_id
- barbecue_zone_id
- date
- start_time
- end_time
- status
```

### 구현 기준

예약 가능 여부는 `bookings`, `booking_holds`, `room_blocks`, `barbecue_bookings`를 한 트랜잭션 안에서 확인한다. 체크인/체크아웃 범위가 겹치거나, 바베큐장 시간이 겹치면 예약 생성 전에 차단한다.

현재 MVP에는 `GET /api/availability/barbecue-timeslots`를 추가해 바베큐장 날짜별 슬롯 조회와 시간 충돌 확인을 분리했다.

## 2. 결제 연동

### 요구사항

- 신용카드 결제
- 간편결제
- 가상계좌 또는 현장 현금 결제 후 현금영수증 발행
- 결제 승인 실패 시 예약 hold 자동 해제
- 추후 입점사별 정산 데이터 분리

### 추천 DB 구조

```text
payment_orders
- id
- booking_id
- order_id
- amount
- method
- status
- cash_receipt_type
- customer_identity_number
- cash_receipt_key
- cash_receipt_url

payments
- id
- payment_order_id
- payment_key
- method
- approved_at
- receipt_url
- raw_payload

settlements
- id
- property_id
- payment_id
- commission_rate
- settlement_amount
- status
- scheduled_at
```

### 구현 기준

카드와 간편결제는 Toss Payments 결제창/승인 API를 기준으로 설계한다. 현금영수증은 결제 주문에 `cash_receipt_type`, `customer_identity_number`를 저장한 뒤 발행 결과의 키와 영수증 URL을 보관한다.

분할 정산은 MVP에서 즉시 자동 지급까지 넣기보다 `settlements` 테이블에 정산 예정 금액을 먼저 쌓고, 추후 지급대행 또는 정산 API 연동으로 확장한다.

## 3. 관리자 페이지

### 요구사항

- 예약 현황 조회
- 예약 확정, 취소, 노쇼, 환불 상태 관리
- 일매출, 결제 대기, 환불, 정산 예정 금액 확인
- 유튜브 UTM 기반 고객 유입/전환 통계 확인

### 추천 View

```text
admin_daily_sales
- property_id
- date
- gross_amount
- paid_count
- refund_amount
- settlement_amount

campaign_conversion_summary
- property_id
- utm_source
- utm_campaign
- visits
- booking_starts
- paid_bookings
- conversion_rate
```

### 구현 기준

운영자 화면은 `/host/core-features`, `/host/rooms`, `/host/properties`, `/host/rate-calendar`로 나누어 구성한다. 실제 Supabase 연결 시 통계 View는 `security_invoker` View 또는 서버 전용 Route Handler에서 조회해 입점사별 권한을 분리한다.

## 4. 카카오 알림톡 연동

### 요구사항

- 예약 완료 알림
- 입실 안내 알림
- 바베큐장 이용 시간 30분 전 알림
- 실패 시 SMS 또는 운영자 수동 발송 대기열 전환

### 추천 DB 구조

```text
notification_templates
- id
- trigger
- provider
- template_code
- title
- body
- status

notification_queue
- id
- booking_id
- trigger
- scheduled_at
- status
- retry_count

notification_logs
- id
- notification_queue_id
- provider_message_id
- status
- sent_at
- error_message
```

### 구현 기준

카카오 일반 메시지 API와 비즈니스 알림톡은 성격이 다르므로, MVP에서는 `Kakao AlimTalk provider adapter`라는 별도 연동 계층으로 분리한다. 실제 발송은 카카오 비즈니스 또는 알림톡 공식/대행 제공사의 템플릿 승인 후 `notification_queue`에서 처리한다.

## 5. 현재 구현된 화면/API

```text
/host/core-features
  핵심 기능 요구사항, 운영 지표, 바베큐장 타임슬롯, 알림톡 템플릿 화면

/api/availability/barbecue-timeslots
  date별 바베큐장 슬롯 조회
  startTime/endTime 입력 시 중복 예약 가능 여부 반환
```

## 다음 개발 순서

1. Supabase 마이그레이션으로 예약/결제/알림 테이블 생성
2. 예약 가능 여부 SQL 함수 또는 서버 Route Handler 트랜잭션 구현
3. 결제 준비/승인/실패 콜백 API 추가
4. 현금영수증 발행 필드와 관리자 조회 화면 연결
5. 알림톡 템플릿 승인 후 큐 기반 발송 어댑터 연결
