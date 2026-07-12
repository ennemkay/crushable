import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function ActivityPage() {
  return (
    <PageShell
      title="Activity"
      description="Profile activity and email relay status metadata."
    >
      <StatusCard title="No app inbox">
        MVP communication uses anonymized email relay. This page shows metadata,
        status, blocks, reports, and activity rather than a stored message inbox.
      </StatusCard>
    </PageShell>
  );
}
