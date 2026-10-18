import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { bookingUpdateSchema } from "@/lib/validation/booking";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const parsed = bookingUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return zodError(parsed.error);
  const { error, data } = await auth.supabase.from("bookings").update({ status: parsed.data.status, queue_status: parsed.data.status === "cancelled" ? "cancelled" : undefined }).eq("id", id).eq("status", "scheduled").select("id");
  if (error || !data?.length) return NextResponse.json({ error: "Booking tidak ditemukan atau sudah diproses" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
