import type { ReactNode } from "react";
export function AuthLayout({
  children,
  brand = "workbench",
  brandMark = "w.",
  title,
  description,
  aside,
  footer,
}: {
  children: ReactNode;
  brand?: string;
  brandMark?: ReactNode;
  title: string;
  description: string;
  aside?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="wb-auth">
      <section className="wb-auth-intro">
        <div className="wb-brand">
          <span>{brandMark}</span>
          {brand}
        </div>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {aside}
        <footer>{footer}</footer>
      </section>
      <section className="wb-auth-panel">{children}</section>
    </main>
  );
}
