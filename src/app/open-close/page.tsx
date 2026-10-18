import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { OpenCloseControls } from "@/components/forms/OpenCloseControls";
import { formatDateTimeWIB } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/format";

interface S { id: string; opened_at: string; closed_at: string | null; status: string; total_bookings: number; total_walk_ins: number; total_revenue: number; total_commission: number; opener: { full_name: string } | null; closer: { full_name: string } | null }

export default async function OpenClosePage() {
  const { supabase, profile } = await requireProfile(["owner", "admin"]);
  const { data } = await supabase.from("shop_sessions").select("id,opened_at,closed_at,status,total_bookings,total_walk_ins,total_revenue,total_commission,opener:profiles!shop_sessions_opened_by_fkey(full_name),closer:profiles!shop_sessions_closed_by_fkey(full_name)").order("opened_at", { ascending: false }).limit(20);
  const rows = (data ?? []) as unknown as S[];
  return (
    <Page supabase={supabase} profile={profile} title="Buka & tutup">
      <OpenCloseControls isOpen={rows[0]?.status === "open"} />
      <Card><CardHeader title="Riwayat buka/tutup" />
        <DataTable rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Belum ada riwayat" hint="Tekan Buka Barbershop untuk memulai hari." />}
          columns={[
            { header: "Dibuka", cell: (r) => <>{formatDateTimeWIB(r.opened_at)}<span className="block text-xs text-slate-500">oleh {r.opener?.full_name ?? "-"}</span></> },
            { header: "Ditutup", cell: (r) => r.closed_at ? <>{formatDateTimeWIB(r.closed_at)}<span className="block text-xs text-slate-500">oleh {r.closer?.full_name ?? "-"}</span></> : <Badge tone="success">Sedang buka</Badge> },
            { header: "Booking / walk-in", cell: (r) => r.closed_at ? `${r.total_bookings} / ${r.total_walk_ins}` : "-" },
            { header: "Omzet", align: "right", cell: (r) => r.closed_at ? formatRupiah(r.total_revenue) : "-" },
            { header: "Komisi", align: "right", cell: (r) => r.closed_at ? formatRupiah(r.total_commission) : "-" },
          ]} />
      </Card>
    </Page>
  );
}
