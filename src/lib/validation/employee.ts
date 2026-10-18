import { z } from "zod";
const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid");
const phone = z.string().regex(/^\d{9,15}$/, "Nomor WhatsApp 9-15 digit, tanpa + dan spasi (contoh 6281234567890)").or(z.literal(""));
const base = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  phone,
  role: z.enum(["owner", "admin", "barber"]),
  status: z.enum(["active", "off", "inactive"]),
  work_start_time: time,
  work_end_time: time,
});
const timeOrder = (v: { work_start_time: string; work_end_time: string }) => v.work_start_time.slice(0, 5) < v.work_end_time.slice(0, 5);
const timeMsg = { path: ["work_end_time"], message: "Jam selesai harus setelah jam mulai" };
export const employeeCreateSchema = base.extend({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password awal minimal 8 karakter"),
}).refine(timeOrder, timeMsg);
export const employeeUpdateSchema = base.refine(timeOrder, timeMsg);
export const employeeActionSchema = z.object({ action: z.literal("reset_password") });
