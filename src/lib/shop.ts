import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
/** Nama aplikasi. Di-cache per request agar bisa dimulai paralel dengan query profil. */
export const getAppName = cache(async (supabase: SupabaseClient): Promise<string> => {
  const { data } = await supabase.from("shop_settings").select("app_display_name").limit(1).maybeSingle();
  return data?.app_display_name ?? "BarberFlow";
});
