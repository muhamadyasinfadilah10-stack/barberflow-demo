"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { barberSchema } from "@/lib/validation/barber";
import { hhmm } from "@/lib/utils/date";
import type { Barber } from "@/types/barber";

export function BarbersManager({ rows }: { rows: Barber[] }) {
  const router = useRouter(); const toast = useToast();
  const [editing, setEditing] = useState<Barber | "new" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(false); const [busy, setBusy] = useState("");
  const b = editing && editing !== "new" ? editing : null;
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = barberSchema.safeParse({ full_name: fd.get("full_name"), phone: fd.get("phone"), is_active: fd.get("is_active") === "on", work_start_time: fd.get("work_start_time"), work_end_time: fd.get("work_end_time") });
    if (!p.success) { setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setLoading(true);
    const res = await callApi(b ? `/api/barbers?id=${b.id}` : "/api/barbers", b ? "PUT" : "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menyimpan", "error"); return; }
    toast("Kapster disimpan"); setEditing(null); router.refresh();
  }
  async function remove(r: Barber) {
    if (!window.confirm(`Hapus kapster ${r.full_name}?`)) return;
    setBusy(r.id); const res = await callApi(`/api/barbers?id=${r.id}`, "DELETE"); setBusy("");
    if (!res.ok) { toast(res.error ?? "Gagal menghapus", "error"); return; }
    toast("Kapster dihapus"); router.refresh();
  }
  return (
    <>
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}>Tambah kapster</Button></div>
      <Card>
        <DataTable rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada kapster" hint="Tambahkan kapster agar pelanggan bisa booking." />}
          columns={[
            { header: "Nama", cell: (r) => <span className="font-medium">{r.full_name}</span> },
            { header: "WhatsApp", cell: (r) => r.phone || "-" },
            { header: "Jam kerja", cell: (r) => `${hhmm(r.work_start_time)}–${hhmm(r.work_end_time)}` },
            { header: "Status", cell: (r) => <Badge tone={r.is_active ? "success" : "muted"}>{r.is_active ? "Aktif" : "Libur"}</Badge> },
            { header: "Aksi", cell: (r) => <div className="flex flex-wrap justify-end gap-2 md:justify-start"><Button size="sm" variant="secondary" onClick={() => setEditing(r)}>Edit</Button><Button size="sm" variant="danger" loading={busy === r.id} onClick={() => remove(r)}>Hapus</Button></div> },
          ]} />
      </Card>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={b ? "Edit kapster" : "Tambah kapster"}>
        {editing !== null && (
          <form key={b?.id ?? "new"} onSubmit={save} className="space-y-4" noValidate>
            <Input label="Nama" name="full_name" defaultValue={b?.full_name} error={errors.full_name} />
            <Input label="Nomor WhatsApp" name="phone" inputMode="numeric" defaultValue={b?.phone ?? ""} error={errors.phone} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Jam mulai" name="work_start_time" type="time" defaultValue={hhmm(b?.work_start_time ?? "10:00")} error={errors.work_start_time} />
              <Input label="Jam selesai" name="work_end_time" type="time" defaultValue={hhmm(b?.work_end_time ?? "21:00")} error={errors.work_end_time} />
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="is_active" defaultChecked={b?.is_active ?? true} className="h-5 w-5 rounded border-slate-300" />Aktif (hilangkan centang jika libur)</label>
            <Button type="submit" full loading={loading}>Simpan</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
