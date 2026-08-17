# VS Code 로컬 실행/디버깅 안내

이 폴더는 펜바TV 프로젝트를 VS Code에서 실행하고 디버깅하기 위한 설정입니다.

## 1. 프로젝트 열기

VS Code에서 아래 폴더를 열어야 합니다.

```text
C:\Users\onsto\OneDrive\Documents\ChatGPT\팬션 홍보\staylink-app
```

상위 폴더인 `팬션 홍보`가 아니라, 반드시 `staylink-app` 폴더를 열어야 합니다.

## 2. 처음 한 번 설치

VS Code 터미널에서 실행합니다.

```bash
npm install
```

이미 `node_modules`가 있으면 생략해도 됩니다.

## 3. 일반 실행

터미널에서 실행합니다.

```bash
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:3000/stays/baebang-alps?utm_source=penbatv&utm_medium=local_debug&utm_campaign=baebang-alps
```

## 4. VS Code Run and Debug 실행

왼쪽 메뉴에서 **Run and Debug**를 열고 아래 중 하나를 선택합니다.

### PenBaTV: full stack debug

가장 추천하는 설정입니다.

- Next.js 개발 서버를 실행합니다.
- Chrome 브라우저를 자동으로 엽니다.
- 서버 코드와 브라우저 코드 디버깅을 같이 볼 수 있습니다.

### PenBaTV: debug browser only

이미 `npm run dev` 서버가 켜져 있을 때 사용합니다.

- Chrome만 디버깅 모드로 엽니다.
- 화면 클릭, React 클라이언트 코드 확인에 좋습니다.

### PenBaTV: debug server only

서버/API 쪽만 보고 싶을 때 사용합니다.

- API 라우트의 breakpoint 확인에 좋습니다.
- 예: `src/app/api/quote/route.ts`, `src/app/api/availability/route.ts`

### PenBaTV: open public demo

현재 외부 배포 URL을 Chrome 디버그 모드로 엽니다.

- 공개 데모 화면 확인용입니다.
- 로컬 소스와 완전히 같은 실행 환경은 아닙니다.

## 5. breakpoint 찍는 곳

고객 예약 화면:

```text
src/app/stays/[id]/StayAppClient.tsx
```

예약 가능 여부 API:

```text
src/app/api/availability/route.ts
src/lib/availability.ts
```

견적 계산:

```text
src/app/api/quote/route.ts
src/lib/pricing.ts
src/lib/local-quote.ts
```

결제 준비/승인:

```text
src/app/api/payments/prepare/route.ts
src/app/api/payments/confirm/route.ts
src/lib/payments/orders.ts
src/lib/payments/confirm.ts
```

## 6. 자주 쓰는 검증 명령어

```bash
npm run typecheck
npm run build
npm run build:sites
```

- `typecheck`: TypeScript 오류 확인
- `build`: 실제 Next.js 빌드 확인
- `build:sites`: 공개 Sites 데모 배포용 파일 생성

## 7. 포트가 이미 사용 중일 때

`localhost:3000`이 이미 사용 중이면 기존 터미널에서 실행 중인 `npm run dev`를 종료합니다.

종료 방법:

```text
Ctrl + C
```

그 후 다시 `Run and Debug`를 실행합니다.
