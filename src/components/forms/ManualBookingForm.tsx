"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";
import { bookingCreateSchema } from "@/lib/validation/booking";
import { formatRupiah } from "@/lib/utils/format";

interface Svc { id: string; name: string; price: number; duration_minutes: number }
interface Brb { id: string; full_name: string }

/** Booking manual oleh owner/kasir. Jam & kapster hanya menampilkan yang benar-benar kosong. */
export function ManualBookingForm({ services, today }: { services: Svc[]; today: string }) {
  const router = useRouter(); const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(""); const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[] | null>(null); const [time, setTime] = useState("");
  const [barbers, setBarbers] = useState<Brb[] | null>(null); const [barberId, setBarberId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSlots(null); setTime(""); setBarbers(null); setBarberId("");
    if (!serviceId || !date) return;
    let alive = true;
    callApi("/api/bookings/availability?" + new URLSearchParams({ date, service_id: serviceId })).then((r) => { if (alive) setSlots((r.raw?.slots as string[]) ?? []); });
    return () => { alive = false; };
  }, [serviceId, date]);

  useEffect(() => {
    setBarbers(null); setBarberId("");
    if (!serviceId || !date || !time) return;
    let alive = true;
    callApi("/api/bookings/availability?" + new URLSearchParams({ date, service_id: serviceId, time })).then((r) => { if (alive) setBarbers((r.raw?.barbers as Brb[]) ?? []); });
    return () => { alive = false; };
  }, [serviceId, date, time]);

  function reset() { setName(""); setPhone(""); setServiceId(""); setDate(today); setErrors({}); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = bookingCreateSchema.safeParse({ customer_name: name, whatsapp_number: phone, service_id: serviceId || undefined, booking_date: date, booking_time: time || undefined, barber_id: barberId || undefined });
    if (!p.success) {
      const m: Record<string, string> = {};
      for (const i of p.error.issues) m[String(i.path[0])] = ["service_id", "booking_time", "barber_id"].includes(String(i.path[0])) ? "Wajib dipilih" : i.message;
      setErrors(m); return;
    }
    setErrors({}); setLoading(true);
    const res = await callApi("/api/bookings", "POST", p.data);
    setLoading(false);
    if (!res.ok) { toast(res.error ?? "Gagal membuat booking", "error"); return; }
    toast("Booking berhasil dibuat"); setOpen(false); reset(); router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Tambah booking</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Booking manual">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input label="Nama pelanggan" value={name} onChange={(e) => setName(e.target.value)} error={errors.customer_name} />
          <Input label="Nomor WhatsApp (opsional)" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} hint="Format 62812…, tanpa + dan spasi" error={errors.whatsapp_number} />
          <Select label="Layanan" value={serviceId} onChange={(e) => setServiceId(e.target.value)} error={errors.service_id}>
            <option value="">Pilih layanan</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {formatRupiah(s.price)} · {s.duration_minutes} mnt</option>)}
          </Select>
          <Input label="Tanggal" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} error={errors.booking_date} />
          <Select label="Jam" value={time} onChange={(e) => setTime(e.target.value)} disabled={!serviceId || slots === null} error={errors.booking_time}>
            <option value="">{!serviceId ? "Pilih layanan dulu" : slots === null ? "Memuat jam…" : slots.length ? "Pilih jam" : "Tidak ada jam kosong"}</option>
            {(slots ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="Kapster" value={barberId} onChange={(e) => setBarberId(e.target.value)} disabled={!time || barbers === null} error={errors.barber_id}>
            <option value="">{!time ? "Pilih jam dulu" : barbers === null ? "Memuat kapster…" : barbers.length ? "Pilih kapster" : "Tidak ada kapster kosong"}</option>
            {(barbers ?? []).map((b) => <option key={b.id} value={b.id}>{b.full_name}</option>)}
          </Select>
          <Button type="submit" full loading={loading}>Simpan booking</Button>
        </form>
      </Modal>
    </>
  );
}
