"use client";

import type { ReactNode } from "react";
import { AppShell, type NavigationItem } from "../patterns/app-shell";
import { PageHeader, MetricStrip } from "../patterns/page-header";
import { DataTable, type DataTableProps } from "../patterns/data-table";

export interface AdminDashboardProps<T> {
  title: string;
  description: string;
  navigation: NavigationItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  metrics: Parameters<typeof MetricStrip>[0]["items"];
  table: DataTableProps<T>;
  brand?: string;
  brandMark?: ReactNode;
  context?: ReactNode;
  actions?: ReactNode;
  beforeTable?: ReactNode;
  afterTable?: ReactNode;
  footer?: ReactNode;
}
export function AdminDashboard<T>({
  title,
  description,
  navigation,
  activeId,
  onNavigate,
  metrics,
  table,
  brand,
  brandMark,
  context,
  actions,
  beforeTable,
  afterTable,
  footer,
}: AdminDashboardProps<T>) {
  return (
    <AppShell
      title={title}
      context={context}
      navigation={navigation}
      activeId={activeId}
      onNavigate={onNavigate}
      brand={brand}
      brandMark={brandMark}
      footer={footer}
    >
      <PageHeader
        eyebrow="Painel administrativo"
        title={title}
        description={description}
        actions={actions}
      />
      <MetricStrip items={metrics} />
      {beforeTable}
      <DataTable {...table} />
      {afterTable}
    </AppShell>
  );
}
