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
import { productCreateSchema, productSchema, stockMovementSchema } from "@/lib/validation/product";
import { formatRupiah } from "@/lib/utils/format";
import type { MovementType, Product } from "@/types/product";

const TYPE_HINT: Record<MovementType, string> = { in: "Stok masuk (restock)", sale: "Terjual", use: "Terpakai / rusak", adjust: "Koreksi (stok sebenarnya)" };

export function StockManager({ products, isOwner }: { products: Product[]; isOwner: boolean }) {
  const router = useRouter(); const toast = useToast();
  const [moveFor, setMoveFor] = useState<Product | null>(null);
  const [mtype, setMtype] = useState<MovementType>("in");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(false); const [busy, setBusy] = useState("");
  const prod = editing && editing !== "new" ? editing : null;

  function fail(issues: { path: PropertyKey[]; message: string }[]) { setErrors(Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]))); }

  async function saveMovement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const p = stockMovementSchema.safeParse({ product_id: moveFor!.id, type: mtype, quantity: fd.quantity, unit_price: mtype === "sale" && fd.unit_price !== "" ? fd.unit_price : undefined, note: fd.note || undefined });
    if (!p.success) { fail(p.error.issues); return; }
    setErrors({}); setLoading(true);
    const res = await callApi("/api/stock", "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal mencatat stok", "error"); return; }
    toast(`Stok ${moveFor!.name} sekarang ${res.raw?.stock}`); setMoveFor(null); router.refresh();
  }
  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const body = { ...fd, is_active: fd.is_active === "on" };
    const p = prod ? productSchema.safeParse(body) : productCreateSchema.safeParse(body);
    if (!p.success) { fail(p.error.issues); return; }
    setErrors({}); setLoading(true);
    const res = await callApi(prod ? `/api/products?id=${prod.id}` : "/api/products", prod ? "PUT" : "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menyimpan produk", "error"); return; }
    toast("Produk disimpan"); setEditing(null); router.refresh();
  }
  async function remove(r: Product) {
    if (!window.confirm(`Hapus produk ${r.name}?`)) return;
    setBusy(r.id); const res = await callApi(`/api/products?id=${r.id}`, "DELETE"); setBusy("");
    if (!res.ok) { toast(res.error ?? "Gagal menghapus", "error"); return; }
    toast("Produk dihapus"); router.refresh();
  }
  const state = (r: Product) => r.stock === 0 ? <Badge tone="danger">Habis</Badge> : r.stock <= r.min_stock ? <Badge tone="danger">Menipis</Badge> : <Badge tone="success">Aman</Badge>;

  return (
    <>
      {isOwner && <div className="flex justify-end"><Button onClick={() => { setErrors({}); setEditing("new"); }}>Tambah produk</Button></div>}
      <Card>
        <DataTable rows={products} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada produk" hint={isOwner ? "Tambahkan produk seperti pomade atau shampoo." : "Minta owner menambahkan produk."} />}
          columns={[
            { header: "Produk", cell: (r) => <span className="font-medium">{r.name}{!r.is_active && <span className="ml-2 text-xs text-slate-400">nonaktif</span>}</span> },
            { header: "Stok", align: "right", cell: (r) => <span className="text-lg font-semibold">{r.stock}</span> },
            { header: "Status", cell: state },
            { header: "Stok minimum", align: "right", cell: (r) => r.min_stock },
            { header: "Harga jual", align: "right", cell: (r) => formatRupiah(r.price) },
            { header: "Aksi", cell: (r) => (
              <div className="flex flex-wrap justify-end gap-2 md:justify-start">
                <Button size="sm" onClick={() => { setErrors({}); setMtype("in"); setMoveFor(r); }}>Catat stok</Button>
                {isOwner && <Button size="sm" variant="secondary" onClick={() => { setErrors({}); setEditing(r); }}>Edit</Button>}
                {isOwner && <Button size="sm" variant="danger" loading={busy === r.id} onClick={() => remove(r)}>Hapus</Button>}
              </div>) },
          ]} />
      </Card>

      <Modal open={moveFor !== null} onClose={() => setMoveFor(null)} title={moveFor ? `Catat stok: ${moveFor.name}` : ""}>
        {moveFor && (
          <form key={moveFor.id + mtype} onSubmit={saveMovement} className="space-y-4" noValidate>
            <p className="text-sm text-slate-500">Stok saat ini: <span className="font-semibold text-slate-900">{moveFor.stock}</span></p>
            <Select label="Jenis" value={mtype} onChange={(e) => { setErrors({}); setMtype(e.target.value as MovementType); }}>
              {(Object.keys(TYPE_HINT) as MovementType[]).filter((t) => t !== "adjust" || isOwner).map((t) => <option key={t} value={t}>{TYPE_HINT[t]}</option>)}
            </Select>
            <Input label={mtype === "adjust" ? "Stok sebenarnya" : "Jumlah"} name="quantity" type="number" inputMode="numeric" min={mtype === "adjust" ? 0 : 1} error={errors.quantity} />
            {mtype === "sale" && <Input label="Harga satuan (Rp)" name="unit_price" type="number" inputMode="numeric" min={0} defaultValue={moveFor.price} error={errors.unit_price} />}
            <Input label="Catatan (opsional)" name="note" maxLength={200} error={errors.note} />
            <Button type="submit" full loading={loading}>Simpan</Button>
          </form>
        )}
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={prod ? "Edit produk" : "Tambah produk"}>
        {editing !== null && (
          <form key={prod?.id ?? "new"} onSubmit={saveProduct} className="space-y-4" noValidate>
            <Input label="Nama produk" name="name" defaultValue={prod?.name} error={errors.name} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Harga jual (Rp)" name="price" type="number" inputMode="numeric" min={0} defaultValue={prod?.price ?? 0} error={errors.price} />
              <Input label="Stok minimum" name="min_stock" type="number" inputMode="numeric" min={0} defaultValue={prod?.min_stock ?? 0} hint="Peringatan muncul jika stok sama atau di bawah ini" error={errors.min_stock} />
            </div>
            {!prod && <Input label="Stok awal" name="initial_stock" type="number" inputMode="numeric" min={0} defaultValue={0} error={errors.initial_stock} />}
            {prod && <p className="text-xs text-slate-500">Jumlah stok diubah lewat tombol Catat stok agar tercatat di riwayat.</p>}
            <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="is_active" defaultChecked={prod?.is_active ?? true} className="h-5 w-5 rounded border-slate-300" />Aktif</label>
            <Button type="submit" full loading={loading}>Simpan</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
