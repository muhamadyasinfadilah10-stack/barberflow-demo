import { NextResponse } from "next/server";
import { requireApi, zodError } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation/settings";

export async function PUT(req: Request) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const p = settingsSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { data: row } = await auth.supabase.from("shop_settings").select("id").limit(1).maybeSingle();
  const payload = { ...p.data, address: p.data.address || null, updated_at: new Date().toISOString() };
  const { error } = row ? await auth.supabase.from("shop_settings").update(payload).eq("id", row.id) : await auth.supabase.from("shop_settings").insert(payload);
  return error ? NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 }) : NextResponse.json({ ok: true });
}
