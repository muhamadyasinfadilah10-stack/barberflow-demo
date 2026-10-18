import { NextResponse } from "next/server";
import { requireApi, zodError } from "@/lib/auth";
import { walkInSchema, walkInUpdateSchema } from "@/lib/validation/booking";
import { jakartaParts, minutesToTime, timeToMinutes, todayISO } from "@/lib/utils/date";

export async function POST(req: Request) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const p = walkInSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const db = auth.supabase;
  const [{ data: service }, { data: barber }] = await Promise.all([
    db.from("services").select("duration_minutes,is_active").eq("id", p.data.service_id).maybeSingle(),
    db.from("barbers").select("is_active").eq("id", p.data.barber_id).maybeSingle(),
  ]);
  if (!service?.is_active) return NextResponse.json({ error: "Layanan tidak tersedia" }, { status: 400 });
  if (!barber?.is_active) return NextResponse.json({ error: "Kapster sedang libur/nonaktif" }, { status: 400 });
  const { data: customer, error: ce } = await db.from("customers").insert({ name: p.data.customer_name }).select("id").single();
  if (ce) return NextResponse.json({ error: "Gagal menyimpan pelanggan" }, { status: 500 });
  const now = jakartaParts();
  const start = Number(now.hour) * 60 + Number(now.minute);
  const end = Math.min(start + service.duration_minutes, 23 * 60 + 59);
  const today = todayISO();
  // Nomor antrean = nomor terakhir hari ini + 1. Jika bentrok (dua kasir bersamaan), coba lagi.
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: last } = await db.from("bookings").select("queue_number").eq("booking_date", today).eq("source", "walk_in").not("queue_number", "is", null).order("queue_number", { ascending: false }).limit(1).maybeSingle();
    const n = (last?.queue_number ?? 0) + 1;
    const { error } = await db.from("bookings").insert({
      customer_id: customer.id, barber_id: p.data.barber_id, service_id: p.data.service_id, booking_date: today,
      booking_time: minutesToTime(start), end_time: minutesToTime(end), status: "scheduled", source: "walk_in", queue_status: "waiting", queue_number: n,
    });
    if (!error) return NextResponse.json({ ok: true, queue_number: n }, { status: 201 });
    if (error.code !== "23505") break;
  }
  return NextResponse.json({ error: "Gagal menambah antrean" }, { status: 500 });
}

export async function PATCH(req: Request) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const p = walkInUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const patch = p.data.queue_status === "cancelled" ? { queue_status: "cancelled", status: "cancelled" } : { queue_status: p.data.queue_status };
  const { data, error } = await auth.supabase.from("bookings").update(patch).eq("id", p.data.id).eq("source", "walk_in").eq("status", "scheduled").select("id");
  return error || !data?.length ? NextResponse.json({ error: "Antrean tidak ditemukan atau sudah selesai" }, { status: 404 }) : NextResponse.json({ ok: true });
}
