# 펜바TV 1주차 보안 정비 실행안

## 목표

실제 예약결제 서비스로 넘어가기 전에 환경변수, 권한, RLS, 예약 API 보안 기준을 먼저 고정한다.

## 1일차: 환경변수와 키 관리

- `.env.local`은 로컬 전용이며 GitHub에 올리지 않는다.
- Vercel에는 `Production`, `Preview`, `Development` 환경별로 필요한 값만 등록한다.
- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출된다.
- `SUPABASE_SERVICE_ROLE_KEY`, `TOSS_PAYMENTS_SECRET_KEY`, `STAYLINK_ADMIN_API_TOKEN`은 서버 전용이다.

## 2일차: GitHub 보안 점검

- `.gitignore`에 `.env.local`, `.env*.local`, `.vercel/` 포함 여부를 확인한다.
- `npm audit` 결과를 0건으로 유지한다.
- 민감키가 커밋에 들어간 적이 있으면 키를 재발급한다.

## 3일차: Supabase RLS 정책 설계

- 공개 고객 화면은 `anon`, `authenticated` 모두 active 데이터만 읽는다.
- 고객은 본인 `profiles`, `bookings`, `payment_orders`만 읽는다.
- 사장님은 `accommodation_host_users`에 등록된 숙소의 예약/결제 현황만 읽는다.
- 운영자는 전체 운영 데이터를 조회할 수 있도록 별도 역할을 둔다.

## 4일차: DB 권한 정책 적용

- `20260821090000_week1_security_hardening.sql` migration을 추가했다.
- `accommodation_host_users` 테이블로 숙소와 사장님 사용자를 연결한다.
- `private.current_profile_role()`, `private.can_manage_accommodation()` helper로 정책 중복을 줄인다.
- 공개 데이터 read policy를 로그인 사용자에게도 열어 고객 로그인 후 화면이 깨지지 않게 한다.

## 5일차: 관리자/사장님 접근 제한

- 현재 host API는 `STAYLINK_ADMIN_API_TOKEN`과 `x-penbatv-role`을 기준으로 보호한다.
- 추후 실제 로그인 기반 전환 시 `profiles.role`과 `accommodation_host_users`를 기준으로 보호한다.
- `/host`, `/admin` 화면은 로그인/권한이 없으면 접근 차단하도록 이어서 보완한다.

## 6일차: 예약 API 보안

- `/api/quote`는 서버에서 금액을 다시 계산한다.
- `/api/booking-holds`는 서버에서 홀드 생성 후 견적을 다시 계산한다.
- 결제 직전에는 예약 가능 여부와 서버 기준 금액을 다시 검증해야 한다.

## 7일차: QA와 반복 검증

- `npm run verify:week1:security`를 추가했다.
- 보안 검증은 환경변수 노출, `.gitignore`, RLS migration, host/operator helper 존재 여부를 확인한다.
- 주차별 작업 후 `npm run build`, `npm run typecheck`, `npm audit`와 함께 실행한다.

## 이번 주차 완료 기준

- 민감키가 브라우저 코드와 GitHub에 노출되지 않는다.
- 로그인 고객도 공개 숙소/객실 데이터를 정상 조회할 수 있다.
- 고객/사장님/운영자 권한 분리의 DB 기반이 생긴다.
- 보안 점검을 명령어로 반복 실행할 수 있다.
