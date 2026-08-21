# 펜바TV 5주차 29-35일차 진행 정리

## 5주차 목표

5주차는 파일럿 오픈 직전 단계입니다. 예약 완료 후 고객에게 안내가 나가고, 외부 예약 채널의 차단일이 펜바TV 달력에 반영되며, 배포 환경과 모바일 화면을 점검한 뒤 첫 숙소를 오픈할 수 있는지 판단하는 구조까지 맞춥니다.

## 29일차: 예약 완료 알림톡 또는 문자 구조

- 예약 확정 시 `notification_queue`에 `booking_confirmed` 알림을 적재합니다.
- 현재는 `mock-alimtalk` 발송 상태로 처리하고, 실제 운영에서는 카카오 알림톡 또는 문자 공급사 어댑터로 교체합니다.
- 알림 큐 적재 이력은 `launch_readiness_events`에 `notification_queue` 단계로 기록합니다.

## 30일차: 입실 안내/바베큐 리마인드 알림

- 입실 전날 18시에 `checkin_guide` 알림을 예약합니다.
- 입실 당일 17:30에 `barbecue_reminder` 알림을 예약합니다.
- 발송 실행 결과는 `notification_dispatch` 단계로 기록해 운영자가 런칭 리허설 화면에서 확인할 수 있게 했습니다.

## 31일차: iCal 기반 외부 예약 차단일 연동

- `/api/integrations/ical/sync`가 iCal `VEVENT`를 파싱합니다.
- 외부 예약은 `calendar_sync_sources`, `calendar_sync_events`, `room_blocks`에 저장됩니다.
- 고객 예약 달력은 `room_blocks`를 예약불가로 계산합니다.
- 동기화 실행 이력은 `launch_readiness_events`에 `ical_sync` 단계로 기록합니다.

## 32일차: 모바일 사용성 QA

- 390px 모바일 기준으로 달력, 하단 탭, 입력 폼, 결제 버튼, 홀드 타이머, 안전영역을 검증합니다.
- `npm.cmd run verify:mobile`로 정적 모바일 QA를 확인합니다.
- 모바일 검증은 파일럿 오픈 체크리스트의 `mobileChecked` 항목으로 반영합니다.

## 33일차: 공개 배포 환경변수 점검

- `/api/admin/environment`에서 Supabase, 관리자 토큰, Toss, 수동입금 계좌 관련 환경변수 상태를 확인합니다.
- 필수 키는 Supabase 공개키, 서비스 롤 키, 관리자 토큰, 기본 숙소 ID입니다.
- 점검 결과는 `launch_readiness_events`에 `environment_check` 단계로 기록합니다.

## 34일차: 첫 파일럿 숙소 운영 리허설

- 고객, 사장님, 운영자 역할로 유튜브 유입부터 예약, 결제, 알림, 대시보드 확인까지 끝까지 시연합니다.
- `/launch-rehearsal` 화면에서 Go/No-Go 체크리스트와 런칭 리허설 이력을 확인합니다.
- 리허설 화면은 `pilot_runs`와 `launch_readiness_events`를 함께 보여줍니다.

## 35일차: 파일럿 오픈

- `/api/pilot/open`에 체크리스트를 제출합니다.
- 모든 체크가 true이면 `pilot_runs.status=open`으로 저장됩니다.
- 파일럿 오픈 판단 이력은 `launch_readiness_events`에 `pilot_open` 단계로 기록합니다.
- 이후 GitHub push와 Vercel 자동 배포로 공개 URL을 갱신할 수 있습니다.

## 추가된 DB 테이블

### `launch_readiness_events`

- 목적: 5주차 오픈 준비 과정에서 실제 실행된 알림, 외부 예약 동기화, 환경 점검, 파일럿 오픈 판단 이력을 남깁니다.
- 주요 컬럼: `stage`, `target_type`, `target_id`, `status`, `actor_role`, `actor_user_id`, `metadata`, `created_at`
- 권한: 운영자만 조회할 수 있고, 서버 서비스 롤에서만 생성/수정/삭제합니다.
- 화면: `/launch-rehearsal`의 `런칭 리허설 이력` 영역에서 최근 기록을 확인합니다.

## 검증 기준

1. `npm.cmd run typecheck`
2. `npm.cmd run build`
3. `npm.cmd audit --json`
4. `npm.cmd run verify:mobile`
5. `STAYLINK_VERIFY_LIVE=1 npm.cmd run verify:week5:launch`

## 배포 메모

5주차가 마지막 차수이므로 기능 검증 후 GitHub push와 Vercel 자동 배포를 진행할 수 있습니다. 단, Vercel에서 커밋 작성자 권한 문제가 다시 나오면 GitHub/Vercel 계정 권한을 먼저 맞춰야 합니다.
