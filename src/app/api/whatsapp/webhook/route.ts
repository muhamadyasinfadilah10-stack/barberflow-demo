import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleIncoming } from "@/lib/whatsapp/webhook";
import { sendWhatsAppText } from "@/lib/whatsapp/client";

// Verifikasi webhook oleh Meta
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Pesan masuk
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const db = createAdminClient();
  try {
    const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages as { from: string; type: string; text?: { body: string } }[] | undefined;
    for (const m of messages ?? []) {
      const text = m.type === "text" ? (m.text?.body ?? "") : "";
      await db.from("whatsapp_messages").insert({ whatsapp_number: m.from, direction: "inbound", message_body: text || `[${m.type}]`, message_type: m.type });
      const reply = text ? await handleIncoming(db, m.from, text) : "Maaf, saat ini saya hanya bisa membaca pesan teks. Ketik *BANTUAN*.";
      await db.from("whatsapp_messages").insert({ whatsapp_number: m.from, direction: "outbound", message_body: reply, message_type: "text" });
      await sendWhatsAppText(m.from, reply);
    }
  } catch (e) { console.error("Webhook error", e); }
  return NextResponse.json({ ok: true }); // selalu 200 agar Meta tidak mengulang kiriman
}
