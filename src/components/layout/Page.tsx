import { DashboardShell } from "./DashboardShell";
import type { Profile } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAppName } from "@/lib/shop";

/** Pembungkus server: ambil nama aplikasi dari pengaturan lalu render shell. */
export async function Page({ supabase, profile, title, actions, children }: { supabase: SupabaseClient; profile: Profile; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const appName = await getAppName(supabase);
  return <DashboardShell name={profile.full_name} role={profile.role} appName={appName} title={title} actions={actions}>{children}</DashboardShell>;
}
