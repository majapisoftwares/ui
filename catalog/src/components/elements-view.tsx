"use client";

import { useState, type ReactNode } from "react";
import { FileTextIcon, SearchIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@majapisoftwares/ui/components/card";
import { defineMessages, useMessages } from "@majapisoftwares/ui/lib/i18n";
import { Checkpoint } from "@majapisoftwares/ui/patterns/chat-checkpoint";
import { InlineCitation } from "@majapisoftwares/ui/patterns/chat-citation";
import { ContextUsage } from "@majapisoftwares/ui/patterns/chat-context";
import {
  ChainOfThought,
  ChatTrace,
  Confirmation,
  Plan,
  Queue,
  Reasoning,
  Sources,
  StackTrace,
  Step,
  Subagent,
  Task,
  Terminal,
  TestResults,
  Tool,
} from "@majapisoftwares/ui/patterns/chat-trace";
import { FileTree, fileTree } from "@majapisoftwares/ui/patterns/file-tree";
import {
  EffortSelector,
  ModelSelector,
} from "@majapisoftwares/ui/patterns/model-selector";
import { PromptInput } from "@majapisoftwares/ui/patterns/prompt-input";
import { Suggestions } from "@majapisoftwares/ui/patterns/chat";

const messages = defineMessages({
  en: {
    reasoning: "Reasoning",
    reasoningText:
      "The log ends during the build step, so I should read the build output first.",
    chainOfThought: "Chain of Thought",
    readLog: "Read the build log",
    searchedWeb: "Searched the web for next.js image cache key",
    searchedCode: "Searched the code for cacheKey",
    plan: "Plan",
    planTitle: "Plan: add dark mode",
    planDescription:
      "Store the theme in a cookie so the page doesn't flash on load.",
    planSteps: [
      "Add a dark variant to the theme tokens",
      "Read the theme from a cookie on the server",
      "Add a toggle to the settings page",
    ],
    queue: "Queue",
    todos: [
      "Write the migration guide",
      "Fix the focus ring on the select trigger",
      "Update the registry snapshots",
    ],
    todoDescription: "It is clipped by overflow-hidden on the field.",
    task: "Task",
    taskRunning: "Updating the page metadata",
    taskDone: "Found the project files",
    sources: "Sources & inline citation",
    citationText:
      "Next.js streams a route in chunks, so the page shows up early.",
    tools: "Tool, Terminal, Test Results & Stack Trace",
    toolTitle: "Ran git status --short",
    subagent: "Subagent",
    subagentTitle: "Ran the research agent",
    subagentTask: "Find out why image optimization reruns on every deploy.",
    subagentResult: "The cache is keyed on the commit SHA.",
    confirmation: "Confirmation",
    confirmQuestion: "Run rm -rf dist?",
    checkpoint: "Checkpoint",
    checkpointLabel: "Button renamed",
    composer: "Context, Model Selector & Suggestions",
    placeholder: "Ask the agent",
    suggestions: ["Summarize today's errors", "Draft the release notes"],
    fileTree: "File Tree",
    low: "Low",
    medium: "Medium",
    high: "High",
  },
  "pt-BR": {
    reasoning: "Raciocínio",
    reasoningText:
      "O log termina durante o build, então devo ler a saída do build primeiro.",
    chainOfThought: "Cadeia de pensamento",
    readLog: "Leu o log do build",
    searchedWeb: "Pesquisou na web next.js image cache key",
    searchedCode: "Buscou cacheKey no código",
    plan: "Plano",
    planTitle: "Plano: modo escuro",
    planDescription:
      "Guardar o tema num cookie para a página não piscar ao abrir.",
    planSteps: [
      "Adicionar a variante escura aos tokens do tema",
      "Ler o tema de um cookie no servidor",
      "Adicionar a opção na página de configurações",
    ],
    queue: "Fila",
    todos: [
      "Escrever o guia de migração",
      "Corrigir o anel de foco do select",
      "Atualizar os snapshots do registry",
    ],
    todoDescription: "Ele é cortado pelo overflow-hidden do campo.",
    task: "Tarefa",
    taskRunning: "Atualizando os metadados da página",
    taskDone: "Encontrou os arquivos do projeto",
    sources: "Fontes e citação",
    citationText:
      "O Next.js transmite uma rota em partes, então a página aparece cedo.",
    tools: "Ferramenta, terminal, testes e stack trace",
    toolTitle: "Rodou git status --short",
    subagent: "Subagente",
    subagentTitle: "Rodou o agente de pesquisa",
    subagentTask:
      "Descobrir por que a otimização de imagens roda de novo a cada deploy.",
    subagentResult: "O cache usa o SHA do commit como chave.",
    confirmation: "Confirmação",
    confirmQuestion: "Rodar rm -rf dist?",
    checkpoint: "Checkpoint",
    checkpointLabel: "Botão renomeado",
    composer: "Contexto, modelo e sugestões",
    placeholder: "Pergunte ao agente",
    suggestions: ["Resuma os erros de hoje", "Escreva as notas da versão"],
    fileTree: "Árvore de arquivos",
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
  },
});

const STACK = `TypeError: Cannot read properties of undefined (reading 'total')
    at formatInvoice (app/lib/billing.ts:42:31)
    at InvoiceRow (app/components/invoice-row.tsx:18:12)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)`;

const LINT = `app/api/chat/route.ts
  14:7  error  'model' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)`;

const providers = [
  {
    name: "Anthropic",
    models: [
      { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5" },
      { id: "claude-haiku-5-5", name: "Claude Haiku 5.5" },
    ],
  },
  {
    name: "OpenAI",
    models: [{ id: "gpt-5.4", name: "GPT-5.4" }],
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}

/** Every shadcn AI Elements recipe as the library ships it. */
export function ElementsView() {
  const t = useMessages(messages);
  const [model, setModel] = useState(providers[0].models[0].id);
  const [effort, setEffort] = useState("medium");
  const [file, setFile] = useState("app/page.tsx");
  const [answered, setAnswered] = useState<boolean>();
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Section title={t.reasoning}>
        <ChatTrace>
          <Reasoning duration={4}>{t.reasoningText}</Reasoning>
        </ChatTrace>
      </Section>
      <Section title={t.chainOfThought}>
        <ChatTrace>
          <ChainOfThought steps={3}>
            <Step title={t.readLog} icon={<FileTextIcon />} />
            <Step
              title={t.searchedWeb}
              icon={<SearchIcon />}
              badges={["nextjs.org", "github.com"]}
            />
            <Step title={t.searchedCode} icon={<SearchIcon />} />
          </ChainOfThought>
        </ChatTrace>
      </Section>
      <Section title={t.plan}>
        <ChatTrace>
          <Plan
            title={t.planTitle}
            description={t.planDescription}
            steps={t.planSteps.map((title, index) => ({
              title,
              status:
                index === 0 ? "done" : index === 1 ? "running" : "pending",
            }))}
          />
        </ChatTrace>
      </Section>
      <Section title={t.queue}>
        <ChatTrace>
          <Queue
            running
            todos={t.todos.map((title, index) => ({
              title,
              description: index === 1 ? t.todoDescription : undefined,
              status:
                index === 0
                  ? "completed"
                  : index === 1
                    ? "in_progress"
                    : "pending",
            }))}
          />
        </ChatTrace>
      </Section>
      <Section title={t.task}>
        <ChatTrace>
          <Task title={t.taskDone}>
            <Step title="app/page.tsx" icon={<SearchIcon />} />
            <Step
              title="app/layout.tsx"
              icon={<FileTextIcon />}
              render={<a href="#app/layout.tsx" />}
            />
          </Task>
          <Task title={t.taskRunning} status="running">
            <Step title="app/page.tsx" status="running" />
          </Task>
        </ChatTrace>
      </Section>
      <Section title={t.sources}>
        <p className="text-sm leading-relaxed">
          {t.citationText}{" "}
          <InlineCitation
            url="https://nextjs.org/docs/app/getting-started/linking-and-navigating#streaming"
            title="Linking and Navigating"
          />
        </p>
        <ChatTrace>
          <Sources
            sources={[
              {
                url: "https://docs.astro.build/en/install-and-setup/",
                title: "Install Astro",
              },
              { url: "https://www.npmjs.com/package/create-astro" },
            ]}
          />
        </ChatTrace>
      </Section>
      <Section title={t.tools}>
        <ChatTrace>
          <Tool
            title={t.toolTitle}
          >{` M app/api/chat/route.ts\n M components/chat.tsx`}</Tool>
          <Terminal command="pnpm lint" exitCode={1} output={LINT} />
          <Terminal command="pnpm build" status="running" />
          <TestResults
            suites={[
              {
                name: "user-api.test.ts",
                tests: [
                  { name: "creates a user", status: "passed" },
                  {
                    name: "updates a user profile",
                    status: "failed",
                    error:
                      "Expected status 200, received 500\n  at src/user-api.test.ts:45:12",
                  },
                  { name: "deletes a user", status: "skipped" },
                ],
              },
            ]}
          />
          <StackTrace
            stack={STACK}
            frameHref={(frame) => `#${frame.file}:${frame.lineNumber}`}
          />
        </ChatTrace>
      </Section>
      <Section title={t.subagent}>
        <ChatTrace>
          <Subagent
            title={t.subagentTitle}
            duration="48s"
            model="anthropic/claude-sonnet-5-5"
            tools={["runCommand"]}
            task={t.subagentTask}
            result={t.subagentResult}
          >
            <Step title="grep -rn cacheKey scripts" />
            <Step title="sed -n 13,15p scripts/optimize-images.ts" />
          </Subagent>
        </ChatTrace>
      </Section>
      <Section title={t.confirmation}>
        {answered === undefined ? (
          <Confirmation
            title={t.confirmQuestion}
            onApprove={() => setAnswered(true)}
            onDeny={() => setAnswered(false)}
          />
        ) : (
          <ChatTrace>
            <Tool
              title={t.confirmQuestion}
              status={answered ? "done" : "denied"}
            />
          </ChatTrace>
        )}
      </Section>
      <Section title={t.checkpoint}>
        <Checkpoint
          label={t.checkpointLabel}
          onRestore={() => setAnswered(undefined)}
        />
      </Section>
      <Section title={t.composer}>
        <Suggestions suggestions={t.suggestions} onSelect={() => undefined} />
        <PromptInput
          placeholder={t.placeholder}
          onSubmit={() => undefined}
          actions={
            <>
              <ContextUsage
                limit={200_000}
                input={8420}
                output={1260}
                reasoning={980}
              />
              <ModelSelector
                providers={providers}
                value={model}
                onValueChange={setModel}
              />
              <EffortSelector
                efforts={[
                  { id: "low", name: t.low },
                  { id: "medium", name: t.medium },
                  { id: "high", name: t.high },
                ]}
                value={effort}
                onValueChange={setEffort}
              />
            </>
          }
        />
      </Section>
      <Section title={t.fileTree}>
        <FileTree
          files={fileTree([
            "app/layout.tsx",
            "app/page.tsx",
            "components/ui/button.tsx",
            "components/login-form.tsx",
          ])}
          selected={file}
          onSelect={setFile}
        />
      </Section>
    </div>
  );
}
