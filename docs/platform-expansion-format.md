# 펜바TV 다중 펜션 플랫폼 확장 포맷

일자: 2026-08-15

## 목표

단일 펜션 예약 시안을 `펜바TV(PenBa TV)` 브랜드 기반의 다중 펜션 플랫폼으로 확장한다. 핵심 구조는 유튜브 숏폼 영상으로 숙소를 먼저 보여주고, 상세 페이지에서 달력 예약과 예약요청/바로결제로 연결하는 방식이다.

## 입점 펜션 기본 포맷

필수 입력:

- 펜션명
- 지역
- 주소
- 소개 문구
- 대표자명
- 연락처
- 객실 수
- 최저가
- 광고 상품
- 예약 방식
- 플랫폼 수수료율
- 태그
- 유튜브 링크
- 영상 제목
- 노출 상태

운영 상태:

- 초안
- 검수중
- 노출중
- 중지

광고 상품:

- 기본 노출
- 유튜브 광고 연동
- 프리미엄 추천

예약 방식:

- 예약요청
- 바로결제
- 요청+바로결제

## 구현 화면

### 플랫폼 홈

경로:

```text
/
```

역할:

- 펜바TV 브랜드 첫 화면
- 유튜브 쇼츠형 숏폼 피드 표시
- 입점 펜션 목록 표시
- 광고 상품과 예약 방식을 카드에 표시
- 각 펜션 예약 상세 화면으로 연결
- 운영자 펜션 등록 화면으로 연결

### 펜션 입점 등록

경로:

```text
/host/properties
```

역할:

- 신규 펜션 기본 정보 입력
- 유튜브 링크 입력
- 영상 제목 입력
- 광고 상품 선택
- 예약 방식 선택
- 수수료율 입력
- 등록 미리보기
- 화면 내 초안 등록
- 관리자 API 토큰 입력 시 Supabase 숙소 기본 정보 저장 시도

### 상세 예약 화면

경로:

```text
/stays/:id
```

역할:

- 화면 상단에 `펜바TV 단독 촬영 영상` 배너 표시
- 유튜브 링크가 등록된 경우 iframe 영상 플레이어 표시
- 유튜브 링크가 없는 경우 대표 이미지 기반 영상 등록 대기 배너 표시
- 가족/단체용 편의시설과 달력 예약창을 이어서 표시

### 관리자 API

경로:

```text
GET /api/host/accommodations
POST /api/host/accommodations
```

주의:

- 실제 DB 저장은 `x-admin-token` 기반 관리자 API에서만 수행한다.
- 현재 `accommodations` 테이블에는 광고 상품, 예약 방식, 대표자 정보, 수수료율 컬럼이 없다.
- 이번 구현에서는 해당 값들을 onboarding payload로 반환한다.
- 다음 DB 확장 시 `partner_profiles`, `ad_products`, `property_ad_enrollments`, `property_settlement_rules` 테이블로 분리하는 것이 좋다.

## 다음 DB 확장 제안

```text
partner_profiles
- id
- accommodation_id
- owner_name
- owner_phone
- business_no
- settlement_bank
- settlement_account
- status

property_ad_enrollments
- id
- accommodation_id
- ad_plan
- budget_amount
- starts_at
- ends_at
- status

property_reservation_settings
- accommodation_id
- reservation_mode
- commission_rate
- payment_provider
- auto_confirm_enabled
- request_confirm_minutes
```

## 검증

추가 검증:

```text
npm.cmd run verify:platform
```

기존 검증:

```text
npm.cmd run typecheck
npm.cmd run verify:week1
npm.cmd run verify:mobile
npm.cmd run verify:week3
npm.cmd run build
```
