"use client";

import { useState, type ReactNode } from "react";
import { BrainIcon, WrenchIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { useUiMessages } from "../lib/i18n";
import { Button } from "../components/ui/button";
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
        {typeof children === "string" ? (
          <pre className="max-h-64 overflow-auto rounded-xl bg-muted px-3 py-2 font-mono text-xs whitespace-pre-wrap text-foreground">
            {children}
          </pre>
        ) : (
          children
        )}
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
