"use client";
import { useRef, useState } from "react";
import { callApi } from "@/lib/utils/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const DEMO_NUMBER = "628000000001";
/** Simulator chat untuk demo tanpa perlu HP. Menjalankan chatbot yang sama dengan webhook asli. */
export function WhatsAppSimulator() {
  const toast = useToast();
  const [msgs, setMsgs] = useState<{ me: boolean; text: string }[]>([{ me: false, text: "Ketik BOOKING untuk mulai." }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim(); if (!t) return;
    setText(""); setMsgs((m) => [...m, { me: true, text: t }]); setBusy(true);
    const res = await callApi<unknown>("/api/whatsapp/send", "POST", { to: DEMO_NUMBER, message: t, simulate: true });
    setBusy(false);
    if (!res.ok) { toast(res.error ?? "Gagal", "error"); return; }
    setMsgs((m) => [...m, { me: false, text: String(res.raw?.reply ?? "") }]);
    setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }
  return (
    <div className="flex h-80 flex-col rounded-xl border border-slate-200">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {msgs.map((m, i) => <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${m.me ? "ml-auto bg-emerald-600 text-white" : "bg-slate-100"}`}>{m.text}</div>)}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ketik pesan…" aria-label="Pesan" className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-base sm:text-sm" />
        <Button type="submit" loading={busy}>Kirim</Button>
      </form>
    </div>
  );
}
