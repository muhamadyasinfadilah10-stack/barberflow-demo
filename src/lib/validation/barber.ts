import { z } from "zod";
const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid");
export const barberSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().regex(/^\d{9,15}$/, "Nomor 9-15 digit tanpa + dan spasi").or(z.literal("")),
  is_active: z.boolean(),
  work_start_time: time,
  work_end_time: time,
}).refine((v) => v.work_start_time.slice(0, 5) < v.work_end_time.slice(0, 5), { path: ["work_end_time"], message: "Jam selesai harus setelah jam mulai" });
