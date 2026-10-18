import { NextResponse } from "next/server";
import { requireApi, zodError } from "@/lib/auth";
import { stockMovementSchema } from "@/lib/validation/product";

// Catat stok masuk / terjual / terpakai / koreksi. Perhitungan dilakukan atomik di database.
export async function POST(req: Request) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const p = stockMovementSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return zodError(p.error);
  const v = p.data;
  if (v.type === "adjust" && auth.profile.role !== "owner") return NextResponse.json({ error: "Koreksi stok hanya untuk owner" }, { status: 403 });
  const { data, error } = await auth.supabase.rpc("record_stock_movement", { p_product: v.product_id, p_type: v.type, p_qty: v.quantity, p_price: v.unit_price ?? null, p_note: v.note ?? "" });
  if (error) {
    if (error.code === "23514") return NextResponse.json({ error: error.message }, { status: 409 });
    if (error.code === "P0002") return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    if (error.code === "42501") return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: "Gagal mencatat stok" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stock: data });
}
