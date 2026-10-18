import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { CompleteButton } from "@/components/forms/CompleteButton";
import { DateFilter } from "@/components/forms/DateFilter";
import { Badge } from "@/components/ui/Badge";
import { formatDateID, hhmm, todayISO } from "@/lib/utils/date";
import { formatRupiah, PAYMENT_LABEL } from "@/lib/utils/format";

interface Tx { id: string; total_amount: number; commission_amount: number; payment_method: string; created_at: string; services: { name: string } | null; barbers: { full_name: string } | null }
interface Pending { id: string; booking_time: string; customers: { name: string } | null; services: { name: string; price: number } | null; barbers: { full_name: string } | null }

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { supabase, profile } = await requireProfile(["owner", "admin"]);
  const sp = await searchParams;
  const today = todayISO();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? "") ? sp.from! : today;
  const [{ data: txs }, { data: pending }] = await Promise.all([
    supabase.from("transactions").select("id,total_amount,commission_amount,payment_method,created_at,services(name),barbers(full_name)").gte("created_at", `${date}T00:00:00+07:00`).lte("created_at", `${date}T23:59:59.999+07:00`).order("created_at", { ascending: false }),
    supabase.from("bookings").select("id,booking_time,customers(name),services(name,price),barbers(full_name)").eq("booking_date", today).eq("status", "scheduled").order("booking_time"),
  ]);
  const list = (txs ?? []) as unknown as Tx[];
  const wait = (pending ?? []) as unknown as Pending[];
  const total = list.reduce((s, t) => s + Number(t.total_amount), 0);
  return (
    <Page supabase={supabase} profile={profile} title="Transaksi">
      <Card>
        <CardHeader title="Siap diselesaikan hari ini" />
        <DataTable rows={wait} rowKey={(r) => r.id} empty={<EmptyState title="Tidak ada yang menunggu pembayaran" />}
          columns={[
            { header: "Pelanggan", cell: (r) => <>{r.customers?.name ?? "-"} <span className="text-xs text-slate-500">· {hhmm(r.booking_time)}</span></> },
            { header: "Layanan", cell: (r) => r.services?.name ?? "-" },
            { header: "Kapster", cell: (r) => r.barbers?.full_name ?? "-" },
            { header: "Harga", cell: (r) => formatRupiah(r.services?.price ?? 0) },
            { header: "Aksi", cell: (r) => <CompleteButton bookingId={r.id} price={r.services?.price} /> },
          ]} />
      </Card>
      <DateFilter from={date} single />
      <Card>
        <CardHeader title={`Transaksi ${formatDateID(date)}`} action={<span className="text-sm text-slate-500">Total <span className="font-semibold text-slate-900">{formatRupiah(total)}</span></span>} />
        <DataTable rows={list} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada transaksi" hint="Selesaikan booking atau antrean untuk mencatat transaksi." />}
          columns={[
            { header: "Layanan", cell: (r) => r.services?.name ?? "-" },
            { header: "Kapster", cell: (r) => r.barbers?.full_name ?? "-" },
            { header: "Pembayaran", cell: (r) => <Badge>{PAYMENT_LABEL[r.payment_method]}</Badge> },
            { header: "Total", align: "right", cell: (r) => <span className="font-semibold">{formatRupiah(r.total_amount)}</span> },
            { header: "Komisi", align: "right", cell: (r) => formatRupiah(r.commission_amount) },
          ]} />
      </Card>
    </Page>
  );
}
