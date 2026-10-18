import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: p } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
    if (p && p.status !== "inactive") redirect("/dashboard");
  }
  return <LoginForm initialError={sp.error === "akses" ? "Akun Anda belum terdaftar sebagai karyawan atau sudah dinonaktifkan. Hubungi owner." : undefined} />;
}
