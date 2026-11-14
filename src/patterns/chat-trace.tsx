"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  ArrowUpRightIcon,
  BrainIcon,
  CheckIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  CircleXIcon,
  FileCodeIcon,
  FlaskConicalIcon,
  GlobeIcon,
  LayersIcon,
  ListChecksIcon,
  ListTodoIcon,
  RouteIcon,
  TerminalIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useUiMessages } from "../lib/i18n";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CodeBlock, CodeBlockContent } from "../components/ui/code-block";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../components/ui/item";
import { Orb } from "../components/ui/orb";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../components/ui/trace";

/** Groups the agent's reasoning and tool lines of one reply. */
export const ChatTrace = Trace;

export interface ReasoningProps {
  /** Thinking text (or steps). Without it the line has nothing to open. */
  children?: ReactNode;
  /** True while the model thinks: the line opens and its title shimmers. */
  running?: boolean;
  /** Seconds spent thinking, measured by the server. */
  duration?: number;
  /** Overrides "Thinking"/"Thought", e.g. a step title. */
  title?: ReactNode;
  /** Lets the app load the trace lazily when it is opened. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * One reasoning line (shadcn AI Elements Reasoning). Opens while running and
 * closes when done, unless the person toggled it. Several steps (as in Numa's
 * reasoning panel) are several lines in the same `ChatTrace`.
 */
export function Reasoning({
  children,
  running = false,
  duration,
  title,
  onOpenChange,
}: ReasoningProps) {
  const messages = useUiMessages();
  const [open, setOpen] = useState<boolean>();
  const line = (
    <TraceLine status={running ? "running" : undefined}>
      <TraceIcon>
        {running ? <Orb size={16} variant="B1" /> : <BrainIcon />}
      </TraceIcon>
      <TraceTitle>
        {title ??
          (running
            ? messages.thinking
            : duration === undefined
              ? messages.thought
              : messages.thoughtFor(duration))}
      </TraceTitle>
    </TraceLine>
  );
  if (!children) return line;
  return (
    <TraceCollapsible
      open={open ?? running}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
    >
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent
        className={cn(typeof children === "string" && "whitespace-pre-wrap")}
      >
        {children}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export type ToolStatus = "pending" | "running" | "done" | "error" | "denied";

export interface ToolProps {
  /** What the tool did, e.g. "Ran git status" or "Failed to run git status". */
  title: ReactNode;
  status?: ToolStatus;
  icon?: ReactNode;
  /** Short metadata after the title, e.g. a duration. */
  description?: ReactNode;
  /** Output shown when opened; strings render as preformatted text. */
  children?: ReactNode;
}

/** Command or tool output as AI Elements shows it: a small code block that wraps and scrolls. */
function Output({ children }: { children: ReactNode }) {
  return (
    <CodeBlock size="sm">
      <CodeBlockContent wrap className="max-h-64">
        {children}
      </CodeBlockContent>
    </CodeBlock>
  );
}

/** One tool call (shadcn AI Elements Tool) with its output on demand. */
export function Tool({
  title,
  status = "done",
  icon,
  description,
  children,
}: ToolProps) {
  const line = (
    <TraceLine
      status={
        status === "running" || status === "error" || status === "pending"
          ? status
          : undefined
      }
    >
      <TraceIcon>{icon ?? <WrenchIcon />}</TraceIcon>
      <TraceTitle>{title}</TraceTitle>
      {description ? <TraceDescription>{description}</TraceDescription> : null}
    </TraceLine>
  );
  if (!children || status === "running" || status === "pending") return line;
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        {typeof children === "string" ? <Output>{children}</Output> : children}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface ConfirmationProps {
  /** The question, e.g. "Run rm -rf dist?". */
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onApprove: () => void;
  onDeny: () => void;
  approveLabel?: string;
  denyLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Asks the person to approve a tool call (shadcn AI Elements Confirmation).
 * Once answered, render the call as a `Tool` line instead.
 */
export function Confirmation({
  title,
  description,
  icon,
  onApprove,
  onDeny,
  approveLabel,
  denyLabel,
  disabled = false,
  className,
}: ConfirmationProps) {
  const messages = useUiMessages();
  return (
    <Item variant="outline" size="sm" role="group" className={className}>
      <ItemMedia variant="icon">{icon ?? <WrenchIcon />}</ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description ? <ItemDescription>{description}</ItemDescription> : null}
      </ItemContent>
      <ItemActions>
        <Button
          size="sm"
          variant="outline"
          className="h-11 md:h-8"
          disabled={disabled}
          onClick={onDeny}
        >
          {denyLabel ?? messages.deny}
        </Button>
        <Button
          size="sm"
          className="h-11 md:h-8"
          disabled={disabled}
          onClick={onApprove}
        >
          {approveLabel ?? messages.approve}
        </Button>
      </ItemActions>
    </Item>
  );
}

/** A step's state: done (none), running, failed or not started. */
export type StepStatus = "done" | "running" | "error" | "pending";

const lineStatus = (status: StepStatus | undefined) =>
  status === "running" || status === "error" || status === "pending"
    ? status
    : undefined;

/** The icon a step gets for its state. */
function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "running") return <Orb size={16} variant="B1" />;
  if (status === "error") return <CircleXIcon />;
  if (status === "pending") return <CircleIcon />;
  return <CircleCheckIcon />;
}

/** Open while running and closed when done, unless the person toggled it (as Reasoning). */
function useRunningOpen(running: boolean) {
  const [open, setOpen] = useState<boolean>();
  return { open: open ?? running, onOpenChange: setOpen };
}

export interface StepProps {
  title: ReactNode;
  status?: StepStatus;
  /** Defaults to the state's icon; `null` for none. */
  icon?: ReactNode;
  /** Short metadata after the title, e.g. a duration. */
  description?: ReactNode;
  /** Makes the line a link, e.g. `<a href="…" />` or a router link. */
  render?: ReactElement;
  /** Search results: one badge each (hostnames), shown when the step opens. */
  badges?: string[];
  /** Shown when the step opens: strings as output, anything else as is. */
  children?: ReactNode;
  defaultOpen?: boolean;
}

/**
 * One thing an agent did, inside Chain of Thought, Task or Subagent (a trace
 * line). With content (children or badges) it opens to show it.
 */
export function Step({
  title,
  status = "done",
  icon,
  description,
  render,
  badges,
  children,
  defaultOpen,
}: StepProps) {
  const line = (
    <TraceLine status={lineStatus(status)}>
      {icon === null ? null : (
        <TraceIcon>{icon ?? <StatusIcon status={status} />}</TraceIcon>
      )}
      <TraceTitle>{title}</TraceTitle>
      {description ? <TraceDescription>{description}</TraceDescription> : null}
    </TraceLine>
  );
  if (children || badges?.length)
    return (
      <TraceCollapsible defaultOpen={defaultOpen}>
        <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
        <TraceCollapsibleContent
          className={cn(badges?.length && "flex flex-wrap gap-1.5")}
        >
          {badges?.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
          {typeof children === "string" ? (
            <Output>{children}</Output>
          ) : (
            children
          )}
        </TraceCollapsibleContent>
      </TraceCollapsible>
    );
  if (render && isValidElement(render)) return cloneElement(render, {}, line);
  return line;
}

export interface ChainOfThoughtProps {
  /** One `Step` per thing the agent did. */
  children: ReactNode;
  /** How many steps, for the default title. */
  steps: number;
  running?: boolean;
  /** A step failed. */
  failed?: boolean;
  /** Overrides "Researching" / "Researched in N steps". */
  title?: ReactNode;
}

/**
 * The steps behind an answer (shadcn AI Elements Chain of Thought): a summary
 * line that opens to them, open while they run.
 */
export function ChainOfThought({
  children,
  steps,
  running = false,
  failed = false,
  title,
}: ChainOfThoughtProps) {
  const messages = useUiMessages();
  const state = useRunningOpen(running);
  return (
    <TraceCollapsible {...state}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : failed ? "error" : undefined}>
          <TraceIcon>
            <StatusIcon status={running ? "running" : "done"} />
          </TraceIcon>
          <TraceTitle>
            {title ??
              (running ? messages.researching : messages.researched(steps))}
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent keepMounted>
        <Trace>{children}</Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface PlanStep {
  title: ReactNode;
  status: "done" | "running" | "pending";
}

export interface PlanProps {
  /** E.g. "Plan: migrate to Base UI". */
  title: ReactNode;
  steps: PlanStep[];
  /** Shown above the steps. */
  description?: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Steps the agent decided on before starting, with its progress (shadcn AI
 * Elements Plan). For steps that come from the work itself, use Task.
 */
export function Plan({
  title,
  steps,
  description,
  defaultOpen = true,
}: PlanProps) {
  const messages = useUiMessages();
  const done = steps.filter((step) => step.status === "done").length;
  const running = steps.some((step) => step.status === "running");
  return (
    <TraceCollapsible defaultOpen={defaultOpen}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          <TraceIcon>
            <RouteIcon />
          </TraceIcon>
          <TraceTitle>{title}</TraceTitle>
          <TraceDescription>
            {messages.planProgress(done, steps.length)}
          </TraceDescription>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent
        className={cn(description && "flex flex-col gap-3")}
      >
        {description ? <p>{description}</p> : null}
        <Trace>
          {steps.map((step, index) => (
            <TraceLine key={index} status={lineStatus(step.status)}>
              <TraceIcon>
                {step.status === "done" ? (
                  <CircleCheckIcon />
                ) : step.status === "running" ? (
                  <CircleDotIcon />
                ) : (
                  <CircleIcon />
                )}
              </TraceIcon>
              <TraceTitle>{step.title}</TraceTitle>
            </TraceLine>
          ))}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface QueueTodo {
  id?: string;
  title: ReactNode;
  /** Opens from the todo. */
  description?: ReactNode;
  status: "pending" | "in_progress" | "completed";
}

export interface QueueProps {
  todos: QueueTodo[];
  /** While the agent works, the todo in progress shimmers. */
  running?: boolean;
}

function TodoRow({ todo, running }: { todo: QueueTodo; running: boolean }) {
  const line = (
    <TraceLine
      status={todo.status === "in_progress" && running ? "running" : undefined}
    >
      <TraceIcon>
        {todo.status === "completed" ? (
          <CircleCheckIcon />
        ) : todo.status === "in_progress" ? (
          <CircleDotIcon />
        ) : (
          <CircleIcon />
        )}
      </TraceIcon>
      <TraceTitle>{todo.title}</TraceTitle>
    </TraceLine>
  );
  if (!todo.description) return line;
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>{todo.description}</TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

/**
 * The agent's todo list (shadcn AI Elements Queue): what's left (open) and
 * what's done (closed). Todos move to the second when done.
 */
export function Queue({ todos, running = false }: QueueProps) {
  const messages = useUiMessages();
  const pending = todos.filter((todo) => todo.status !== "completed");
  const completed = todos.filter((todo) => todo.status === "completed");
  const section = (
    items: QueueTodo[],
    icon: ReactNode,
    label: string,
    defaultOpen: boolean,
  ) =>
    items.length ? (
      <TraceCollapsible defaultOpen={defaultOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>{icon}</TraceIcon>
            <TraceTitle>{label}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent keepMounted>
          <Trace>
            {items.map((todo, index) => (
              <TodoRow key={todo.id ?? index} todo={todo} running={running} />
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    ) : null;
  return (
    <>
      {section(pending, <ListTodoIcon />, messages.toDo(pending.length), true)}
      {section(
        completed,
        <ListChecksIcon />,
        messages.completedCount(completed.length),
        false,
      )}
    </>
  );
}

export interface TaskProps {
  /** Present tense while it runs ("Updating the page metadata"), past once done. */
  title: ReactNode;
  status?: "done" | "running" | "error";
  /** One `Step` per thing done so far. */
  children: ReactNode;
}

/**
 * One unit of the agent's work, its steps appearing as they happen (shadcn
 * AI Elements Task). Open while it runs; several tasks share one ChatTrace.
 */
export function Task({ title, status = "done", children }: TaskProps) {
  const state = useRunningOpen(status === "running");
  return (
    <TraceCollapsible {...state}>
      <TraceCollapsibleTrigger>
        <TraceLine status={lineStatus(status)}>
          <TraceTitle>{title}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent keepMounted>
        <Trace>{children}</Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface Source {
  url: string;
  /** Falls back to the URL's hostname. */
  title?: string;
}

/** A URL's hostname without "www.", or the text as is when it isn't a URL. */
export function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** The links an answer used (shadcn AI Elements Sources), closed by default. */
export function Sources({ sources }: { sources: Source[] }) {
  const messages = useUiMessages();
  if (!sources.length) return null;
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <TraceLine>
          <TraceIcon>
            <GlobeIcon />
          </TraceIcon>
          <TraceTitle>{messages.usedSources(sources.length)}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace>
          {sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              <TraceLine>
                <TraceIcon>
                  <GlobeIcon />
                </TraceIcon>
                <TraceTitle>
                  {source.title ?? hostnameOf(source.url)}
                  <span className="sr-only"> {messages.opensInNewTab}</span>
                </TraceTitle>
                <TraceIcon>
                  <ArrowUpRightIcon />
                </TraceIcon>
              </TraceLine>
            </a>
          ))}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface SubagentProps {
  /** "Running the research agent" while it runs, "Ran the research agent" after. */
  title: ReactNode;
  status?: "done" | "running" | "error";
  /** How long it ran, e.g. "48s". */
  duration?: ReactNode;
  /** What it was asked to do. */
  task?: ReactNode;
  /** Its model, as a badge. */
  model?: string;
  /** Its tools, as badges. */
  tools?: string[];
  /** One `Step` (or `Tool`, `Terminal`…) per tool call so far. */
  children?: ReactNode;
  /** What it found, once done. */
  result?: ReactNode;
}

/**
 * A delegated agent run (shadcn AI Elements Subagent): its line opens to the
 * task it was given, its model and tools, its tool calls and its result.
 * Open while it runs.
 */
export function Subagent({
  title,
  status = "done",
  duration,
  task,
  model,
  tools,
  children,
  result,
}: SubagentProps) {
  const state = useRunningOpen(status === "running");
  return (
    <TraceCollapsible {...state}>
      <TraceCollapsibleTrigger>
        <TraceLine status={lineStatus(status)}>
          <TraceIcon>
            <StatusIcon status={status} />
          </TraceIcon>
          <TraceTitle>{title}</TraceTitle>
          {duration ? <TraceDescription>{duration}</TraceDescription> : null}
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent keepMounted className="flex flex-col gap-3">
        {model || tools?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {model ? <Badge variant="secondary">{model}</Badge> : null}
            {tools?.map((tool) => (
              <Badge key={tool} variant="outline" className="font-mono">
                {tool}
              </Badge>
            ))}
          </div>
        ) : null}
        {task ? <div>{task}</div> : null}
        {children ? <Trace>{children}</Trace> : null}
        {result ? <div className="text-foreground">{result}</div> : null}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface TerminalProps {
  command: string;
  status?: "done" | "running" | "error";
  /** A command that exits with any code but 0 failed. */
  exitCode?: number;
  /** What it printed so far. */
  output?: string;
}

/**
 * A shell command and its output (shadcn AI Elements Terminal). It opens once
 * output arrives while it runs; a non-zero exit is an error.
 */
export function Terminal({
  command,
  status = "done",
  exitCode,
  output,
}: TerminalProps) {
  const messages = useUiMessages();
  const failed =
    status === "error" || (exitCode !== undefined && exitCode !== 0);
  const running = status === "running" && !failed;
  const state = useRunningOpen(running);
  const line = (
    <TraceLine status={running ? "running" : failed ? "error" : undefined}>
      <TraceIcon>
        <TerminalIcon />
      </TraceIcon>
      <TraceTitle>
        {running
          ? messages.runningCommand(command)
          : failed && exitCode !== undefined
            ? messages.exitedWith(command, exitCode)
            : messages.ranCommand(command)}
      </TraceTitle>
    </TraceLine>
  );
  if (!output) return line;
  return (
    <TraceCollapsible {...state}>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Output>{output}</Output>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface TestCase {
  name: string;
  status: "passed" | "failed" | "skipped";
  /** A failure's message and stack. */
  error?: string;
}

export interface TestSuite {
  /** Usually the test file. */
  name: string;
  tests: TestCase[];
}

const countTests = (tests: TestCase[]) => ({
  total: tests.length,
  failed: tests.filter((test) => test.status === "failed").length,
  skipped: tests.filter((test) => test.status === "skipped").length,
});

function TestRow({ test }: { test: TestCase }) {
  const messages = useUiMessages();
  if (test.status === "failed")
    return (
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine status="error">
            <TraceIcon>
              <XIcon />
            </TraceIcon>
            <TraceTitle>{test.name}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        {test.error ? (
          <TraceCollapsibleContent>
            <Output>{test.error}</Output>
          </TraceCollapsibleContent>
        ) : null}
      </TraceCollapsible>
    );
  return (
    <TraceLine>
      <TraceIcon>
        {test.status === "skipped" ? <CircleDashedIcon /> : <CheckIcon />}
      </TraceIcon>
      <TraceTitle>
        {test.status === "skipped"
          ? messages.skippedTest(test.name)
          : test.name}
      </TraceTitle>
    </TraceLine>
  );
}

/**
 * A test run (shadcn AI Elements Test Results): the counts, then each suite
 * (file) and its tests. Suites with a failure open; a failure opens to its
 * error.
 */
export function TestResults({ suites }: { suites: TestSuite[] }) {
  const messages = useUiMessages();
  const counts = (tests: TestCase[]) => {
    const { total, failed, skipped } = countTests(tests);
    return messages.testCounts(total, failed, skipped);
  };
  const all = suites.flatMap((suite) => suite.tests);
  const failed = countTests(all).failed;
  return (
    <TraceCollapsible defaultOpen>
      <TraceCollapsibleTrigger>
        <TraceLine status={failed > 0 ? "error" : undefined}>
          <TraceIcon>
            <FlaskConicalIcon />
          </TraceIcon>
          <TraceTitle>{messages.ranTests(counts(all))}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent keepMounted>
        <Trace>
          {suites.map((suite) => {
            const suiteFailed = countTests(suite.tests).failed;
            return (
              <TraceCollapsible key={suite.name} defaultOpen={suiteFailed > 0}>
                <TraceCollapsibleTrigger>
                  <TraceLine status={suiteFailed > 0 ? "error" : undefined}>
                    <TraceIcon>
                      <FileCodeIcon />
                    </TraceIcon>
                    <TraceTitle>
                      {suite.name}, {counts(suite.tests)}
                    </TraceTitle>
                  </TraceLine>
                </TraceCollapsibleTrigger>
                <TraceCollapsibleContent keepMounted>
                  <Trace>
                    {suite.tests.map((test) => (
                      <TestRow key={test.name} test={test} />
                    ))}
                  </Trace>
                </TraceCollapsibleContent>
              </TraceCollapsible>
            );
          })}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}

export interface StackFrame {
  line: string;
  name?: string;
  file?: string;
  lineNumber?: string;
  /** From node_modules: folded with the other framework frames. */
  internal: boolean;
}

/** Splits a stack into its error and frames (`at name (file:line:column)`). */
export function parseStack(stack: string) {
  const [error = "", ...lines] = stack
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const frames: StackFrame[] = lines.map((line) => {
    const match = line.match(/^at (.+) \((.+):(\d+):(\d+)\)$/);
    return {
      line,
      name: match?.[1],
      file: match?.[2],
      lineNumber: match?.[3],
      internal: line.includes("node_modules"),
    };
  });
  return { error, frames };
}

export interface StackTraceProps {
  stack: string;
  /** Links one of your frames to its file and line. */
  frameHref?: (frame: StackFrame) => string | undefined;
  defaultOpen?: boolean;
}

/**
 * A failure and its stack (shadcn AI Elements Stack Trace): the error is the
 * title; your frames come first (links with `frameHref`) and framework frames
 * fold into a line of their own.
 */
export function StackTrace({ stack, frameHref, defaultOpen }: StackTraceProps) {
  const messages = useUiMessages();
  const { error, frames } = parseStack(stack);
  const own = frames.filter((frame) => !frame.internal);
  const internal = frames.filter((frame) => frame.internal);
  return (
    <TraceCollapsible defaultOpen={defaultOpen}>
      <TraceCollapsibleTrigger>
        <TraceLine status="error">
          <TraceIcon>
            <CircleXIcon />
          </TraceIcon>
          <TraceTitle>{messages.failedWith(error)}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent keepMounted className="flex flex-col gap-2">
        <p className="font-mono text-xs text-destructive">{error}</p>
        <Trace>
          {own.map((frame, index) => {
            const line = (
              <TraceLine>
                <TraceIcon>
                  <FileCodeIcon />
                </TraceIcon>
                <TraceTitle>
                  {frame.name && frame.file
                    ? `${frame.name} · ${frame.file}:${frame.lineNumber}`
                    : frame.line}
                </TraceTitle>
              </TraceLine>
            );
            const href = frameHref?.(frame);
            return href ? (
              <a key={`${index}-${frame.line}`} href={href}>
                {line}
              </a>
            ) : (
              <div key={`${index}-${frame.line}`}>{line}</div>
            );
          })}
          {internal.length ? (
            <TraceCollapsible>
              <TraceCollapsibleTrigger>
                <TraceLine>
                  <TraceIcon>
                    <LayersIcon />
                  </TraceIcon>
                  <TraceTitle>
                    {messages.frameworkFrames(internal.length)}
                  </TraceTitle>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                <ol className="flex flex-col gap-1 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                  {internal.map((frame, index) => (
                    <li
                      key={`${index}-${frame.line}`}
                      className="whitespace-nowrap"
                    >
                      {frame.line}
                    </li>
                  ))}
                </ol>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          ) : null}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
