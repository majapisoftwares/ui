"use client";

import { isValidElement, type CSSProperties, type ReactNode } from "react";
import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";
import { Orb } from "./orb";

/**
 * Snackbar: the only way apps notify people, for information and for errors.
 * One message at a time, at the bottom center, on the inverse surface, with
 * an optional action. Errors stay on screen longer and carry an icon; field
 * validation stays next to its field.
 *
 * Mount `<Snackbar />` once (Preferences does) and call `snackbar(message)`
 * or `snackbar.error(message)` from anywhere on the client.
 */

export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

export interface SnackbarOptions {
  /** One short action, such as Undo or Retry. */
  action?: SnackbarAction;
  /** Milliseconds on screen; info 4 s and errors 8 s by default. */
  duration?: number;
  /** Replaces the snackbar with the same id instead of queueing another. */
  id?: string | number;
}

const INFO_MS = 4000;
const ERROR_MS = 8000;

const options = (value: SnackbarOptions | undefined, duration: number) => ({
  duration: value?.duration ?? duration,
  ...(value?.id !== undefined ? { id: value.id } : {}),
  ...(value?.action ? { action: { label: value.action.label, onClick: value.action.onClick } } : {}),
});

/** A message that something happened or needs attention. */
function show(message: ReactNode, value?: SnackbarOptions) {
  return toast(message, options(value, INFO_MS));
}

/** The message of an error or of anything thrown. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : String(error);
}

export const snackbar = Object.assign(show, {
  /** Something failed: the reason, as the person can act on it. Accepts a thrown value. */
  error(message: unknown, value?: SnackbarOptions) {
    const text: ReactNode = typeof message === "string" || isValidElement(message) ? message : errorMessage(message);
    return toast.error(text, options(value, ERROR_MS));
  },
  /** Removes one snackbar, or all of them. */
  dismiss(id?: string | number) {
    return toast.dismiss(id);
  },
});

/** The snackbar host. Theme comes from the caller (Preferences passes the active theme). */
export function Snackbar({ theme = "system", ...props }: ToasterProps) {
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      visibleToasts={1}
      offset={24}
      mobileOffset={16}
      className="snackbar group"
      icons={{
        success: null,
        info: null,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <CircleAlertIcon className="size-4 text-destructive" />,
        loading: <Orb size={16} />,
      }}
      style={{ "--width": "min(36rem, calc(100vw - 2rem))" } as CSSProperties}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "cn-snackbar flex w-(--width) items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-lg data-[type=error]:pr-3",
          content: "min-w-0 flex-1",
          title: "leading-5 break-words",
          description: "text-background/70",
          icon: "flex shrink-0 items-center",
          actionButton:
            "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-background underline-offset-4 hover:bg-background/10 focus-visible:outline-2 focus-visible:outline-background",
          cancelButton: "shrink-0 rounded-full px-3 py-1.5 text-sm text-background/70 hover:bg-background/10",
          closeButton: "hidden",
        },
      }}
      {...props}
    />
  );
}
