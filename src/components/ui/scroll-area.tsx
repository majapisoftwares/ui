"use client";

import * as React from "react";
import {
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaCorner as ScrollAreaCornerPrimitive,
  ScrollAreaScrollbar as ScrollAreaScrollbarPrimitive,
  ScrollAreaThumb as ScrollAreaThumbPrimitive,
  ScrollAreaViewport as ScrollAreaViewportPrimitive,
} from "@ui-sdk/react/scroll-area";
import { cn } from "cn";

function ScrollArea({
  className,
  viewportClassName,
  fade = "both",
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive> & {
  viewportClassName?: string;
  // "bottom" keeps a sticky header solid (a top fade would dissolve it).
  fade?: "both" | "bottom";
}) {
  return (
    <ScrollAreaPrimitive
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaViewportPrimitive
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          fade === "bottom" ? "scroll-fade-b" : "scroll-fade",
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaViewportPrimitive>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaCornerPrimitive />
    </ScrollAreaPrimitive>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollbarPrimitive>) {
  return (
    <ScrollAreaScrollbarPrimitive
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px opacity-0 transition-[color,opacity] select-none data-[visible]:opacity-100 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaThumbPrimitive
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaScrollbarPrimitive>
  );
}

export { ScrollArea, ScrollBar };
