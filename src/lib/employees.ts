import "server-only";
import { createClient as createPlain } from "@supabase/supabase-js";
/** Kirim email reset password tanpa menyentuh cookie sesi owner. */
export async function sendResetEmail(email: string) {
  const c = createPlain(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return c.auth.resetPasswordForEmail(email, { redirectTo: `${site}/auth/confirm?next=/reset-password` });
}
