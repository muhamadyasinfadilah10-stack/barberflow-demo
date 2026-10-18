import "server-only";
const GRAPH = "https://graph.facebook.com/v21.0";
/** Kirim pesan teks via WhatsApp Cloud API. Token hanya dibaca di server. */
export async function sendWhatsAppText(to: string, body: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN, id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !id) { console.warn("WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID belum diisi"); return false; }
  const res = await fetch(`${GRAPH}/${id}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
  });
  if (!res.ok) console.error("WhatsApp send gagal", res.status, await res.text());
  return res.ok;
}
