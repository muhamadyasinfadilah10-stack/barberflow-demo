import Link from "next/link";
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: { href: string; label: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-lg font-semibold tracking-tight">BarberFlow</p>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-4 text-center text-sm"><Link href={footer.href} className="text-slate-600 underline underline-offset-4">{footer.label}</Link></p>}
      </div>
    </main>
  );
}
