import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApi } from "@/lib/auth";
import { getReport } from "@/lib/report";
import { todayISO } from "@/lib/utils/date";

const q = z.object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

export async function GET(req: NextRequest) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const today = todayISO();
  const p = q.safeParse({ from: req.nextUrl.searchParams.get("from") ?? today, to: req.nextUrl.searchParams.get("to") ?? today });
  if (!p.success || p.data.from > p.data.to) return NextResponse.json({ error: "Rentang tanggal tidak valid" }, { status: 400 });
  // Admin/kasir hanya laporan harian
  const [from, to] = auth.profile.role === "admin" ? [p.data.from, p.data.from] : [p.data.from, p.data.to];
  return NextResponse.json({ data: await getReport(auth.supabase, from, to) });
}
