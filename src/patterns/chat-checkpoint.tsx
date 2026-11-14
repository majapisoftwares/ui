"use client";

import type { ReactNode } from "react";
import { useUiMessages } from "../lib/i18n";
import { Button } from "../components/ui/button";
import { Marker, MarkerContent } from "../components/ui/marker";

export interface CheckpointProps {
  /** What the turn above it changed, e.g. "Button renamed". */
  label: ReactNode;
  /** Keeps that turn and drops every later message. Leave it out on the last turn. */
  onRestore?: () => void;
  /** Accessible name of the restore button, e.g. "Restore to Button renamed". */
  restoreLabel?: string;
}

/**
 * A point the conversation can go back to (shadcn AI Elements Checkpoint): a
 * separator after a turn, with Restore.
 */
export function Checkpoint({
  label,
  onRestore,
  restoreLabel,
}: CheckpointProps) {
  const messages = useUiMessages();
  return (
    <Marker variant="separator">
      <MarkerContent className="inline-flex items-center gap-2">
        {label}
        {onRestore ? (
          <Button
            size="xs"
            variant="outline"
            aria-label={
              restoreLabel ??
              (typeof label === "string"
                ? messages.restoreTo(label)
                : undefined)
            }
            onClick={onRestore}
          >
            {messages.restore}
          </Button>
        ) : null}
      </MarkerContent>
    </Marker>
  );
}
