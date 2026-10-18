"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { AuthCard } from "@/components/forms/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState(initialError ?? "");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setLoading(true);
    const { error } = await createClient().auth.signInWithPassword(parsed.data);
    if (error) { setLoading(false); setFormError(error.message.toLowerCase().includes("invalid") ? "Email atau password salah. Periksa lagi lalu coba kembali." : "Gagal masuk. Coba lagi beberapa saat."); return; }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard title="Masuk" subtitle="Gunakan akun karyawan Anda.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>}
        <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" error={errors.password} />
        <Button type="submit" full loading={loading}>Masuk</Button>
        <p className="text-center text-sm"><Link href="/forgot-password" className="text-slate-600 underline underline-offset-4">Lupa password?</Link></p>
      </form>
    </AuthCard>
  );
}
