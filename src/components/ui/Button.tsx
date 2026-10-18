import { forwardRef } from "react";
type Variant = "primary" | "secondary" | "danger" | "success" | "ghost";
const V: Record<Variant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400",
  secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:text-slate-400",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-300",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300",
  ghost: "text-slate-700 hover:bg-slate-100",
};
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; loading?: boolean; size?: "md" | "sm"; full?: boolean }
export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ variant = "primary", loading, size = "md", full, className = "", children, disabled, ...rest }, ref) {
  return (
    <button ref={ref} disabled={disabled || loading} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed ${size === "md" ? "min-h-11" : "min-h-9 px-3"} ${full ? "w-full" : ""} ${V[variant]} ${className}`} {...rest}>
      {loading && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
});
