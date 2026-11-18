"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a screen current, so it never needs a refresh button: calls `refresh`
 * every `ms` while the page is visible, and right away when the person comes
 * back to it (focus or a visible tab). The first load stays with the caller.
 *
 * Return the load's promise (`useLiveRefresh(load)` or `() => load()`): while
 * it runs, the next ticks are skipped, so a slow server never gets the same
 * request piled up. A refresh that returns nothing runs on every tick.
 */
export function useLiveRefresh(refresh: () => unknown, ms = 5000) {
  const latest = useRef(refresh);
  useEffect(() => {
    latest.current = refresh;
  });
  useEffect(() => {
    let running = false;
    const run = () => {
      if (document.hidden || running) return;
      const result = latest.current();
      if (
        result &&
        typeof (result as PromiseLike<unknown>).then === "function"
      ) {
        running = true;
        Promise.resolve(result)
          .catch(() => undefined)
          .finally(() => {
            running = false;
          });
      }
    };
    const timer = setInterval(run, ms);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("focus", run);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("focus", run);
    };
  }, [ms]);
}
