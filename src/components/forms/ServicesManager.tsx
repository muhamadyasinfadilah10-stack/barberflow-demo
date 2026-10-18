"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { serviceSchema } from "@/lib/validation/service";
import { formatRupiah } from "@/lib/utils/format";
import type { Service } from "@/types/service";

export function ServicesManager({ rows }: { rows: Service[] }) {
  const router = useRouter(); const toast = useToast();
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(false); const [busy, setBusy] = useState("");
  const s = editing && editing !== "new" ? editing : null;
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const p = serviceSchema.safeParse({ ...fd, is_active: fd.is_active === "on" });
    if (!p.success) { setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setLoading(true);
    const res = await callApi(s ? `/api/services?id=${s.id}` : "/api/services", s ? "PUT" : "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menyimpan", "error"); return; }
    toast("Layanan disimpan"); setEditing(null); router.refresh();
  }
  async function remove(r: Service) {
    if (!window.confirm(`Hapus layanan ${r.name}?`)) return;
    setBusy(r.id); const res = await callApi(`/api/services?id=${r.id}`, "DELETE"); setBusy("");
    if (!res.ok) { toast(res.error ?? "Gagal menghapus", "error"); return; }
    toast("Layanan dihapus"); router.refresh();
  }
  return (
    <>
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}>Tambah layanan</Button></div>
      <Card>
        <DataTable rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada layanan" />}
          columns={[
            { header: "Layanan", cell: (r) => <span className="font-medium">{r.name}</span> },
            { header: "Harga", cell: (r) => formatRupiah(r.price) },
            { header: "Durasi", cell: (r) => `${r.duration_minutes} menit` },
            { header: "Komisi", cell: (r) => r.commission_type === "percent" ? `${r.commission_value}%` : formatRupiah(r.commission_value) },
            { header: "Status", cell: (r) => <Badge tone={r.is_active ? "success" : "muted"}>{r.is_active ? "Aktif" : "Nonaktif"}</Badge> },
            { header: "Aksi", cell: (r) => <div className="flex flex-wrap justify-end gap-2 md:justify-start"><Button size="sm" variant="secondary" onClick={() => setEditing(r)}>Edit</Button><Button size="sm" variant="danger" loading={busy === r.id} onClick={() => remove(r)}>Hapus</Button></div> },
          ]} />
      </Card>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={s ? "Edit layanan" : "Tambah layanan"}>
        {editing !== null && (
          <form key={s?.id ?? "new"} onSubmit={save} className="space-y-4" noValidate>
            <Input label="Nama layanan" name="name" defaultValue={s?.name} error={errors.name} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Harga (Rp)" name="price" type="number" inputMode="numeric" min={0} defaultValue={s?.price} error={errors.price} />
              <Input label="Durasi (menit)" name="duration_minutes" type="number" inputMode="numeric" min={5} defaultValue={s?.duration_minutes ?? 30} error={errors.duration_minutes} />
              <Select label="Jenis komisi" name="commission_type" defaultValue={s?.commission_type ?? "percent"}><option value="percent">Persen (%)</option><option value="fixed">Nominal tetap (Rp)</option></Select>
              <Input label="Nilai komisi" name="commission_value" type="number" inputMode="decimal" min={0} defaultValue={s?.commission_value ?? 0} error={errors.commission_value} />
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="is_active" defaultChecked={s?.is_active ?? true} className="h-5 w-5 rounded border-slate-300" />Aktif (tampil di pilihan booking)</label>
            <Button type="submit" full loading={loading}>Simpan</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
