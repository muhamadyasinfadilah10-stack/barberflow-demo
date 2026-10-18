import { DataTable, EmptyState } from "@/components/ui/Table";
import { BookingStatusBadge } from "@/components/whatsapp/BookingStatusBadge";
import { hhmm } from "@/lib/utils/date";

export interface BookingRow { id: string; queue_number?: number | null; booking_time: string; status: string; queue_status: string | null; source: string; customers: { name: string; whatsapp_number: string | null } | null; services: { name: string } | null; barbers: { full_name: string } | null }
export function TodayBookings({ rows }: { rows: BookingRow[] }) {
  return (
    <DataTable rows={rows} rowKey={(r) => r.id}
      empty={<EmptyState title="Belum ada booking hari ini" hint="Booking dari WhatsApp akan muncul di sini." />}
      columns={[
        { header: "Jam", cell: (r) => <span className="font-semibold">{hhmm(r.booking_time)}</span> },
        { header: "Pelanggan", cell: (r) => r.customers?.name ?? "-" },
        { header: "Layanan", cell: (r) => r.services?.name ?? "-" },
        { header: "Kapster", cell: (r) => r.barbers?.full_name ?? "-" },
        { header: "Status", cell: (r) => <BookingStatusBadge status={r.status} queue={r.queue_status} /> },
      ]} />
  );
}
