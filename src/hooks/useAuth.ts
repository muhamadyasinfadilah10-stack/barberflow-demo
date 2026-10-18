"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    const s = createClient();
    s.auth.getUser().then(async ({ data }) => {
      if (data.user) { const { data: p } = await s.from("profiles").select("*").eq("id", data.user.id).maybeSingle(); setProfile(p as Profile | null); }
      setLoading(false);
    });
  }, []);
  return { profile, loading };
}
