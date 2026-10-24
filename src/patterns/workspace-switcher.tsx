"use client";

import type { ReactNode } from "react";
import { cn } from "cn";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../components/ui/sidebar";
import { Skeleton } from "../components/ui/skeleton";
import { defineMessages, useMessages } from "../lib/i18n";

const messages = defineMessages({
  en: { switchWorkspace: "Switch workspace", workspaces: "Workspaces" },
  "pt-BR": { switchWorkspace: "Trocar workspace", workspaces: "Workspaces" },
});

export interface Workspace {
  id: string;
  name: string;
  /** Second line, e.g. plan or owner. */
  description?: string;
  /** Square mark; defaults to the name's initial. */
  icon?: ReactNode;
  /** Workspaces sharing a group are listed together (e.g. by company). */
  group?: string;
}

function WorkspaceMark({
  workspace,
  className,
}: {
  workspace: Workspace;
  className?: string;
}) {
  return (
    <span
      className={cn(
        // Forced: focused menu items recolor all descendants to the accent color.
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground **:text-primary-foreground! [&_svg]:size-4",
        className,
      )}
    >
      {workspace.icon ?? (
        <span className="text-sm font-semibold">
          {workspace.name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}

/**
 * Sidebar workspace selector (place it in `AppShell` `sidebarHeader`).
 * Selecting a workspace calls `onSelect`; routing and data stay in the app.
 */
export function WorkspaceSwitcher({
  workspaces,
  activeId,
  onSelect,
  actions,
  loading = false,
}: {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (workspace: Workspace) => void;
  /** Extra menu items after the list, e.g. "Manage workspaces". */
  actions?: ReactNode;
  loading?: boolean;
}) {
  const t = useMessages(messages);
  const { isMobile } = useSidebar();
  const active = workspaces.find((workspace) => workspace.id === activeId);
  const groups = workspaces.reduce<Map<string, Workspace[]>>(
    (map, workspace) => {
      const key = workspace.group ?? "";
      map.set(key, [...(map.get(key) ?? []), workspace]);
      return map;
    },
    new Map(),
  );

  if (loading || !active)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex h-14 items-center gap-2 px-3 group-data-[collapsible=icon]:px-0">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 flex-1 group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={t.switchWorkspace}
                // Card-like surface so the current workspace reads as a distinct control.
                className="bg-card shadow-xs ring-1 ring-foreground/5 hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground dark:ring-foreground/10"
              />
            }
          >
            <WorkspaceMark
              workspace={active}
              className="transition-opacity group-data-[collapsible=icon]:group-hover/menu-button:opacity-70 group-data-[collapsible=icon]:group-data-popup-open/menu-button:opacity-70"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{active.name}</span>
              {active.description ? (
                <span className="truncate text-xs text-muted-foreground">
                  {active.description}
                </span>
              ) : null}
            </div>
            <ChevronsUpDownIcon className="ml-auto text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-60"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {[...groups.entries()].map(([group, items], index) => (
              <DropdownMenuGroup key={group || index}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuLabel>{group || t.workspaces}</DropdownMenuLabel>
                {items.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => onSelect(workspace)}
                  >
                    <WorkspaceMark workspace={workspace} className="size-6" />
                    <div className="grid flex-1 leading-tight">
                      <span className="truncate">{workspace.name}</span>
                      {workspace.description ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {workspace.description}
                        </span>
                      ) : null}
                    </div>
                    {workspace.id === activeId ? (
                      <CheckIcon className="ml-auto" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ))}
            {actions ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>{actions}</DropdownMenuGroup>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
