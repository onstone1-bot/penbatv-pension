"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "customer" | "host" | "operator";
type AuthProvider = "naver" | "kakao";

type ProviderStatus = {
  naverReady: boolean;
  kakaoReady: boolean;
};

type AuthClientProps = {
  defaultProvider?: AuthProvider | null;
  statusMessage?: string | null;
  providerStatus: ProviderStatus;
};

const roleDestinations: Record<Role, string> = {
  customer: "/customer-home",
  host: "/host/rooms",
  operator: "/admin/operations"
};

const setupMessages: Record<AuthProvider, string> = {
  naver: "네이버 실제 로그인은 네이버 개발자센터 Client ID/Secret과 콜백 URL 설정 후 사용할 수 있습니다.",
  kakao: "카카오 실제 로그인은 카카오 개발자센터 앱 생성 후 Supabase Kakao Provider 설정이 끝나야 사용할 수 있습니다."
};

export function AuthClient({ defaultProvider = null, statusMessage = null, providerStatus }: AuthClientProps) {
  const [message, setMessage] = useState(
    statusMessage ?? "현재 간편가입은 연동 준비 상태입니다. 설정 전에는 고객홈 데모로 흐름만 확인합니다."
  );
  const [isLoading, setIsLoading] = useState<AuthProvider | null>(null);

  function enterCustomerDemo(provider: AuthProvider) {
    localStorage.setItem(
      "penbatv.demoProfile",
      JSON.stringify({
        provider,
        name: provider === "kakao" ? "카카오 데모 고객" : "네이버 데모 고객",
        signedInAt: new Date().toISOString()
      })
    );

    window.location.href = `/customer-home?auth_status=demo&provider=${provider}&auth_message=${provider}_setup_required`;
  }

  async function signInWithProvider(provider: AuthProvider) {
    setIsLoading(provider);

    if (provider === "naver") {
      if (!providerStatus.naverReady) {
        setMessage(setupMessages.naver);
        setIsLoading(null);
        return;
      }

      setMessage("네이버 로그인 시작 API로 이동합니다.");
      window.location.href = "/api/auth/naver/start?next=/customer-home";
      return;
    }

    if (!providerStatus.kakaoReady) {
      setMessage(setupMessages.kakao);
      setIsLoading(null);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/customer-home`,
        scopes: "profile_nickname account_email phone_number"
      }
    });

    if (error) {
      setIsLoading(null);
      setMessage(`카카오 로그인 설정 확인 필요: ${error.message}`);
    }
  }

  function enterRole(role: Role) {
    window.location.href = roleDestinations[role];
  }

  return (
    <div className="auth-live-panel">
      <div className="auth-status-note">
        <b>현재 버튼 상태</b>
        <span>실제 회원가입 버튼이 아니라, 네이버·카카오 외부 설정을 연결하기 전 단계까지 포함한 데모 화면입니다.</span>
      </div>

      <div className="social-auth-grid">
        <article className={`social-auth-card naver ${defaultProvider === "naver" ? "selected" : ""}`}>
          <span>{providerStatus.naverReady ? "연동 준비됨" : "설정 필요"}</span>
          <h3>네이버 로그인</h3>
          <p>{providerStatus.naverReady ? "네이버 인증 화면으로 이동해 고객 프로필 연결을 테스트합니다." : setupMessages.naver}</p>
          <div className="social-auth-actions">
            <button type="button" onClick={() => signInWithProvider("naver")} disabled={isLoading !== null}>
              {providerStatus.naverReady ? (isLoading === "naver" ? "네이버 연결 중" : "네이버 연결 테스트") : "설정 상태 확인"}
            </button>
            <button type="button" className="secondary" onClick={() => enterCustomerDemo("naver")} disabled={isLoading !== null}>
              고객홈 데모 보기
            </button>
          </div>
        </article>

        <article className={`social-auth-card kakao ${defaultProvider === "kakao" ? "selected" : ""}`}>
          <span>{providerStatus.kakaoReady ? "연동 준비됨" : "설정 필요"}</span>
          <h3>카카오 로그인</h3>
          <p>{providerStatus.kakaoReady ? "카카오 인증 후 Supabase 세션과 고객 프로필을 저장합니다." : setupMessages.kakao}</p>
          <div className="social-auth-actions">
            <button type="button" onClick={() => signInWithProvider("kakao")} disabled={isLoading !== null}>
              {providerStatus.kakaoReady ? (isLoading === "kakao" ? "카카오 연결 중" : "카카오 연결 테스트") : "설정 상태 확인"}
            </button>
            <button type="button" className="secondary" onClick={() => enterCustomerDemo("kakao")} disabled={isLoading !== null}>
              고객홈 데모 보기
            </button>
          </div>
        </article>
      </div>

      <div className="role-shortcut-panel">
        <div>
          <b>역할별 화면 바로가기</b>
          <small>{message}</small>
        </div>
        <button type="button" onClick={() => enterRole("customer")}>
          고객홈
        </button>
        <button type="button" onClick={() => enterRole("host")}>
          사장님 관리방
        </button>
        <button type="button" onClick={() => enterRole("operator")}>
          운영자 관리방
        </button>
        <button type="button" onClick={() => { window.location.href = "/auth/signout"; }}>
          로그아웃
        </button>
      </div>
    </div>
  );
}