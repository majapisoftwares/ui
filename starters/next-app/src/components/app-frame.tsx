"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboardIcon, LogInIcon, UserPlusIcon } from "lucide-react";
import { AppShell } from "@majapisoftwares/ui/patterns/app-shell";
import { MajapiLogo } from "@majapisoftwares/ui/patterns/majapi-logo";
import {
  PreferenceControls,
  useDocumentTitle,
} from "@majapisoftwares/ui/patterns/preferences";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@majapisoftwares/ui/components/breadcrumb";
import { useMessages } from "@majapisoftwares/ui/lib/i18n";
import { appName } from "@/lib/app";
import { messages } from "@/messages";

const routes = { dashboard: "/", login: "/login", signup: "/signup" } as const;
type RouteId = keyof typeof routes;

export function AppFrame({ children }: { children: ReactNode }) {
  const t = useMessages(messages);
  const router = useRouter();
  const pathname = usePathname();
  const activeId =
    (Object.keys(routes) as RouteId[]).find((id) => routes[id] === pathname) ??
    "dashboard";
  useDocumentTitle(
    activeId === "dashboard" ? appName : `${t[activeId]} · ${appName}`,
  );

  return (
    <AppShell
      logo={<MajapiLogo variant="mark" className="h-5" />}
      name={appName}
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
          ],
        },
        {
          label: t.account,
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
    >
      {children}
    </AppShell>
  );
}
