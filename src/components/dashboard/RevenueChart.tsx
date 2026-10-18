import { formatRupiah } from "@/lib/utils/format";
import { formatDateID } from "@/lib/utils/date";
/** Grafik batang sederhana tanpa library */
export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  return (
    <div className="flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label="Grafik omzet 7 hari terakhir">
      {data.map((d) => (
        <div key={d.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${formatDateID(d.date)}: ${formatRupiah(d.revenue)}`}>
          <span className="hidden text-[11px] text-slate-500 sm:block">{d.revenue ? Math.round(d.revenue / 1000) + "k" : ""}</span>
          <div className="w-full rounded-t-md bg-slate-900" style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%`, opacity: d.revenue ? 1 : 0.15 }} />
          <span className="text-[11px] text-slate-500">{d.date.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}
