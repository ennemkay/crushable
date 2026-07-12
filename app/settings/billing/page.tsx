import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function BillingSettingsPage() {
  return (
    <PageShell
      title="Billing"
      description="Plan state, lightweight billing identity, and provider checkout will live here."
    >
      <StatusCard title="Provider boundary">
        Stripe is provisional. UI should call billing services, not Stripe
        directly.
      </StatusCard>
    </PageShell>
  );
}
