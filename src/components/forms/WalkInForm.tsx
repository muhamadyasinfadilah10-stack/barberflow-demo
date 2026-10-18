"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { walkInSchema } from "@/lib/validation/booking";
import { formatQueue, formatRupiah } from "@/lib/utils/format";

export function WalkInForm({ services, barbers }: { services: { id: string; name: string; price: number }[]; barbers: { id: string; full_name: string }[] }) {
  const router = useRouter(); const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const p = walkInSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!p.success) { setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setLoading(true);
    const res = await callApi("/api/walk-in", "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menambah antrean", "error"); return; }
    toast(`Nomor antrean ${formatQueue(Number(res.raw?.queue_number))}`); form.reset(); router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end" noValidate>
      <Input label="Nama pelanggan" name="customer_name" error={errors.customer_name} />
      <Select label="Layanan" name="service_id" defaultValue="" error={errors.service_id}><option value="">Pilih layanan</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name} · {formatRupiah(s.price)}</option>)}</Select>
      <Select label="Kapster" name="barber_id" defaultValue="" error={errors.barber_id}><option value="">Pilih kapster</option>{barbers.map((b) => <option key={b.id} value={b.id}>{b.full_name}</option>)}</Select>
      <Button type="submit" loading={loading}>Tambah ke antrean</Button>
    </form>
  );
}
