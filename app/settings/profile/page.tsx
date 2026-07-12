import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatusCard } from "@/components/ui/status-card";
import { getCurrentProfile } from "@/lib/profiles/current-profile";

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, profileResult] = await Promise.all([searchParams, getCurrentProfile()]);

  return (
    <PageShell
      title="Profile settings"
      description="Edit profile fields, photos, visibility, and public field settings."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {saved ? (
          <StatusCard title="Profile saved">
            Your profile form submitted successfully and redirected here.
          </StatusCard>
        ) : null}

        {profileResult.status === "signed-out" ? (
          <StatusCard title="Sign in required">
            Sign in before editing profile settings.{" "}
            <Link className="font-bold text-teal-700" href="/sign-in">
              Go to sign in.
            </Link>
          </StatusCard>
        ) : null}

        {profileResult.status === "db-unavailable" ? (
          <StatusCard title="Database unavailable">
            Signed in as {profileResult.email}, but Postgres is not reachable
            from this environment yet.
          </StatusCard>
        ) : null}

        {profileResult.status === "loaded" ? (
          profileResult.profile ? (
            <>
              <StatusCard title="Current profile">
                <dl className="grid gap-2">
                  <div>
                    <dt className="font-bold text-ink">Display name</dt>
                    <dd>{profileResult.profile.displayName}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">Username</dt>
                    <dd>{profileResult.profile.username}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">Completion</dt>
                    <dd>{profileResult.profile.completionStatus}</dd>
                  </div>
                </dl>
              </StatusCard>
              <StatusCard title="Visibility">
                {profileResult.profile.visibilityStatus}
              </StatusCard>
              <div className="md:col-span-2">
                <ProfileForm
                  mode="settings"
                  defaultEmail={profileResult.email}
                  defaults={{
                    emailAddress: profileResult.profile.emailAddress,
                    username: profileResult.profile.username,
                    displayName: profileResult.profile.displayName,
                    description: profileResult.profile.description,
                    zipCode: profileResult.profile.zipCode,
                    ageDecade: profileResult.profile.ageDecade,
                    sex: profileResult.profile.sex,
                    photoCount: String(profileResult.profile.photos.length),
                  }}
                />
              </div>
            </>
          ) : (
            <StatusCard title="No profile yet">
              Continue to onboarding to create your required profile.{" "}
              <Link className="font-bold text-teal-700" href="/onboarding">
                Create profile.
              </Link>
            </StatusCard>
          )
        ) : null}
      </div>
    </PageShell>
  );
}
