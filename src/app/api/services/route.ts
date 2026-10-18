import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { serviceSchema } from "@/lib/validation/service";

const idOf = (req: NextRequest) => { const id = req.nextUrl.searchParams.get("id"); return z.string().uuid().safeParse(id).success ? id! : null; };

export async function GET() {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const { data } = await auth.supabase.from("services").select("*").order("name");
  return NextResponse.json({ data });
}
export async function POST(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const p = serviceSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { error } = await auth.supabase.from("services").insert(p.data);
  return error ? NextResponse.json({ error: "Gagal menyimpan layanan" }, { status: 500 }) : NextResponse.json({ ok: true }, { status: 201 });
}
export async function PUT(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const id = idOf(req); if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const p = serviceSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { error } = await auth.supabase.from("services").update(p.data).eq("id", id);
  return error ? NextResponse.json({ error: "Gagal memperbarui layanan" }, { status: 500 }) : NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const id = idOf(req); if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const { error } = await auth.supabase.from("services").delete().eq("id", id);
  if (error?.code === "23503") return NextResponse.json({ error: "Layanan sudah dipakai di booking/transaksi. Nonaktifkan saja." }, { status: 409 });
  return error ? NextResponse.json({ error: "Gagal menghapus layanan" }, { status: 500 }) : NextResponse.json({ ok: true });
}
