"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";

const INTERVAL_MS = 24;
const MIN_DURATION_MS = 480;
const MAX_DURATION_MS = 2400;
const MS_PER_CHARACTER = 6;

export interface UseStreamedTextOptions {
  /** Reveals the text progressively. When false the full text is returned. */
  enabled: boolean;
  /** Called once the whole text is visible. */
  onComplete?: () => void;
}

/**
 * Reveals a complete reply progressively, for backends that return the whole
 * message at once (from Numa). Short replies take ~0.5s and long ones at most
 * ~2.4s. Respects prefers-reduced-motion by showing the text immediately.
 */
export function useStreamedText(
  text: string,
  { enabled, onComplete }: UseStreamedTextOptions,
) {
  const characters = useMemo(() => Array.from(text), [text]);
  const [state, setState] = useState(() => ({
    text,
    visible: enabled ? Math.min(1, characters.length) : characters.length,
  }));
  const complete = useEffectEvent(() => onComplete?.());
  // A new text restarts the reveal.
  const visible = state.text === text ? state.visible : enabled ? 0 : characters.length;

  useEffect(() => {
    if (!enabled) return;
    const total = characters.length;
    if (total <= 1 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timeout = setTimeout(() => {
        setState({ text, visible: total });
        complete();
      }, 0);
      return () => clearTimeout(timeout);
    }
    const duration = Math.min(
      MAX_DURATION_MS,
      Math.max(MIN_DURATION_MS, total * MS_PER_CHARACTER),
    );
    const step = Math.max(1, Math.ceil(total / Math.ceil(duration / INTERVAL_MS)));
    let next = Math.min(1, total);
    const interval = setInterval(() => {
      next = Math.min(total, next + step);
      setState({ text, visible: next });
      if (next === total) {
        clearInterval(interval);
        complete();
      }
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [characters, enabled, text]);

  if (!enabled) return text;
  return characters.slice(0, visible).join("");
}
