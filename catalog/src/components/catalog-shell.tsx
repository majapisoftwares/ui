"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BotIcon,
  BoxesIcon,
  LayoutDashboardIcon,
  TableIcon,
} from "lucide-react";
import { AppShell } from "@majapisoftwares/ui/patterns/app-shell";
import { MajapiLogo } from "@majapisoftwares/ui/patterns/majapi-logo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
  chat: "/chat",
  newChat: "/chat/new",
  login: "/login",
  signup: "/signup",
} as const;
type RouteId = keyof typeof routes;
type ShellRouteId = "dashboard" | "components" | "patterns" | "chat" | "newChat";

export function CatalogShell({ children }: { children: ReactNode }) {
  const t = useMessages(messages);
  const router = useRouter();
  const pathname = usePathname();
  const activeId = ((Object.keys(routes) as RouteId[]).find(
    (id) => routes[id] === pathname,
  ) ?? "dashboard") as ShellRouteId;
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
              children: [
                { id: "login", label: t.login, href: routes.login },
                { id: "signup", label: t.signup, href: routes.signup },
              ],
            },
            {
              id: "chat",
              label: t.chat,
              icon: <BotIcon />,
              children: [
                { id: "newChat", label: t.newChat, href: routes.newChat },
              ],
            },
          ],
        },
      ]}
      header={
        <Breadcrumb>
          <BreadcrumbList>
            {activeId === "newChat" ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={routes.chat}>{t.chat}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : null}
            <BreadcrumbItem>
              <BreadcrumbPage>{t[activeId]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={<PreferenceControls />}
      sidebarHeader={<ExampleWorkspaceSwitcher />}
      footer={<ExampleUserMenu />}
      // The dashboard (table) and the chat fill the screen and scroll inside.
      fillHeight={
        activeId === "dashboard" || activeId === "chat" || activeId === "newChat"
      }
    >
      {children}
    </AppShell>
  );
}
