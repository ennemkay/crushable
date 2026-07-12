import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";
import { EmailLinkForm } from "@/components/auth/email-link-form";
import { requestSignUpLink } from "@/lib/auth/email-link";

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error } = await searchParams;

  return (
    <AuthPanel
      title="Create account"
      description="Use an email address you control. Your profile email is never public."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-bold text-teal-700" href="/sign-in">
            Sign in
          </Link>
        </>
      }
    >
      <EmailLinkForm action={requestSignUpLink} submitLabel="Send account link" error={error} />
      <p className="mt-4 text-xs leading-5 text-muted">
        By continuing, you agree to use Crushable safely and understand that
        public profiles cannot include direct contact information.
      </p>
    </AuthPanel>
  );
}
