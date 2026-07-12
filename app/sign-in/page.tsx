import Link from "next/link";
import { AuthPanel } from "@/components/auth/auth-panel";
import { EmailLinkForm } from "@/components/auth/email-link-form";
import { requestSignInLink } from "@/lib/auth/email-link";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  return (
    <AuthPanel
      title="Sign in"
      description="Enter your email and Crushable will send a secure sign-in link."
      footer={
        <>
          New to Crushable?{" "}
          <Link className="font-bold text-teal-700" href="/sign-up">
            Create an account
          </Link>
        </>
      }
    >
      <EmailLinkForm action={requestSignInLink} submitLabel="Send sign-in link" error={error} />
    </AuthPanel>
  );
}
