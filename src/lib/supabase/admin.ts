import "server-only";
import { createClient } from "@supabase/supabase-js";
// HANYA untuk kode server (webhook WhatsApp, kelola karyawan). Jangan diimpor di komponen client.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}
