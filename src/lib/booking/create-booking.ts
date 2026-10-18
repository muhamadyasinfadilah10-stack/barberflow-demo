import type { SupabaseClient } from "@supabase/supabase-js";
import { bookingCreateSchema } from "@/lib/validation/booking";
import { minutesToTime, timeToMinutes } from "@/lib/utils/date";
import { getAvailableBarbers } from "./availability";

export type CreateResult = { ok: true; booking: { id: string; barber_name: string; service_name: string; date: string; time: string } } | { ok: false; reason: "slot_taken" | "invalid" | "error"; message: string };

/** Membuat booking. Pencegahan double booking dijamin oleh exclusion constraint di database. */
export async function createBooking(db: SupabaseClient, input: unknown, source: "whatsapp" | "manual" = "whatsapp"): Promise<CreateResult> {
  const parsed = bookingCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid", message: parsed.error.issues[0].message };
  const v = parsed.data;
  const [{ data: service }, { data: barber }] = await Promise.all([
    db.from("services").select("id,name,duration_minutes,is_active").eq("id", v.service_id).maybeSingle(),
    db.from("barbers").select("id,full_name").eq("id", v.barber_id).maybeSingle(),
  ]);
  if (!service?.is_active || !barber) return { ok: false, reason: "invalid", message: "Layanan atau kapster tidak tersedia" };

  // Validasi jam kerja & libur
  const free = await getAvailableBarbers(db, v.booking_date, v.booking_time, service.duration_minutes);
  if (!free.some((b) => b.id === v.barber_id)) return { ok: false, reason: "slot_taken", message: "Slot sudah tidak tersedia" };

  let customerId: string | undefined;
  if (v.whatsapp_number) {
    await db.from("customers").upsert({ whatsapp_number: v.whatsapp_number, name: v.customer_name }, { onConflict: "whatsapp_number", ignoreDuplicates: true });
    const { data: existing } = await db.from("customers").select("id").eq("whatsapp_number", v.whatsapp_number).maybeSingle();
    customerId = existing?.id;
  } else {
    const { data: created } = await db.from("customers").insert({ name: v.customer_name }).select("id").single();
    customerId = created?.id;
  }
  if (!customerId) return { ok: false, reason: "error", message: "Gagal menyimpan pelanggan" };

  const end = minutesToTime(timeToMinutes(v.booking_time) + service.duration_minutes);
  const { data: booking, error } = await db.from("bookings").insert({
    customer_id: customerId, barber_id: v.barber_id, service_id: v.service_id, booking_date: v.booking_date,
    booking_time: v.booking_time, end_time: end, status: "scheduled", source,
  }).select("id").single();
  if (error) {
    if (error.code === "23P01") return { ok: false, reason: "slot_taken", message: "Slot baru saja diambil pelanggan lain" };
    return { ok: false, reason: "error", message: "Gagal membuat booking" };
  }
  return { ok: true, booking: { id: booking.id, barber_name: barber.full_name, service_name: service.name, date: v.booking_date, time: v.booking_time } };
}
