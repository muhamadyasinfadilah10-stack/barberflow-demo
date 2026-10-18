import type { SupabaseClient } from "@supabase/supabase-js";
import { getAvailableBarbers, getAvailableSlots } from "@/lib/booking/availability";
import { createBooking } from "@/lib/booking/create-booking";
import { cancelBooking, listUpcomingByNumber } from "@/lib/booking/cancel-booking";
import { addDaysISO, todayISO } from "@/lib/utils/date";
import { getSession, resetSession, saveSession } from "./session";
import { T } from "./templates";

type Temp = { serviceId?: string; serviceName?: string; duration?: number; date?: string; slots?: string[]; time?: string; barberIds?: string[]; cancelIds?: string[] };
const num = (t: string) => (/^\d{1,2}$/.test(t) ? parseInt(t, 10) : NaN);

/** Mesin percakapan berbasis menu/angka. Mengembalikan teks balasan. */
export async function handleIncoming(db: SupabaseClient, from: string, rawText: string): Promise<string> {
  const text = rawText.trim();
  const cmd = text.toUpperCase();
  const session = await getSession(db, from);
  const temp = session.temp_data as Temp;

  // Perintah global
  if (cmd === "BANTUAN" || cmd === "HELP" || cmd === "MENU") { await resetSession(db, from); return T.help(); }
  if (cmd === "JADWAL") {
    await resetSession(db, from);
    const rows = await listUpcomingByNumber(db, from, todayISO());
    return T.schedule(rows.map((r) => ({ booking_date: r.booking_date, booking_time: r.booking_time, service: r.services?.name ?? "-", barber: r.barbers?.full_name ?? "-" })));
  }
  if (cmd === "BATAL") {
    if (session.current_step !== "idle" && session.current_step !== "confirm_cancel") { await resetSession(db, from); return T.aborted(); }
    const rows = await listUpcomingByNumber(db, from, todayISO());
    if (!rows.length) { await resetSession(db, from); return T.nothingToCancel(); }
    await saveSession(db, from, "confirm_cancel", { cancelIds: rows.map((r) => r.id) });
    return T.cancelPick(rows.map((r) => ({ booking_date: r.booking_date, booking_time: r.booking_time, service: r.services?.name ?? "-" })));
  }
  if (cmd === "BOOKING") {
    const { data: services, error } = await db.from("services").select("id,name,price,duration_minutes").eq("is_active", true).order("price");
    if (error) { console.error("[chatbot] gagal membaca layanan:", error.message); return "Maaf, sistem sedang bermasalah. Coba lagi sebentar."; }
    if (!services?.length) { console.warn("[chatbot] tidak ada layanan aktif yang terbaca (cek menu Layanan dan SUPABASE_SERVICE_ROLE_KEY)"); return "Maaf, belum ada layanan tersedia."; }
    const list = services as { id: string; name: string; price: number; duration_minutes: number }[];
    await saveSession(db, from, "select_service", { serviceIds: list.map((s) => s.id) });
    return T.services(list);
  }

  switch (session.current_step) {
    case "confirm_cancel": {
      const n = num(text);
      const ids = temp.cancelIds ?? [];
      if (n === 0) { await resetSession(db, from); return T.aborted(); }
      if (!n || n > ids.length) return T.invalidChoice();
      await cancelBooking(db, ids[n - 1]);
      await resetSession(db, from);
      return T.cancelled();
    }
    case "select_service": {
      const ids = ((session.temp_data as { serviceIds?: string[] }).serviceIds) ?? [];
      const n = num(text);
      if (!n || n > ids.length) return T.invalidChoice();
      const { data: s } = await db.from("services").select("id,name,duration_minutes").eq("id", ids[n - 1]).single();
      if (!s) return T.invalidChoice();
      await saveSession(db, from, "select_date", { serviceId: s.id, serviceName: s.name, duration: s.duration_minutes });
      return T.dates(todayISO(), addDaysISO(todayISO(), 1));
    }
    case "select_date": {
      const n = num(text);
      if (n !== 1 && n !== 2) return T.invalidChoice();
      const date = n === 1 ? todayISO() : addDaysISO(todayISO(), 1);
      const slots = await getAvailableSlots(db, date, temp.duration!);
      if (!slots.length) {
        const otherDate = n === 1 ? addDaysISO(todayISO(), 1) : todayISO();
        const other = await getAvailableSlots(db, otherDate, temp.duration!);
        return T.noSlots(date, other.slice(0, 4));
      }
      await saveSession(db, from, "select_time", { ...temp, date, slots });
      return T.slots(date, slots);
    }
    case "select_time": {
      const slots = temp.slots ?? [];
      const n = num(text);
      if (!n || n > slots.length) return T.invalidChoice();
      const time = slots[n - 1];
      const barbers = await getAvailableBarbers(db, temp.date!, time, temp.duration!);
      if (!barbers.length) {
        const fresh = await getAvailableSlots(db, temp.date!, temp.duration!);
        await saveSession(db, from, "select_time", { ...temp, slots: fresh });
        return fresh.length ? "Slot itu baru saja penuh. Pilih slot lain:\n\n" + T.slots(temp.date!, fresh) : T.noSlots(temp.date!, []);
      }
      await saveSession(db, from, "select_barber", { ...temp, time, barberIds: barbers.map((b) => b.id) });
      return T.barbers(barbers);
    }
    case "select_barber": {
      const ids = temp.barberIds ?? [];
      const n = num(text);
      if (!n || n > ids.length + 1) return T.invalidChoice();
      const barberId = n === ids.length + 1 ? ids[0] : ids[n - 1]; // "Siapa saja" = kapster pertama yang bebas
      const res = await createBooking(db, { customer_name: "Pelanggan " + from.slice(-4), whatsapp_number: from, barber_id: barberId, service_id: temp.serviceId, booking_date: temp.date, booking_time: temp.time });
      if (!res.ok) {
        await resetSession(db, from);
        return res.reason === "slot_taken" ? T.slotTaken() : "Maaf, terjadi kendala saat membuat booking. Ketik *BOOKING* untuk mencoba lagi.";
      }
      await resetSession(db, from);
      return T.confirmed({ service_name: res.booking.service_name, barber_name: res.booking.barber_name, date: res.booking.date, time: res.booking.time });
    }
    default:
      return T.unknown();
  }
}
