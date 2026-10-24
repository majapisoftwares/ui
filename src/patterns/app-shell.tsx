import type { ReactNode } from "react";
import { Button } from "../components/ui/button";

export interface NavigationItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}
export function AppShell({
  title,
  context,
  navigation,
  activeId,
  onNavigate,
  children,
  footer = "Workspace local",
  brand = "workbench",
  brandMark = "w.",
}: {
  title: string;
  context?: ReactNode;
  navigation: NavigationItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
  footer?: ReactNode;
  brand?: string;
  brandMark?: ReactNode;
}) {
  return (
    <div className="wb-shell">
      <aside className="wb-sidebar">
        <div className="wb-brand">
          <span>{brandMark}</span>
          {brand}
        </div>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <Button
              key={item.id}
              variant="navigation"
              data-active={activeId === item.id}
              aria-current={activeId === item.id ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon}
              {item.label}
              {item.count !== undefined ? (
                <span className="ml-auto">{item.count}</span>
              ) : null}
            </Button>
          ))}
        </nav>
        <div className="wb-sidebar-footer">{footer}</div>
      </aside>
      <div className="min-w-0">
        <header className="wb-topbar">
          <span>
            {brand} / {title}
          </span>
          {context}
        </header>
        <main className="wb-main">{children}</main>
      </div>
    </div>
  );
}
