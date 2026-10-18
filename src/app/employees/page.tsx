import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { EmployeesManager } from "@/components/forms/EmployeesManager";
import type { Profile } from "@/types/database";

export default async function EmployeesPage() {
  const { supabase, profile, user } = await requireProfile(["owner"]);
  const { data } = await supabase.from("profiles").select("*").order("joined_at", { ascending: false });
  return <Page supabase={supabase} profile={profile} title="Karyawan"><EmployeesManager rows={(data ?? []) as Profile[]} selfId={user.id} /></Page>;
}
