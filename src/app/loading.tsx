/** Tampil seketika saat pindah halaman, supaya layar tidak terasa macet. */
export default function Loading() {
  return (
    <div className="min-h-screen lg:pl-60" aria-busy="true" aria-label="Memuat halaman">
      <div className="h-14 border-b border-slate-200 bg-white" />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}</div>
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
