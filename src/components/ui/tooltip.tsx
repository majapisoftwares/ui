"use client";

import * as React from "react";
import {
  Tooltip as TooltipRoot,
  TooltipArrow,
  TooltipContent as TooltipContentPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@ui-sdk/react/tooltip";
import { cn } from "cn";

type TooltipDelays = { delay?: number; closeDelay?: number };

const TooltipDelayContext = React.createContext<TooltipDelays>({});

/** Sets the default delays of the tooltips inside it. ui-sdk groups tooltips on its own. */
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
      {children}
    </TooltipDelayContext.Provider>
  );
}

function Tooltip({
  delay,
  closeDelay,
  ...props
}: React.ComponentProps<typeof TooltipRoot>) {
  const defaults = React.useContext(TooltipDelayContext);
  return (
    <TooltipRoot
      delay={delay ?? defaults.delay ?? 0}
      closeDelay={closeDelay ?? defaults.closeDelay}
      {...props}
    />
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipTriggerPrimitive>) {
  return <TooltipTriggerPrimitive data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipContentPrimitive>, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <TooltipContentPrimitive
      data-slot="tooltip-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-fit max-w-xs [&[hidden]]:hidden origin-(--transform-origin) items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs text-background transition-[opacity,scale] duration-100 not-data-closed:inline-flex data-ending-style:inline-flex data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-95 data-starting-style:opacity-0 has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <TooltipArrow className="absolute z-50 size-2.5 rotate-45 rounded-[2px] bg-foreground data-[side=bottom]:top-0 data-[side=bottom]:left-(--arrow-offset) data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-1/2 data-[side=left]:top-(--arrow-offset) data-[side=left]:right-0 data-[side=left]:translate-x-1/2 data-[side=left]:-translate-y-1/2 data-[side=right]:top-(--arrow-offset) data-[side=right]:left-0 data-[side=right]:-translate-x-1/2 data-[side=right]:-translate-y-1/2 data-[side=top]:bottom-0 data-[side=top]:left-(--arrow-offset) data-[side=top]:-translate-x-1/2 data-[side=top]:translate-y-1/2" />
    </TooltipContentPrimitive>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
