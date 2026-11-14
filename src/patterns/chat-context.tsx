"use client";

import { useUiMessages } from "../lib/i18n";
import { Button } from "../components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import { Progress } from "../components/ui/progress";

export interface ContextUsageProps {
  /** The model's context window, in tokens (the model's, not sent by the provider). */
  limit: number;
  input?: number;
  output?: number;
  reasoning?: number;
}

/** 1234 → "1.2k". */
export function formatTokens(value: number) {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

/**
 * How much of the context window a conversation uses (shadcn AI Elements
 * Context): a percent button, for the prompt input's `actions`, that shows
 * the counts on hover.
 */
export function ContextUsage({
  limit,
  input = 0,
  output = 0,
  reasoning = 0,
}: ContextUsageProps) {
  const messages = useUiMessages();
  const used = input + output + reasoning;
  const percent =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const rows = [
    { label: messages.inputTokens, value: input },
    { label: messages.outputTokens, value: output },
    { label: messages.reasoningTokens, value: reasoning },
  ].filter((row) => row.value > 0);
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={10}
        closeDelay={100}
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-11 rounded-full md:h-8"
          />
        }
      >
        {messages.contextPercent(percent)}
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">{messages.context}</span>
          <span className="text-muted-foreground tabular-nums">
            {formatTokens(used)} / {formatTokens(limit)}
          </span>
        </div>
        <Progress value={percent} aria-label={messages.contextUsed} />
        {rows.length ? (
          <div className="flex flex-col gap-1 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="tabular-nums">{formatTokens(row.value)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}
