# Day 2 진행 결과

일자: 2026-08-14

## 목표

2일차 목표는 DB 스키마 1차 구현이다. 1일차 초안을 실제 예약 웹앱에서 사용할 수 있는 수준으로 확장하고, 고객 화면과 운영자 화면이 공통으로 사용할 데이터 구조를 고정한다.

## 패키지 설치 진행

- `npm.cmd install`을 승인된 네트워크 권한으로 재시도했다.
- `registry.npmjs.org` 직접 연결은 승인된 네트워크에서 HTTP 200으로 확인했다.
- npm 설치는 tarball 추출 단계까지 진행되며 `node_modules` 일부가 생성됐지만, 장시간 무출력으로 멈춰 중단했다.
- `package-lock.json`은 아직 생성되지 않았다.
- `npm.cmd run typecheck`를 시도했지만 부분 설치 상태라 `tsc`를 찾지 못해 실패했다.
- 다음 실행 전 `node_modules`가 부분 설치 상태일 수 있으므로, 설치가 계속 멈추면 `node_modules` 정리 후 재설치를 검토한다.

## DB 스키마 구현

`supabase/schema.v1.sql`에 다음 테이블을 확정했다.

- `accommodations`
- `rooms`
- `room_images`
- `room_rates`
- `booking_options`
- `booking_holds`
- `bookings`
- `booking_option_items`
- `room_blocks`
- `youtube_campaigns`
- `utm_events`
- `payments`
- `settlements`

## 주요 보강 내용

- 객실/사이트 시즌 요금용 `room_rates` 추가
- 바비큐, 불멍, 얼리체크인 옵션용 `booking_options` 추가
- 예약별 옵션 항목용 `booking_option_items` 추가
- PG 결제 상태 저장용 `payments` 추가
- 정산 확장용 `settlements` 추가
- `room_images(room_id, url)` 유니크 제약 추가
- `room_rates` 중복 seed 방지용 유니크 제약 추가
- 모든 public 테이블 RLS 활성화
- 고객 공개 조회가 필요한 테이블에만 `anon` select grant 부여
- UTM 이벤트는 `anon` insert만 허용

## Seed 데이터

`supabase/seed.sql`에 다음 샘플 데이터를 추가했다.

- 배방알프스 숙소
- 독채펜션 A
- 돔 글램핑 B
- 방/사이트 이미지 샘플 URL
- 기본 요금/여름 성수기 요금
- 바비큐/불멍/얼리체크인 옵션
- `campheaven_*` 유튜브 캠페인 3종

## API 확장

- 방 목록 API에 `room_images`, `room_rates` 포함
- 방 상세 API에 `room_images`, `room_rates` 포함
- 옵션 조회 API 추가
  - `GET /api/accommodations/:id/options`

## 검증

설치가 완료되지 않아 `typecheck`와 `build`는 아직 실행하지 못했다.

설치 없이 가능한 정적 검증:

- `schema.v1.sql` 필수 테이블 포함 확인
- FK 생성 순서 확인
- `booking_holds -> bookings -> booking_option_items -> payments -> settlements` 순서 확인

검증 결과:

```json
{
  "missing": [],
  "orderOk": true
}
```

## Supabase 최신 변경 반영

2026년 Supabase 변경사항 중 새 public 테이블이 Data API에 자동 노출되지 않는 변경을 고려했다. 따라서 스키마에서 RLS와 `grant`를 명시했다.

적용 원칙:

- public 테이블은 모두 RLS 활성화
- 고객에게 필요한 조회 테이블만 `anon` select 허용
- 예약/결제/정산 테이블은 service role 서버 API를 통해서만 접근
- service role key는 서버 전용 환경변수로만 사용

## 남은 이슈

- npm 설치 완료 및 lockfile 생성
- Supabase CLI 설치/확인
- CLI 복구 후 `supabase migration new init_staylink_schema`로 정식 migration 생성
- 실제 Supabase 프로젝트에 SQL 적용
- `supabase db advisors` 또는 MCP advisor 실행
- 타입체크와 빌드 실행
