"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/roles";
import type { Role } from "@/types/database";

export function Sidebar({ role, appName, onNavigate }: { role: Role; appName: string; onNavigate?: () => void }) {
  const path = usePathname();
  const items = NAV.filter((n) => n.roles.includes(role));
  return (
    <nav aria-label="Menu utama" className="flex h-full flex-col">
      <div className="px-5 py-5 text-lg font-semibold tracking-tight">{appName}</div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((n) => {
          const active = path === n.href || path.startsWith(n.href + "/");
          return (
            <li key={n.href}>
              <Link href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
