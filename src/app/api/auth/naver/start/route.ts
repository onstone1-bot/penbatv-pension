import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/customer-home";
  const clientId = process.env.NAVER_CLIENT_ID;
  const redirectUri =
    process.env.NAVER_REDIRECT_URI || `${url.origin}/api/auth/naver/callback`;

  if (!clientId) {
    return NextResponse.redirect(
      new URL(`${next}?auth_status=demo&provider=naver&auth_message=naver_env_missing`, url.origin)
    );
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(
    `https://nid.naver.com/oauth2.0/authorize?${new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state
    })}`
  );

  response.cookies.set("penbatv_naver_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    maxAge: 60 * 10,
    path: "/"
  });
  response.cookies.set("penbatv_naver_next", next, {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    maxAge: 60 * 10,
    path: "/"
  });

  return response;
}
