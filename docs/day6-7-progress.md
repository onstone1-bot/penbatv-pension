# Day 6~7 진행 결과

일자: 2026-08-14

## Day 6: 통합 테스트와 seed 데이터 정리

완료:

- 정적 통합 검증 스크립트 추가
  - `scripts/verify-week1.mjs`
  - `npm.cmd run verify:week1`
- 고객 화면 API 매핑 문서 작성
  - `docs/customer-api-mapping.md`
- quote API 추가
  - `GET /api/quote`
- 1주차 필수 테이블, RLS, 캠페인 seed, 주요 API 파일 존재 여부 검증 가능

검증 결과:

- 필수 파일 존재 확인 완료
- 필수 테이블/생성 순서/캠페인 seed 정적 검증 통과
- `npm.cmd run verify:week1` 통과
- `npm.cmd run typecheck`는 의존성 설치 미완료로 `tsc`를 찾지 못해 실패

## Day 7: 1주차 리뷰와 2주차 준비

완료:

- API 명세 초안 작성
  - `docs/api-spec.md`
- DB ERD 초안 작성
  - `docs/db-erd.md`
- 2주차 프론트엔드 작업 목록 작성
  - `docs/week2-frontend-tasks.md`
- README에 Day 6~7 범위 추가
- 1주차 체크리스트 업데이트

## 남은 블로커

- `npm.cmd install`이 완전히 끝나지 않아 `package-lock.json`이 없다.
- `node_modules`는 부분 설치 상태다.
- `npm.cmd run typecheck`, `npm.cmd run build`는 아직 통과하지 못했다.
- Supabase CLI가 설치되어 있지 않아 정식 migration 파일 생성은 보류 상태다.
- 실제 Supabase 프로젝트 URL/key가 없어 DB 적용과 advisor 검증은 아직 못 했다.

## 다음 권장 순서

1. 부분 설치된 `node_modules` 정리 후 의존성 재설치
2. `npm.cmd run verify:week1`
3. `npm.cmd run typecheck`
4. `npm.cmd run build`
5. Supabase CLI 설치/연결
6. `schema.v1.sql`을 정식 migration으로 전환
7. Supabase DB 적용 및 advisor 실행
