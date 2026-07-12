import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

type CrushConnectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CrushConnectPage({ params }: CrushConnectPageProps) {
  const { id } = await params;

  return (
    <PageShell
      title="Crush connect"
      description="A paid/eligible crusher can send a connect message after the crushee accepts."
    >
      <StatusCard title="Accepted crush context required">
        Connect access for crush {id} requires an accepted match context,
        entitlement checks, and block checks.
      </StatusCard>
    </PageShell>
  );
}
