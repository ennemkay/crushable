import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-5xl content-center gap-8 px-6 py-12">
      <section className="grid gap-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Crushable
        </p>
        <h1 className="max-w-3xl text-5xl font-black leading-none tracking-normal text-ink md:text-7xl">
          Linkable dating profiles with privacy-first crush discovery.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted">
          This scaffold is ready for the MVP modules: profiles, disposable links,
          crush records, plan entitlements, email relay, and admin safety tools.
        </p>
      </section>
      <nav className="flex flex-wrap gap-3">
        <Link className="rounded-md bg-teal-700 px-4 py-3 font-bold text-white" href="/sign-up">
          Create account
        </Link>
        <Link className="rounded-md border border-line bg-white px-4 py-3 font-bold text-ink" href="/sign-in">
          Sign in
        </Link>
        <Link className="rounded-md bg-teal-700 px-4 py-3 font-bold text-white" href="/onboarding">
          Start onboarding
        </Link>
        <Link className="rounded-md border border-line bg-white px-4 py-3 font-bold text-ink" href="/settings/profile">
          Edit profile
        </Link>
        <Link className="rounded-md border border-line bg-white px-4 py-3 font-bold text-ink" href="/crushes/new">
          Submit crush
        </Link>
      </nav>
    </main>
  );
}
