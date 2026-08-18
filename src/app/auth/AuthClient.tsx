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

    if (provider === "naver") {
      localStorage.setItem(
        "penbatv.demoProfile",
        JSON.stringify({
          provider: "naver",
          name: "네이버 데모 고객",
          signedInAt: new Date().toISOString()
        })
      );
      setMessage("네이버 실연동 전 데모 로그인으로 고객홈에 이동합니다. 실제 연동은 네이버 OAuth 콜백 구현 후 연결합니다.");
      window.location.href = "/customer-home?auth_status=demo&provider=naver";
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
