import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { DataTable, EmptyState } from "@/components/ui/Table";
import { BookingStatusBadge } from "@/components/whatsapp/BookingStatusBadge";
import { RowActions } from "@/components/forms/RowActions";
import { CompleteButton } from "@/components/forms/CompleteButton";
import { DateFilter } from "@/components/forms/DateFilter";
import { ManualBookingForm } from "@/components/forms/ManualBookingForm";
import { LiveRefresh } from "@/components/dashboard/LiveRefresh";
import { formatDateID, hhmm, todayISO } from "@/lib/utils/date";

interface Row { id: string; booking_time: string; end_time: string; status: string; queue_status: string | null; customers: { name: string; whatsapp_number: string | null } | null; services: { name: string; price: number } | null; barbers: { full_name: string } | null }

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { supabase, profile } = await requireProfile();
  const sp = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? "") ? sp.from! : todayISO();
  const manage = profile.role !== "barber";
  const { data: svc } = manage ? await supabase.from("services").select("id,name,price,duration_minutes").eq("is_active", true).order("name") : { data: [] };
  const { data } = await supabase.from("bookings").select("id,booking_time,end_time,status,queue_status,customers(name,whatsapp_number),services(name,price),barbers(full_name)")
    .eq("booking_date", date).in("source", ["whatsapp", "manual"]).order("booking_time"); // RLS: kapster hanya melihat miliknya
  const rows = (data ?? []) as unknown as Row[];
  return (
    <Page supabase={supabase} profile={profile} title={profile.role === "barber" ? "Jadwal saya" : "Booking"} actions={manage ? <ManualBookingForm services={svc ?? []} today={todayISO()} /> : undefined}>
      <LiveRefresh />
      <DateFilter from={date} single />
      <Card>
        <p className="mb-4 text-sm text-slate-500">{formatDateID(date)}</p>
        <DataTable rows={rows} rowKey={(r) => r.id}
          empty={<EmptyState title="Tidak ada booking" hint="Pilih tanggal lain, atau minta pelanggan mengetik BOOKING di WhatsApp." />}
          columns={[
            { header: "Jam", cell: (r) => <span className="font-semibold">{hhmm(r.booking_time)}–{hhmm(r.end_time)}</span> },
            { header: "Pelanggan", cell: (r) => <>{r.customers?.name ?? "-"}{r.customers?.whatsapp_number && <span className="block text-xs text-slate-500">{r.customers.whatsapp_number}</span>}</> },
            { header: "Layanan", cell: (r) => r.services?.name ?? "-" },
            ...(profile.role === "barber" ? [] : [{ header: "Kapster", cell: (r: Row) => r.barbers?.full_name ?? "-" }]),
            { header: "Status", cell: (r) => <BookingStatusBadge status={r.status} /> },
            ...(manage ? [{ header: "Aksi", cell: (r: Row) => r.status === "scheduled" ? <div className="flex flex-wrap justify-end gap-2 md:justify-start"><CompleteButton bookingId={r.id} price={r.services?.price} /><RowActions id={r.id} kind="booking" /></div> : <span className="text-slate-400">-</span> }] : []),
          ]} />
      </Card>
    </Page>
  );
}
