"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { useUiMessages } from "../lib/i18n";
import { Button } from "../components/ui/button";
import { Bubble, BubbleContent } from "../components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "../components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScrollerGutterWidth,
} from "../components/ui/message-scroller";
import { Orb } from "../components/ui/orb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

const GutterContext = createContext<{
  gutter: number;
  setGutter: (width: number) => void;
} | null>(null);

/**
 * Agent chat layout: a transcript that fills the space and a composer below
 * it. Place it in `AppShell fillHeight` (or any height-constrained parent).
 */
export function Chat({ className, children, ...props }: ComponentProps<"div">) {
  const [gutter, setGutter] = useState(0);
  return (
    <GutterContext.Provider value={{ gutter, setGutter }}>
      <TooltipProvider>
        <div
          data-slot="chat"
          className={cn("relative flex min-h-0 flex-1 flex-col", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </GutterContext.Provider>
  );
}

export interface ChatMessagesProps
  extends Omit<ComponentProps<typeof MessageScrollerProvider>, "children"> {
  children: ReactNode;
  /** True while a reply streams; screen readers wait for the finished row. */
  busy?: boolean;
  className?: string;
}

/**
 * The transcript (shadcn Message Scroller). Follows the reply while the
 * reader stays at the live edge and opens at the last turn. Wrap each row in
 * `MessageScrollerItem` and mark the person's turns with `scrollAnchor`.
 */
export function ChatMessages({
  children,
  busy,
  className,
  autoScroll = true,
  defaultScrollPosition = "last-anchor",
  ...props
}: ChatMessagesProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const gutter = useMessageScrollerGutterWidth(viewportRef);
  const setGutter = useContext(GutterContext)?.setGutter;

  useEffect(() => setGutter?.(gutter), [gutter, setGutter]);

  return (
    <MessageScrollerProvider
      autoScroll={autoScroll}
      defaultScrollPosition={defaultScrollPosition}
      {...props}
    >
      <MessageScroller className={cn("min-h-0 flex-1", className)}>
        <MessageScrollerViewport ref={viewportRef}>
          <MessageScrollerContent
            aria-busy={busy}
            className="mx-auto w-full max-w-3xl px-1 pb-6"
          >
            {children}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

/**
 * Holds the prompt input (and suggestions) under the transcript, aligned
 * with it even when the transcript reserves a scrollbar gutter.
 */
export function ChatComposer({
  className,
  children,
  style,
  ...props
}: ComponentProps<"div">) {
  const gutter = useContext(GutterContext)?.gutter ?? 0;
  return (
    <div
      data-slot="chat-composer"
      className={cn("shrink-0 pb-[env(safe-area-inset-bottom)]", className)}
      style={{ paddingInlineEnd: gutter, ...style }}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-1">
        {children}
      </div>
    </div>
  );
}

export interface ChatMessageProps
  extends Omit<ComponentProps<typeof Message>, "align"> {
  from: "user" | "assistant";
  /** Files or images sent with a person's message, above the bubble. */
  attachments?: ReactNode;
  /** Actions or the time under the message. A person's footer shows on hover. */
  footer?: ReactNode;
}

/**
 * One turn. A person's text sits in a muted bubble on the end side; the
 * agent's reply is unboxed so markdown, reasoning and tools read as a page.
 */
export function ChatMessage({
  from,
  attachments,
  footer,
  children,
  ...props
}: ChatMessageProps) {
  if (from === "user") {
    return (
      <Message align="end" data-from="user" {...props}>
        <MessageContent>
          {attachments}
          {children ? (
            <Bubble align="end" variant="muted">
              <BubbleContent className="whitespace-pre-wrap">
                {children}
              </BubbleContent>
            </Bubble>
          ) : null}
          {footer ? (
            <MessageFooter className="transition-opacity md:opacity-0 md:group-hover/message:opacity-100 md:group-focus-within/message:opacity-100">
              {footer}
            </MessageFooter>
          ) : null}
        </MessageContent>
      </Message>
    );
  }
  return (
    <Message data-from="assistant" {...props}>
      <MessageContent>
        {children}
        {footer ? <MessageFooter className="px-0">{footer}</MessageFooter> : null}
      </MessageContent>
    </Message>
  );
}

/** Row of message actions (copy, feedback, retry) and metadata. */
export function MessageActions({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="message-actions"
      className={cn("-mx-2 flex min-w-0 items-center gap-0.5", className)}
      {...props}
    />
  );
}

export interface MessageActionProps extends ComponentProps<typeof Button> {
  /** Accessible name and tooltip. */
  label: string;
}

/** Icon button with a tooltip. Use `aria-pressed` for toggles like feedback. */
export function MessageAction({
  label,
  className,
  children,
  ...props
}: MessageActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn(
              "size-11 text-muted-foreground hover:text-foreground aria-pressed:text-foreground md:size-8",
              className,
            )}
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Copies the message text and confirms for two seconds. */
export function CopyMessageAction({ text }: { text: string }) {
  const messages = useUiMessages();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <MessageAction
      label={copied ? messages.copied : messages.copy}
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => setCopied(true))
      }
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </MessageAction>
  );
}

/** Shown while the agent works on a reply and nothing has streamed yet. */
export function TypingIndicator({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const messages = useUiMessages();
  return (
    <div
      data-slot="typing-indicator"
      role="status"
      aria-live="polite"
      className={cn("flex", className)}
    >
      <Orb pill label={label ?? `${messages.responding}…`} />
    </div>
  );
}

export interface SuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
}

/** Prompt suggestions above the prompt input; each label is sent as-is. */
export function Suggestions({
  suggestions,
  onSelect,
  className,
}: SuggestionsProps) {
  const messages = useUiMessages();
  if (suggestions.length === 0) return null;
  return (
    <div
      role="group"
      aria-label={messages.suggestions}
      className={cn(
        "no-scrollbar flex scroll-fade-x gap-2 overflow-x-auto overscroll-x-contain",
        className,
      )}
    >
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          className="h-11 shrink-0 md:h-8"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
