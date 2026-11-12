"use client";

import { Orb } from "./orb";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { toast as manager } from "./toast";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
} from "lucide-react";

// Theme comes from the caller (Preferences passes the active theme).
/** @deprecated Notifications are the shadcn toast: Preferences mounts its `Toaster` from `components/toast`. */
const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Orb size={16} />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
type Message = React.ReactNode;
interface LegacyOptions {
  description?: React.ReactNode;
  duration?: number;
  id?: string | number;
  action?: { label: React.ReactNode; onClick: () => void };
}

const legacy = (type: string | undefined, message: Message, options?: LegacyOptions) =>
  manager.add({
    ...(type ? { type } : {}),
    ...(type === "error" ? { priority: "high" as const } : {}),
    // A message with a description reads as a title over it, as in sonner.
    ...(options?.description ? { title: message, description: options.description } : { description: message }),
    ...(options?.duration !== undefined ? { timeout: options.duration } : {}),
    ...(options?.id !== undefined ? { id: String(options.id) } : {}),
    ...(options?.action ? { actionProps: { children: options.action.label, onClick: options.action.onClick } } : {}),
  });

/**
 * @deprecated Use `toast.add(...)` and `toastError(error)` from `components/toast`
 * (the shadcn toast). These calls already show as that toast.
 */
const toast = Object.assign((message: Message, options?: LegacyOptions) => legacy(undefined, message, options), {
  message: (message: Message, options?: LegacyOptions) => legacy(undefined, message, options),
  success: (message: Message, options?: LegacyOptions) => legacy("success", message, options),
  info: (message: Message, options?: LegacyOptions) => legacy("info", message, options),
  warning: (message: Message, options?: LegacyOptions) => legacy("warning", message, options),
  error: (message: Message, options?: LegacyOptions) => legacy("error", message, options),
  loading: (message: Message, options?: LegacyOptions) => legacy("loading", message, options),
  dismiss: (id?: string | number) => manager.close(id === undefined ? undefined : String(id)),
});

export { toast };
