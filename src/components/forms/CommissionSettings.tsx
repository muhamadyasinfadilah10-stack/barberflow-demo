"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { serviceSchema } from "@/lib/validation/service";
import { calculateCommission } from "@/lib/commission/calculate";
import { formatRupiah } from "@/lib/utils/format";
import type { Service } from "@/types/service";

const field = "min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-base sm:text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

function Row({ s }: { s: Service }) {
  const router = useRouter(); const toast = useToast();
  const [type, setType] = useState<Service["commission_type"]>(s.commission_type);
  const [value, setValue] = useState(String(s.commission_value));
  const [loading, setLoading] = useState(false);
  const num = Number(value);
  const preview = Number.isFinite(num) ? calculateCommission({ price: s.price, commission_type: type, commission_value: num }) : 0;
  const changed = type !== s.commission_type || num !== Number(s.commission_value);

  async function save() {
    const p = serviceSchema.safeParse({ name: s.name, price: s.price, duration_minutes: s.duration_minutes, is_active: s.is_active, commission_type: type, commission_value: value });
    if (!p.success) { toast(p.error.issues[0].message, "error"); return; }
    setLoading(true);
    const res = await callApi(`/api/services?id=${s.id}`, "PUT", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menyimpan", "error"); return; }
    toast(`Komisi ${s.name} disimpan`); router.refresh();
  }
  return (
    <li className="rounded-xl border border-slate-200 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-medium">{s.name}</p><p className="text-sm text-slate-500">Harga {formatRupiah(s.price)}</p></div>
        <p className="text-right text-sm text-slate-500">Komisi per layanan<br /><span className="text-base font-semibold text-slate-900">{formatRupiah(preview)}</span></p>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <select aria-label={`Jenis komisi ${s.name}`} value={type} onChange={(e) => setType(e.target.value as Service["commission_type"])} className={field}>
          <option value="percent">Persen (%)</option><option value="fixed">Nominal (Rp)</option>
        </select>
        <input aria-label={`Nilai komisi ${s.name}`} type="number" inputMode="decimal" min={0} max={type === "percent" ? 100 : undefined} value={value} onChange={(e) => setValue(e.target.value)} className={`${field} w-28`} />
        <Button size="sm" className="min-h-11" loading={loading} disabled={!changed} onClick={save}>Simpan</Button>
      </div>
    </li>
  );
}

/** Owner mengatur komisi tiap layanan langsung dari halaman Komisi. */
export function CommissionSettings({ services }: { services: Service[] }) {
  if (!services.length) return <p className="text-sm text-slate-500">Belum ada layanan. Tambahkan di menu Layanan.</p>;
  return <ul className="space-y-3">{services.map((s) => <Row key={`${s.id}-${s.commission_type}-${s.commission_value}`} s={s} />)}</ul>;
}
