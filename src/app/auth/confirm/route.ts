import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Menangani link dari email reset password (token_hash atau code PKCE)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/reset-password";
  const safeNext = next.startsWith("/") ? next : "/reset-password";
  const supabase = await createClient();
  let ok = false;
  if (token_hash && type) ok = !(await supabase.auth.verifyOtp({ type, token_hash })).error;
  else if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  return NextResponse.redirect(`${origin}${ok ? safeNext : "/forgot-password?error=link"}`);
}
