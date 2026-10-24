import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export interface Metric {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  note?: ReactNode;
}
export function MetricStrip({ items }: { items: Metric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {item.value}
            </CardTitle>
            {item.badge ? <CardAction>{item.badge}</CardAction> : null}
          </CardHeader>
          {item.note ? (
            <CardFooter className="text-sm text-muted-foreground">
              {item.note}
            </CardFooter>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
