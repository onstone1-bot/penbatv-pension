# 펜바TV 5주차 29-35일차 진행 정리

## 29일차: 예약 완료 알림톡 또는 문자 구조

- 예약 확정 시 `notification_queue`에 `booking_confirmed` 알림을 적재합니다.
- 현재는 `mock-alimtalk` 발송 상태로 처리하고, 실제 운영에서는 알림톡 공식/대행 공급사 어댑터로 교체합니다.

## 30일차: 입실 안내/바베큐 리마인드 알림

- 입실 전날 18시에 `checkin_guide` 알림을 예약합니다.
- 입실 당일 17:30에 `barbecue_reminder` 알림을 예약합니다.
- 실패 건은 CS 대기열에서 문자 또는 수동 연락으로 전환합니다.

## 31일차: iCal 기반 외부 예약 차단일 연동

- `/api/integrations/ical/sync`가 iCal `VEVENT`를 파싱합니다.
- 외부 예약은 `calendar_sync_sources`, `calendar_sync_events`, `room_blocks`에 저장됩니다.
- 고객 예약 달력은 `room_blocks`를 예약불가로 계산합니다.

## 32일차: 모바일 사용성 QA

- 390px 모바일 기준으로 달력, 하단 탭, 입력 폼, 결제 버튼, 홀드 타이머, 안전영역을 검증합니다.
- `npm.cmd run verify:mobile`로 정적 모바일 QA를 확인합니다.

## 33일차: 공개 배포 환경변수 점검

- `/api/admin/environment`에서 Supabase, 관리자 토큰, Toss, 수동입금 계좌 관련 환경변수 상태를 확인합니다.
- 필수 키는 Supabase 공개키, 서비스 롤 키, 관리자 토큰, 기본 숙소 ID입니다.
- Toss와 계좌 정보는 결제 방식에 따라 운영 전 입력합니다.

## 34일차: 첫 파일럿 숙소 운영 리허설

- 고객, 사장님, 운영자 역할로 유튜브 유입부터 예약, 결제, 알림, 대시보드 확인까지 끝까지 시연합니다.
- `/launch-rehearsal` 화면에서 Go/No-Go 체크리스트를 확인합니다.

## 35일차: 파일럿 오픈

- `/api/pilot/open`에 체크리스트를 제출합니다.
- 모든 체크가 true이면 `pilot_runs.status=open`으로 저장됩니다.
- 이후 GitHub push와 Vercel 자동 배포로 공개 URL을 갱신합니다.

## 5주차 이후 배포 순서

1. `npm.cmd run verify:week5:launch`
2. `npm.cmd run verify:mobile`
3. `npm.cmd run build`
4. GitHub push
5. Vercel Production Deployment 확인
6. 공개 URL에서 고객 예약 흐름 재검증
