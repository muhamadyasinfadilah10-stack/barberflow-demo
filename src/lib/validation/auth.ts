import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
export const forgotSchema = z.object({ email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid") });
export const resetSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Konfirmasi password tidak sama" });
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  password: z.string().min(8, "Password baru minimal 8 karakter"),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Konfirmasi password tidak sama" });
