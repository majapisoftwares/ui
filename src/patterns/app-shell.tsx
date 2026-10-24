"use client";

import type { ReactNode } from "react";
import { cn } from "cn";
import {
  Sidebar,
  SidebarCollapse,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  type SidebarMode,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { TooltipProvider } from "../components/ui/tooltip";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}
export interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}

export interface AppShellProps {
  /** Square logo; stays in place in every sidebar mode. */
  logo: ReactNode;
  /** App name next to the logo; fades out when the sidebar is compact. */
  name: string;
  navigation: NavigationGroup[];
  activeId: string;
  onNavigate: (id: string) => void;
  /** Rendered in the header next to the sidebar trigger, e.g. breadcrumbs. */
  header?: ReactNode;
  /** Rendered at the end of the header, e.g. locale or theme switchers. */
  actions?: ReactNode;
  /** Below the logo in the sidebar header, e.g. `WorkspaceSwitcher`. */
  sidebarHeader?: ReactNode;
  /** Sidebar footer, e.g. `UserMenu`. */
  footer?: ReactNode;
  defaultMode?: SidebarMode;
  defaultWidth?: number;
  /**
   * Locks the shell to the viewport height so content (e.g. a `DataTable
   * fillHeight`) fills the remaining space and scrolls internally.
   */
  fillHeight?: boolean;
  children: ReactNode;
}

// Items without an icon still need something to show in compact mode.
function ItemIcon({ item }: { item: NavigationItem }) {
  return (
    item.icon ?? (
      <span
        aria-hidden="true"
        className="flex size-4 items-center justify-center text-xs font-semibold"
      >
        {item.label.charAt(0).toUpperCase()}
      </span>
    )
  );
}

// The collapse control lives inside the sidebar; reopening needs one outside.
// Shown on mobile and, on desktop, only while the sidebar is hidden (CSS, so
// it is right from the first paint).
function HeaderTrigger() {
  return (
    <div className="flex items-center md:hidden md:group-has-data-[collapsible=offcanvas]/sidebar-wrapper:flex">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 ml-2 h-4 self-center!"
      />
    </div>
  );
}

export function AppShell({
  logo,
  name,
  navigation,
  activeId,
  onNavigate,
  header,
  actions,
  footer,
  sidebarHeader,
  defaultMode,
  defaultWidth,
  fillHeight = false,
  children,
}: AppShellProps) {
  return (
    <TooltipProvider delay={600}>
      <SidebarProvider defaultMode={defaultMode} defaultWidth={defaultWidth}>
        <Sidebar>
          {/* Top row: fixed h-14 to match the page header with identical vertical alignment in all apps */}
          <div className="flex h-14 shrink-0 items-center gap-2 px-2 overflow-hidden group-data-[collapsible=icon]:justify-center">
            <div className="flex size-8 shrink-0 items-center justify-center [&>*]:shrink-0">
              {logo}
            </div>
            <span className="flex-1 truncate font-semibold whitespace-nowrap transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:hidden">
              {name}
            </span>
            <SidebarCollapse className="group-data-[collapsible=icon]:hidden" />
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex justify-center pb-2">
            <SidebarCollapse />
          </div>
          {sidebarHeader ? (
            <div className="p-2 pt-0">{sidebarHeader}</div>
          ) : null}
          <SidebarContent>
            {navigation.map((group, index) => (
              <SidebarGroup key={group.label ?? index}>
                {group.label ? (
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                ) : null}
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={item.id === activeId}
                        tooltip={item.label}
                        aria-current={item.id === activeId ? "page" : undefined}
                        onClick={() => onNavigate(item.id)}
                      >
                        <ItemIcon item={item} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.count !== undefined ? (
                        <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>
          {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
          <SidebarRail />
        </Sidebar>
        <SidebarInset className={fillHeight ? "h-svh min-h-0" : undefined}>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6">
            <HeaderTrigger />
            <div className="min-w-0 flex-1">{header}</div>
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}
          </header>
          <div
            className={cn(
              "flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6",
              fillHeight && "min-h-0 overflow-hidden",
            )}
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
