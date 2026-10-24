import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "../src/patterns/app-shell";
import { PageHeader, MetricStrip } from "../src/patterns/page-header";
import { StatusBadge } from "../src/patterns/status-badge";
import { DataTable, type DataColumn } from "../src/patterns/data-table";
import { DetailsSheet, DetailList } from "../src/patterns/details-sheet";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Input } from "../src/components/ui/input";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../src/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "../src/components/ui/empty";
import {
  NativeSelect,
  NativeSelectOption,
} from "../src/components/ui/native-select";
import { Separator } from "../src/components/ui/separator";
import { Skeleton } from "../src/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../src/components/ui/tabs";
import "../src/styles.css";
import { AuthLayout } from "../src/templates/auth-layout";
import { LoginForm } from "../src/templates/login-form";
import { SignupForm } from "../src/templates/signup-form";
import { AdminDashboard } from "../src/templates/admin-dashboard";

type Example = { id: string; name: string; region: string; state: string };
const sample: Example[] = [
  {
    id: "1",
    name: "Ambiente de desenvolvimento",
    region: "sa-east-1",
    state: "Em execução",
  },
  {
    id: "2",
    name: "Ambiente de revisão",
    region: "sa-east-1",
    state: "Parado",
  },
  {
    id: "3",
    name: "Worker de integração",
    region: "us-east-1",
    state: "Em execução",
  },
];
const columns: DataColumn<Example>[] = [
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
      <StatusBadge tone={row.state === "Em execução" ? "success" : "neutral"}>
        {row.state}
      </StatusBadge>
    ),
    sortValue: (row) => row.state,
  },
];

