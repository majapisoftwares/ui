import { Badge } from "../components/ui/badge";
export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <Badge
      variant={
        tone === "danger"
          ? "destructive"
          : tone === "neutral"
            ? "secondary"
            : tone
      }
    >
      <span className="wb-status-dot" aria-hidden="true" />
      {children}
    </Badge>
  );
}
