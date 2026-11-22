"use client";

import type { KeyboardEvent, ReactNode } from "react";

/** True when the primary pointer is touch (a phone or tablet). */
export const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

/**
 * On touch devices Enter inserts a newline and sending is the button's job.
 * The capture handler stops Enter before the composer sees it and leaves the
 * default, so the textarea keeps its newline. Wrap a `PromptInput` with it.
 */
export function MobileEnterNewline({ children }: { children: ReactNode }) {
  const onKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (!(event.target instanceof HTMLTextAreaElement)) return;
    if (isCoarsePointer()) event.stopPropagation();
  };
  return (
    <div className="contents" onKeyDownCapture={onKeyDownCapture}>
      {children}
    </div>
  );
}
