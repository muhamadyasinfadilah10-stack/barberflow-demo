import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { StockManager } from "@/components/forms/StockManager";
import { formatDateTimeWIB } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/format";
import type { Product } from "@/types/product";

interface Mv { id: string; type: string; quantity: number; stock_after: number; unit_price: number | null; note: string | null; created_at: string; products: { name: string } | null; by: { full_name: string } | null }
const LABEL: Record<string, string> = { in: "Masuk", sale: "Terjual", use: "Terpakai", adjust: "Koreksi" };

export default async function StockPage() {
  const { supabase, profile } = await requireProfile(["owner", "admin"]);
  const [{ data: prods }, { data: mv }] = await Promise.all([
    supabase.from("products").select("*").order("name"),
    supabase.from("stock_movements").select("id,type,quantity,stock_after,unit_price,note,created_at,products(name),by:profiles(full_name)").order("created_at", { ascending: false }).limit(30),
  ]);
  const products = (prods ?? []) as Product[];
  const history = (mv ?? []) as unknown as Mv[];
  const low = products.filter((p) => p.is_active && p.stock <= p.min_stock).length;
  return (
    <Page supabase={supabase} profile={profile} title="Stok produk">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard label="Produk aktif" value={String(products.filter((p) => p.is_active).length)} />
        <StatCard label="Perlu restock" value={String(low)} hint={low ? "Stok menipis atau habis" : "Semua aman"} />
      </div>
      <StockManager products={products} isOwner={profile.role === "owner"} />
      <Card><CardHeader title="Riwayat stok terbaru" />
        <DataTable rows={history} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada riwayat" hint="Pencatatan stok masuk, terjual, dan terpakai muncul di sini." />}
          columns={[
            { header: "Waktu", cell: (r) => formatDateTimeWIB(r.created_at) },
            { header: "Produk", cell: (r) => <span className="font-medium">{r.products?.name ?? "-"}</span> },
            { header: "Jenis", cell: (r) => <Badge tone={r.type === "in" ? "success" : "muted"}>{LABEL[r.type]}</Badge> },
            { header: "Jumlah", align: "right", cell: (r) => <span className="font-semibold">{r.quantity > 0 ? `+${r.quantity}` : r.quantity}</span> },
            { header: "Sisa", align: "right", cell: (r) => r.stock_after },
            { header: "Keterangan", cell: (r) => <>{r.unit_price !== null && <span className="block text-xs text-slate-500">@ {formatRupiah(r.unit_price)}</span>}{r.note ?? "-"}<span className="block text-xs text-slate-400">{r.by?.full_name ?? ""}</span></> },
          ]} />
      </Card>
    </Page>
  );
}
