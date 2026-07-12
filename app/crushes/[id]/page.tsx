import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

type CrushDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CrushDetailPage({ params }: CrushDetailPageProps) {
  const { id } = await params;

  return (
    <PageShell
      title="Crush detail"
      description="Show the crusher profile and limited crush context to an eligible crushee."
    >
      <StatusCard title="Crush ID">{id}</StatusCard>
    </PageShell>
  );
}
