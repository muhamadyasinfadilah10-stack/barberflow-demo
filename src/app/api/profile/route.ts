import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama maksimal 80 karakter"),
  phone: z.string().regex(/^\d{9,15}$/, "Nomor 9-15 digit, tanpa + dan spasi (contoh 6281234567890)").or(z.literal("")),
});

// Setiap user boleh mengubah nama & nomor WA miliknya sendiri (role/status tidak bisa diubah di sini)
export async function PATCH(req: Request) {
  const auth = await requireApi();
  if ("error" in auth) return auth.error;
  const p = schema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ full_name: p.data.full_name, phone: p.data.phone || null }).eq("id", auth.user.id);
  if (error) return NextResponse.json({ error: "Gagal menyimpan profil" }, { status: 500 });
  await admin.from("barbers").update({ full_name: p.data.full_name, phone: p.data.phone || null }).eq("profile_id", auth.user.id);
  return NextResponse.json({ ok: true });
}
