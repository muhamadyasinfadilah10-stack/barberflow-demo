import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { BookingStatusBadge } from "@/components/whatsapp/BookingStatusBadge";
import { RowActions } from "@/components/forms/RowActions";
import { CompleteButton } from "@/components/forms/CompleteButton";
import { WalkInForm } from "@/components/forms/WalkInForm";
import { LiveRefresh } from "@/components/dashboard/LiveRefresh";
import { formatQueue } from "@/lib/utils/format";
import { todayISO } from "@/lib/utils/date";

interface Row { id: string; queue_number: number | null; status: string; queue_status: string | null; customers: { name: string } | null; services: { name: string; price: number } | null; barbers: { full_name: string } | null }

export default async function WalkInPage() {
  const { supabase, profile } = await requireProfile(["owner", "admin"]);
  const [{ data: services }, { data: barbers }, { data }] = await Promise.all([
    supabase.from("services").select("id,name,price").eq("is_active", true).order("name"),
    supabase.from("barbers").select("id,full_name").eq("is_active", true).order("full_name"), // yang libur tidak muncul
    supabase.from("bookings").select("id,queue_number,status,queue_status,created_at,customers(name),services(name,price),barbers(full_name)").eq("booking_date", todayISO()).eq("source", "walk_in").order("queue_number").order("created_at"),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  return (
    <Page supabase={supabase} profile={profile} title="Antrean walk-in">
      <LiveRefresh />
      <Card><CardHeader title="Tambah pelanggan" /><WalkInForm services={services ?? []} barbers={barbers ?? []} /></Card>
      <Card>
        <CardHeader title="Antrean hari ini" />
        <DataTable rows={rows} rowKey={(r) => r.id} empty={<EmptyState title="Antrean kosong" hint="Tambahkan pelanggan walk-in lewat form di atas." />}
          columns={[
            { header: "No.", cell: (r) => <span className="text-lg font-semibold">{formatQueue(r.queue_number)}</span> },
            { header: "Pelanggan", cell: (r) => r.customers?.name ?? "-" },
            { header: "Layanan", cell: (r) => r.services?.name ?? "-" },
            { header: "Kapster", cell: (r) => r.barbers?.full_name ?? "-" },
            { header: "Status", cell: (r) => <BookingStatusBadge status={r.status} queue={r.queue_status} /> },
            { header: "Aksi", cell: (r) => r.status === "scheduled" ? <div className="flex flex-wrap justify-end gap-2 md:justify-start"><CompleteButton bookingId={r.id} price={r.services?.price} /><RowActions id={r.id} kind="walkin" queue={r.queue_status} /></div> : <span className="text-slate-400">-</span> },
          ]} />
      </Card>
    </Page>
  );
}
