import { DashboardView } from "@/components/dashboard-view";
import { demoRecords } from "@/lib/demo";

export default function DashboardPage() {
  return <DashboardView records={demoRecords} />;
}
