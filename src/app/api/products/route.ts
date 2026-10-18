import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { productCreateSchema, productSchema } from "@/lib/validation/product";

const idOf = (req: NextRequest) => { const id = req.nextUrl.searchParams.get("id"); return z.string().uuid().safeParse(id).success ? id! : null; };

export async function GET() {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const { data } = await auth.supabase.from("products").select("*").order("name");
  return NextResponse.json({ data });
}
export async function POST(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const p = productCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { initial_stock, ...fields } = p.data;
  const { data, error } = await auth.supabase.from("products").insert({ ...fields, stock: 0 }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  if (initial_stock > 0) await auth.supabase.rpc("record_stock_movement", { p_product: data.id, p_type: "in", p_qty: initial_stock, p_price: null, p_note: "Stok awal" });
  return NextResponse.json({ ok: true }, { status: 201 });
}
// Mengubah data produk (bukan jumlah stok; stok diubah lewat pencatatan agar ada riwayat)
export async function PUT(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const id = idOf(req); if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const p = productSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const { error } = await auth.supabase.from("products").update(p.data).eq("id", id);
  return error ? NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 }) : NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const id = idOf(req); if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const { error } = await auth.supabase.from("products").delete().eq("id", id);
  if (error?.code === "23503") return NextResponse.json({ error: "Produk punya riwayat stok. Nonaktifkan saja lewat Edit." }, { status: 409 });
  return error ? NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 }) : NextResponse.json({ ok: true });
}
