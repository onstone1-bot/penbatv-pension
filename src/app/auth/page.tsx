import Link from "next/link";
import { AuthClient } from "./AuthClient";

const roleCards = [
  {
    role: "고객",
    badge: "기본 권한",
    entry: "유튜브 설명란 링크 또는 메인홈에서 가입",
    screens: ["고객홈", "예약확인", "찜", "MY 정보관리"],
    data: "이름, 휴대폰, 예약자 정보, 찜한 숙소, 결제 내역"
  },
  {
    role: "사장님",
    badge: "입점 승인 후 부여",
    entry: "입점제안 승인 뒤 파트너 계정 생성",
    screens: ["객실 관리", "요금 관리", "사진/영상 등록", "예약 현황"],
    data: "사업자 정보, 숙소 정보, 객실/옵션, 정산 계좌, 운영 지표"
  },
  {
    role: "운영자",
    badge: "내부 관리자",
    entry: "펜바TV 운영자가 직접 계정 발급",
    screens: ["입점 승인", "전체 예약", "결제/정산", "성과 집계"],
    data: "전체 숙소, 전체 예약, 결제 상태, 유튜브 UTM 성과"
  }
];

const implementationSteps = [
  "Supabase Auth 세션을 서버 쿠키로 유지",
  "로그인 성공 후 profiles 테이블에 고객 프로필 자동 저장",
  "고객은 MY, 사장님은 사장님 콘솔, 운영자는 운영자 콘솔로 이동",
  "예약/결제 API는 로그인 사용자와 서버 권한을 기준으로 검증"
];

const setupChecklist = [
  "Supabase Auth Redirect URL에 /auth/callback 등록",
  "카카오 개발자센터 REST API Key와 Client Secret 발급",
  "Supabase Kakao Provider에 카카오 키 입력",
  "네이버 개발자센터 Client ID/Secret 발급",
  "네이버는 Supabase custom OAuth/OIDC 또는 별도 콜백 방식으로 연결",
  "Vercel 환경변수와 Supabase 운영 프로젝트 값 일치 확인"
];

type AuthPlanningPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

function authStatusMessage(status: string | null, profileStatus: string | null, message: string | null) {
  if (status === "success" && profileStatus === "saved") {
    return "로그인 성공: 고객 프로필이 DB에 저장되었습니다.";
  }

  if (status === "success" && profileStatus === "needs_db_check") {
    return `로그인은 성공했지만 프로필 저장 확인이 필요합니다. ${message ?? ""}`.trim();
  }

  if (status === "error") {
    return `로그인 실패: ${message ?? "OAuth 설정을 확인해 주세요."}`;
  }

  return null;
}

export default async function AuthPlanningPage({ searchParams }: AuthPlanningPageProps) {
  const query = await searchParams;
  const provider = first(query.provider);
  const authStatus = first(query.auth_status);
  const profileStatus = first(query.profile_status);
  const authMessage = first(query.auth_message) ?? first(query.profile_message);
  const statusMessage = authStatusMessage(authStatus, profileStatus, authMessage);
  const defaultProvider = provider === "naver" || provider === "kakao" ? provider : null;
  const providerStatus = {
    naverReady: Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
    kakaoReady: process.env.NEXT_PUBLIC_KAKAO_AUTH_READY === "true"
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div>
          <Link className="home-back-link" href="/">
            펜바TV 메인홈
          </Link>
          <p className="muted">Week 2 Day 8-14</p>
          <h1>네이버·카카오 간편 로그인</h1>
          <p>
            고객은 네이버·카카오로 가입하고, 로그인 성공 시 펜바TV DB의 고객 프로필이 자동 생성됩니다.
            이후 MY 화면에서 예약 확인, 찜한 숙소, 회원정보 관리를 이어갑니다.
          </p>
        </div>
        <div className="auth-device-preview" aria-label="가입 후 이동 화면 예시">
          <span>가입 완료</span>
          <b>김고객님</b>
          <small>다음 예약까지 5일 남았습니다.</small>
          <Link href="/stays/baebang-alps?utm_source=penbatv&utm_medium=auth_preview&utm_campaign=baebang-alps">
            내 예약 보러가기
          </Link>
        </div>
      </section>

      <section className="auth-section">
        <div className="section-head">
          <h2>간편 로그인</h2>
          <span>OAuth · DB 자동가입 · 고객홈 이동</span>
        </div>
        <AuthClient defaultProvider={defaultProvider} statusMessage={statusMessage} providerStatus={providerStatus} />
      </section>

      <section className="auth-section">
        <div className="section-head">
          <h2>역할별 권한</h2>
          <span>고객 · 사장님 · 운영자</span>
        </div>
        <div className="permission-grid">
          {roleCards.map((role) => (
            <article className="permission-card" key={role.role}>
              <span>{role.badge}</span>
              <h3>{role.role}</h3>
              <p>{role.entry}</p>
              <b>접근 화면</b>
              <div>
                {role.screens.map((screen) => (
                  <small key={screen}>{screen}</small>
                ))}
              </div>
              <b>관리 데이터</b>
              <p>{role.data}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-section auth-implementation-panel">
        <div>
          <h2>2주차 구현 기준</h2>
          <p>
            로그인 버튼만 두는 것이 아니라, Supabase 세션, 고객 프로필 저장, MY 화면 조회까지 한 흐름으로 동작해야 합니다.
          </p>
        </div>
        <ol>
          {implementationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="auth-section auth-implementation-panel">
        <div>
          <h2>외부 설정 체크리스트</h2>
          <p>
            아래 설정은 네이버/카카오 개발자센터와 Supabase 대시보드에서 직접 확인해야 합니다. 코드 연결은 준비되어 있고,
            이 설정이 끝나면 실제 로그인 테스트가 가능합니다.
          </p>
        </div>
        <ol>
          {setupChecklist.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
