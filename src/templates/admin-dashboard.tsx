"use client";

import type { ReactNode } from "react";
import { AppShell, type AppShellProps } from "../patterns/app-shell";
import { PageHeader, MetricStrip, type Metric } from "../patterns/page-header";
import { DataTable, type DataTableProps } from "../patterns/data-table";

export interface AdminDashboardProps<T> extends Omit<
  AppShellProps,
  "children"
> {
  title: string;
  description?: string;
  metrics: Metric[];
  table: DataTableProps<T>;
  /** Page-level actions next to the title. */
  pageActions?: ReactNode;
  beforeTable?: ReactNode;
  afterTable?: ReactNode;
}
export function AdminDashboard<T>({
  title,
  description,
  metrics,
  table,
  pageActions,
  beforeTable,
  afterTable,
  ...shell
}: AdminDashboardProps<T>) {
  return (
    <AppShell {...shell}>
      <PageHeader
        title={title}
        description={description}
        actions={pageActions}
      />
      <MetricStrip items={metrics} />
      {beforeTable}
      <DataTable {...table} />
      {afterTable}
    </AppShell>
  );
}
