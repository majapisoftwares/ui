"use client";

import { useState } from "react";
import { MetricStrip } from "@majapisoftwares/ui/patterns/page-header";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@majapisoftwares/ui/patterns/data-table";
import {
  DetailList,
  DetailsSheet,
} from "@majapisoftwares/ui/patterns/details-sheet";
import { StatusBadge } from "@majapisoftwares/ui/patterns/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@majapisoftwares/ui/components/select";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import type { DemoRecord } from "@/lib/demo";
import { messages } from "@/messages";

export function DashboardView({ records }: { records: DemoRecord[] }) {
  const t = useMessages(messages);
  const [region, setRegion] = useState("all");
  const regions = [
    { value: "all", label: t.allRegions },
    { value: "sa-east-1", label: "sa-east-1" },
    { value: "us-east-1", label: "us-east-1" },
  ];
  const [selected, setSelected] = useState<DemoRecord | null>(null);
  const status = (row: DemoRecord) =>
    row.state === "running" ? t.running : t.stopped;
  const columns: ColumnDef<DemoRecord, unknown>[] = [
    { accessorKey: "name", header: t.name, meta: { label: t.name } },
    {
      accessorKey: "region",
      header: t.region,
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.region}</span>
      ),
      meta: { label: t.region },
    },
    {
      accessorKey: "state",
      header: t.status,
      cell: ({ row }) => (
        <StatusBadge
          tone={row.original.state === "running" ? "success" : "neutral"}
        >
          {status(row.original)}
        </StatusBadge>
      ),
      meta: { label: t.status },
    },
  ];
  return (
    <>
      <MetricStrip
        items={[
          { label: t.environments, value: records.length },
          {
            label: t.running,
            value: records.filter((row) => row.state === "running").length,
          },
          {
            label: t.regions,
            value: new Set(records.map((row) => row.region)).size,
          },
        ]}
      />
      <DataTable
        data={records.filter(
          (row) => region === "all" || row.region === region,
        )}
        columns={columns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        onRowClick={setSelected}
        storageKey="dashboard"
        toolbarEnd={() => (
          <Select
            items={regions}
            value={region}
            onValueChange={(value) => setRegion(value as string)}
          >
            <SelectTrigger aria-label={t.region} className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <DetailsSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.name ?? ""}
      >
        <DetailList
          items={[
            { label: t.region, value: selected?.region },
            { label: t.status, value: selected ? status(selected) : null },
          ]}
        />
      </DetailsSheet>
    </>
  );
}
