"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { changePasswordSchema, resetSchema } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** mode "reset": dari link email. mode "change": user login, minta password lama. */
export function PasswordForm({ mode, email }: { mode: "reset" | "change"; email?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = mode === "change" ? changePasswordSchema.safeParse(fd) : resetSchema.safeParse(fd);
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setLoading(true);
    const supabase = createClient();
    if (mode === "change") {
      const { error } = await supabase.auth.signInWithPassword({ email: email ?? "", password: fd.oldPassword });
      if (error) { setLoading(false); setErrors({ oldPassword: "Password lama salah" }); return; }
    }
    const { error } = await supabase.auth.updateUser({ password: fd.password });
    if (error) { setLoading(false); setFormError(error.message.includes("same") ? "Password baru tidak boleh sama dengan yang lama." : "Gagal menyimpan password. Link mungkin sudah kedaluwarsa, minta link baru."); return; }
    await supabase.auth.signOut();
    toast("Password berhasil diubah. Silakan masuk kembali.");
    router.replace("/login");
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>}
      {mode === "change" && <Input label="Password lama" name="oldPassword" type="password" autoComplete="current-password" error={errors.oldPassword} />}
      <Input label="Password baru" name="password" type="password" autoComplete="new-password" hint="Minimal 8 karakter" error={errors.password} />
      <Input label="Ulangi password baru" name="confirm" type="password" autoComplete="new-password" error={errors.confirm} />
      <Button type="submit" full loading={loading}>Simpan password</Button>
    </form>
  );
}
