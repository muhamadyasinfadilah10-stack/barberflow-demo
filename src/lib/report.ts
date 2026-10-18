import type { SupabaseClient } from "@supabase/supabase-js";
import { addDaysISO } from "@/lib/utils/date";

export interface Report {
  from: string; to: string;
  totalBookings: number; totalWalkIns: number; customers: number; revenue: number; commission: number;
  topServices: { name: string; count: number }[];
  perBarber: { barber_id: string; name: string; customers: number; revenue: number; commission: number }[];
  daily: { date: string; revenue: number }[];
}
const wib = (d: string, end = false) => `${d}T${end ? "23:59:59.999" : "00:00:00"}+07:00`;

/** Laporan gabungan untuk rentang tanggal (zona waktu Jakarta). Query memakai klien user, jadi RLS berlaku. */
export async function getReport(db: SupabaseClient, from: string, to: string): Promise<Report> {
  const [{ data: bookings }, { data: txs }] = await Promise.all([
    db.from("bookings").select("source,status").gte("booking_date", from).lte("booking_date", to).neq("status", "cancelled"),
    db.from("transactions").select("barber_id,total_amount,commission_amount,created_at,services(name),barbers(full_name)").gte("created_at", wib(from)).lte("created_at", wib(to, true)),
  ]);
  type Tx = { barber_id: string; total_amount: number; commission_amount: number; created_at: string; services: { name: string } | null; barbers: { full_name: string } | null };
  const list = (txs ?? []) as unknown as Tx[];
  const svc = new Map<string, number>();
  const bar = new Map<string, { name: string; customers: number; revenue: number; commission: number }>();
  const day = new Map<string, number>();
  for (let d = from; d <= to; d = addDaysISO(d, 1)) day.set(d, 0);
  for (const t of list) {
    const n = t.services?.name ?? "-";
    svc.set(n, (svc.get(n) ?? 0) + 1);
    const b = bar.get(t.barber_id) ?? { name: t.barbers?.full_name ?? "-", customers: 0, revenue: 0, commission: 0 };
    b.customers++; b.revenue += Number(t.total_amount); b.commission += Number(t.commission_amount);
    bar.set(t.barber_id, b);
    const dk = new Date(new Date(t.created_at).getTime() + 7 * 3600_000).toISOString().slice(0, 10);
    day.set(dk, (day.get(dk) ?? 0) + Number(t.total_amount));
  }
  const bk = (bookings ?? []) as { source: string; status: string }[];
  return {
    from, to,
    totalBookings: bk.filter((b) => b.source !== "walk_in").length,
    totalWalkIns: bk.filter((b) => b.source === "walk_in").length,
    customers: list.length,
    revenue: list.reduce((s, t) => s + Number(t.total_amount), 0),
    commission: list.reduce((s, t) => s + Number(t.commission_amount), 0),
    topServices: [...svc].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    perBarber: [...bar].map(([barber_id, v]) => ({ barber_id, ...v })).sort((a, b) => b.revenue - a.revenue),
    daily: [...day].map(([date, revenue]) => ({ date, revenue })),
  };
}
