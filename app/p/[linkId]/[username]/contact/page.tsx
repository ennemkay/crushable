import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

type PublicProfileContactPageProps = {
  params: Promise<{
    linkId: string;
    username: string;
  }>;
};

export default async function PublicProfileContactPage({
  params,
}: PublicProfileContactPageProps) {
  const { username } = await params;

  return (
    <PageShell
      title={`Contact ${username}`}
      description="Send a short contact message through the public profile link."
    >
      <StatusCard title="Access checks">
        This route will require sign-in, an active profile, plan/usage allowance,
        and block checks before sending through the email relay.
      </StatusCard>
    </PageShell>
  );
}
