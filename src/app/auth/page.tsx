import Link from "next/link";
import { AuthClient } from "./AuthClient";

const setupChecklist = [
  "카카오 개발자센터 앱 생성",
  "네이버 개발자센터 앱 생성",
  "Supabase/Vercel 환경변수 연결"
];

type AuthPlanningPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

function authStatusMessage(status: string | null, profileStatus: string | null, message: string | null) {
  if (status === "success" && profileStatus === "saved") return "로그인 성공: 고객 프로필이 저장되었습니다.";
  if (status === "success" && profileStatus === "needs_db_check") return `로그인은 성공했지만 프로필 저장 확인이 필요합니다. ${message ?? ""}`.trim();
  if (status === "error") return `로그인 실패: ${message ?? "OAuth 설정을 확인해 주세요."}`;
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
    <main className="auth-page simple-auth-page">
      <section className="auth-hero simple-auth-hero">
        <div>
          <Link className="home-back-link" href="/">펜바TV 홈</Link>
          <h1>로그인 안내</h1>
          <p>현재는 네이버·카카오 실제 연동 전 단계입니다. 고객홈 데모로 예약 흐름을 먼저 확인할 수 있습니다.</p>
        </div>
        <div className="auth-device-preview simple-auth-preview" aria-label="회원 기능 요약">
          <span>회원 기능</span>
          <b>예약 확인 · 찜 · MY</b>
          <small>실제 연동 후 고객별 DB 저장</small>
          <Link href="/customer-home">고객홈 보기</Link>
        </div>
      </section>

      <section className="auth-section simple-auth-section">
        <div className="section-head">
          <div>
            <span>LOGIN</span>
            <h2>간편 로그인 준비상태</h2>
          </div>
          <Link href="/my">MY 화면</Link>
        </div>
        <AuthClient defaultProvider={defaultProvider} statusMessage={statusMessage} providerStatus={providerStatus} />
      </section>

      <section className="auth-section simple-auth-checklist">
        <div className="section-head">
          <div>
            <span>NEXT</span>
            <h2>실제 로그인 연결에 필요한 것</h2>
          </div>
        </div>
        <div>
          {setupChecklist.map((item, index) => (
            <span key={item}>{index + 1}. {item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}