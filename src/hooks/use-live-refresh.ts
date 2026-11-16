"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a screen current, so it never needs a refresh button: calls `refresh`
 * every `ms` while the page is visible, and right away when the person comes
 * back to it (focus or a visible tab). The first load stays with the caller.
 */
export function useLiveRefresh(refresh: () => void, ms = 5000) {
  const latest = useRef(refresh);
  useEffect(() => {
    latest.current = refresh;
  });
  useEffect(() => {
    const run = () => {
      if (!document.hidden) latest.current();
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
