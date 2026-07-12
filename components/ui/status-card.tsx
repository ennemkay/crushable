type StatusCardProps = {
  title: string;
  children: React.ReactNode;
};

export function StatusCard({ title, children }: StatusCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h2 className="text-lg font-black text-ink">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-muted">{children}</div>
    </section>
  );
}
