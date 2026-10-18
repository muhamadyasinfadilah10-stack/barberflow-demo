import type { SupabaseClient } from "@supabase/supabase-js";
import { hhmm, minutesToTime, nowMinutesJakarta, timeToMinutes, todayISO } from "@/lib/utils/date";

const STEP = 30; // menit antar slot
interface BarberRow { id: string; full_name: string; work_start_time: string; work_end_time: string; }
interface Busy { barber_id: string; booking_time: string; end_time: string; }

async function load(db: SupabaseClient, date: string) {
  const [{ data: shop }, { data: barbers }, { data: busy }] = await Promise.all([
    db.from("shop_settings").select("open_time,close_time").limit(1).maybeSingle(),
    db.from("barbers").select("id,full_name,work_start_time,work_end_time").eq("is_active", true).order("full_name"),
    db.from("bookings").select("barber_id,booking_time,end_time").eq("booking_date", date).eq("status", "scheduled").in("source", ["whatsapp", "manual"]),
  ]);
  return { shop: shop ?? { open_time: "10:00", close_time: "21:00" }, barbers: (barbers ?? []) as BarberRow[], busy: (busy ?? []) as Busy[] };
}

function isFree(b: BarberRow, busy: Busy[], start: number, end: number, shop: { open_time: string; close_time: string }) {
  const lo = Math.max(timeToMinutes(b.work_start_time), timeToMinutes(shop.open_time));
  const hi = Math.min(timeToMinutes(b.work_end_time), timeToMinutes(shop.close_time));
  if (start < lo || end > hi) return false; // di luar jam kerja
  return !busy.some((x) => x.barber_id === b.id && start < timeToMinutes(x.end_time) && end > timeToMinutes(x.booking_time));
}

/** Slot jam yang masih punya minimal 1 kapster bebas */
export async function getAvailableSlots(db: SupabaseClient, date: string, durationMinutes: number): Promise<string[]> {
  const { shop, barbers, busy } = await load(db, date);
  const minStart = date === todayISO() ? nowMinutesJakarta() + 15 : 0;
  const slots: string[] = [];
  for (let t = timeToMinutes(shop.open_time); t + durationMinutes <= timeToMinutes(shop.close_time); t += STEP) {
    if (t < minStart) continue;
    if (barbers.some((b) => isFree(b, busy, t, t + durationMinutes, shop))) slots.push(minutesToTime(t));
  }
  return slots;
}

/** Kapster yang bebas pada slot tertentu (yang libur/nonaktif tidak muncul) */
export async function getAvailableBarbers(db: SupabaseClient, date: string, time: string, durationMinutes: number) {
  const { shop, barbers, busy } = await load(db, date);
  const s = timeToMinutes(time);
  return barbers.filter((b) => isFree(b, busy, s, s + durationMinutes, shop)).map((b) => ({ id: b.id, full_name: b.full_name, work: `${hhmm(b.work_start_time)}-${hhmm(b.work_end_time)}` }));
}
