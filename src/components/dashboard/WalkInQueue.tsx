import { DataTable, EmptyState } from "@/components/ui/Table";
import { BookingStatusBadge } from "@/components/whatsapp/BookingStatusBadge";
import { formatQueue } from "@/lib/utils/format";
import type { BookingRow } from "./TodayBookings";
export function WalkInQueue({ rows }: { rows: BookingRow[] }) {
  return (
    <DataTable rows={rows} rowKey={(r) => r.id}
      empty={<EmptyState title="Antrean kosong" hint="Pelanggan walk-in yang ditambahkan kasir tampil di sini." />}
      columns={[
        { header: "No.", cell: (r) => <span className="font-semibold">{formatQueue(r.queue_number)}</span> },
        { header: "Pelanggan", cell: (r) => r.customers?.name ?? "-" },
        { header: "Layanan", cell: (r) => r.services?.name ?? "-" },
        { header: "Kapster", cell: (r) => r.barbers?.full_name ?? "-" },
        { header: "Status", cell: (r) => <BookingStatusBadge status={r.status} queue={r.queue_status} /> },
      ]} />
  );
}
