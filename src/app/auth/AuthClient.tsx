"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "customer" | "host" | "operator";
type AuthProvider = "naver" | "kakao";

type AuthClientProps = {
  defaultProvider?: AuthProvider | null;
  statusMessage?: string | null;
};

const roleDestinations: Record<Role, string> = {
  customer: "/customer-home",
  host: "/host/rooms",
  operator: "/admin/operations"
};

export function AuthClient({ defaultProvider = null, statusMessage = null }: AuthClientProps) {
  const [message, setMessage] = useState(
    statusMessage ?? "네이버·카카오 로그인 후 고객 프로필이 DB에 자동 저장됩니다."
  );
  const [isLoading, setIsLoading] = useState<AuthProvider | null>(null);

  async function signInWithProvider(provider: AuthProvider) {
    setIsLoading(provider);
    const supabase = createClient();
    const oauthProvider = provider === "kakao" ? "kakao" : "custom:naver";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: oauthProvider as Parameters<typeof supabase.auth.signInWithOAuth>[0]["provider"],
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/customer-home`,
        scopes: provider === "kakao" ? "profile_nickname account_email phone_number" : "name email mobile"
      }
    });

    if (error) {
      setIsLoading(null);
      setMessage(`${provider === "kakao" ? "카카오" : "네이버"} 로그인 설정 확인 필요: ${error.message}`);
    }
  }

  function enterRole(role: Role) {
    window.location.href = roleDestinations[role];
  }

  return (
    <div className="auth-live-panel">
      <div className="social-auth-grid">
        <article className={`social-auth-card naver ${defaultProvider === "naver" ? "selected" : ""}`}>
          <span>네이버</span>
          <h3>네이버로 시작하기</h3>
          <p>네이버 로그인 성공 후 펜바TV 고객 계정과 프로필이 자동 생성됩니다.</p>
          <button type="button" onClick={() => signInWithProvider("naver")} disabled={isLoading !== null}>
            {isLoading === "naver" ? "네이버 연결 중" : "네이버 로그인"}
          </button>
        </article>

        <article className={`social-auth-card kakao ${defaultProvider === "kakao" ? "selected" : ""}`}>
          <span>카카오</span>
          <h3>카카오로 시작하기</h3>
          <p>카카오 로그인 성공 후 예약자 정보를 고객 MY 화면에서 이어서 관리합니다.</p>
          <button type="button" onClick={() => signInWithProvider("kakao")} disabled={isLoading !== null}>
            {isLoading === "kakao" ? "카카오 연결 중" : "카카오 로그인"}
          </button>
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
