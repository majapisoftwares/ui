"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileIcon,
  FileTextIcon,
  RefreshCwIcon,
  RocketIcon,
  SearchIcon,
  TerminalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@majapisoftwares/ui/components/attachment";
import { Bubble, BubbleContent } from "@majapisoftwares/ui/components/bubble";
import { MessageScrollerItem } from "@majapisoftwares/ui/components/message-scroller";
import { useStreamedText } from "@majapisoftwares/ui/hooks/use-streamed-text";
import {
  defineMessages,
  useLocale,
  useMessages,
  useUiMessages,
} from "@majapisoftwares/ui/lib/i18n";
import {
  Chat,
  ChatComposer,
  ChatMessage,
  ChatMessages,
  CopyMessageAction,
  MessageAction,
  MessageActions,
  Suggestions,
  TypingIndicator,
} from "@majapisoftwares/ui/patterns/chat";
import { ChatMarkdown } from "@majapisoftwares/ui/patterns/chat-markdown";
import {
  ChatTrace,
  Confirmation,
  Reasoning,
  Tool,
  type ToolStatus,
} from "@majapisoftwares/ui/patterns/chat-trace";
import {
  PromptInput,
  type ChatStatus,
  type PromptInputMessage,
} from "@majapisoftwares/ui/patterns/prompt-input";

// Demo data: a scripted agent. A real app streams these parts from its backend
// (for example the AI SDK's useChat) and maps them to the same components.
const messages = defineMessages({
  en: {
    placeholder: "Ask the agent",
    failed: "Couldn't get a reply.",
    suggestions: [
      "Why did the last deploy fail?",
      "Summarize today's errors",
      "Draft the release notes",
    ],
    seed: {
      ask: "Why did last night's deploy fail?",
      reasoning:
        "The log ends during the build step, so I should read the build output before checking the infrastructure.",
      readLog: "Read deploy.log",
      ranBuild: "Failed to run npm run build",
      buildOutput:
        "Error: Image Optimization using the default loader is not compatible with `output: 'export'`.\n  at app/page.tsx:12",
      answer: `The build failed before anything was uploaded, so production still runs the previous release.

**Cause:** \`app/page.tsx\` uses \`next/image\` with the default loader, which a static export can't run.

**Fix:** turn off optimization for the export:

\`\`\`ts
// next.config.ts
export default {
  output: "export",
  images: { unoptimized: true },
};
\`\`\`

| Step | Status |
| --- | --- |
| Install | Passed |
| Build | Failed |
| Upload | Skipped |`,
      fix: "Fix it and deploy to production.",
      edited: "Edited next.config.ts",
      deployQuestion: "Deploy to production?",
      deployDescription: "Publishes the fixed build to ui.majapi.com.",
    },
    deploying: "Deploying to production",
    deployed: "Deployed to production",
    deployOutput: "Uploaded 214 files\nInvalidated CloudFront cache\nDone in 38s",
    deployDenied: "Deploy denied",
    deployedText:
      "Deployed. The site now serves the fixed build and the images load from the static files.",
    deniedText: "Okay, I didn't deploy. The fix stays in `next.config.ts`.",
    searching: "Searched the docs",
    searchingRunning: "Searching the docs",
    searchOutput: "nextjs.org/docs/app/guides/static-exports\nnextjs.org/docs/app/api-reference/components/image",
    replyReasoning: "I'll look this up in the docs before answering.",
    reply: `Here's what I found:

1. **Static exports** can't optimize images at request time.
2. Use \`images.unoptimized\` or a custom \`loader\`.
3. Everything else in the app stays the same.

Want me to open a pull request?`,
  },
  "pt-BR": {
    placeholder: "Pergunte ao agente",
    failed: "Não foi possível obter uma resposta.",
    suggestions: [
      "Por que o último deploy falhou?",
      "Resuma os erros de hoje",
      "Escreva as notas da versão",
    ],
    seed: {
      ask: "Por que o deploy de ontem à noite falhou?",
      reasoning:
        "O log termina durante o build, então devo ler a saída do build antes de olhar a infraestrutura.",
      readLog: "Leu deploy.log",
      ranBuild: "Falha ao executar npm run build",
      buildOutput:
        "Error: Image Optimization using the default loader is not compatible with `output: 'export'`.\n  at app/page.tsx:12",
      answer: `O build falhou antes de qualquer envio, então a produção continua na versão anterior.

**Causa:** \`app/page.tsx\` usa \`next/image\` com o loader padrão, que uma exportação estática não executa.

**Correção:** desative a otimização na exportação:

\`\`\`ts
// next.config.ts
export default {
  output: "export",
  images: { unoptimized: true },
};
\`\`\`

| Etapa | Status |
| --- | --- |
| Instalação | Passou |
| Build | Falhou |
| Envio | Ignorado |`,
      fix: "Corrija e faça o deploy em produção.",
      edited: "Editou next.config.ts",
      deployQuestion: "Fazer deploy em produção?",
      deployDescription: "Publica o build corrigido em ui.majapi.com.",
    },
    deploying: "Fazendo deploy em produção",
    deployed: "Deploy em produção concluído",
    deployOutput: "214 arquivos enviados\nCache do CloudFront invalidado\nConcluído em 38s",
    deployDenied: "Deploy negado",
    deployedText:
      "Deploy feito. O site já serve o build corrigido e as imagens carregam dos arquivos estáticos.",
    deniedText: "Certo, não fiz o deploy. A correção continua em `next.config.ts`.",
    searching: "Pesquisou na documentação",
    searchingRunning: "Pesquisando na documentação",
    searchOutput: "nextjs.org/docs/app/guides/static-exports\nnextjs.org/docs/app/api-reference/components/image",
    replyReasoning: "Vou consultar a documentação antes de responder.",
    reply: `Encontrei o seguinte:

1. **Exportações estáticas** não otimizam imagens no momento da requisição.
2. Use \`images.unoptimized\` ou um \`loader\` próprio.
3. O resto do app continua igual.

Quer que eu abra um pull request?`,
  },
});

