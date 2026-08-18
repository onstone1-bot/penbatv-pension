"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "customer" | "host" | "operator";

const roleDestinations: Record<Role, string> = {
  customer: "/customer-home",
  host: "/host/rooms",
  operator: "/admin/operations"
};

export function AuthClient() {
  const [message, setMessage] = useState("로그인 방식과 역할 이동을 확인할 수 있는 4주차 연결 데모입니다.");

  async function signInWithKakao() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/customer-home`
      }
    });

    if (error) setMessage(`카카오 로그인 설정 확인 필요: ${error.message}`);
  }

  function continueWithNaverDemo() {
    window.location.href = "/customer-home?auth_provider=naver&auth_status=demo";
  }

  function enterRole(role: Role) {
    window.location.href = roleDestinations[role];
  }

  return (
    <div className="auth-live-panel">
      <div className="social-auth-grid">
        <article className="social-auth-card naver">
          <span>네이버</span>
          <h3>본인인증 가입</h3>
          <p>실서비스에서는 네이버 본인확인 또는 네이버 로그인 심사를 거쳐 고객 계정을 생성합니다.</p>
          <button type="button" onClick={continueWithNaverDemo}>
            네이버 데모로 계속하기
          </button>
        </article>

        <article className="social-auth-card kakao">
          <span>카카오</span>
          <h3>간편가입</h3>
          <p>Supabase OAuth 설정이 완료되면 카카오 계정으로 가입하고 고객홈으로 이동합니다.</p>
          <button type="button" onClick={signInWithKakao}>
            카카오로 계속하기
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
      </div>
    </div>
  );
}
