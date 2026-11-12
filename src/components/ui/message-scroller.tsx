"use client";

import * as React from "react";
import {
  MessageScroller as MessageScrollerPrimitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@shadcn/react/message-scroller";
import { cn } from "cn";

import { Button } from "./button";
import { ArrowDownIcon } from "lucide-react";
import { useUiMessages } from "../../lib/i18n";

function MessageScrollerProvider(
  props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>,
) {
  return <MessageScrollerPrimitive.Provider {...props} />;
}

function MessageScroller({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Root>) {
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      className={cn(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function MessageScrollerViewport({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport>) {
  const messages = useUiMessages();
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      aria-label={messages.messages}
      className={cn(
        "size-full min-h-0 min-w-0 scroll-fade-b overflow-y-auto overscroll-contain [scrollbar-gutter:stable] contain-content data-autoscrolling:[scrollbar-color:transparent_transparent] data-pending-scroll:invisible",
        className,
      )}
      {...props}
    />
  );
}

function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Content>) {
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      // Majapi UI: p-2 makes room for the items' paint margin (below), so it
      // never overflows the viewport sideways.
      className={cn("flex h-max min-h-full flex-col gap-8 p-2", className)}
      {...props}
    />
  );
}

function MessageScrollerItem({
  className,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item>) {
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      scrollAnchor={scrollAnchor}
      // Majapi UI: content-visibility:auto always applies paint containment,
      // which clips shadows and focus rings at the row's edges. -m-2 p-2
      // gives every row an 8px paint margin without moving its content.
      className={cn(
        "-m-2 min-w-0 shrink-0 p-2 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
        className,
      )}
      {...props}
    />
  );
}

function MessageScrollerButton({
  direction = "end",
  className,
  children,
  render,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  const messages = useUiMessages();
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      data-direction={direction}
      data-variant={variant}
      data-size={size}
      direction={direction}
      className={cn(
        "absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
        className,
      )}
      render={render ?? <Button variant={variant} size={size} />}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">
            {direction === "end"
              ? messages.scrollToEnd
              : messages.scrollToStart}
          </span>
        </>
      )}
    </MessageScrollerPrimitive.Button>
  );
}

/**
 * Width of the viewport's reserved scrollbar gutter (from Numa). Content
 * outside the viewport, such as a composer, pads its inline end by this
 * amount to stay aligned with the transcript.
 */
function useMessageScrollerGutterWidth(
  viewportRef: React.RefObject<HTMLElement | null>,
) {
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const sync = () =>
      setWidth(Math.max(0, viewport.offsetWidth - viewport.clientWidth));
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewportRef]);

  return width;
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerGutterWidth,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
};
