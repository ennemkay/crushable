import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function AdminAuditPage() {
  return (
    <PageShell title="Audit" description="Admin action history and undo surface.">
      <StatusCard title="Undo where feasible">
        Reversible actions should expose undo from audit history, including
        lifting suspensions and restoring soft-deleted accounts.
      </StatusCard>
    </PageShell>
  );
}
