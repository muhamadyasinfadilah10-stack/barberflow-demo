import { forwardRef } from "react";
const base = "block w-full min-h-11 rounded-xl border bg-white px-3 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-100";
interface P extends React.InputHTMLAttributes<HTMLInputElement> { label: string; error?: string; hint?: string }
export const Input = forwardRef<HTMLInputElement, P>(function Input({ label, error, hint, id, className = "", ...rest }, ref) {
  const key = id ?? `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={key} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input ref={ref} id={key} aria-invalid={!!error} className={`${base} ${error ? "border-red-400" : "border-slate-300"} ${className}`} {...rest} />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
});
interface S extends React.SelectHTMLAttributes<HTMLSelectElement> { label: string; error?: string }
export function Select({ label, error, id, children, className = "", ...rest }: S) {
  const key = id ?? `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={key} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select id={key} aria-invalid={!!error} className={`${base} ${error ? "border-red-400" : "border-slate-300"} ${className}`} {...rest}>{children}</select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
