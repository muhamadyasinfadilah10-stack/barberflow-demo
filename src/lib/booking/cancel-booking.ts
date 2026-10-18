import type { SupabaseClient } from "@supabase/supabase-js";
/** Batalkan booking aktif milik nomor WhatsApp tertentu (terdekat dulu). */
export async function listUpcomingByNumber(db: SupabaseClient, whatsapp: string, today: string) {
  const { data: customer } = await db.from("customers").select("id").eq("whatsapp_number", whatsapp).maybeSingle();
  if (!customer) return [];
  const { data } = await db.from("bookings")
    .select("id,booking_date,booking_time,services(name),barbers(full_name)")
    .eq("customer_id", customer.id).eq("status", "scheduled").gte("booking_date", today)
    .order("booking_date").order("booking_time");
  return (data ?? []) as unknown as { id: string; booking_date: string; booking_time: string; services: { name: string } | null; barbers: { full_name: string } | null }[];
}
export async function cancelBooking(db: SupabaseClient, id: string) {
  const { error } = await db.from("bookings").update({ status: "cancelled" }).eq("id", id).eq("status", "scheduled");
  return !error;
}
