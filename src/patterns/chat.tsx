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
import { CheckIcon, CopyIcon, ReplyIcon, XIcon } from "lucide-react";
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
  useMessageScroller,
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
            className="mx-auto w-full max-w-3xl pt-6 pb-6"
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
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-2">
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
  /** The message this one replies to (a `ChatQuote`), above its text. */
  quote?: ReactNode;
  /** Actions or the time under the message. A person's footer shows on hover. */
  footer?: ReactNode;
}

/**
 * One turn. A person's text sits in a muted bubble on the end side; the
 * agent's reply is unboxed so markdown, reasoning and tools read as a page.
 * Either footer (actions, time) shows on hover or focus; on touch screens it
 * stays visible.
 */
export function ChatMessage({
  from,
  attachments,
  quote,
  footer,
  children,
  ...props
}: ChatMessageProps) {
  if (from === "user") {
    return (
      <Message align="end" data-from="user" {...props}>
        <MessageContent>
          {attachments}
          {children || quote ? (
            <Bubble align="end" variant="muted">
              <BubbleContent className="whitespace-pre-wrap">
                {quote ? (
                  <div className={cn("whitespace-normal", children ? "mb-1.5" : undefined)}>{quote}</div>
                ) : null}
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
        {quote ? <div className="max-w-md">{quote}</div> : null}
        {children}
        {footer ? (
          <MessageFooter className="px-0 transition-opacity md:opacity-0 md:group-hover/message:opacity-100 md:group-focus-within/message:opacity-100">
            {footer}
          </MessageFooter>
        ) : null}
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

/** Starts a reply to the message, as in messaging apps. */
export function ReplyMessageAction({ onReply }: { onReply: () => void }) {
  const messages = useUiMessages();
  return (
    <MessageAction label={messages.reply} onClick={onReply}>
      <ReplyIcon />
    </MessageAction>
  );
}

export interface ChatQuoteProps extends ComponentProps<"div"> {
  /** Who wrote the quoted message. */
  author: ReactNode;
  /** In the transcript: selecting the quote scrolls to this message. */
  messageId?: string;
  /** In the composer: shows a button that cancels the reply. */
  onDismiss?: () => void;
}

function QuoteBody({ author, children }: { author: ReactNode; children: ReactNode }) {
  return (
    <>
      <span className="block truncate font-medium text-foreground">{author}</span>
      <span className="line-clamp-2 break-words text-muted-foreground">
        {children}
      </span>
    </>
  );
}

function QuoteJump({
  messageId,
  author,
  children,
}: {
  messageId: string;
  author: ReactNode;
  children: ReactNode;
}) {
  const { scrollToMessage } = useMessageScroller();
  return (
    <Button
      type="button"
      variant="ghost"
      className="h-auto min-w-0 flex-1 flex-col items-stretch gap-0 rounded-[inherit] px-2.5 py-1.5 text-left text-xs font-normal whitespace-normal hover:bg-transparent"
      onClick={() => scrollToMessage(messageId, { align: "center", behavior: "smooth" })}
    >
      <QuoteBody author={author}>{children}</QuoteBody>
    </Button>
  );
}

/**
 * The message a reply refers to: its author and the start of its text. Pass
 * it as `quote` to `ChatMessage` (with `messageId`, it jumps to the original)
 * or to `PromptInput` while the person writes the reply (with `onDismiss`).
 */
export function ChatQuote({
  author,
  messageId,
  onDismiss,
  className,
  children,
  ...props
}: ChatQuoteProps) {
  const messages = useUiMessages();
  return (
    <div
      data-slot="chat-quote"
      className={cn(
        "flex min-w-0 items-start rounded-lg border-l-2 border-primary bg-foreground/5 text-xs",
        className,
      )}
      {...props}
    >
      {messageId ? (
        <QuoteJump messageId={messageId} author={author}>
          {children}
        </QuoteJump>
      ) : (
        <div className="min-w-0 flex-1 px-2.5 py-1.5">
          <QuoteBody author={author}>{children}</QuoteBody>
        </div>
      )}
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={messages.cancelReply}
          className="m-1 size-11 shrink-0 text-muted-foreground md:size-6"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onDismiss}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
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
