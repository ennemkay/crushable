import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function CrushSearchPage() {
  return (
    <PageShell
      title="Search crushes"
      description="Paid/payment-verified users can search for crush records scoped to their billing/search identity."
    >
      <StatusCard title="Privacy boundary">
        Free accounts cannot search crush records. Search identity uses
        lightweight billing information and entitlement checks.
      </StatusCard>
    </PageShell>
  );
}
