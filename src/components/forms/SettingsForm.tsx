"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { settingsSchema } from "@/lib/validation/settings";
import type { ShopSettings } from "@/types/database";

export function SettingsForm({ initial }: { initial: ShopSettings | null }) {
  const router = useRouter(); const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const p = settingsSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!p.success) { setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setLoading(true);
    const res = await callApi("/api/settings", "PUT", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menyimpan", "error"); return; }
    toast("Pengaturan disimpan"); router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Input label="Nama barbershop" name="shop_name" defaultValue={initial?.shop_name} error={errors.shop_name} />
      <Input label="Nama tampilan aplikasi" name="app_display_name" defaultValue={initial?.app_display_name} error={errors.app_display_name} />
      <div className="sm:col-span-2"><Input label="Alamat" name="address" defaultValue={initial?.address ?? ""} error={errors.address} /></div>
      <Input label="Jam buka" name="open_time" type="time" defaultValue={initial?.open_time.slice(0, 5)} error={errors.open_time} />
      <Input label="Jam tutup" name="close_time" type="time" defaultValue={initial?.close_time.slice(0, 5)} error={errors.close_time} />
      <div className="sm:col-span-2"><Input label="Nomor WhatsApp owner" name="owner_whatsapp_number" inputMode="numeric" defaultValue={initial?.owner_whatsapp_number ?? ""} hint="Format 62812…, tanpa + dan spasi. Tujuan laporan buka/tutup." error={errors.owner_whatsapp_number} /></div>
      <div className="sm:col-span-2"><Button type="submit" loading={loading} full className="sm:w-auto">Simpan pengaturan</Button></div>
    </form>
  );
}
