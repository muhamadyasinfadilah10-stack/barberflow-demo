import { z } from "zod";
export const productSchema = z.object({
  name: z.string().trim().min(2, "Nama produk minimal 2 karakter"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  min_stock: z.coerce.number().int("Harus bilangan bulat").min(0, "Tidak boleh negatif"),
  is_active: z.boolean().default(true),
});
export const productCreateSchema = productSchema.extend({ initial_stock: z.coerce.number().int("Harus bilangan bulat").min(0, "Tidak boleh negatif").default(0) });
export const stockMovementSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(["in", "sale", "use", "adjust"], { message: "Pilih jenis" }),
  quantity: z.coerce.number().int("Jumlah harus bilangan bulat"),
  unit_price: z.coerce.number().min(0, "Harga tidak boleh negatif").optional(),
  note: z.string().trim().max(200, "Catatan maksimal 200 karakter").optional(),
}).refine((v) => (v.type === "adjust" ? v.quantity >= 0 : v.quantity >= 1), { path: ["quantity"], message: "Jumlah minimal 1" });
