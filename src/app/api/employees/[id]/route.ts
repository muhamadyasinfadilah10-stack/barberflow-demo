import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendResetEmail } from "@/lib/employees";
import { employeeActionSchema, employeeUpdateSchema } from "@/lib/validation/employee";

type Ctx = { params: Promise<{ id: string }> };
const validId = (id: string) => z.string().uuid().safeParse(id).success;

// Ubah data karyawan atau (action: reset_password) kirim email reset
export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  if (!validId(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  const act = employeeActionSchema.safeParse(body);
  if (act.success) {
    const { data: emp } = await admin.from("profiles").select("email").eq("id", id).maybeSingle();
    if (!emp?.email) return NextResponse.json({ error: "Karyawan tidak ditemukan" }, { status: 404 });
    const { error } = await sendResetEmail(emp.email);
    return error ? NextResponse.json({ error: "Gagal mengirim email reset" }, { status: 502 }) : NextResponse.json({ ok: true, message: `Link reset dikirim ke ${emp.email}` });
  }

  const p = employeeUpdateSchema.safeParse(body);
  if (!p.success) return zodError(p.error);
  const v = p.data;
  if (id === auth.user.id && (v.role !== "owner" || v.status === "inactive"))
    return NextResponse.json({ error: "Anda tidak bisa menurunkan atau menonaktifkan akun owner sendiri" }, { status: 400 });
  const { error } = await admin.from("profiles").update({ full_name: v.full_name, phone: v.phone || null, role: v.role, status: v.status, work_start_time: v.work_start_time, work_end_time: v.work_end_time }).eq("id", id);
  if (error) return NextResponse.json({ error: "Gagal memperbarui karyawan" }, { status: 500 });

  // Sinkronkan data kapster (agar libur/nonaktif tidak muncul di pilihan booking)
  const barberFields = { full_name: v.full_name, phone: v.phone || null, is_active: v.status === "active" && v.role === "barber", work_start_time: v.work_start_time, work_end_time: v.work_end_time };
  const { data: existing } = await admin.from("barbers").select("id").eq("profile_id", id).maybeSingle();
  if (existing) await admin.from("barbers").update(barberFields).eq("id", existing.id);
  else if (v.role === "barber") await admin.from("barbers").insert({ profile_id: id, ...barberFields });
  return NextResponse.json({ ok: true });
}

// Hapus permanen hanya jika belum punya booking/transaksi/sesi buka-tutup
export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  if (!validId(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  if (id === auth.user.id) return NextResponse.json({ error: "Anda tidak bisa menghapus akun sendiri" }, { status: 400 });
  const admin = createAdminClient();
  const { data: barber } = await admin.from("barbers").select("id").eq("profile_id", id).maybeSingle();
  let used = false;
  if (barber) {
    const [b, t] = await Promise.all([
      admin.from("bookings").select("id", { count: "exact", head: true }).eq("barber_id", barber.id),
      admin.from("transactions").select("id", { count: "exact", head: true }).eq("barber_id", barber.id),
    ]);
    used = (b.count ?? 0) > 0 || (t.count ?? 0) > 0;
  }
  const [s1, s2, s3] = await Promise.all([
    admin.from("shop_sessions").select("id", { count: "exact", head: true }).eq("opened_by", id),
    admin.from("shop_sessions").select("id", { count: "exact", head: true }).eq("closed_by", id),
    admin.from("transactions").select("id", { count: "exact", head: true }).eq("created_by", id),
  ]);
  used = used || (s1.count ?? 0) + (s2.count ?? 0) + (s3.count ?? 0) > 0;
  if (used) return NextResponse.json({ error: "Karyawan sudah punya riwayat. Nonaktifkan saja agar data tetap aman." }, { status: 409 });
  if (barber) await admin.from("barbers").delete().eq("id", barber.id);
  await admin.from("profiles").delete().eq("id", id);
  const { error } = await admin.auth.admin.deleteUser(id);
  return error ? NextResponse.json({ error: "Gagal menghapus akun" }, { status: 500 }) : NextResponse.json({ ok: true });
}
