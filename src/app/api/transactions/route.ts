import { NextResponse } from "next/server";
import { requireApi, zodError } from "@/lib/auth";
import { transactionSchema } from "@/lib/validation/transaction";
import { calculateCommission } from "@/lib/commission/calculate";

// Menyelesaikan booking/walk-in: hitung komisi otomatis dari layanan
export async function POST(req: Request) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const p = transactionSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const db = auth.supabase;
  const { data: b } = await db.from("bookings").select("id,barber_id,service_id,status,source").eq("id", p.data.booking_id).maybeSingle();
  if (!b || b.status !== "scheduled") return NextResponse.json({ error: "Booking tidak ditemukan atau sudah diproses" }, { status: 404 });
  const { data: s } = await db.from("services").select("price,commission_type,commission_value").eq("id", b.service_id).single();
  if (!s) return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });
  const { error } = await db.from("transactions").insert({
    booking_id: b.id, barber_id: b.barber_id, service_id: b.service_id, total_amount: s.price,
    payment_method: p.data.payment_method, commission_amount: calculateCommission(s), created_by: auth.user.id,
  });
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Transaksi sudah tercatat" : "Gagal menyimpan transaksi" }, { status: 409 });
  await db.from("bookings").update({ status: "completed", queue_status: b.source === "walk_in" ? "done" : null }).eq("id", b.id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
