import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertCustomerProfileFromUser } from "@/lib/auth/profiles";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/customer-home";
  return value;
}

function redirectWithParams(origin: string, path: string, params: Record<string, string>) {
  const target = new URL(path, origin);

  for (const [key, value] of Object.entries(params)) {
    target.searchParams.set(key, value);
  }

  return NextResponse.redirect(target);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const code = requestUrl.searchParams.get("code");
  const providerError =
    requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");

  if (providerError) {
    return redirectWithParams(origin, "/auth", {
      auth_status: "error",
      auth_message: providerError
    });
  }

  if (!code) {
    return redirectWithParams(origin, "/auth", {
      auth_status: "error",
      auth_message: "로그인 인증 코드가 전달되지 않았습니다."
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithParams(origin, "/auth", {
      auth_status: "error",
      auth_message: error.message
    });
  }

  const user = data.user ?? (await supabase.auth.getUser()).data.user;

  if (!user) {
    return redirectWithParams(origin, "/auth", {
      auth_status: "error",
      auth_message: "로그인 사용자를 확인하지 못했습니다."
    });
  }

  try {
    await upsertCustomerProfileFromUser(user);
  } catch (profileError) {
    const message = profileError instanceof Error ? profileError.message : "프로필 저장 실패";

    return redirectWithParams(origin, next, {
      auth_status: "success",
      profile_status: "needs_db_check",
      profile_message: message
    });
  }

  return redirectWithParams(origin, next, {
    auth_status: "success",
    profile_status: "saved"
  });
}
