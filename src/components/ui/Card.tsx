export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card p-4 sm:p-6 ${className}`}>{children}</section>;
}
export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {action}
    </div>
  );
}
