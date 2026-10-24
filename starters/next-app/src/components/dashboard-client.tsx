"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@majapisoftwares/ui/templates/admin-dashboard";
import { DetailsSheet, DetailList } from "@majapisoftwares/ui/patterns/details-sheet";
import { StatusBadge } from "@majapisoftwares/ui/patterns/status-badge";
import { type DataColumn } from "@majapisoftwares/ui/patterns/data-table";
import {
  NativeSelect,
  NativeSelectOption,
} from "@majapisoftwares/ui/components/native-select";
import { Button } from "@majapisoftwares/ui/components/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@majapisoftwares/ui/components/alert";
import { type DemoRecord } from "@/lib/demo";
const columns: DataColumn<DemoRecord>[] = [
  {
    id: "name",
    header: "Nome",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
  },
  {
    id: "region",
    header: "Região",
    cell: (row) => row.region,
    sortValue: (row) => row.region,
  },
  {
    id: "state",
    header: "Estado",
    cell: (row) => (
      <StatusBadge tone={row.state === "running" ? "success" : "neutral"}>
        {row.state === "running" ? "Em execução" : "Parado"}
      </StatusBadge>
    ),
    sortValue: (row) => row.state,
  },
];
export function DashboardClient({ records }: { records: DemoRecord[] }) {
  const router = useRouter(),
    [region, setRegion] = useState("all"),
    [selected, setSelected] = useState<DemoRecord | null>(null);
  return (
    <>
      <AdminDashboard
        brand="workbench"
        title="Visão geral"
        description="Seu novo aplicativo começa com componentes e experiências compartilhados."
        navigation={[
          { id: "dashboard", label: "Visão geral" },
          { id: "login", label: "Login" },
          { id: "signup", label: "Cadastro" },
        ]}
        activeId="dashboard"
        onNavigate={(id) =>
          router.push(id === "dashboard" ? "/dashboard" : `/${id}`)
        }
        metrics={[
          { label: "Ambientes", value: records.length },
          {
            label: "Ativos",
            value: records.filter((row) => row.state === "running").length,
          },
          {
            label: "Regiões",
            value: new Set(records.map((row) => row.region)).size,
          },
        ]}
        context={<StatusBadge tone="warning">Demonstração</StatusBadge>}
        actions={
          <Button
            variant="outline"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Acessar conta
          </Button>
        }
        beforeTable={
          <Alert>
            <AlertTitle>Dados demonstrativos</AlertTitle>
            <AlertDescription>
              Esta área demonstra o template administrativo. Nenhum recurso real
              está conectado.
            </AlertDescription>
          </Alert>
        }
        table={{
          rows: records.filter(
            (row) => region === "all" || row.region === region,
          ),
          columns,
          getRowId: (row) => row.id,
          searchValue: (row) => `${row.name} ${row.region}`,
          rowLabel: (row) => row.name,
          onOpen: setSelected,
          pageSize: 2,
          filters: (
            <NativeSelect
              aria-label="Filtrar região"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <NativeSelectOption value="all">
                Todas as regiões
              </NativeSelectOption>
              <NativeSelectOption value="sa-east-1">
                São Paulo
              </NativeSelectOption>
              <NativeSelectOption value="us-east-1">
                Virginia
              </NativeSelectOption>
            </NativeSelect>
          ),
        }}
      />
      <DetailsSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.name ?? "Detalhes"}
        description="Registro demonstrativo da biblioteca compartilhada."
      >
        <DetailList
          items={[
            { label: "Região", value: selected?.region },
            {
              label: "Estado",
              value: selected?.state === "running" ? "Em execução" : "Parado",
            },
          ]}
        />
      </DetailsSheet>
    </>
  );
}
