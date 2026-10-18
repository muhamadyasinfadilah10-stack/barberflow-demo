export function formatRupiah(n: number | null | undefined): string {
  const v = Math.round(Number(n ?? 0));
  return "Rp" + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
export const PAYMENT_LABEL: Record<string, string> = { cash: "Tunai", qris: "QRIS", transfer: "Transfer" };
export const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin/Kasir", barber: "Kapster" };
export const STATUS_LABEL: Record<string, string> = { active: "Aktif", off: "Libur", inactive: "Nonaktif" };
export const QUEUE_LABEL: Record<string, string> = { waiting: "Menunggu", serving: "Dilayani", done: "Selesai", cancelled: "Dibatalkan" };
export const BOOKING_LABEL: Record<string, string> = { scheduled: "Terjadwal", completed: "Selesai", cancelled: "Dibatalkan", no_show: "Tidak datang" };
export const formatQueue = (n: number | null | undefined) => (n ? "A" + String(n).padStart(3, "0") : "-");
