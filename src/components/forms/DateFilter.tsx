import { Button } from "@/components/ui/Button";
/** Filter tanggal via GET (tanpa JS), cocok untuk server component. */
export function DateFilter({ from, to, single }: { from: string; to?: string; single?: boolean }) {
  const cls = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base sm:text-sm";
  return (
    <form className="flex flex-wrap items-end gap-3">
      <label className="block text-sm"><span className="mb-1.5 block font-medium text-slate-700">{single ? "Tanggal" : "Dari"}</span><input type="date" name="from" defaultValue={from} className={cls} /></label>
      {!single && <label className="block text-sm"><span className="mb-1.5 block font-medium text-slate-700">Sampai</span><input type="date" name="to" defaultValue={to} className={cls} /></label>}
      <Button type="submit" variant="secondary">Terapkan</Button>
    </form>
  );
}
