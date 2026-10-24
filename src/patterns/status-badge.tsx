import type { ReactNode } from "react";
import { Badge } from "../components/ui/badge";
export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <Badge
      variant={
        tone === "danger"
          ? "destructive"
          : tone === "neutral"
            ? "outline"
            : tone
      }
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </Badge>
  );
}
