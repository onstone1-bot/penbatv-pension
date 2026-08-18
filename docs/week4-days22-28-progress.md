# 펜바TV 4주차 22-28일차 진행 정리

## 22일차: 고객 회원가입/로그인 구조 연결

- 네이버/카카오 OAuth 로그인 후 `/auth/callback`에서 Supabase 세션을 만들고 `profiles`에 고객 프로필을 자동 저장합니다.
- `/my` 화면은 로그인 고객 ID 또는 휴대폰 번호 기준으로 예약을 조회합니다.

## 23일차: 사장님/운영자 권한 분리

- 관리 API의 기본 역할을 `customer`로 낮췄습니다.
- 사장님 API 호출은 `x-admin-token`과 `x-penbatv-role=host`를 함께 보내야 합니다.
- 운영자 API 호출은 `x-admin-token`과 `x-penbatv-role=operator`를 함께 보내야 합니다.

## 24일차: 운영자 입점 승인 관리

- `/host/proposals`에서 운영자 토큰 입력 후 숙소 상태를 승인, 보류, 중지로 변경합니다.
- `/api/admin/accommodations/[id]/approval`은 운영자 역할만 접근할 수 있습니다.

## 25일차: 전체 예약 현황 집계

- `/admin/operations`에서 전체 예약 건수, 확정/입금대기 상태, 최근 예약 목록을 조회합니다.

## 26일차: 결제/정산 예정금액 집계

- `payment_orders`, `payments`, `settlements`를 기준으로 결제 매출과 정산 예정금액을 집계합니다.
- 정산 테이블이 비어 있으면 결제액의 90%를 임시 지급 예정액으로 표시합니다.

## 27일차: 유튜브 UTM 유입/예약 전환 집계

- `utm_events`의 방문/결제시작 이벤트와 `bookings.utm_code`를 묶어 캠페인별 전환율과 매출을 계산합니다.

## 28일차: 관리자 화면 QA

- 운영자 화면에 4주차 QA 표를 추가했습니다.
- 회원/권한, 입점 승인, 예약 현황, 결제/정산, UTM 전환을 한 화면에서 점검합니다.

## 운영 전 체크

- Supabase 운영 DB에 최신 마이그레이션 반영
- Kakao/Naver OAuth Redirect URL에 운영 도메인 등록
- `STAYLINK_ADMIN_API_TOKEN` 운영 환경변수 설정
- 사장님/운영자 실제 로그인 권한은 추후 Supabase `profiles.role` 기반으로 완전 전환
