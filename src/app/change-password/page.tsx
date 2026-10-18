import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { PasswordForm } from "@/components/forms/PasswordForm";

export default async function ChangePasswordPage() {
  const { supabase, profile, user } = await requireProfile();
  return (
    <Page supabase={supabase} profile={profile} title="Ganti password">
      <Card className="max-w-md"><PasswordForm mode="change" email={user.email ?? ""} /><p className="mt-4 text-xs text-slate-500">Setelah berhasil, Anda akan keluar dan perlu masuk lagi.</p></Card>
    </Page>
  );
}
