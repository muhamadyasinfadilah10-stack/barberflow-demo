import { DashboardShell } from "./DashboardShell";
import type { Profile } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Pembungkus server: ambil nama aplikasi dari pengaturan lalu render shell. */
export async function Page({ supabase, profile, title, actions, children }: { supabase: SupabaseClient; profile: Profile; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const { data } = await supabase.from("shop_settings").select("app_display_name").limit(1).maybeSingle();
  return <DashboardShell name={profile.full_name} role={profile.role} appName={data?.app_display_name ?? "BarberFlow"} title={title} actions={actions}>{children}</DashboardShell>;
}
