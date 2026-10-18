"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
/** Antrean real-time: refresh saat tabel bookings berubah (Supabase Realtime) + polling 30 detik sebagai cadangan. */
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase.channel("bookings-live").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => router.refresh()).subscribe();
    const t = setInterval(() => router.refresh(), 30000);
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, [router]);
  return null;
}
