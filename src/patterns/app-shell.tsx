"use client";

import { Fragment, type MouseEvent, type ReactNode } from "react";
import { cn } from "cn";
import { ArrowLeftIcon } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  type SidebarMode,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { TooltipProvider } from "../components/ui/tooltip";
import { buttonVariants } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { useUiMessages } from "../lib/i18n";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  /** Native destination; preserves open-in-new-tab and modified clicks. */
  href?: string;
  /** Related views shown under the active tool. One level of contextual navigation. */
  children?: (Omit<NavigationItem, "children"> & { href: string })[];
}
export interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}

/** One step of the page's breadcrumb. */
export interface ShellBreadcrumb {
  /** `null` while the name loads (a skeleton shows in its place). */
  label: string | null;
  /**
   * A page above this one. Only real parents get an href: on phones the
   * nearest one becomes the header's back arrow. A group that only collects
   * sibling pages (the sidebar opens them) has none.
   */
  href?: string;
}

export interface AppShellProps {
  /** Square logo; stays in place in every sidebar mode. */
  logo: ReactNode;
  /** App name next to the logo; fades out when the sidebar is compact. */
  name: string;
  navigation: NavigationGroup[];
  activeId: string;
  onNavigate: (id: string) => void;
  /**
   * Where the page sits, the current page last. The shell owns the page's
   * navigation: from `md` up it shows the whole trail and no back button; on
   * phones it shows the current page, after a back arrow to the nearest
   * linked parent. Pages never add their own back buttons.
   */
  breadcrumbs?: ShellBreadcrumb[];
  /** Client-side navigation for breadcrumb links and the back arrow (e.g. `router.push`). Without it they are plain links. */
  onBreadcrumbNavigate?: (href: string) => void;
  /**
   * @deprecated Pass `breadcrumbs`: the shell draws them the same way in
   * every app. Rendered only when `breadcrumbs` is not set.
   */
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

const plainClick = (event: MouseEvent<HTMLElement>) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

function ShellBreadcrumbs({
  items,
  onNavigate,
}: {
  items: ShellBreadcrumb[];
  onNavigate?: (href: string) => void;
}) {
  const t = useUiMessages();
  const parent = items
    .slice(0, -1)
    .reverse()
    .find((item) => item.href);
  const follow = (href: string) => (event: MouseEvent<HTMLElement>) => {
    if (!onNavigate || !plainClick(event)) return;
    event.preventDefault();
    onNavigate(href);
  };
  const name = (item: ShellBreadcrumb) =>
    item.label ?? <Skeleton className="h-4 w-24" />;
  return (
    <div className="flex min-w-0 items-center gap-1">
      {/* Phones only: one way back, in place of the parents' links. A link
          (it navigates), styled as the ghost icon button. */}
      {parent?.href ? (
        <a
          href={parent.href}
          onClick={follow(parent.href)}
          aria-label={parent.label ? t.backTo(parent.label) : t.back}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "-ml-1.5 shrink-0 md:hidden",
          )}
        >
          <ArrowLeftIcon />
        </a>
      ) : null}
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <Fragment key={index}>
                {last ? (
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate">
                      {name(item)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  <>
                    <BreadcrumbItem className="hidden max-w-48 min-w-0 shrink-0 md:inline-flex">
                      {item.href ? (
                        <BreadcrumbLink
                          className="truncate"
                          href={item.href}
                          onClick={follow(item.href)}
                        >
                          {name(item)}
                        </BreadcrumbLink>
                      ) : (
                        <span className="truncate">{name(item)}</span>
                      )}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

function ShellNavigation({
  navigation,
  activeId,
  onNavigate,
}: Pick<AppShellProps, "navigation" | "activeId" | "onNavigate">) {
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = (id: string, event: MouseEvent<HTMLElement>) => {
    if (!plainClick(event)) return;
    event.preventDefault();
    onNavigate(id);
    if (isMobile) setOpenMobile(false);
  };
  return navigation.map((group, index) => (
    <SidebarGroup key={group.label ?? index}>
      {group.label ? (
        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      ) : null}
      <SidebarMenu>
        {group.items.map((item) => {
          const active =
            item.id === activeId ||
            Boolean(item.children?.some((child) => child.id === activeId));
          return (
            <SidebarMenuItem key={item.id}>
              <div className="relative">
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  aria-current={item.id === activeId ? "page" : undefined}
                  render={item.href ? <a href={item.href} /> : undefined}
                  onClick={(event) => navigate(item.id, event)}
                >
                  <ItemIcon item={item} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                {item.count !== undefined ? (
                  <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                ) : null}
              </div>
              {active && item.children?.length ? (
                <SidebarMenuSub aria-label={item.label}>
                  {item.children.map((child) => (
                    <SidebarMenuSubItem key={child.id}>
                      <SidebarMenuSubButton
                        href={child.href}
                        isActive={child.id === activeId}
                        aria-current={
                          child.id === activeId ? "page" : undefined
                        }
                        onClick={(event) => navigate(child.id, event)}
                      >
                        <span>{child.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  ));
}

export function AppShell({
  logo,
  name,
  navigation,
  activeId,
  onNavigate,
  breadcrumbs,
  onBreadcrumbNavigate,
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
          {/* Keep the mark anchored to the left while the sidebar width animates. */}
          <div className="flex h-14 shrink-0 items-center gap-2 px-2 overflow-hidden">
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
            <ShellNavigation
              navigation={navigation}
              activeId={activeId}
              onNavigate={onNavigate}
            />
          </SidebarContent>
          {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
          <SidebarRail />
        </Sidebar>
        <SidebarInset className={fillHeight ? "h-svh min-h-0" : undefined}>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6">
            <HeaderTrigger />
            <div className="min-w-0 flex-1">
              {breadcrumbs?.length ? (
                <ShellBreadcrumbs
                  items={breadcrumbs}
                  onNavigate={onBreadcrumbNavigate}
                />
              ) : (
                header
              )}
            </div>
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
