"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { employeeCreateSchema, employeeUpdateSchema } from "@/lib/validation/employee";
import { formatDateID, hhmm } from "@/lib/utils/date";
import { ROLE_LABEL, STATUS_LABEL } from "@/lib/utils/format";
import type { Profile } from "@/types/database";

export function EmployeesManager({ rows, selfId }: { rows: Profile[]; selfId: string }) {
  const router = useRouter(); const toast = useToast();
  const [editing, setEditing] = useState<Profile | "new" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const isNew = editing === "new";
  const emp = editing && editing !== "new" ? editing : null;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const p = isNew ? employeeCreateSchema.safeParse(fd) : employeeUpdateSchema.safeParse(fd);
    if (!p.success) { setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    setErrors({}); setLoading(true);
    const res = await callApi(isNew ? "/api/employees" : `/api/employees/${emp!.id}`, isNew ? "POST" : "PATCH", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menyimpan", "error"); return; }
    toast(isNew ? "Karyawan ditambahkan" : "Data karyawan diperbarui"); setEditing(null); router.refresh();
  }
  async function run(key: string, fn: () => Promise<{ ok: boolean; error?: string; raw?: Record<string, unknown> }>, okMsg: string) {
    setBusy(key); const res = await fn(); setBusy("");
    if (!res.ok) { toast(res.error ?? "Gagal", "error"); return; }
    toast(String(res.raw?.message ?? okMsg)); router.refresh();
  }
  const deactivate = (r: Profile) => run("d" + r.id, () => callApi(`/api/employees/${r.id}`, "PATCH", { full_name: r.full_name, phone: r.phone ?? "", role: r.role, status: "inactive", work_start_time: hhmm(r.work_start_time), work_end_time: hhmm(r.work_end_time) }), "Karyawan dinonaktifkan");
  const reset = (r: Profile) => run("r" + r.id, () => callApi(`/api/employees/${r.id}`, "PATCH", { action: "reset_password" }), "Email reset dikirim");
  const remove = (r: Profile) => { if (window.confirm(`Hapus ${r.full_name} secara permanen? Hanya bisa jika belum punya riwayat.`)) run("x" + r.id, () => callApi(`/api/employees/${r.id}`, "DELETE"), "Karyawan dihapus"); };

  return (
    <>
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}>Tambah karyawan</Button></div>
      <Card>
        <DataTable rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada karyawan" />}
          columns={[
            { header: "Nama", cell: (r) => <span className="font-medium">{r.full_name}</span> },
            { header: "Email", cell: (r) => r.email ?? "-" },
            { header: "WhatsApp", cell: (r) => r.phone || "-" },
            { header: "Role", cell: (r) => ROLE_LABEL[r.role] },
            { header: "Status", cell: (r) => <Badge tone={r.status === "active" ? "success" : r.status === "off" ? "muted" : "danger"}>{STATUS_LABEL[r.status]}</Badge> },
            { header: "Jam kerja", cell: (r) => `${hhmm(r.work_start_time)}–${hhmm(r.work_end_time)}` },
            { header: "Bergabung", cell: (r) => formatDateID(r.joined_at) },
            { header: "Aksi", cell: (r) => (
              <div className="flex flex-wrap justify-end gap-2 md:justify-start">
                <Button size="sm" variant="secondary" onClick={() => setEditing(r)}>Edit</Button>
                <Button size="sm" variant="secondary" loading={busy === "r" + r.id} onClick={() => reset(r)}>Reset password</Button>
                {r.id !== selfId && r.status !== "inactive" && <Button size="sm" variant="secondary" loading={busy === "d" + r.id} onClick={() => deactivate(r)}>Nonaktifkan</Button>}
                {r.id !== selfId && <Button size="sm" variant="danger" loading={busy === "x" + r.id} onClick={() => remove(r)}>Hapus</Button>}
              </div>) },
          ]} />
      </Card>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={isNew ? "Tambah karyawan" : "Edit karyawan"}>
        {editing !== null && (
          <form key={emp?.id ?? "new"} onSubmit={save} className="space-y-4" noValidate>
            <Input label="Nama lengkap" name="full_name" defaultValue={emp?.full_name} error={errors.full_name} />
            {isNew ? (<>
              <Input label="Email login" name="email" type="email" error={errors.email} />
              <Input label="Password awal" name="password" type="password" autoComplete="new-password" hint="Minimal 8 karakter. Karyawan bisa menggantinya sendiri." error={errors.password} />
            </>) : <Input label="Email login" value={emp?.email ?? ""} disabled readOnly />}
            <Input label="Nomor WhatsApp" name="phone" inputMode="numeric" defaultValue={emp?.phone ?? ""} hint="Format 62812…, tanpa + dan spasi" error={errors.phone} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Role" name="role" defaultValue={emp?.role ?? "barber"} error={errors.role}><option value="owner">Owner</option><option value="admin">Admin/Kasir</option><option value="barber">Kapster</option></Select>
              <Select label="Status" name="status" defaultValue={emp?.status ?? "active"} error={errors.status}><option value="active">Aktif</option><option value="off">Libur</option><option value="inactive">Nonaktif</option></Select>
              <Input label="Jam mulai" name="work_start_time" type="time" defaultValue={hhmm(emp?.work_start_time ?? "10:00")} error={errors.work_start_time} />
              <Input label="Jam selesai" name="work_end_time" type="time" defaultValue={hhmm(emp?.work_end_time ?? "21:00")} error={errors.work_end_time} />
            </div>
            <Button type="submit" full loading={loading}>Simpan</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
