import type { ReactNode } from "react";
export interface Column<T> { header: string; cell: (row: T) => ReactNode; align?: "right" }
interface P<T> { rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string; empty?: ReactNode; loading?: boolean }

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      {hint && <p className="max-w-xs text-sm text-slate-500">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Tabel di layar md ke atas, daftar kartu di HP. */
export function DataTable<T>({ rows, columns, rowKey, empty, loading }: P<T>) {
  if (loading) return <div className="space-y-2 p-2" aria-busy>{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}</div>;
  if (!rows.length) return <>{empty ?? <EmptyState title="Belum ada data" />}</>;
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-slate-500">{columns.map((c) => <th key={c.header} className={`px-3 py-2.5 font-medium ${c.align === "right" ? "text-right" : ""}`}>{c.header}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={rowKey(r)} className="border-b border-slate-100 last:border-0">{columns.map((c) => <td key={c.header} className={`px-3 py-3 align-middle ${c.align === "right" ? "text-right" : ""}`}>{c.cell(r)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)} className="rounded-xl border border-slate-200 p-3">
            <dl className="space-y-1.5">
              {columns.map((c, i) => (
                <div key={c.header} className={i === 0 ? "" : "flex items-start justify-between gap-3 text-sm"}>
                  {i === 0 ? <dd className="font-medium">{c.cell(r)}</dd> : <><dt className="shrink-0 text-slate-500">{c.header}</dt><dd className="min-w-0 text-right">{c.cell(r)}</dd></>}
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
