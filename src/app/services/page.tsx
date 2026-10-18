import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { ServicesManager } from "@/components/forms/ServicesManager";
import type { Service } from "@/types/service";
export default async function ServicesPage() {
  const { supabase, profile } = await requireProfile(["owner"]);
  const { data } = await supabase.from("services").select("*").order("name");
  return <Page supabase={supabase} profile={profile} title="Layanan"><ServicesManager rows={(data ?? []) as Service[]} /></Page>;
}
