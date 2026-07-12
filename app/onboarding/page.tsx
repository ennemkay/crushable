import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatusCard } from "@/components/ui/status-card";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  return (
    <PageShell
      title="Create profile"
      description="The activation flow will collect the required MVP profile fields before unlocking app features."
    >
      {user ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ProfileForm defaultEmail={user.email} mode="onboarding" />
          <div className="grid gap-4 content-start">
            <StatusCard title="Required profile fields">
              3-9 photos, 80 character description, ZIP code, age decade, sex,
              email, username, and display name.
            </StatusCard>
            <StatusCard title="Persistence status">
              This form is wired to Prisma/Postgres. If Postgres is not running,
              the form will show a database availability message instead of
              crashing.
            </StatusCard>
          </div>
        </div>
      ) : (
        <StatusCard title="Sign in required">
          Create an account or sign in before creating your profile.{" "}
          <Link className="font-bold text-teal-700" href="/sign-up">
            Start with email sign-up.
          </Link>
        </StatusCard>
      )}
    </PageShell>
  );
}