type Copy = (typeof messages)["en"];

type Part =
  | { type: "reasoning"; text: string; running?: boolean; duration?: number }
  | {
      type: "tool";
      id: string;
      title: string;
      status: ToolStatus;
      icon?: "terminal" | "file" | "search" | "deploy";
      output?: string;
      description?: string;
    }
  | { type: "confirmation"; id: string }
  | { type: "text"; text: string; streaming?: boolean; reveal?: boolean }
  | { type: "error" };

interface DemoFile {
  name: string;
  size: number;
  url?: string;
}

interface DemoMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  files?: DemoFile[];
  parts?: Part[];
  time?: string;
}

const icons = {
  terminal: <TerminalIcon />,
  file: <FileTextIcon />,
  search: <SearchIcon />,
  deploy: <RocketIcon />,
};

// Keys only; the text comes from the active locale so switching language
// translates the seeded transcript too.
function seed(t: Copy): DemoMessage[] {
  return [
    {
      id: "u1",
      role: "user",
      text: t.seed.ask,
      files: [{ name: "deploy.log", size: 18_432 }],
      time: "21:04",
    },
    {
      id: "a1",
      role: "assistant",
      time: "21:04",
      parts: [
        { type: "reasoning", text: t.seed.reasoning, duration: 4 },
        { type: "tool", id: "t1", title: t.seed.readLog, status: "done", icon: "file", description: "0.2s" },
        {
          type: "tool",
          id: "t2",
          title: t.seed.ranBuild,
          status: "error",
          icon: "terminal",
          output: t.seed.buildOutput,
        },
        { type: "text", text: t.seed.answer },
      ],
    },
    { id: "u2", role: "user", text: t.seed.fix, time: "21:06" },
    {
      id: "a2",
      role: "assistant",
      time: "21:06",
      parts: [
        { type: "tool", id: "t3", title: t.seed.edited, status: "done", icon: "file", description: "+1 −0" },
        { type: "confirmation", id: "deploy" },
      ],
    },
  ];
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(signal.reason);
    });
  });
}

function TextPart({
  part,
  onRevealed,
}: {
  part: Extract<Part, { type: "text" }>;
  onRevealed: () => void;
}) {
  // A non-streaming backend returns the whole reply; reveal it progressively.
  const text = useStreamedText(part.text, {
    enabled: part.reveal ?? false,
    onComplete: onRevealed,
  });
  return (
    <ChatMarkdown streaming={part.streaming || part.reveal}>{text}</ChatMarkdown>
  );
}

