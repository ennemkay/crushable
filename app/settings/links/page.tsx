import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function ProfileLinksPage() {
  return (
    <PageShell
      title="Profile links"
      description="Create, label, and revoke disposable public profile links."
    >
      <StatusCard title="Link rules">
        Profiles can have multiple active links. Each link has a label, an
        independent revoke action, and a system-configured active-link limit.
      </StatusCard>
    </PageShell>
  );
}
