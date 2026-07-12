import { PageShell } from "@/components/layout/page-shell";
import { StatusCard } from "@/components/ui/status-card";

export default function NewCrushPage() {
  return (
    <PageShell
      title="Submit crush"
      description="Create a structured crush record about someone who may not have a Crushable profile."
    >
      <StatusCard title="MVP crush fields">
        First-name variants, full last name, city, age decade, and sex are
        required. Hair color, eye color, and controlled context are optional. No
        freeform note in MVP.
      </StatusCard>
    </PageShell>
  );
}
