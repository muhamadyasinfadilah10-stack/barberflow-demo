import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { barberSchema } from "@/lib/validation/barber";

const idOf = (req: NextRequest) => { const id = req.nextUrl.searchParams.get("id"); return z.string().uuid().safeParse(id).success ? id! : null; };

export async function GET() {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const { data } = await auth.supabase.from("barbers").select("*").order("full_name");
  return NextResponse.json({ data });
}
export async function POST(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const p = barberSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { error } = await auth.supabase.from("barbers").insert(p.data);
  return error ? NextResponse.json({ error: "Gagal menyimpan kapster" }, { status: 500 }) : NextResponse.json({ ok: true }, { status: 201 });
}
export async function PUT(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const id = idOf(req); if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const p = barberSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { error } = await auth.supabase.from("barbers").update(p.data).eq("id", id);
  return error ? NextResponse.json({ error: "Gagal memperbarui kapster" }, { status: 500 }) : NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const id = idOf(req); if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const { error } = await auth.supabase.from("barbers").delete().eq("id", id);
  if (error?.code === "23503") return NextResponse.json({ error: "Kapster punya riwayat booking/transaksi. Nonaktifkan saja." }, { status: 409 });
  return error ? NextResponse.json({ error: "Gagal menghapus kapster" }, { status: 500 }) : NextResponse.json({ ok: true });
}
