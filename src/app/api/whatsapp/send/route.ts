import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApi, zodError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleIncoming } from "@/lib/whatsapp/webhook";
import { sendWhatsAppText } from "@/lib/whatsapp/client";

const schema = z.object({ to: z.string().regex(/^\d{9,15}$/), message: z.string().min(1).max(1000), simulate: z.boolean().default(false) });

// Owner saja. simulate=true: jalankan chatbot tanpa mengirim lewat Meta (untuk simulator di demo).
export async function POST(req: Request) {
  const auth = await requireApi(["owner"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return zodError(parsed.error);
  const { to, message, simulate } = parsed.data;
  const db = createAdminClient();
  if (simulate) {
    // Key salah (mis. anon key dipakai sebagai service role) membuat tabel tampak kosong karena RLS. Deteksi di sini.
    const { error: keyErr } = await db.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (keyErr) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY di .env.local tidak valid. Isi dengan key service_role/secret (bukan anon), simpan, lalu restart server." }, { status: 500 });
    await db.from("whatsapp_messages").insert({ whatsapp_number: to, direction: "inbound", message_body: message, message_type: "text" });
    const reply = await handleIncoming(db, to, message);
    await db.from("whatsapp_messages").insert({ whatsapp_number: to, direction: "outbound", message_body: reply, message_type: "text" });
    return NextResponse.json({ reply });
  }
  const ok = await sendWhatsAppText(to, message);
  if (ok) await db.from("whatsapp_messages").insert({ whatsapp_number: to, direction: "outbound", message_body: message, message_type: "text" });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Gagal mengirim. Cek token & nomor penerima (harus terdaftar di test number Meta)." }, { status: 502 });
}
