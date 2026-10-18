"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { shopSessionSchema } from "@/lib/validation/settings";
import { buildWaLink } from "@/lib/whatsapp-report";

export function OpenCloseControls({ isOpen }: { isOpen: boolean }) {
  const router = useRouter(); const toast = useToast();
  const [note, setNote] = useState(""); const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ report: string; whatsapp: string | null; action: "open" | "close" } | null>(null);

  async function act(action: "open" | "close") {
    const p = shopSessionSchema.safeParse({ action, note: note || undefined });
    if (!p.success) { toast(p.error.issues[0].message, "error"); return; }
    setLoading(true);
    const res = await callApi("/api/shop-sessions", "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal", "error"); return; }
    toast(action === "open" ? "Barbershop dibuka" : "Barbershop ditutup");
    setPreview({ report: String(res.raw?.report ?? ""), whatsapp: (res.raw?.whatsapp as string | null) ?? null, action });
    setNote(""); router.refresh();
  }
  return (
    <>
      <Card>
        <CardHeader title={isOpen ? "Barbershop sedang buka" : "Barbershop sedang tutup"} />
        {isOpen && <label className="mb-4 block text-sm"><span className="mb-1.5 block font-medium text-slate-700">Catatan penutupan (opsional)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-base sm:text-sm" /></label>}
        {isOpen ? <Button variant="danger" full loading={loading} onClick={() => act("close")} className="sm:w-auto">Tutup Barbershop</Button>
          : <Button variant="success" full loading={loading} onClick={() => act("open")} className="sm:w-auto">Buka Barbershop</Button>}
      </Card>
      {preview && (
        <Card>
          <CardHeader title="Preview laporan" />
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-relaxed">{preview.report}</pre>
          {preview.whatsapp ? (
            <a href={buildWaLink(preview.whatsapp, preview.report)} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 sm:w-auto">Kirim ke WhatsApp</a>
          ) : <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">Nomor WhatsApp owner belum diisi. Owner perlu mengisinya di Pengaturan.</p>}
          <p className="mt-2 text-xs text-slate-500">WhatsApp akan terbuka dengan pesan terisi. Anda tinggal menekan kirim.</p>
        </Card>
      )}
    </>
  );
}
