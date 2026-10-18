import { NextResponse } from "next/server";
import { requireApi, zodError } from "@/lib/auth";
import { shopSessionSchema } from "@/lib/validation/settings";
import { getReport } from "@/lib/report";
import { todayISO } from "@/lib/utils/date";
import { buildCloseReport, buildOpenReport } from "@/lib/whatsapp-report";

// Catat buka/tutup + buat ringkasan. Pesan WhatsApp TIDAK dikirim dari server (pakai link wa.me di client).
export async function POST(req: Request) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const p = shopSessionSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const db = auth.supabase;
  const { data: shop } = await db.from("shop_settings").select("id,shop_name,owner_whatsapp_number").limit(1).maybeSingle();
  if (!shop) return NextResponse.json({ error: "Pengaturan barbershop belum diisi" }, { status: 400 });
  const { data: open } = await db.from("shop_sessions").select("*").eq("status", "open").order("opened_at", { ascending: false }).limit(1).maybeSingle();
  const now = new Date().toISOString();
  const by = auth.profile.full_name;

  if (p.data.action === "open") {
    if (open) return NextResponse.json({ error: "Barbershop sudah dibuka. Tutup dulu sebelum membuka lagi." }, { status: 409 });
    const { error } = await db.from("shop_sessions").insert({ shop_id: shop.id, opened_by: auth.user.id, opened_at: now, status: "open", note: p.data.note ?? null });
    if (error) return NextResponse.json({ error: "Gagal mencatat pembukaan" }, { status: 500 });
    return NextResponse.json({ ok: true, report: buildOpenReport({ shopName: shop.shop_name, by, at: now }), whatsapp: shop.owner_whatsapp_number });
  }

  if (!open) return NextResponse.json({ error: "Barbershop belum dibuka" }, { status: 409 });
  const r = await getReport(db, todayISO(), todayISO());
  const { error } = await db.from("shop_sessions").update({
    closed_by: auth.user.id, closed_at: now, status: "closed", total_bookings: r.totalBookings, total_walk_ins: r.totalWalkIns,
    total_revenue: r.revenue, total_commission: r.commission, note: p.data.note ?? null,
  }).eq("id", open.id);
  if (error) return NextResponse.json({ error: "Gagal mencatat penutupan" }, { status: 500 });
  return NextResponse.json({ ok: true, report: buildCloseReport({ shopName: shop.shop_name, by, at: now, bookings: r.totalBookings, walkIns: r.totalWalkIns, revenue: r.revenue, commission: r.commission, note: p.data.note }), whatsapp: shop.owner_whatsapp_number });
}
