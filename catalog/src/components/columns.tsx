"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { createArrayIncludesSomeFilter } from "@majapisoftwares/ui/patterns/data-table";
import { StatusBadge } from "@majapisoftwares/ui/patterns/status-badge";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import { messages, type Row } from "@/messages";

export function useColumns(): ColumnDef<Row, unknown>[] {
  const t = useMessages(messages);
  return [
    {
      accessorKey: "name",
      header: t.name,
      meta: { label: t.name, filter: { type: "text" } },
    },
    {
      accessorKey: "region",
      header: t.region,
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.region}</span>
      ),
      filterFn: createArrayIncludesSomeFilter<Row>(),
      meta: {
        label: t.region,
        filter: {
          type: "multi",
          options: [
            { label: "sa-east-1", value: "sa-east-1" },
            { label: "us-east-1", value: "us-east-1" },
          ],
        },
      },
    },
    {
      id: "status",
      accessorFn: (r) => (r.running ? "running" : "stopped"),
      header: t.status,
      cell: ({ row }) => (
        <StatusBadge tone={row.original.running ? "success" : "neutral"}>
          {row.original.running ? t.running : t.stopped}
        </StatusBadge>
      ),
      filterFn: createArrayIncludesSomeFilter<Row>(),
      meta: {
        label: t.status,
        filter: {
          type: "multi",
          options: [
            { label: t.running, value: "running" },
            { label: t.stopped, value: "stopped" },
          ],
        },
      },
    },
  ];
}
