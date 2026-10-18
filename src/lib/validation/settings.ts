import { z } from "zod";
export const settingsSchema = z.object({
  shop_name: z.string().min(2, "Nama barbershop wajib diisi"),
  app_display_name: z.string().min(2, "Nama aplikasi wajib diisi"),
  address: z.string().max(300).default(""),
  open_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid"),
  close_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid"),
  owner_whatsapp_number: z.string().regex(/^\d{9,15}$/, "Nomor 9-15 digit, tanpa + dan spasi (contoh 6281234567890)"),
}).refine((v) => v.open_time.slice(0, 5) < v.close_time.slice(0, 5), { path: ["close_time"], message: "Jam tutup harus setelah jam buka" });
export const shopSessionSchema = z.object({ action: z.enum(["open", "close"]), note: z.string().max(500).optional() });
