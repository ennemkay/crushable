import Link from "next/link";

type PageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Sign up" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/links", label: "Links" },
  { href: "/crushes/new", label: "New crush" },
  { href: "/crushes/search", label: "Search" },
  { href: "/admin/reports", label: "Admin" },
];

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-6">
      <header className="grid gap-5 border-b border-line pb-5 md:flex md:items-end md:justify-between">
        <div className="grid gap-2">
          <Link href="/" className="text-sm font-black uppercase tracking-wide text-teal-700">
            Crushable
          </Link>
          <h1 className="text-4xl font-black leading-none tracking-normal text-ink md:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted">{description}</p>
        </div>
        <nav className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </main>
  );
}
