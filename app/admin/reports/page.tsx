import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function AdminReportsPage() {
  return (
    <PageShell title="Reports" description="Admin report review queue.">
      <StatusCard title="MVP admin action">
        Admins can view profile reports and suspend accounts for a specified
        duration.
      </StatusCard>
    </PageShell>
  );
}
