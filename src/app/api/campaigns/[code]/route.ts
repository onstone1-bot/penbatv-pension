import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("youtube_campaigns")
    .select("*")
    .eq("code", code)
    .eq("status", "active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ campaign: data });
}
