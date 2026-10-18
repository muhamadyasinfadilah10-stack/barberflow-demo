import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/types/database";

/** Untuk Server Component: wajib login dan role sesuai, kalau tidak redirect. */
export async function requireProfile(allowed?: Role[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.status === "inactive") redirect("/login?error=akses");
  if (allowed && !allowed.includes(profile.role as Role)) redirect("/dashboard");
  return { supabase, user, profile: profile as Profile };
}

/** Untuk API route: kembalikan 401/403 JSON kalau tidak berhak. */
export async function requireApi(allowed?: Role[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Belum login" }, { status: 401 }) } as const;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.status === "inactive") return { error: NextResponse.json({ error: "Akun tidak aktif" }, { status: 403 }) } as const;
  if (allowed && !allowed.includes(profile.role as Role)) return { error: NextResponse.json({ error: "Anda tidak punya akses" }, { status: 403 }) } as const;
  return { supabase, user, profile: profile as Profile } as const;
}

export function zodError(err: import("zod").ZodError) {
  return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid", fields: err.flatten().fieldErrors }, { status: 400 });
}
