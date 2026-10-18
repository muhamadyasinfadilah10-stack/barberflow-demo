const T = { neutral: "bg-slate-100 text-slate-700", success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", muted: "bg-white text-slate-500 ring-1 ring-slate-200", danger: "bg-red-50 text-red-700 ring-1 ring-red-200" };
export function Badge({ tone = "neutral", children }: { tone?: keyof typeof T; children: React.ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${T[tone]}`}>{children}</span>;
}
