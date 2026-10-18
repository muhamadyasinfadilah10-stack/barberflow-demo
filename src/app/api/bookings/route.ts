import { NextResponse, type NextRequest } from "next/server";
import { requireApi, zodError } from "@/lib/auth";
import { bookingCreateSchema } from "@/lib/validation/booking";
import { createBooking } from "@/lib/booking/create-booking";
import { todayISO } from "@/lib/utils/date";

export async function GET(req: NextRequest) {
  const auth = await requireApi();
  if ("error" in auth) return auth.error;
  const date = req.nextUrl.searchParams.get("date") ?? todayISO();
  const { data, error } = await auth.supabase.from("bookings")
    .select("*,customers(name,whatsapp_number),services(name,price),barbers(full_name)").eq("booking_date", date).order("booking_time");
  if (error) return NextResponse.json({ error: "Gagal memuat booking" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await requireApi(["owner", "admin"]);
  if ("error" in auth) return auth.error;
  const parsed = bookingCreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return zodError(parsed.error);
  if (parsed.data.booking_date < todayISO()) return NextResponse.json({ error: "Tanggal booking tidak boleh sudah lewat" }, { status: 400 });
  const res = await createBooking(auth.supabase, parsed.data, "manual");
  return res.ok ? NextResponse.json({ data: res.booking }, { status: 201 }) : NextResponse.json({ error: res.message }, { status: res.reason === "slot_taken" ? 409 : 400 });
}
