import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodayBookings, type BookingRow } from "@/components/dashboard/TodayBookings";
import { WalkInQueue } from "@/components/dashboard/WalkInQueue";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LiveRefresh } from "@/components/dashboard/LiveRefresh";
import { WhatsAppSimulator } from "@/components/whatsapp/WhatsAppSimulator";
import { getReport } from "@/lib/report";
import { addDaysISO, formatDateID, todayISO } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/format";

export default async function DashboardPage() {
  const { supabase, profile } = await requireProfile();
  const today = todayISO();
  const isBarber = profile.role === "barber";
  const isOwner = profile.role === "owner";
  const [report, { data: rows }, week] = await Promise.all([
    getReport(supabase, today, today),
    supabase.from("bookings").select("id,queue_number,booking_time,status,queue_status,source,customers(name,whatsapp_number),services(name),barbers(full_name)").eq("booking_date", today).neq("status", "cancelled").order("queue_number", { nullsFirst: false }).order("booking_time"),
    isOwner ? getReport(supabase, addDaysISO(today, -6), today) : Promise.resolve(null),
  ]);
  const prodRes = isBarber ? null : await supabase.from("products").select("stock,min_stock").eq("is_active", true);
  const lowStock = (prodRes?.data ?? []).filter((x: { stock: number; min_stock: number }) => x.stock <= x.min_stock).length;
  const all = (rows ?? []) as unknown as BookingRow[];
  const wa = all.filter((b) => b.source !== "walk_in");
  const walk = all.filter((b) => b.source === "walk_in");
  return (
    <Page supabase={supabase} profile={profile} title="Dashboard">
      <LiveRefresh />
      <p className="-mt-3 text-sm text-slate-500">{formatDateID(today)}</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Booking hari ini" value={String(all.length)} />
        <StatCard label="Pelanggan dilayani" value={String(report.customers)} />
        {!isBarber && <StatCard label="Omzet hari ini" value={formatRupiah(report.revenue)} />}
        <StatCard label={isBarber ? "Komisi saya hari ini" : "Komisi kapster"} value={formatRupiah(report.commission)} />
      </div>
      {lowStock > 0 && (
        <Link href="/stock" className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <span>{lowStock} produk stoknya menipis atau habis</span><span className="font-medium underline underline-offset-4">Lihat stok</span>
        </Link>
      )}
      <Card><CardHeader title="Booking hari ini" /><TodayBookings rows={wa} /></Card>
      {!isBarber && <Card><CardHeader title="Antrean walk-in" /><WalkInQueue rows={walk} /></Card>}
      {week && <Card><CardHeader title="Omzet 7 hari terakhir" /><RevenueChart data={week.daily} /></Card>}
      {isOwner && <Card><CardHeader title="Simulator WhatsApp" /><p className="mb-3 text-sm text-slate-500">Coba alur booking tanpa HP. Ketik BOOKING.</p><WhatsAppSimulator /></Card>}
    </Page>
  );
}
