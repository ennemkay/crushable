import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function AdminAccountsPage() {
  return (
    <PageShell title="Accounts" description="Search profiles and accounts for support and moderation.">
      <StatusCard title="Admin controls">
        Admins can search accounts, suspend any account, soft-delete accounts,
        and undo reversible actions through audit history.
      </StatusCard>
    </PageShell>
  );
}
