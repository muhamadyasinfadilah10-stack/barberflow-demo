"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { transactionSchema } from "@/lib/validation/transaction";
import { formatRupiah } from "@/lib/utils/format";

/** Selesaikan booking/walk-in: pilih metode bayar, komisi dihitung otomatis di server. */
export function CompleteButton({ bookingId, price }: { bookingId: string; price?: number }) {
  const router = useRouter(); const toast = useToast();
  const [open, setOpen] = useState(false); const [method, setMethod] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  async function submit() {
    const p = transactionSchema.safeParse({ booking_id: bookingId, payment_method: method || undefined });
    if (!p.success) { setErr(p.error.issues[0].message); return; }
    setErr(""); setLoading(true);
    const res = await callApi("/api/transactions", "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal menyimpan transaksi", "error"); return; }
    toast("Transaksi selesai dan komisi tercatat"); setOpen(false); router.refresh();
  }
  return (
    <>
      <Button size="sm" variant="success" onClick={() => setOpen(true)}>Selesaikan</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Selesaikan layanan">
        <div className="space-y-4">
          {price !== undefined && <p className="text-sm text-slate-600">Total: <span className="font-semibold text-slate-900">{formatRupiah(price)}</span></p>}
          <Select label="Metode pembayaran" value={method} onChange={(e) => setMethod(e.target.value)} error={err}>
            <option value="">Pilih metode</option><option value="cash">Tunai</option><option value="qris">QRIS</option><option value="transfer">Transfer</option>
          </Select>
          <Button full variant="success" loading={loading} onClick={submit}>Simpan transaksi</Button>
        </div>
      </Modal>
    </>
  );
}
