import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { CommissionSettings } from "@/components/forms/CommissionSettings";
import type { Service } from "@/types/service";
import { StatCard } from "@/components/dashboard/StatCard";
import { getReport } from "@/lib/report";
import { formatDateID, startOfWeekISO, todayISO, toJakartaDate } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/format";

interface Tx { id: string; commission_amount: number; created_at: string; services: { name: string } | null; barbers: { full_name: string } | null }

export default async function CommissionsPage() {
  const { supabase, profile } = await requireProfile(["owner", "barber"]);
  const today = todayISO(), weekStart = startOfWeekISO(today);
  const [day, week, { data }, { data: svc }] = await Promise.all([
    getReport(supabase, today, today), getReport(supabase, weekStart, today), // RLS: kapster hanya melihat komisinya sendiri
    supabase.from("transactions").select("id,commission_amount,created_at,services(name),barbers(full_name)").gte("created_at", `${weekStart}T00:00:00+07:00`).order("created_at", { ascending: false }).limit(100),
    profile.role === "owner" ? supabase.from("services").select("*").order("name") : Promise.resolve({ data: [] as Service[] }),
  ]);
  const rows = (data ?? []) as unknown as Tx[];
  const names = new Map(week.perBarber.map((b) => [b.barber_id, b]));
  return (
    <Page supabase={supabase} profile={profile} title={profile.role === "barber" ? "Komisi saya" : "Komisi kapster"}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard label="Hari ini" value={formatRupiah(day.commission)} />
        <StatCard label="Minggu ini" value={formatRupiah(week.commission)} hint={`Sejak ${formatDateID(weekStart)}`} />
      </div>
      {profile.role === "owner" && (
        <Card><CardHeader title="Atur komisi per layanan" />
          <p className="mb-4 text-sm text-slate-500">Berlaku untuk transaksi berikutnya. Transaksi yang sudah selesai tidak berubah.</p>
          <CommissionSettings services={(svc ?? []) as Service[]} />
        </Card>
      )}
      {profile.role === "owner" && (
        <Card><CardHeader title="Rekap per kapster (minggu ini)" />
          <DataTable rows={[...names.values()]} rowKey={(r) => r.barber_id} empty={<EmptyState title="Belum ada komisi minggu ini" />}
            columns={[{ header: "Kapster", cell: (r) => r.name }, { header: "Pelanggan", align: "right", cell: (r) => r.customers }, { header: "Omzet", align: "right", cell: (r) => formatRupiah(r.revenue) }, { header: "Komisi", align: "right", cell: (r) => <span className="font-semibold">{formatRupiah(r.commission)}</span> }]} />
        </Card>
      )}
      <Card><CardHeader title="Rincian per transaksi" />
        <DataTable rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada komisi" hint="Komisi tercatat otomatis saat transaksi diselesaikan." />}
          columns={[
            { header: "Tanggal", cell: (r) => formatDateID(toJakartaDate(r.created_at)) },
            ...(profile.role === "owner" ? [{ header: "Kapster", cell: (r: Tx) => r.barbers?.full_name ?? "-" }] : []),
            { header: "Layanan", cell: (r) => r.services?.name ?? "-" },
            { header: "Komisi", align: "right", cell: (r) => <span className="font-semibold">{formatRupiah(r.commission_amount)}</span> },
          ]} />
      </Card>
    </Page>
  );
}
