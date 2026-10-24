"use client";

import { useState } from "react";
import { DataTable } from "@majapisoftwares/ui/patterns/data-table";
import { MetricStrip } from "@majapisoftwares/ui/patterns/page-header";
import { Button } from "@majapisoftwares/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@majapisoftwares/ui/components/empty";
import { Skeleton } from "@majapisoftwares/ui/components/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@majapisoftwares/ui/components/toggle-group";
import { defineMessages, useMessages } from "@majapisoftwares/ui/lib/i18n";
import { PlusIcon, ServerIcon } from "lucide-react";
import { messages as shared } from "@/messages";
import { useColumns } from "@/components/columns";

const states = [
  "ready",
  "loading",
  "empty",
  "noResults",
  "error",
  "stale",
  "partial",
  "unavailable",
] as const;
type State = (typeof states)[number];

const messages = defineMessages({
  en: {
    state: "State",
    ready: "Ready",
    loading: "Loading",
    empty: "Empty",
    noResults: "No results",
    error: "Error",
    stale: "Stale",
    partial: "Partial",
    unavailable: "No access",
    errorBody: "The server didn't respond in time.",
    partialBody: "us-east-1 is unreachable; showing other regions.",
    unavailableBody: "You don't have access to these environments",
    firstEnv: "No environments yet",
    create: "Create environment",
  },
  "pt-BR": {
    state: "Estado",
    ready: "Pronto",
    loading: "Carregando",
    empty: "Vazio",
    noResults: "Sem resultados",
    error: "Erro",
    stale: "Desatualizado",
    partial: "Parcial",
    unavailable: "Sem acesso",
    errorBody: "O servidor não respondeu a tempo.",
    partialBody: "us-east-1 está inacessível; exibindo as outras regiões.",
    unavailableBody: "Você não tem acesso a estes ambientes",
    firstEnv: "Nenhum ambiente ainda",
    create: "Criar ambiente",
  },
});

export function PatternsView() {
  const t = useMessages(messages);
  const s = useMessages(shared);
  const columns = useColumns();
  const [state, setState] = useState<State>("ready");
  const rows =
    state === "empty" || state === "error"
      ? []
      : state === "partial"
        ? s.rows.filter((r) => r.region !== "us-east-1")
        : s.rows;
  return (
    <div className="flex flex-col gap-6">
      <ToggleGroup
        aria-label={t.state}
        value={[state]}
        onValueChange={(value) => value[0] && setState(value[0] as State)}
        variant="outline"
        className="flex-wrap"
      >
        {states.map((value) => (
          <ToggleGroupItem key={value} value={value}>
            {t[value]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {state === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-4xl" />
          ))}
        </div>
      ) : state !== "unavailable" ? (
        <MetricStrip
          items={[
            {
              label: s.environments,
              value: state === "error" ? "—" : rows.length,
            },
            {
              label: s.running,
              value:
                state === "error" ? "—" : rows.filter((r) => r.running).length,
            },
          ]}
        />
      ) : null}
      <DataTable
        // Remount so the default search applies when switching states.
        key={state}
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        loading={state === "loading"}
        initialGlobalFilter={state === "noResults" ? "zzz" : ""}
        error={state === "error" || state === "stale" ? t.errorBody : undefined}
        onRetry={() => setState("ready")}
        warning={state === "partial" ? t.partialBody : undefined}
        unavailable={state === "unavailable" ? t.unavailableBody : undefined}
        emptyState={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ServerIcon />
              </EmptyMedia>
              <EmptyTitle>{t.firstEnv}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm">
                <PlusIcon data-icon="inline-start" />
                {t.create}
              </Button>
            </EmptyContent>
          </Empty>
        }
      />
    </div>
  );
}
