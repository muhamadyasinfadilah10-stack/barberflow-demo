import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { BarbersManager } from "@/components/forms/BarbersManager";
import type { Barber } from "@/types/barber";
export default async function BarbersPage() {
  const { supabase, profile } = await requireProfile(["owner"]);
  const { data } = await supabase.from("barbers").select("*").order("full_name");
  return <Page supabase={supabase} profile={profile} title="Kapster"><BarbersManager rows={(data ?? []) as Barber[]} /></Page>;
}
