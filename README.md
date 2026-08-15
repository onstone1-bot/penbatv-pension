# StayLink App

캠핑친구형 유튜브 예약 연결 플랫폼의 Next.js + Supabase 구현 프로젝트입니다.

## Day 1 완료 범위

- Next.js App Router 프로젝트 구조 생성
- Supabase 브라우저/서버/admin client 유틸 준비
- 환경변수 예시 파일 작성
- DB 스키마 v1 초안 작성
- 예약 가능 여부 계산 서비스 작성
- 방/사이트/이미지 조회 API 골격 작성
- 유튜브 UTM 파라미터 처리 유틸 작성

## Day 2 완료 범위

- DB 스키마 v1을 예약 웹앱 기준으로 확장
- `room_rates`, `booking_options`, `booking_option_items`, `payments`, `settlements` 추가
- 방 목록/상세 API에 이미지와 요금 규칙 포함
- 숙소 옵션 조회 API 추가
- seed 데이터에 방/사이트 이미지, 시즌 요금, 예약 옵션 추가

진행 상세: `docs/day2-progress.md`

## Day 3~5 완료 범위

- 예약 가능 여부 계산, booking hold 생성, 만료 hold 정리 API 추가
- `room_rates` 기반 날짜별 요금 계산 로직 추가
- 운영자 방/사이트/이미지/요금 관리 API 추가
- 유튜브 UTM 랜딩 페이지와 예약 draft 저장 흐름 추가

진행 상세: `docs/day3-5-progress.md`

## Day 6~7 완료 범위

- 1주차 정적 통합 검증 스크립트 추가
- quote API 추가
- 고객 화면 API 매핑 문서 작성
- API 명세, DB ERD, 2주차 프론트엔드 작업 목록 작성

진행 상세: `docs/day6-7-progress.md`

## 2주차 화면 구현

- 고객 웹앱: `/stays/baebang-alps`
- 유튜브 랜딩 예시: `/stays/baebang-alps?utm_source=youtube&utm_medium=video&utm_campaign=campheaven_room_01&room=A`
- 운영자 기본 화면: `/host/rooms`

진행 상세: `docs/week2-progress.md`

## 설치

```bash
npm.cmd install
```

PowerShell 실행 정책 때문에 `npm`이 막히면 Windows에서는 `npm.cmd`를 사용합니다.

## 실행

```bash
npm.cmd run dev
```

## 환경변수

`.env.local.example`을 `.env.local`로 복사한 뒤 Supabase Connect 패널의 값을 넣습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용입니다. 클라이언트 컴포넌트나 `NEXT_PUBLIC_` 환경변수로 노출하면 안 됩니다.

## Supabase 주의사항

- public schema 테이블은 RLS를 활성화합니다.
- Data API 접근이 필요한 테이블은 RLS 정책과 함께 role grant를 명시합니다.
- 새 마이그레이션은 Supabase CLI 연결 후 `supabase migration new <name>`으로 생성합니다.
- 현재 `supabase/schema.v1.sql`은 1일차 스키마 확정 초안입니다.
