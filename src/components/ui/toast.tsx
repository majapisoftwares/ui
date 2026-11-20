"use client";

import * as React from "react";
import {
  Toast as ToastPrimitive,
  ToastAction as ToastActionPrimitive,
  ToastClose as ToastClosePrimitive,
  ToastDescription as ToastDescriptionPrimitive,
  ToastRegion as ToastRegionPrimitive,
  ToastTitle as ToastTitlePrimitive,
  createToaster as createSdkToaster,
  type ToastOptions,
  type ToastRegionProps,
  type Toaster as SdkToaster,
} from "@ui-sdk/react/toast";
import { cn } from "cn";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { useUiMessages } from "../../lib/i18n";
import { Button } from "./button";

type Content = React.ReactNode;

/** Options of `toast.add`: the library's long-standing shape, mapped onto ui-sdk's toast. */
interface ToastAddOptions {
  id?: string;
  title?: Content;
  description?: Content;
  type?:
    | "default"
    | "success"
    | "error"
    | "info"
    | "warning"
    | "loading"
    | (string & {});
  /** `high` is announced right away (assertive), `low` waits for a pause (polite). */
  priority?: "high" | "low";
  /** Milliseconds before it closes; `0` keeps it until dismissed. */
  timeout?: number;
  /** One short action (Undo, Try again). `children` is the label. */
  actionProps?: { children?: Content; onClick?: () => unknown; href?: string };
}

function toOptions(options: ToastAddOptions): ToastOptions<Content> {
  const { actionProps, priority, timeout, ...rest } = options;
  return {
    ...rest,
    ...(priority
      ? { priority: priority === "high" ? "assertive" : "polite" }
      : {}),
    ...(timeout !== undefined
      ? { duration: timeout === 0 ? Infinity : timeout }
      : {}),
    ...(actionProps
      ? {
          action: {
            label: actionProps.children,
            ...(actionProps.onClick ? { onAction: actionProps.onClick } : {}),
            ...(actionProps.href ? { href: actionProps.href } : {}),
          },
        }
      : {}),
  } as ToastOptions<Content>;
}

/**
 * A toast queue: callable and with the ui-sdk methods (`success`, `error`,
 * `promise`, `update`, `dismiss`...), plus `add` and `close` with the shape
 * this library has always had.
 */
type Toast_ = SdkToaster<Content> & {
  add: (options: ToastAddOptions) => string;
  close: (id?: string) => void;
};

function createToastManager(): Toast_ {
  const queue = createSdkToaster<Content>();
  return Object.assign(queue, {
    add: (options: ToastAddOptions) => queue(toOptions(options)),
    close: (id?: string) => queue.dismiss(id),
  });
}

const toast = createToastManager();

function ToastViewport({
  className,
  ...props
}: Omit<ToastRegionProps, "children"> & {
  children?: ToastRegionProps["children"];
}) {
  return (
    <ToastRegionPrimitive
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none m-4 h-(--toast-front-height) w-[min(24rem,calc(100vw-2rem))] transition-[height] duration-500 data-[expanded]:h-[calc(var(--toast-stack-height)+(var(--toast-count)-1)*0.75rem)]",
        className,
      )}
      {...props}
    />
  );
}

function Toast({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive>) {
  return (
    <ToastPrimitive
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute inset-x-0 bottom-0 z-[calc(100-var(--toast-index))] h-(--toast-height) list-none overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-lg outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--y:calc(var(--toast-index)*-0.75rem)] [scale:calc(1-var(--toast-index)*0.05)] [translate:var(--toast-swipe-x,0px)_calc(var(--y)+var(--toast-swipe-y,0px))]",
        "transition-[translate,scale,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-[opacity]",
        "[&:not([data-front],[data-expanded])]:h-(--toast-front-height)",
        "data-[expanded]:[--y:calc(-1*(var(--toast-offset)+var(--toast-index)*0.75rem))] data-[expanded]:[scale:1]",
        "data-[starting-style]:transition-none data-[starting-style]:data-[front]:[--y:100%] data-[swiping]:transition-none",
        "data-[ending-style]:opacity-0 data-[starting-style]:[&:not([data-front])]:opacity-0",
        "after:absolute after:top-full after:left-0 after:h-3 after:w-full after:content-['']",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-[:not([data-front],[data-expanded])]/toast:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastTitlePrimitive>) {
  return (
    <ToastTitlePrimitive
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastDescriptionPrimitive>) {
  return (
    <ToastDescriptionPrimitive
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: React.ComponentProps<typeof ToastActionPrimitive>) {
  return (
    <ToastActionPrimitive
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: React.ComponentProps<typeof ToastClosePrimitive>) {
  const messages = useUiMessages();
  return (
    <ToastClosePrimitive
      data-slot="toast-close"
      aria-label={messages.close}
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastClosePrimitive>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null;

  if (type === "success") {
    icon = <CircleCheckIcon aria-hidden="true" />;
  }

  if (type === "info") {
    icon = <InfoIcon aria-hidden="true" />;
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon aria-hidden="true" />;
  }

  if (type === "error") {
    icon = <OctagonXIcon className="text-destructive" aria-hidden="true" />;
  }

  if (type === "loading") {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />;
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  );
}

/** Shows `toast` (or the `toaster` queue passed). Preferences mounts it once. */
function Toaster({
  toaster = toast,
  children,
  ...props
}: Omit<ToastRegionProps, "children" | "toaster"> & {
  toaster?: ToastRegionProps["toaster"];
  children?: ToastRegionProps["children"];
}) {
  return (
    <ToastViewport toaster={toaster} {...props}>
      {children ??
        ((item) => (
          <Toast>
            <ToastContent>
              <ToastIcon type={item.type} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <ToastTitle />
                <ToastDescription />
              </div>
              <ToastAction />
              <ToastClose />
            </ToastContent>
          </Toast>
        ))}
    </ToastViewport>
  );
}

/** The message of an error or of anything thrown. */
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : String(error);
}

/** Shows a failure (anything thrown) as an error toast. */
function toastError(error: unknown, title?: string) {
  return toast.add({
    type: "error",
    priority: "high",
    ...(title ? { title } : {}),
    description: errorMessage(error),
  });
}

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  createToastManager,
  errorMessage,
  toast,
  toastError,
};
export type { ToastAddOptions };
