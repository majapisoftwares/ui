"use client";

import { useState } from "react";
import { MetricStrip } from "@majapisoftwares/ui/patterns/page-header";
import { DataTable } from "@majapisoftwares/ui/patterns/data-table";
import {
  DetailList,
  DetailsSheet,
} from "@majapisoftwares/ui/patterns/details-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@majapisoftwares/ui/components/select";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import { messages, type Row } from "@/messages";
import { useColumns } from "@/components/columns";

export function DashboardView() {
  const t = useMessages(messages);
  const columns = useColumns();
  const [region, setRegion] = useState("all");
  const regions = [
    { value: "all", label: t.allRegions },
    { value: "sa-east-1", label: "sa-east-1" },
    { value: "us-east-1", label: "us-east-1" },
  ];
  const [selected, setSelected] = useState<Row | null>(null);
  // Extra demo rows so the full-height table has something to scroll.
  const rows: Row[] = [
    ...t.rows,
    ...Array.from({ length: 45 }, (_, i) => ({
      id: `worker-${i + 1}`,
      name: `worker-${String(i + 1).padStart(2, "0")}`,
      region: i % 3 ? "sa-east-1" : "us-east-1",
      running: i % 4 !== 0,
    })),
  ];
  return (
    <>
      <MetricStrip
        items={[
          { label: t.environments, value: rows.length },
          { label: t.running, value: rows.filter((r) => r.running).length },
          { label: t.stopped, value: rows.filter((r) => !r.running).length },
          {
            label: t.regions,
            value: new Set(rows.map((r) => r.region)).size,
          },
        ]}
      />
      <DataTable
        data={rows.filter((r) => region === "all" || r.region === region)}
        fillHeight
        initialPageSize={50}
        columns={columns}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        onRowClick={setSelected}
        storageKey="catalog:dashboard-v2"
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
            {
              label: t.status,
              value: selected?.running ? t.running : t.stopped,
            },
          ]}
        />
      </DetailsSheet>
    </>
  );
}
