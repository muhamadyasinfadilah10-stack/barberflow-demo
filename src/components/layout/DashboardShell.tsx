"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { Role } from "@/types/database";

export function DashboardShell({ name, role, appName, title, actions, children }: { name: string; role: Role; appName: string; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-slate-200 bg-white lg:block"><Sidebar role={role} appName={appName} /></aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl"><Sidebar role={role} appName={appName} onNavigate={() => setOpen(false)} /></aside>
        </div>
      )}
      <div className="lg:pl-60">
        <Topbar name={name} role={role} appName={appName} onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {actions}
          </div>
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
