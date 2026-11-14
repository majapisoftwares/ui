"use client";

import { useUiMessages } from "../lib/i18n";
import { Button } from "../components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import { hostnameOf } from "./chat-trace";

export interface InlineCitationProps {
  url: string;
  /** Falls back to the URL's hostname. */
  title?: string;
  description?: string;
}

/**
 * A source inside a sentence (shadcn AI Elements Inline Citation): its
 * hostname, which shows the title, description and link on hover. For the
 * list of sources after an answer, use Sources.
 */
export function InlineCitation({
  url,
  title,
  description,
}: InlineCitationProps) {
  const messages = useUiMessages();
  const host = hostnameOf(url);
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={10}
        closeDelay={100}
        render={<Button variant="secondary" size="xs" />}
      >
        {host}
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-1">
        <div className="font-medium">{title ?? host}</div>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {host}
          <span className="sr-only"> {messages.opensInNewTab}</span>
        </a>
      </HoverCardContent>
    </HoverCard>
  );
}
