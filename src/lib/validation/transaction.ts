import { z } from "zod";
export const transactionSchema = z.object({
  booking_id: z.string().uuid(),
  payment_method: z.enum(["cash", "qris", "transfer"], { message: "Pilih metode pembayaran" }),
});
