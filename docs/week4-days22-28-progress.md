# 펜바TV 4주차 22-28일차 진행 정리

## 4주차 목표

고객이 네이버·카카오 로그인으로 들어오고, 사장님과 운영자의 권한을 분리한 뒤, 운영자가 입점 승인·예약 현황·결제/정산·유튜브 전환 성과를 한 화면에서 확인할 수 있도록 운영자 관리 구조를 정리합니다.

## 22일차: 고객 회원가입/로그인 구조 연결

- /auth 화면에서 네이버/카카오 로그인 준비상태를 보여줍니다.
- 네이버는 /api/auth/naver/start를 통해 외부 인증 시작 구조를 사용합니다.
- 카카오는 Supabase OAuth Provider가 준비되면 supabase.auth.signInWithOAuth로 연결합니다.
- 인증 성공 후 /auth/callback에서 profiles 테이블에 고객 프로필 자동 저장을 목표로 둡니다.

## 23일차: 사장님/운영자 권한 분리

- 관리 API 기본 역할은 customer로 처리합니다.
- 사장님 기능은 x-admin-token과 x-penbatv-role=host가 있어야 접근합니다.
- 운영자 기능은 x-admin-token과 x-penbatv-role=operator가 있어야 접근합니다.
- 추후 실제 운영에서는 임시 토큰 방식에서 Supabase profiles.role 기반 권한으로 전환합니다.

## 24일차: 운영자 입점 승인 관리

- /host/proposals에서 입점문의와 숙소 상태를 확인합니다.
- /api/admin/accommodations/[id]/approval로 운영자가 승인, 보류, 중지 상태를 변경합니다.
- 승인/보류/중지 처리 결과는 admin_operation_events에 저장합니다.

## 25일차: 전체 예약 현황 집계

- /admin/operations에서 전체 예약 건수와 최근 예약 목록을 조회합니다.
- bookings 기준으로 예약 상태, 결제 상태, 금액을 보여줍니다.
- 각 예약은 객실과 숙소 데이터를 연결해 운영자가 바로 파악할 수 있게 합니다.

## 26일차: 결제/정산 예정금액 집계

- payment_orders, payments, settlements를 조회합니다.
- 결제 매출, 예약 확정액, 정산 예정금액을 운영자 KPI로 표시합니다.
- 정산 데이터가 없으면 결제액의 90%를 임시 정산 예정액으로 계산해 보여줍니다.

## 27일차: 유튜브 UTM 유입/예약 전환 집계

- utm_events의 landing_view, payment_started, payment_completed 이벤트를 집계합니다.
- bookings.utm_code와 연결해 캠페인별 예약 건수와 매출을 계산합니다.
- 유튜브 설명란 링크가 실제 예약으로 이어지는지 운영자가 확인하는 지표입니다.

## 28일차: 관리자 QA와 운영자 감사 로그

- /api/admin/operations는 operator 권한에서만 조회됩니다.
- host 권한으로 운영자 API를 호출하면 차단되는지 검증합니다.
- 운영자 대시보드 조회, 입점 승인, 입점문의 상태 변경은 admin_operation_events에 기록합니다.
- 운영자 화면에는 최근 운영자 처리 이력 섹션을 추가해 실제 로그가 보이도록 했습니다.

## 추가된 DB 테이블

### admin_operation_events

운영자 관리방에서 발생한 주요 운영 액션을 기록합니다.

- action: dashboard_view, accommodation_approval, partner_inquiry_status, role_scope_check, qa_run
- target_type: admin_dashboard, accommodation, partner_inquiry, profile, booking, payment_order, utm_campaign
- target_id: 대상 ID
- status: completed, blocked, failed
- metadata: 처리 내용 요약 JSON
- created_at: 기록 시각

## 이번 반영 결과

- /admin/operations 상단에 WEEK 4 · 22~28일차 진행 상태판을 정리했습니다.
- 회원/권한, 입점 승인, 예약 현황, 결제/정산, UTM 전환, 운영자 처리 이력을 카드형으로 요약했습니다.
- verify:week4:admin 검증에 운영자 감사 로그와 28일차 문서 마커를 추가했습니다.

## 검증 기준

- npm run typecheck 통과
- npm run build 통과
- npm run verify:week4:admin 통과
- npm audit 취약점 0건 확인

## 배포 메모

자동 배포는 마지막 차수 때 진행하기로 했으므로 이번 4주차 22~28일차 반영분은 로컬 소스 기준으로만 유지합니다.
