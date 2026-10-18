import { formatRupiah } from "@/lib/utils/format";
import { formatDateID } from "@/lib/utils/date";
export const T = {
  help: () => "Selamat datang! Perintah yang tersedia:\n\n*BOOKING* - buat booking baru\n*JADWAL* - lihat booking Anda\n*BATAL* - batalkan booking\n*BANTUAN* - tampilkan pesan ini",
  unknown: () => "Maaf, perintah tidak dikenali. Ketik *BANTUAN* untuk melihat daftar perintah.",
  invalidChoice: () => "Pilihan tidak valid. Balas dengan angka sesuai daftar, atau ketik *BATAL* untuk membatalkan proses.",
  services: (list: { name: string; price: number; duration_minutes: number }[]) =>
    "Pilih layanan (balas dengan angka):\n\n" + list.map((s, i) => `${i + 1}. ${s.name} - ${formatRupiah(s.price)} (${s.duration_minutes} menit)`).join("\n"),
  dates: (today: string, tomorrow: string) => `Pilih tanggal:\n\n1. Hari ini (${formatDateID(today)})\n2. Besok (${formatDateID(tomorrow)})`,
  slots: (date: string, slots: string[]) => `Jam tersedia untuk ${formatDateID(date)}:\n\n` + slots.map((s, i) => `${i + 1}. ${s}`).join("\n"),
  noSlots: (date: string, other: string[]) => `Maaf, slot ${formatDateID(date)} sudah penuh.` + (other.length ? ` Slot lain: ${other.join(", ")}. Pilih tanggal lain dengan angka.` : ""),
  barbers: (list: { full_name: string }[]) => "Pilih kapster:\n\n" + list.map((b, i) => `${i + 1}. ${b.full_name}`).join("\n") + `\n${list.length + 1}. Siapa saja`,
  confirmed: (b: { service_name: string; barber_name: string; date: string; time: string }) =>
    `Booking berhasil!\n\nLayanan: ${b.service_name}\nKapster: ${b.barber_name}\nTanggal: ${formatDateID(b.date)}\nJam: ${b.time} WIB\n\nKetik *JADWAL* untuk melihat booking atau *BATAL* untuk membatalkan.`,
  slotTaken: () => "Maaf, slot itu baru saja diambil. Ketik *BOOKING* untuk memilih ulang.",
  schedule: (rows: { booking_date: string; booking_time: string; service: string; barber: string }[]) =>
    rows.length ? "Booking Anda:\n\n" + rows.map((r, i) => `${i + 1}. ${formatDateID(r.booking_date)} ${r.booking_time.slice(0, 5)} - ${r.service} (${r.barber})`).join("\n") : "Anda belum punya booking aktif. Ketik *BOOKING* untuk membuat booking.",
  cancelPick: (rows: { booking_date: string; booking_time: string; service: string }[]) =>
    "Booking mana yang dibatalkan? Balas dengan angka:\n\n" + rows.map((r, i) => `${i + 1}. ${formatDateID(r.booking_date)} ${r.booking_time.slice(0, 5)} - ${r.service}`).join("\n") + "\n\nKetik 0 untuk tidak membatalkan.",
  cancelled: () => "Booking sudah dibatalkan.",
  nothingToCancel: () => "Tidak ada booking aktif yang bisa dibatalkan.",
  aborted: () => "Proses dibatalkan. Ketik *BOOKING* untuk memulai lagi.",
};
