import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";
import { demoRecords } from "@/lib/demo";
export const metadata: Metadata = { title: "Visão geral" };
export default function DashboardPage() {
  return <DashboardClient records={demoRecords} />;
}
