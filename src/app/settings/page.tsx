import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { SettingsForm } from "@/components/forms/SettingsForm";
import type { ShopSettings } from "@/types/database";

export default async function SettingsPage() {
  const { supabase, profile } = await requireProfile(["owner"]);
  const { data } = await supabase.from("shop_settings").select("*").limit(1).maybeSingle();
  return <Page supabase={supabase} profile={profile} title="Pengaturan"><Card><SettingsForm initial={data as ShopSettings | null} /></Card></Page>;
}
