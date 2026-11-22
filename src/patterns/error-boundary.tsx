"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { toast } from "../components/ui/toast";
import { defineMessages, useMessages } from "../lib/i18n";

const messages = defineMessages({
  en: { failed: "Something went wrong" },
  "pt-BR": { failed: "Algo deu errado" },
});

function keysChanged(a?: readonly unknown[], b?: readonly unknown[]) {
  if (a === b) return false;
  if (!a || !b || a.length !== b.length) return true;
  return a.some((value, index) => !Object.is(value, b[index]));
}

export interface ErrorBoundaryProps {
  /** Names the isolated part, for the report (`board.card`). */
  name: string;
  /** Changing any of these recovers the part automatically. */
  resetKeys?: readonly unknown[];
  /** What takes the failed part's place; nothing by default. */
  fallback?: ReactNode | ((reset: () => void) => ReactNode);
  /** Called with the failure, to report it. */
  onError?: (
    error: Error,
    info: { name: string; componentStack?: string },
  ) => void;
  /** Skips the toast. */
  silent?: boolean;
  /** Overrides the toast title. */
  title?: string;
  children: ReactNode;
}

interface InnerProps extends ErrorBoundaryProps {
  title: string;
}

class Boundary extends Component<InnerProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, {
      name: this.props.name,
      componentStack: info.componentStack ?? undefined,
    });
    if (!this.props.silent)
      toast.add({
        id: `error-boundary:${this.props.name}`,
        type: "error",
        priority: "high",
        title: this.props.title,
      });
  }

  componentDidUpdate(previous: InnerProps) {
    if (
      this.state.failed &&
      keysChanged(previous.resetKeys, this.props.resetKeys)
    )
      this.setState({ failed: false });
  }

  reset = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    const { fallback } = this.props;
    return typeof fallback === "function"
      ? fallback(this.reset)
      : (fallback ?? null);
  }
}

/**
 * Isolates a render failure to one part of the screen (a message, a card, a
 * panel): the rest stays usable and the failure shows as a toast, never as
 * text on the page.
 */
export function ErrorBoundary({ title, ...props }: ErrorBoundaryProps) {
  const t = useMessages(messages);
  return <Boundary {...props} title={title ?? t.failed} />;
}