function Catalog() {
  const [view, setView] = useState("patterns"),
    [selected, setSelected] = useState<Example | null>(null),
    [region, setRegion] = useState("all"),
    [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigation = [
    { id: "patterns", label: "Padrões de UX" },
    { id: "components", label: "Componentes" },
    { id: "dashboard", label: "Administrativo" },
    { id: "login", label: "Login" },
    { id: "signup", label: "Cadastro" },
    { id: "guidelines", label: "Contribuição" },
  ];
  if (view === "login" || view === "signup")
    return (
      <AuthLayout
        title="Seu próximo produto começa aqui."
        description="A base compartilhada para uma experiência consistente em todos os apps."
        footer="Template demonstrativo · Nenhuma conta é criada"
      >
        <div className="flex w-full flex-col items-center gap-5">
          {view === "login" ? (
            <LoginForm
              onSubmit={() => setSubmitted(true)}
              footer={
                <Button
                  variant="link"
                  onClick={() => {
                    setView("signup");
                    setSubmitted(false);
                  }}
                >
                  Criar conta
                </Button>
              }
            />
          ) : (
            <SignupForm
              onSubmit={() => setSubmitted(true)}
              footer={
                <Button
                  variant="link"
                  onClick={() => {
                    setView("login");
                    setSubmitted(false);
                  }}
                >
                  Já tenho uma conta
                </Button>
              }
            />
          )}
          {submitted ? (
            <Alert>
              <AlertTitle>Demonstração de formulário</AlertTitle>
              <AlertDescription>
                Nenhum dado foi enviado. O app consumidor conecta a
                autenticação.
              </AlertDescription>
            </Alert>
          ) : null}
          <Button variant="outline" onClick={() => setView("patterns")}>
            Voltar ao catálogo
          </Button>
        </div>
      </AuthLayout>
    );
  if (view === "dashboard")
    return (
      <AdminDashboard
        title="Visão geral"
        description="Template administrativo composto com os mesmos padrões do produto."
        navigation={navigation}
        activeId={view}
        onNavigate={setView}
        context={<Badge variant="outline">Dados demonstrativos</Badge>}
        metrics={[
          { label: "Ambientes", value: 3 },
          { label: "Ativos", value: 2 },
          { label: "Regiões", value: 2 },
        ]}
        table={{
          rows: sample,
          columns,
          getRowId: (row) => row.id,
          searchValue: (row) => row.name,
        }}
        beforeTable={
          <Alert>
            <AlertTitle>Template reutilizável</AlertTitle>
            <AlertDescription>
              Configure marca, navegação, métricas, colunas, ações e conteúdo
              por props e composição React.
            </AlertDescription>
          </Alert>
        }
      />
    );
  return (
    <div className={dark ? "dark" : ""}>
      <AppShell
        title="Padrões de produto"
        context={
          <Button variant="outline" onClick={() => setDark(!dark)}>
            {dark ? "Tema claro" : "Tema escuro"}
          </Button>
        }
        navigation={navigation}
        activeId={view}
        onNavigate={setView}
        footer={
          <>
            @workbench/ui · v0.1.0
            <br />
            Catálogo com dados demonstrativos
          </>
        }
      >
        <PageHeader
          eyebrow="Design system / biblioteca compartilhada"
          title="Um padrão. Todo o Workbench."
          description="Componentes e comportamentos que evoluem juntos, em todos os produtos."
          actions={<StatusBadge tone="success">shadcn · Radix</StatusBadge>}
        />
        {view === "patterns" ? (
          <>
            <MetricStrip
              items={[
                { label: "Primitivos shadcn", value: 13 },
                { label: "Padrões compostos", value: 7 },
                {
                  label: "Regra central",
                  value: "Contribuir primeiro",
                  note: "A evolução começa na biblioteca",
                },
              ]}
            />
            <Alert>
              <AlertTitle>Exemplo de inventário</AlertTitle>
              <AlertDescription>
                Os registros abaixo são demonstrativos. A mesma tabela é usada
                pelo Cloud Manager com dados reais.
              </AlertDescription>
            </Alert>
            <DataTable
              rows={sample.filter(
                (row) => region === "all" || row.region === region,
              )}
              columns={columns}
              getRowId={(row) => row.id}
              searchValue={(row) => `${row.name} ${row.region}`}
              rowLabel={(row) => row.name}
              onOpen={setSelected}
              pageSize={2}
              filters={
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
              }
            />
          </>
        ) : null}
        {view === "components" ? (
          <>
            <section className="wb-catalog-section">
              <h2>Ações e hierarquia</h2>
              <div className="flex flex-wrap gap-3">
                <Button>Salvar alteração</Button>
                <Button variant="secondary">Ação secundária</Button>
                <Button variant="outline">Cancelar</Button>
                <Button variant="destructive">Excluir recurso</Button>
                <Button disabled>Indisponível</Button>
              </div>
            </section>
            <Separator />
            <section className="wb-catalog-section">
              <h2>Entrada e validação</h2>
              <Input
                aria-label="Nome de exemplo"
                placeholder="Nome do recurso"
              />
              <Input
                aria-label="Campo inválido"
                aria-invalid
                placeholder="Campo com erro de validação"
              />
              <Input
                aria-label="Campo indisponível"
                disabled
                placeholder="Campo indisponível"
              />
            </section>
            <section className="wb-catalog-section">
              <h2>Estados sem depender apenas da cor</h2>
              <div className="flex flex-wrap gap-3">
                <StatusBadge tone="success">Concluído</StatusBadge>
                <StatusBadge tone="warning">Cobertura parcial</StatusBadge>
                <StatusBadge tone="danger">Falha</StatusBadge>
                <StatusBadge>Desconhecido</StatusBadge>
                <Badge variant="outline">Somente leitura</Badge>
              </div>
            </section>
            <Tabs defaultValue="empty">
              <TabsList>
                <TabsTrigger value="empty">Vazio</TabsTrigger>
                <TabsTrigger value="error">Erro</TabsTrigger>
                <TabsTrigger value="loading">Carregamento</TabsTrigger>
              </TabsList>
              <TabsContent value="empty">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Nenhum recurso encontrado</EmptyTitle>
                    <EmptyDescription>
                      Altere os filtros ou consulte outra região.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TabsContent>
              <TabsContent value="error">
                <Alert variant="destructive">
                  <AlertTitle>Não foi possível atualizar</AlertTitle>
                  <AlertDescription>
                    Os dados anteriores podem estar desatualizados. Tente
                    novamente.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="loading">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </TabsContent>
            </Tabs>
            <Button variant="outline" onClick={() => setLoading(!loading)}>
              Alternar tabela carregando
            </Button>
            <DataTable
              rows={sample}
              columns={columns}
              getRowId={(row) => row.id}
              searchValue={(row) => row.name}
              loading={loading}
            />
          </>
        ) : null}
        {view === "guidelines" ? (
          <>
            <Alert>
              <AlertTitle>
                Contribuir para a biblioteca antes de customizar o app
              </AlertTitle>
              <AlertDescription>
                Procure o componente existente. Se faltar uma variante ou
                comportamento reutilizável, evolua aqui com documentação e
                exemplo; depois atualize o consumidor.
              </AlertDescription>
            </Alert>
            <DetailList
              items={[
                {
                  label: "Código",
                  value:
                    "TypeScript estrito, React, composição e interfaces tipadas. Domínio e credenciais ficam nos apps.",
                },
                {
                  label: "Visual",
                  value:
                    "Tokens semânticos, hierarquia de ações, tipografia e espaçamento compartilhados.",
                },
                {
                  label: "UX",
                  value:
                    "Busca, ordenação, paginação, estados de vazio/erro/carregamento e detalhes com foco acessível.",
                },
                {
                  label: "Validação",
                  value:
                    "Typecheck, lint, verificação de padrões, build e revisão visual desktop/mobile.",
                },
                {
                  label: "Entrega",
                  value:
                    "Publicar a biblioteca, fixar o commit no consumidor e atualizar o plano.",
                },
              ]}
            />
          </>
        ) : null}
        <DetailsSheet
          open={selected !== null}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          title={selected?.name ?? "Detalhes"}
          description="Exemplo do painel de detalhes compartilhado."
        >
          <DetailList
            items={[
              { label: "Região", value: selected?.region },
              { label: "Estado", value: selected?.state },
              {
                label: "Dados",
                value: "Exemplo demonstrativo, sem conexão AWS.",
              },
            ]}
          />
        </DetailsSheet>
      </AppShell>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Catalog />
  </StrictMode>,
);
