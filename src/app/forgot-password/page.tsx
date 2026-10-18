"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { forgotSchema } from "@/lib/validation/auth";
import { AuthCard } from "@/components/forms/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = forgotSchema.safeParse({ email: new FormData(e.currentTarget).get("email") });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setError(""); setLoading(true);
    const { error: err } = await createClient().auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password` });
    setLoading(false);
    if (err) setError("Gagal mengirim email. Coba lagi beberapa saat."); else setSent(true);
  }
  return (
    <AuthCard title="Lupa password" subtitle="Kami akan mengirim link untuk membuat password baru." footer={{ href: "/login", label: "Kembali ke halaman masuk" }}>
      {sent ? (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">Jika email terdaftar, link reset password sudah dikirim. Cek kotak masuk dan folder spam.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" error={error} />
          <Button type="submit" full loading={loading}>Kirim link reset</Button>
        </form>
      )}
    </AuthCard>
  );
}
