import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    mode?: string;
    persistence?: string;
  }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email, mode, persistence } = await searchParams;
  const decodedEmail = email ? decodeURIComponent(email) : "your email";
  const isSignUp = mode === "sign-up";
  const persisted = persistence === "database";

  return (
    <AuthPanel
      title="Check your email"
      description={`We will send ${isSignUp ? "an account setup" : "a sign-in"} link to ${decodedEmail}.`}
      footer={
        <>
          Wrong address?{" "}
          <Link className="font-bold text-teal-700" href={isSignUp ? "/sign-up" : "/sign-in"}>
            Try again
          </Link>
        </>
      }
    >
      <div className="rounded-md border border-line bg-[#f5f7f3] p-4 text-sm leading-6 text-muted">
        Email delivery is stubbed in this scaffold. The provider adapter will
        later send the actual magic link and complete the session.
      </div>
      <div className="mt-4 rounded-md border border-line bg-white p-4 text-sm leading-6 text-muted">
        {persisted
          ? "A user, email-link token, and development auth session were persisted."
          : "Postgres is not reachable, so this is using the development cookie fallback only."}
      </div>
      {isSignUp ? (
        <Link
          href="/onboarding"
          className="mt-4 block rounded-md bg-teal-700 px-4 py-3 text-center font-black text-white"
        >
          Continue to onboarding stub
        </Link>
      ) : null}
    </AuthPanel>
  );
}
