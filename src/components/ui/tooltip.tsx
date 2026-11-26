"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { renderElement, type RenderProp } from "@ui-sdk/react/primitive";
import { cn } from "cn";

type TooltipDelays = { delay?: number; closeDelay?: number };

const TooltipDelayContext = React.createContext<TooltipDelays>({});
const TooltipDisabledContext = React.createContext(false);
const TooltipHasProviderContext = React.createContext(false);

/** Sets the default delays of the tooltips inside it. Radix groups tooltips on its own. */
function TooltipProvider({
  delay = 0,
  closeDelay,
  children,
}: TooltipDelays & { children?: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ delay, closeDelay }),
    [delay, closeDelay],
  );
  return (
    <TooltipDelayContext.Provider value={value}>
      <TooltipHasProviderContext.Provider value>
        <TooltipPrimitive.Provider
          data-slot="tooltip-provider"
          delayDuration={delay}
        >
          {children}
        </TooltipPrimitive.Provider>
      </TooltipHasProviderContext.Provider>
    </TooltipDelayContext.Provider>
  );
}

function Tooltip({
  delay,
  closeDelay,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Root>, "delayDuration"> &
  TooltipDelays & { disabled?: boolean }) {
  const defaults = React.useContext(TooltipDelayContext);
  const hasProvider = React.useContext(TooltipHasProviderContext);
  const close = closeDelay ?? defaults.closeDelay ?? 0;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  React.useEffect(() => () => clearTimeout(closeTimer.current), []);
  // Radix has no closeDelay: hold the close request back by the delay instead.
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      clearTimeout(closeTimer.current);
      if (!next && close > 0) {
        closeTimer.current = setTimeout(() => {
          if (open === undefined) setUncontrolledOpen(false);
          onOpenChange?.(false);
        }, close);
        return;
      }
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [close, open, onOpenChange],
  );
  if (disabled) {
    return (
      <TooltipDisabledContext.Provider value>
        {children}
      </TooltipDisabledContext.Provider>
    );
  }
  const controlled = open !== undefined || close > 0;
  const root = (
    <TooltipPrimitive.Root
      data-slot="tooltip"
      delayDuration={delay ?? defaults.delay ?? 0}
      {...(controlled
        ? { open: open ?? uncontrolledOpen, onOpenChange: handleOpenChange }
        : { defaultOpen, onOpenChange })}
      {...props}
    >
      {children}
    </TooltipPrimitive.Root>
  );
  // Radix 1.4 throws without a Provider; a tooltip used alone gets its own.
  if (hasProvider) return root;
  return (
    <TooltipPrimitive.Provider delayDuration={delay ?? defaults.delay ?? 0}>
      {root}
    </TooltipPrimitive.Provider>
  );
}

function TooltipTrigger({
  render,
  children,
  ...props
}: React.ComponentProps<"button"> & { render?: RenderProp }) {
  const disabled = React.useContext(TooltipDisabledContext);
  const element = renderElement(
    "button",
    { type: "button", ...props, children },
    render,
  );
  if (disabled) return element;
  return (
    <TooltipPrimitive.Trigger asChild data-slot="tooltip-trigger">
      {element}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const disabled = React.useContext(TooltipDisabledContext);
  if (disabled) return null;
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) animate-in items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs text-background fade-in-0 zoom-in-95 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-lg",
          className,
        )}
        {...props}
      >
        {children}
        {/* The shadcn arrow: same color and radius as the bubble, shifted half
            its size plus 2px into it so no seam shows on any side. */}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
