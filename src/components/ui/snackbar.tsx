"use client";

import type { ReactNode } from "react";
import { errorMessage, toast, toastError } from "./toast";

/**
 * @deprecated Notifications are the shadcn toast: `toast.add({ description })`
 * and `toastError(error)` from `components/toast`. These forward to it.
 */

export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

/** @deprecated Use `toast.add` options from `components/toast`. */
export interface SnackbarOptions {
  action?: SnackbarAction;
  duration?: number;
  id?: string | number;
}

const options = (value: SnackbarOptions | undefined) => ({
  ...(value?.duration !== undefined ? { timeout: value.duration } : {}),
  ...(value?.id !== undefined ? { id: String(value.id) } : {}),
  ...(value?.action ? { actionProps: { children: value.action.label, onClick: value.action.onClick } } : {}),
});

/** @deprecated Use `toast.add({ description })` from `components/toast`. */
function show(message: ReactNode, value?: SnackbarOptions) {
  return toast.add({ description: message, ...options(value) });
}

/** @deprecated Use `toast` and `toastError` from `components/toast`. */
export const snackbar = Object.assign(show, {
  /** @deprecated Use `toastError(error)` from `components/toast`. */
  error(message: unknown, value?: SnackbarOptions) {
    return value ? toast.add({ type: "error", priority: "high", description: errorMessage(message), ...options(value) }) : toastError(message);
  },
  /** @deprecated Use `toast.close(id)` from `components/toast`. */
  dismiss(id?: string | number) {
    toast.close(id === undefined ? undefined : String(id));
  },
});

export { errorMessage };

/** @deprecated Preferences mounts the toast `Toaster`; this renders nothing. */
export function Snackbar(props: { theme?: string }) {
  void props;
  return null;
}
