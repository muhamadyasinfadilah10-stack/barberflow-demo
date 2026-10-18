"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ROLE_LABEL } from "@/lib/utils/format";

export function Topbar({ name, role, appName, onMenu }: { name: string; role: string; appName: string; onMenu: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:px-6">
      <button onClick={onMenu} aria-label="Buka menu" className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h14" /></svg>
      </button>
      <span className="truncate font-semibold lg:hidden">{appName}</span>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-medium leading-tight">{name}</p>
          <p className="text-xs text-slate-500">{ROLE_LABEL[role] ?? role}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout} loading={busy}>Keluar</Button>
      </div>
    </header>
  );
}
