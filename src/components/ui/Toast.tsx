"use client";
import { createContext, useCallback, useContext, useState } from "react";

type Kind = "success" | "error";
const Ctx = createContext<(msg: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; kind: Kind }[]>([]);
  const push = useCallback((msg: string, kind: Kind = "success") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, msg, kind }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((i) => (
          <div key={i.id} role="status" className={`pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${i.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>{i.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
