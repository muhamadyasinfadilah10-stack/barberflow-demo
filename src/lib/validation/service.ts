import { z } from "zod";
export const serviceSchema = z.object({
  name: z.string().min(2, "Nama layanan wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  duration_minutes: z.coerce.number().int().min(5, "Durasi minimal 5 menit"),
  commission_type: z.enum(["percent", "fixed"]),
  commission_value: z.coerce.number().min(0, "Komisi tidak boleh negatif"),
  is_active: z.boolean().default(true),
}).refine((v) => v.commission_type !== "percent" || v.commission_value <= 100, { path: ["commission_value"], message: "Komisi persen maksimal 100" });
