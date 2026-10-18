import { NextResponse } from "next/server";
import { requireApi, zodError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { employeeCreateSchema } from "@/lib/validation/employee";

// Owner menambah karyawan: buat akun login + profil (+ data kapster bila role = barber)
export async function POST(req: Request) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const p = employeeCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { password, ...v } = p.data;
  const admin = createAdminClient();
  const { data: created, error: ue } = await admin.auth.admin.createUser({ email: v.email, password, email_confirm: true });
  if (ue || !created.user) return NextResponse.json({ error: ue?.message.includes("already") ? "Email sudah terdaftar" : "Gagal membuat akun login" }, { status: 409 });
  const id = created.user.id;
  const { error: pe } = await admin.from("profiles").insert({ id, full_name: v.full_name, email: v.email, role: v.role, phone: v.phone || null, status: v.status, work_start_time: v.work_start_time, work_end_time: v.work_end_time });
  if (pe) { await admin.auth.admin.deleteUser(id); return NextResponse.json({ error: "Gagal menyimpan profil karyawan" }, { status: 500 }); }
  if (v.role === "barber") {
    await admin.from("barbers").insert({ profile_id: id, full_name: v.full_name, phone: v.phone || null, is_active: v.status === "active", work_start_time: v.work_start_time, work_end_time: v.work_end_time });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
