import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Diagnosa koneksi. Tidak menampilkan kunci, hanya ya/tidak dan alamat project.
const refOf = (k: string): string | undefined => {
  try { return JSON.parse(Buffer.from(k.split(".")[1], "base64url").toString()).ref; } catch { return undefined; }
};

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const projectId = url.trim().replace(/^https?:\/\//, "").split(".")[0];
  const anonRef = refOf(anon.trim()), serviceRef = refOf(service.trim());
  const env = {
    NEXT_PUBLIC_SUPABASE_URL_terisi: !!url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_terisi: !!anon,
    SUPABASE_SERVICE_ROLE_KEY_terisi: !!service,
    url_bentuk_benar: /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url.trim()),
    url_ada_spasi_atau_enter: url !== url.trim(),
    anon_key_cocok_dengan_url: anonRef ? anonRef === projectId : null,
    service_key_cocok_dengan_url: serviceRef ? serviceRef === projectId : null,
    site_url_diawali_https: (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://"),
  };
  let supabase: Record<string, unknown> = { diuji: false };
  if (url && anon) {
    const t0 = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(`${url.trim()}/auth/v1/health`, { headers: { apikey: anon.trim() }, signal: ctrl.signal, cache: "no-store" });
      supabase = { diuji: true, terjangkau: true, http_status: r.status, ms: Date.now() - t0 };
    } catch (e) {
      supabase = { diuji: true, terjangkau: false, ms: Date.now() - t0, galat: e instanceof Error ? e.name : "error" };
    } finally { clearTimeout(timer); }
  }
  return NextResponse.json({ project: projectId, region_vercel: process.env.VERCEL_REGION ?? null, env, supabase });
}
