import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = await createClient();

  await supabase.auth.signOut();

  const target = new URL("/", requestUrl.origin);
  target.searchParams.set("signed_out", "1");

  return NextResponse.redirect(target);
}