export function ChatView({ empty = false }: { empty?: boolean }) {
  const t = useMessages(messages);
  const ui = useUiMessages();
  const locale = useLocale();
  const [transcript, setTranscript] = useState<DemoMessage[] | null>(
    empty ? [] : null,
  );
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const repliesRef = useRef(0);
  const revealedRef = useRef<() => void>(() => {});
  const list = transcript ?? seed(t);

  useEffect(() => () => abortRef.current?.abort(), []);

  const now = () =>
    new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(new Date());

  const update = (id: string, change: (message: DemoMessage) => DemoMessage) =>
    setTranscript((current) =>
      (current ?? seed(t)).map((message) =>
        message.id === id ? change(message) : message,
      ),
    );

  const setParts = (id: string, change: (parts: Part[]) => Part[]) =>
    update(id, (message) => ({ ...message, parts: change(message.parts ?? []) }));

  const run = async (
    id: string,
    script: (signal: AbortSignal) => Promise<void>,
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setActiveId(id);
    try {
      await script(controller.signal);
      setStatus("ready");
    } catch {
      // Stopped by the person.
    }
  };

  const streamText = async (id: string, text: string, signal: AbortSignal) => {
    const words = text.split(/(\s+)/);
    setParts(id, (parts) => [...parts, { type: "text", text: "", streaming: true }]);
    let shown = "";
    for (const word of words) {
      await sleep(18, signal);
      shown += word;
      const snapshot = shown;
      setParts(id, (parts) =>
        parts.map((part, index) =>
          index === parts.length - 1 && part.type === "text"
            ? { ...part, text: snapshot }
            : part,
        ),
      );
    }
    setParts(id, (parts) =>
      parts.map((part) => (part.type === "text" ? { ...part, streaming: false } : part)),
    );
  };

  const reply = (id: string) =>
    run(id, async (signal) => {
      const attempt = repliesRef.current++;
      setStatus("submitted");
      await sleep(700, signal);
      setStatus("streaming");
      setParts(id, () => [{ type: "reasoning", text: t.replyReasoning, running: true }]);
      await sleep(1400, signal);
      // Every second live reply fails, to show the error state and retry.
      if (attempt % 2 === 1) {
        setParts(id, () => [{ type: "error" }]);
        return;
      }
      setParts(id, () => [
        { type: "reasoning", text: t.replyReasoning, duration: 1 },
        { type: "tool", id: "search", title: t.searchingRunning, status: "running", icon: "search" },
      ]);
      await sleep(1100, signal);
      setParts(id, (parts) =>
        parts.map((part) =>
          part.type === "tool"
            ? { ...part, title: t.searching, status: "done", output: t.searchOutput, description: "1.1s" }
            : part,
        ),
      );
      await streamText(id, t.reply, signal);
    });

  const send = ({ text, files }: PromptInputMessage) => {
    const id = crypto.randomUUID();
    const userMessage: DemoMessage = {
      id: `u-${id}`,
      role: "user",
      text,
      time: now(),
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      })),
    };
    setTranscript((current) => [
      ...(current ?? seed(t)),
      userMessage,
      { id: `a-${id}`, role: "assistant", time: now(), parts: [] },
    ]);
    void reply(`a-${id}`);
  };

  const stop = () => {
    abortRef.current?.abort();
    setStatus("ready");
    setTranscript((current) =>
      (current ?? seed(t)).map((message) => ({
        ...message,
        parts: message.parts?.map((part) =>
          part.type === "reasoning" && part.running
            ? { ...part, running: false }
            : part.type === "tool" && part.status === "running"
              ? { ...part, status: "error" }
              : part.type === "text"
                ? { ...part, streaming: false, reveal: false }
                : part,
        ),
      })),
    );
  };

  // Regenerates as a non-streaming backend would: the whole reply at once.
  const retry = (id: string) =>
    run(id, async (signal) => {
      setStatus("submitted");
      setParts(id, () => []);
      await sleep(900, signal);
      setStatus("streaming");
      setParts(id, () => [{ type: "text", text: t.reply, reveal: true }]);
      await new Promise<void>((resolve, reject) => {
        revealedRef.current = resolve;
        signal.addEventListener("abort", () => reject(signal.reason));
      });
      setParts(id, (parts) =>
        parts.map((part) =>
          part.type === "text" ? { ...part, reveal: false } : part,
        ),
      );
    });

  const answer = (approved: boolean) =>
    run("a2", async (signal) => {
      const id = "a2";
      setStatus("streaming");
      if (!approved) {
        setParts(id, (parts) => [
          ...parts.filter((part) => part.type !== "confirmation"),
          { type: "tool", id: "deploy", title: t.deployDenied, status: "denied", icon: "deploy" },
        ]);
        await streamText(id, t.deniedText, signal);
        return;
      }
      setParts(id, (parts) => [
        ...parts.filter((part) => part.type !== "confirmation"),
        { type: "tool", id: "deploy", title: t.deploying, status: "running", icon: "deploy" },
      ]);
      await sleep(2200, signal);
      setParts(id, (parts) =>
        parts.map((part) =>
          part.type === "tool" && part.id === "deploy"
            ? { ...part, title: t.deployed, status: "done", output: t.deployOutput, description: "38s" }
            : part,
        ),
      );
      await streamText(id, t.deployedText, signal);
    });

  const busy = status === "submitted" || status === "streaming";

  return (
    <Chat>
      <ChatMessages busy={busy}>
        {list.map((message) => {
          if (message.role === "user") {
            return (
              <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor>
                <ChatMessage
                  from="user"
                  footer={message.time}
                  attachments={
                    message.files?.length ? (
                      <AttachmentGroup className="justify-end">
                        {message.files.map((file) => (
                          <Attachment key={file.name} size="sm">
                            <AttachmentMedia variant={file.url ? "image" : "icon"}>
                              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                              {file.url ? <img src={file.url} alt="" /> : <FileIcon />}
                            </AttachmentMedia>
                            <AttachmentContent>
                              <AttachmentTitle>{file.name}</AttachmentTitle>
                              <AttachmentDescription>{formatBytes(file.size)}</AttachmentDescription>
                            </AttachmentContent>
                          </Attachment>
                        ))}
                      </AttachmentGroup>
                    ) : undefined
                  }
                >
                  {message.text}
                </ChatMessage>
              </MessageScrollerItem>
            );
          }
          const parts = message.parts ?? [];
          const trace = parts.filter(
            (part) => part.type === "reasoning" || part.type === "tool",
          );
          const text = parts.find((part) => part.type === "text");
          const failed = parts.some((part) => part.type === "error");
          const working = busy && message.id === activeId;
          const done = !working && !parts.some((part) => part.type === "confirmation");
          return (
            <MessageScrollerItem key={message.id} messageId={message.id}>
              <ChatMessage
                from="assistant"
                footer={
                  done && (text || failed) ? (
                    <MessageActions>
                      {text ? <CopyMessageAction text={text.text} /> : null}
                      {text ? (
                        <>
                          <MessageAction
                            label={ui.goodResponse}
                            aria-pressed={feedback[message.id] === "up"}
                            onClick={() => setFeedback((f) => ({ ...f, [message.id]: "up" }))}
                          >
                            <ThumbsUpIcon />
                          </MessageAction>
                          <MessageAction
                            label={ui.badResponse}
                            aria-pressed={feedback[message.id] === "down"}
                            onClick={() => setFeedback((f) => ({ ...f, [message.id]: "down" }))}
                          >
                            <ThumbsDownIcon />
                          </MessageAction>
                        </>
                      ) : null}
                      <MessageAction label={ui.retry} onClick={() => void retry(message.id)}>
                        <RefreshCwIcon />
                      </MessageAction>
                      <span className="ml-1.5 tabular-nums">{message.time}</span>
                    </MessageActions>
                  ) : undefined
                }
              >
                {trace.length > 0 ? (
                  <ChatTrace>
                    {trace.map((part, index) =>
                      part.type === "reasoning" ? (
                        <Reasoning key={`r${index}`} running={part.running} duration={part.duration}>
                          {part.text}
                        </Reasoning>
                      ) : part.type === "tool" ? (
                        <Tool
                          key={part.id}
                          title={part.title}
                          status={part.status}
                          icon={part.icon ? icons[part.icon] : undefined}
                          description={part.description}
                        >
                          {part.output}
                        </Tool>
                      ) : null,
                    )}
                  </ChatTrace>
                ) : null}
                {parts.some((part) => part.type === "confirmation") ? (
                  <Confirmation
                    icon={<RocketIcon />}
                    title={t.seed.deployQuestion}
                    description={t.seed.deployDescription}
                    disabled={busy}
                    onApprove={() => void answer(true)}
                    onDeny={() => void answer(false)}
                  />
                ) : null}
                {text ? (
                  <TextPart part={text} onRevealed={() => revealedRef.current()} />
                ) : null}
                {failed ? (
                  <Bubble variant="destructive">
                    <BubbleContent>{t.failed}</BubbleContent>
                  </Bubble>
                ) : null}
                {working && parts.length === 0 ? <TypingIndicator /> : null}
              </ChatMessage>
            </MessageScrollerItem>
          );
        })}
      </ChatMessages>
      <ChatComposer>
        {list.length === 0 ? (
          <Suggestions suggestions={t.suggestions} onSelect={(text) => send({ text, files: [] })} />
        ) : null}
        <PromptInput
          placeholder={t.placeholder}
          status={status}
          onStop={stop}
          onSubmit={send}
          attachments
          autoFocus
        />
      </ChatComposer>
    </Chat>
  );
}
