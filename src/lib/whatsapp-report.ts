import { formatRupiah } from "@/lib/utils/format";
import { formatDateTimeWIB } from "@/lib/utils/date";

interface Base { shopName: string; by: string; note?: string | null }
export function buildOpenReport(i: Base & { at: string }) {
  return ["Barbershop DIBUKA", `Nama: ${i.shopName}`, `Waktu buka: ${formatDateTimeWIB(i.at)}`, `Dibuka oleh: ${i.by}`, "Status: Siap melayani pelanggan"].join("\n");
}
export function buildCloseReport(i: Base & { at: string; bookings: number; walkIns: number; revenue: number; commission: number }) {
  return ["Barbershop DITUTUP", `Nama: ${i.shopName}`, `Waktu tutup: ${formatDateTimeWIB(i.at)}`, `Ditutup oleh: ${i.by}`,
    `Total booking hari ini: ${i.bookings}`, `Total walk-in hari ini: ${i.walkIns}`, `Total omzet hari ini: ${formatRupiah(i.revenue)}`,
    `Total komisi kapster: ${formatRupiah(i.commission)}`, `Catatan: ${i.note?.trim() || "-"}`].join("\n");
}
/** Link wa.me: dibuka di perangkat pengguna, pengguna sendiri yang menekan Kirim. */
export function buildWaLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
