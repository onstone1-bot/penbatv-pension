import { NextResponse } from "next/server";

type NaverTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type NaverProfileResponse = {
  response?: {
    id?: string;
    email?: string;
    name?: string;
    mobile?: string;
    profile_image?: string;
  };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.headers.get("cookie")?.match(/penbatv_naver_state=([^;]+)/)?.[1];
  const savedNext = request.headers.get("cookie")?.match(/penbatv_naver_next=([^;]+)/)?.[1];
  const next = savedNext ? decodeURIComponent(savedNext) : "/customer-home";
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!code || !state || !savedState || state !== decodeURIComponent(savedState)) {
    return NextResponse.redirect(
      new URL(`${next}?auth_status=error&provider=naver&auth_message=invalid_state`, url.origin)
    );
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`${next}?auth_status=demo&provider=naver&auth_message=naver_secret_missing`, url.origin)
    );
  }

  const tokenResponse = await fetch(
    `https://nid.naver.com/oauth2.0/token?${new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state
    })}`,
    { cache: "no-store" }
  );
  const token = (await tokenResponse.json()) as NaverTokenResponse;

  if (!tokenResponse.ok || !token.access_token) {
    return NextResponse.redirect(
      new URL(
        `${next}?auth_status=error&provider=naver&auth_message=${encodeURIComponent(token.error_description || token.error || "token_failed")}`,
        url.origin
      )
    );
  }

  const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: {
      Authorization: `Bearer ${token.access_token}`
    },
    cache: "no-store"
  });
  const profile = (await profileResponse.json()) as NaverProfileResponse;
  const profileName = profile.response?.name || "네이버 고객";

  return NextResponse.redirect(
    new URL(
      `${next}?auth_status=naver_verified&provider=naver&auth_message=${encodeURIComponent(`${profileName}님 네이버 인증 확인`)}`,
      url.origin
    )
  );
}
