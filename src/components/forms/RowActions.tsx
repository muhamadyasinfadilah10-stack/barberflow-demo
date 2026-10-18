"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { callApi } from "@/lib/utils/api";

/** Tombol aksi status untuk booking WhatsApp atau antrean walk-in. */
export function RowActions({ id, kind, queue }: { id: string; kind: "booking" | "walkin"; queue?: string | null }) {
  const router = useRouter(); const toast = useToast(); const [busy, setBusy] = useState("");
  async function run(key: string, url: string, body: unknown, msg: string, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(key);
    const res = await callApi(url, "PATCH", body);
    setBusy("");
    if (!res.ok) { toast(res.error ?? "Gagal", "error"); return; }
    toast(msg); router.refresh();
  }
  if (kind === "booking") return (
    <>
      <Button size="sm" variant="secondary" loading={busy === "ns"} onClick={() => run("ns", `/api/bookings/${id}`, { status: "no_show" }, "Ditandai tidak datang")}>Tidak datang</Button>
      <Button size="sm" variant="danger" loading={busy === "c"} onClick={() => run("c", `/api/bookings/${id}`, { status: "cancelled" }, "Booking dibatalkan", "Batalkan booking ini?")}>Batalkan</Button>
    </>
  );
  return (
    <>
      {queue === "waiting" && <Button size="sm" variant="secondary" loading={busy === "s"} onClick={() => run("s", "/api/walk-in", { id, queue_status: "serving" }, "Mulai dilayani")}>Mulai layani</Button>}
      <Button size="sm" variant="danger" loading={busy === "c"} onClick={() => run("c", "/api/walk-in", { id, queue_status: "cancelled" }, "Antrean dibatalkan", "Batalkan antrean ini?")}>Batalkan</Button>
    </>
  );
}
