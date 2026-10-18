import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateFilter } from "@/components/forms/DateFilter";
import { ExportCsv } from "@/components/forms/ExportCsv";
import { getReport } from "@/lib/report";
import { formatDateID, todayISO } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/format";

const isDate = (s?: string) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? "");

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { supabase, profile } = await requireProfile(["owner", "admin"]);
  const sp = await searchParams;
  const isOwner = profile.role === "owner";
  const today = todayISO();
  let from = isDate(sp.from) ? sp.from! : today;
  let to = isOwner && isDate(sp.to) ? sp.to! : from; // kasir: laporan harian saja
  if (to < from) to = from;
  const r = await getReport(supabase, from, to);
  const csv: (string | number)[][] = [
    ["Laporan", `${from} s/d ${to}`], [],
    ["Booking WhatsApp", r.totalBookings], ["Walk-in", r.totalWalkIns], ["Pelanggan dilayani", r.customers], ["Omzet", r.revenue], ["Komisi", r.commission], [],
    ["Kapster", "Pelanggan", "Omzet", "Komisi"], ...r.perBarber.map((b) => [b.name, b.customers, b.revenue, b.commission]), [],
    ["Layanan terlaris", "Jumlah"], ...r.topServices.map((s) => [s.name, s.count]),
  ];
  return (
    <Page supabase={supabase} profile={profile} title={isOwner ? "Laporan" : "Laporan harian"} actions={<ExportCsv filename={`laporan-${from}${to !== from ? "_" + to : ""}.csv`} rows={csv} />}>
      <DateFilter from={from} to={to} single={!isOwner} />
      <p className="-mt-2 text-sm text-slate-500">{from === to ? formatDateID(from) : `${formatDateID(from)} – ${formatDateID(to)}`}</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard label="Booking" value={String(r.totalBookings)} />
        <StatCard label="Walk-in" value={String(r.totalWalkIns)} />
        <StatCard label="Pelanggan" value={String(r.customers)} />
        <StatCard label="Omzet" value={formatRupiah(r.revenue)} />
        <StatCard label="Komisi" value={formatRupiah(r.commission)} />
      </div>
      <Card><CardHeader title="Layanan terlaris" />
        <DataTable rows={r.topServices} rowKey={(s) => s.name} empty={<EmptyState title="Belum ada transaksi" hint="Coba rentang tanggal lain." />}
          columns={[{ header: "Layanan", cell: (s) => s.name }, { header: "Terjual", align: "right", cell: (s) => s.count }]} />
      </Card>
      <Card><CardHeader title="Per kapster" />
        <DataTable rows={r.perBarber} rowKey={(b) => b.barber_id} empty={<EmptyState title="Belum ada data kapster" />}
          columns={[{ header: "Kapster", cell: (b) => b.name }, { header: "Pelanggan", align: "right", cell: (b) => b.customers }, { header: "Omzet", align: "right", cell: (b) => formatRupiah(b.revenue) }, { header: "Komisi", align: "right", cell: (b) => formatRupiah(b.commission) }]} />
      </Card>
      {isOwner && from !== to && (
        <Card><CardHeader title="Omzet per hari" />
          <DataTable rows={r.daily} rowKey={(d) => d.date} columns={[{ header: "Tanggal", cell: (d) => formatDateID(d.date) }, { header: "Omzet", align: "right", cell: (d) => formatRupiah(d.revenue) }]} />
        </Card>
      )}
    </Page>
  );
}
