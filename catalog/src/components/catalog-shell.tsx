"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BoxesIcon,
  LayoutDashboardIcon,
  LogInIcon,
  TableIcon,
  UserPlusIcon,
} from "lucide-react";
import { AppShell } from "@majapisoftwares/ui/patterns/app-shell";
import { MajapiLogo } from "@majapisoftwares/ui/patterns/majapi-logo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@majapisoftwares/ui/components/breadcrumb";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import {
  PreferenceControls,
  useDocumentTitle,
} from "@majapisoftwares/ui/patterns/preferences";
import { messages } from "@/messages";
import {
  ExampleUserMenu,
  ExampleWorkspaceSwitcher,
} from "@/components/sidebar-examples";

const routes = {
  dashboard: "/",
  components: "/components",
  patterns: "/patterns",
  login: "/login",
  signup: "/signup",
} as const;
type RouteId = keyof typeof routes;

export function CatalogShell({ children }: { children: ReactNode }) {
  const t = useMessages(messages);
  const router = useRouter();
  const pathname = usePathname();
  const activeId = ((Object.keys(routes) as RouteId[]).find(
    (id) => routes[id] === pathname,
  ) ?? "dashboard") as "dashboard" | "components" | "patterns";
  useDocumentTitle(
    activeId === "dashboard" ? "Majapi UI" : `${t[activeId]} · Majapi UI`,
  );

  return (
    <AppShell
      logo={<MajapiLogo variant="mark" className="h-5" />}
      name="Majapi UI"
      activeId={activeId}
      onNavigate={(id) => router.push(routes[id as RouteId])}
      navigation={[
        {
          items: [
            {
              id: "dashboard",
              label: t.dashboard,
              icon: <LayoutDashboardIcon />,
            },
            { id: "components", label: t.components, icon: <BoxesIcon /> },
            {
              id: "patterns",
              label: t.patterns,
              icon: <TableIcon />,
              // Number of table states demonstrated on the page.
              count: 8,
            },
          ],
        },
        {
          label: t.templates,
          items: [
            { id: "login", label: t.login, icon: <LogInIcon /> },
            { id: "signup", label: t.signup, icon: <UserPlusIcon /> },
          ],
        },
      ]}
      header={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{t[activeId]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={<PreferenceControls />}
      sidebarHeader={<ExampleWorkspaceSwitcher />}
      footer={<ExampleUserMenu />}
      // The dashboard demonstrates a table that fills the screen.
      fillHeight={activeId === "dashboard"}
    >
      {children}
    </AppShell>
  );
}
