import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { withTimeout } from "@/lib/utils/timeout";

const PUBLIC = ["/", "/login", "/forgot-password", "/reset-password", "/auth/confirm", "/api/whatsapp/webhook", "/api/health"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Halaman publik tidak perlu menghubungi Supabase di middleware
  if (PUBLIC.includes(path)) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse("Konfigurasi belum lengkap: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di Vercel. Buka /api/health untuk diagnosa.", { status: 503 });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Jika Supabase tidak menjawab dalam 5 detik, anggap belum login (jangan sampai 504)
  const res = await withTimeout(supabase.auth.getUser(), 5000);
  const user = res?.data.user ?? null;
  if (!user) {
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Belum login" }, { status: 401 });
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
