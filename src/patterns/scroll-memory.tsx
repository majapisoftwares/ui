"use client";

import { useEffect } from "react";

const positions = new Map<string, number>();
const key = () => location.pathname + location.search;
/** The page being returned to (Back/Forward) and where it was; null for a normal visit, which opens at the top. */
let returning: { key: string; y: number } | null = null;

/**
 * Pass the router's current pathname. Remembers where each page was scrolled and puts it back on Back/Forward. A page that loads its content after
 * mounting is short at first, and the browser would clamp the position to the top, so the position is applied
 * again while the page grows, until the reader scrolls on their own.
 */
export function ScrollMemory({ pathname }: { pathname: string }) {
  useEffect(() => {
    const onScroll = () => {
      // While a page is being restored, the intermediate positions are not the reader's.
      if (!returning) positions.set(key(), window.scrollY);
    };
    const onPop = () => {
      const target = key();
      returning = positions.has(target)
        ? { key: target, y: positions.get(target)! }
        : null;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    const target = returning;
    returning = null;
    if (!target || target.key !== key()) return;
    let done = false;
    const stop = () => {
      done = true;
      cleanup();
    };
    const apply = () => {
      if (done) return;
      window.scrollTo(0, target.y);
      if (Math.abs(window.scrollY - target.y) < 2) stop();
    };
    const observer = new ResizeObserver(apply);
    observer.observe(document.body);
    const timer = window.setTimeout(stop, 3000);
    const cleanup = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      for (const event of ["wheel", "touchstart", "keydown"])
        window.removeEventListener(event, stop);
    };
    for (const event of ["wheel", "touchstart", "keydown"])
      window.addEventListener(event, stop, { passive: true });
    apply();
    return stop;
  }, [pathname]);

  return null;
}
