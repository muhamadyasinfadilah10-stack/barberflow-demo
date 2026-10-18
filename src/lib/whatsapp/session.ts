import type { SupabaseClient } from "@supabase/supabase-js";
import type { BotSession, BotStep } from "@/types/whatsapp";
const TTL_MS = 30 * 60 * 1000; // sesi kedaluwarsa setelah 30 menit tidak aktif

export async function getSession(db: SupabaseClient, number: string): Promise<BotSession> {
  const { data } = await db.from("whatsapp_sessions").select("*").eq("whatsapp_number", number).maybeSingle();
  if (!data || Date.now() - new Date(data.updated_at).getTime() > TTL_MS) return { whatsapp_number: number, current_step: "idle", temp_data: {} };
  return { whatsapp_number: number, current_step: data.current_step as BotStep, temp_data: data.temp_data ?? {} };
}
export async function saveSession(db: SupabaseClient, number: string, step: BotStep, temp: Record<string, unknown>) {
  await db.from("whatsapp_sessions").upsert({ whatsapp_number: number, current_step: step, temp_data: temp, updated_at: new Date().toISOString() }, { onConflict: "whatsapp_number" });
}
export const resetSession = (db: SupabaseClient, n: string) => saveSession(db, n, "idle", {});
