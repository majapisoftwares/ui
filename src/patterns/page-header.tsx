import type { ReactNode } from "react";
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="wb-page-header">
      <div>
        {eyebrow ? <div className="wb-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions}
    </section>
  );
}
export function MetricStrip({
  items,
}: {
  items: { label: string; value: ReactNode; note?: string }[];
}) {
  return (
    <section className="wb-metrics" aria-label="Resumo">
      {items.map((item) => (
        <div key={item.label}>
          <div className="wb-metric-label">{item.label}</div>
          <div className="wb-metric-value">{item.value}</div>
          {item.note ? <div className="wb-metric-note">{item.note}</div> : null}
        </div>
      ))}
    </section>
  );
}
