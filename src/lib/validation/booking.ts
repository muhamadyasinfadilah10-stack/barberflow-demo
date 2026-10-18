import { z } from "zod";
export const bookingCreateSchema = z.object({
  customer_name: z.string().min(2, "Nama pelanggan minimal 2 karakter").default("Pelanggan"),
  whatsapp_number: z.string().regex(/^\d{9,15}$/, "Nomor WhatsApp 9-15 digit, tanpa + dan spasi").or(z.literal("")).optional(),
  barber_id: z.string().uuid(),
  service_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  booking_time: z.string().regex(/^\d{2}:\d{2}$/),
});
export const bookingUpdateSchema = z.object({ status: z.enum(["cancelled", "no_show"]) });
export const walkInSchema = z.object({
  customer_name: z.string().min(2, "Nama pelanggan wajib diisi"),
  service_id: z.string().uuid("Pilih layanan"),
  barber_id: z.string().uuid("Pilih kapster"),
});
export const walkInUpdateSchema = z.object({ id: z.string().uuid(), queue_status: z.enum(["waiting", "serving", "cancelled"]) });
