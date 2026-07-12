import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

type AdminAccountPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminAccountPage({ params }: AdminAccountPageProps) {
  const { id } = await params;

  return (
    <PageShell title="Account detail" description="Admin account status, activity, and actions.">
      <StatusCard title="Account ID">{id}</StatusCard>
    </PageShell>
  );
}
