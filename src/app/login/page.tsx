import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withTimeout } from "@/lib/utils/timeout";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const res = await withTimeout(supabase.auth.getUser(), 5000);
  const user = res?.data.user ?? null;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
    if (p && p.status !== "inactive") redirect("/dashboard");
  }
  return <LoginForm initialError={res === null ? "Database tidak merespons. Buka /api/health untuk diagnosa pengaturan Supabase di Vercel." : sp.error === "akses" ? "Akun Anda belum terdaftar sebagai karyawan atau sudah dinonaktifkan. Hubungi owner." : undefined} />;
}
