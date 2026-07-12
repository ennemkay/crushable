import Link from "next/link";

type AuthPanelProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthPanel({ title, description, children, footer }: AuthPanelProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md content-center px-5 py-10">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Link href="/" className="text-sm font-black uppercase tracking-wide text-teal-700">
          Crushable
        </Link>
        <div className="mt-6">
          <h1 className="text-4xl font-black leading-none tracking-normal text-ink">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        </div>
        <div className="mt-6">{children}</div>
        <footer className="mt-6 border-t border-line pt-5 text-sm text-muted">{footer}</footer>
      </section>
    </main>
  );
}
