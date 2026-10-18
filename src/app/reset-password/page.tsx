import { createClient } from "@/lib/supabase/server";
import { AuthCard } from "@/components/forms/AuthCard";
import { PasswordForm } from "@/components/forms/PasswordForm";

export default async function ResetPasswordPage() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) {
    return (
      <AuthCard title="Link tidak valid" subtitle="Link reset password sudah kedaluwarsa atau sudah dipakai." footer={{ href: "/forgot-password", label: "Minta link baru" }}>
        <p className="text-sm text-slate-600">Buka link dari email terbaru Anda, atau minta link reset baru.</p>
      </AuthCard>
    );
  }
  return <AuthCard title="Buat password baru"><PasswordForm mode="reset" /></AuthCard>;
}
