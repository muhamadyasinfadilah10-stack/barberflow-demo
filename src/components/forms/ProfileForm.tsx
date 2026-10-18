"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const router = useRouter(); const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const res = await callApi("/api/profile", "PATCH", { full_name: String(fd.get("full_name") ?? ""), phone: String(fd.get("phone") ?? "") });
    setLoading(false);
    if (!res.ok) { setErrors(Object.fromEntries(Object.entries(res.fields ?? {}).map(([k, v]) => [k, v[0]]))); toast(res.error ?? "Gagal menyimpan", "error"); return; }
    setErrors({}); toast("Profil diperbarui"); router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Input label="Nama" name="full_name" defaultValue={fullName} error={errors.full_name} />
      <Input label="Nomor WhatsApp" name="phone" inputMode="numeric" defaultValue={phone} hint="Format 62812…, tanpa + dan spasi" error={errors.phone} />
      <Button type="submit" loading={loading}>Simpan perubahan</Button>
    </form>
  );
}
