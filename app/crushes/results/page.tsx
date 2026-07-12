import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function CrushResultsPage() {
  return (
    <PageShell
      title="Crush results"
      description="Eligible users see matching crush result links and can inspect the crusher profile."
    >
      <StatusCard title="All-or-nothing access">
        For MVP, paid/eligible users can see matching crush details without
        per-result metering.
      </StatusCard>
    </PageShell>
  );
}
