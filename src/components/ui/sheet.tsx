"use client";

import * as React from "react";
import {
  Drawer as SheetRoot,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer";
import { cn } from "cn";

import { Button } from "./button";
import { XIcon } from "lucide-react";
import { useUiMessages } from "../../lib/i18n";

/** `side` picks the edge the sheet comes from (it used to live on `SheetContent`). */
function Sheet({
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetRoot>) {
  return <SheetRoot side={side} {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof DrawerTrigger>) {
  return <DrawerTrigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof DrawerClose>) {
  return <DrawerClose data-slot="sheet-close" {...props} />;
}

/** Kept for compatibility: ui-sdk content already renders in the top layer. */
function SheetPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerBackdrop>) {
  return (
    <DrawerBackdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<typeof DrawerContent>, "children"> & {
  children?: React.ReactNode;
  showCloseButton?: boolean;
}) {
  const messages = useUiMessages();
  return (
    <>
      <SheetOverlay />
      <DrawerContent
        data-slot="sheet-content"
        className={cn(
          "z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-xl data-[side=bottom]:h-auto data-[side=bottom]:w-full data-[side=bottom]:border-t data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:sm:max-w-sm data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:sm:max-w-sm data-[side=top]:h-auto data-[side=top]:w-full data-[side=top]:border-b",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DrawerClose
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4 bg-secondary"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{messages.close}</span>
          </DrawerClose>
        )}
      </DrawerContent>
    </>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerTitle>) {
  return (
    <DrawerTitle
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerDescription>) {
  return (
    <DrawerDescription
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetPortal,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
