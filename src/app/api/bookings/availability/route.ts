import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { getAvailableBarbers, getAvailableSlots } from "@/lib/booking/availability";

const q = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  service_id: z.string().uuid(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

// Slot jam kosong (tanpa time) atau kapster yang kosong pada jam tertentu (dengan time)
export async function GET(req: NextRequest) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const sp = req.nextUrl.searchParams;
  const p = q.safeParse({ date: sp.get("date") ?? "", service_id: sp.get("service_id") ?? "", time: sp.get("time") ?? undefined });
  if (!p.success) return zodError(p.error);
  const { data: service } = await auth.supabase.from("services").select("duration_minutes").eq("id", p.data.service_id).maybeSingle();
  if (!service) return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });
  if (p.data.time) return NextResponse.json({ barbers: await getAvailableBarbers(auth.supabase, p.data.date, p.data.time, service.duration_minutes) });
  return NextResponse.json({ slots: await getAvailableSlots(auth.supabase, p.data.date, service.duration_minutes) });
}
