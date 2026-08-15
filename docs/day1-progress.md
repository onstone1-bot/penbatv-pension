# Day 1 진행 결과

일자: 2026-08-13

## 완료

- Next.js + Supabase 프로젝트 폴더 `staylink-app` 생성
- 현재 공식 문서 기준 Supabase 환경변수명 적용
- Node 22 이상 기준으로 package 구성
- Supabase client 유틸 작성
  - 브라우저 client
  - 서버 cookie 기반 client
  - service role admin client
- DB 스키마 v1 초안 작성
- seed 데이터 초안 작성
- 예약 가능 여부 계산 로직 작성
- 방/사이트/이미지 조회 API 골격 작성
- 유튜브 UTM campaign 처리 유틸 작성
- UTM 이벤트 저장 API 골격 작성

## 확인 필요

- Supabase 프로젝트 생성 여부
- Supabase URL과 publishable key
- service role key 보관 위치
- 실제 이미지 Storage bucket 이름
- 운영자 인증 방식
- `npm.cmd install`은 시도했지만 장시간 무출력 상태라 중단했으며, lockfile은 생성되지 않음
- 전역 `tsc`가 없어 타입체크는 패키지 설치 후 실행 필요

## 다음 작업

1. `npm.cmd install`로 패키지 설치와 lockfile 생성
2. Supabase 프로젝트 연결
3. Supabase CLI로 정식 migration 생성
4. `schema.v1.sql` 적용 후 advisor 점검
5. API를 실제 DB에 연결해 응답 검증

## 설치 후 검증 명령

```bash
npm.cmd run typecheck
npm.cmd run build
```
