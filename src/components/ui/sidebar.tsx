"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { useIsMobile } from "../../hooks/use-mobile";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import {
  PanelLeftCloseIcon,
  PanelLeftIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import { useUiMessages } from "../../lib/i18n";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const SIDEBAR_WIDTH = 256;
const SIDEBAR_WIDTH_MIN = 208;
const SIDEBAR_WIDTH_MAX = 448;
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
// Drag thresholds (px from the sidebar's edge) that switch modes while resizing.
const SIDEBAR_CLOSE_BELOW = 24;
const SIDEBAR_COMPACT_BELOW = 152;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export type SidebarMode = "open" | "compact" | "closed";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  width: number;
  setWidth: (width: number) => void;
  resizing: boolean;
  setResizing: (resizing: boolean) => void;
  resizeTo: (offset: number) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  toggleCompact: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const clampWidth = (width: number) =>
  Math.round(Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, width)));

/**
 * Applies the saved sidebar state to the server-rendered markup before the
 * browser paints (static pages can't read the cookie on the server).
 */
function SidebarRestoreScript() {
  const script = `(function(){try{var m=document.cookie.match(/(?:^|; )${SIDEBAR_COOKIE_NAME}=([^;]*)/);if(!m)return;var p=m[1].split(":"),mode=p[0],w=Number(p[1]),wrap=document.currentScript.parentElement;if(w)wrap.setAttribute("style",(wrap.getAttribute("style")||"").replace(/--sidebar-width:[^;]*/,"--sidebar-width:"+Math.round(Math.min(${SIDEBAR_WIDTH_MAX},Math.max(${SIDEBAR_WIDTH_MIN},w)))+"px"));var sb=wrap.querySelector('[data-slot="sidebar"]');var r=wrap.querySelector('[data-slot="sidebar-rail"]');if(r)r.setAttribute("aria-valuenow",String(mode==="compact"?48:mode==="closed"?0:Math.round(Math.min(${SIDEBAR_WIDTH_MAX},Math.max(${SIDEBAR_WIDTH_MIN},w||${SIDEBAR_WIDTH})))));if(sb&&(mode==="compact"||mode==="closed")){sb.setAttribute("data-state","collapsed");sb.setAttribute("data-collapsible",mode==="closed"?"offcanvas":"icon")}}catch(e){}})()`;
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}

/** Reads the persisted `mode:width` cookie, e.g. on the server via `cookies()`. */
function parseSidebarCookie(value: string | undefined) {
  const [mode, width] = (value ?? "").split(":");
  return {
    mode: (["open", "compact", "closed"].includes(mode) ? mode : undefined) as
      SidebarMode | undefined,
    width: Number(width) ? clampWidth(Number(width)) : undefined,
  };
}

function readSidebarCookie() {
  if (typeof document === "undefined") return parseSidebarCookie(undefined);
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SIDEBAR_COOKIE_NAME}=([^;]*)`),
  );
  return parseSidebarCookie(match?.[1]);
}

function SidebarProvider({
  defaultMode,
  defaultWidth,
  mode: modeProp,
  onModeChange,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultMode?: SidebarMode;
  defaultWidth?: number;
  mode?: SidebarMode;
  onModeChange?: (mode: SidebarMode) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  // Server/static HTML renders the defaults; SidebarRestoreScript patches that
  // markup to the saved state before paint, and the client starts from the
  // same saved state so hydration matches and nothing jumps.
  const [initial] = React.useState(() =>
    defaultMode !== undefined || defaultWidth !== undefined
      ? parseSidebarCookie(undefined)
      : readSidebarCookie(),
  );
  const [_mode, _setMode] = React.useState<SidebarMode>(
    defaultMode ?? initial.mode ?? "open",
  );
  const [width, _setWidth] = React.useState(
    clampWidth(defaultWidth ?? initial.width ?? SIDEBAR_WIDTH),
  );
  const [resizing, setResizing] = React.useState(false);
  const mode = modeProp ?? _mode;
  // Mode to restore when a closed sidebar is shown again.
  const lastVisible = React.useRef<SidebarMode>(
    mode === "closed" ? "open" : mode,
  );

  React.useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${mode}:${width}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [mode, width]);

  const setMode = React.useCallback(
    (next: SidebarMode) => {
      if (next !== "closed") lastVisible.current = next;
      if (onModeChange) onModeChange(next);
      else _setMode(next);
    },
    [onModeChange],
  );
  const setWidth = React.useCallback(
    (next: number) => _setWidth(clampWidth(next)),
    [],
  );

  // Maps a dragged width to a mode: tiny closes, narrow shows icons, wide opens.
  const resizeTo = React.useCallback(
    (offset: number) => {
      if (offset < SIDEBAR_CLOSE_BELOW) setMode("closed");
      else if (offset < SIDEBAR_COMPACT_BELOW) setMode("compact");
      else {
        setMode("open");
        setWidth(offset);
      }
    },
    [setMode, setWidth],
  );

  const open = mode === "open";
  const setOpen = React.useCallback(
    (value: boolean) => setMode(value ? "open" : "compact"),
    [setMode],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) return setOpenMobile((value) => !value);
    setMode(mode === "closed" ? lastVisible.current : "closed");
  }, [isMobile, mode, setMode]);

  const toggleCompact = React.useCallback(() => {
    if (isMobile) return setOpenMobile(false);
    setMode(mode === "open" ? "compact" : "open");
  }, [isMobile, mode, setMode]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      mode,
      setMode,
      width,
      setWidth,
      resizing,
      setResizing,
      resizeTo,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      toggleCompact,
    }),
    [
      state,
      mode,
      setMode,
      width,
      setWidth,
      resizing,
      resizeTo,
      open,
      setOpen,
      isMobile,
      openMobile,
      toggleSidebar,
      toggleCompact,
    ],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        data-resizing={resizing || undefined}
        style={
          {
            "--sidebar-width": `${width}px`,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar data-resizing:cursor-col-resize data-resizing:select-none",
          className,
        )}
        {...props}
      >
        {children}
        {defaultMode === undefined && defaultWidth === undefined ? (
          <SidebarRestoreScript />
        ) : null}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "auto",
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  /** `auto` follows the provider mode: compact shows icons, closed hides. */
  collapsible?: "auto" | "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, mode, openMobile, setOpenMobile } = useSidebar();
  const messages = useUiMessages();
  const collapsedAs =
    collapsible === "auto"
      ? mode === "closed"
        ? "offcanvas"
        : "icon"
      : collapsible;

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{messages.sidebar}</SheetTitle>
            <SheetDescription>{messages.sidebar}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsedAs : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-resizing/sidebar-wrapper:transition-none",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear group-data-resizing/sidebar-wrapper:transition-none data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-2xl group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad)/.test(navigator.platform);

/**
 * Wraps a sidebar control with a tooltip (label + shortcut hint) and a
 * right-click menu to pick the mode directly: expanded, compact or hidden.
 */
function SidebarModeControl({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement;
}) {
  const { mode, setMode, isMobile } = useSidebar();
  const messages = useUiMessages();
  const shortcut = `${isMac() ? "⌘" : "Ctrl+"}${SIDEBAR_KEYBOARD_SHORTCUT.toUpperCase()}`;
  // Clicking changes the sidebar size and moves this control, so the tooltip
  // closes on press and stays closed until the pointer leaves.
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  const suppressed = React.useRef(false);

  if (isMobile) return children;

  return (
    <ContextMenu>
      <Tooltip
        open={tooltipOpen}
        onOpenChange={(open) => setTooltipOpen(open && !suppressed.current)}
      >
        <ContextMenuTrigger
          render={
            <TooltipTrigger
              render={children}
              delay={600}
              onPointerDown={() => {
                suppressed.current = true;
                setTooltipOpen(false);
              }}
              onPointerLeave={() => {
                suppressed.current = false;
              }}
            />
          }
        />
        <TooltipContent side="right" className="flex flex-col gap-0.5">
          <span>{label}</span>
          <span className="opacity-70">{messages.sidebarHint(shortcut)}</span>
        </TooltipContent>
      </Tooltip>
      <ContextMenuContent className="min-w-44">
        <ContextMenuRadioGroup
          value={mode}
          onValueChange={(value) => setMode(value as SidebarMode)}
        >
          <ContextMenuRadioItem value="open">
            {messages.modeOpen}
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="compact">
            {messages.modeCompact}
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="closed">
            {messages.modeClosed}
            <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  const messages = useUiMessages();

  return (
    <SidebarModeControl label={messages.toggleSidebar}>
      <Button
        data-sidebar="trigger"
        data-slot="sidebar-trigger"
        variant="ghost"
        size="icon-sm"
        className={cn(className)}
        aria-label={messages.toggleSidebar}
        onClick={(event) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeftIcon />
      </Button>
    </SidebarModeControl>
  );
}

/** Collapse control meant to live inside the sidebar: toggles open ↔ compact. */
function SidebarCollapse({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { mode, toggleCompact, isMobile } = useSidebar();
  const messages = useUiMessages();
  const label =
    mode === "open" || isMobile
      ? messages.collapseSidebar
      : messages.expandSidebar;

  return (
    <SidebarModeControl label={label}>
      <Button
        data-sidebar="collapse"
        data-slot="sidebar-collapse"
        variant="ghost"
        size="icon-sm"
        className={cn(className)}
        // Stable label/icons (CSS-switched) so the pre-paint restored state
        // hydrates without mismatches.
        aria-label={messages.toggleSidebar}
        onClick={(event) => {
          onClick?.(event);
          toggleCompact();
        }}
        {...props}
      >
        <PanelLeftCloseIcon className="group-data-[collapsible=icon]:hidden" />
        <PanelLeftOpenIcon className="hidden group-data-[collapsible=icon]:block" />
      </Button>
    </SidebarModeControl>
  );
}

/**
 * Drag handle on the sidebar edge. Dragging resizes the open sidebar and
 * switches modes by width (closed → compact → open); a click toggles
 * open ↔ compact; arrow keys resize from the keyboard.
 */
function SidebarRail({ className, ...props }: React.ComponentProps<"div">) {
  const { mode, width, resizeTo, setResizing, toggleCompact } = useSidebar();
  const messages = useUiMessages();
  const drag = React.useRef<{
    startX: number;
    startOffset: number;
    side: "left" | "right";
    moved: boolean;
  } | null>(null);
  const offset = mode === "open" ? width : mode === "compact" ? 48 : 0;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={messages.resizeSidebar}
      aria-valuenow={offset}
      aria-valuemin={0}
      aria-valuemax={SIDEBAR_WIDTH_MAX}
      tabIndex={0}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const side =
          event.currentTarget.closest<HTMLElement>("[data-side]")?.dataset
            .side === "right"
            ? "right"
            : "left";
        drag.current = {
          startX: event.clientX,
          startOffset: offset,
          side,
          moved: false,
        };
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current) return;
        const delta =
          (event.clientX - current.startX) * (current.side === "left" ? 1 : -1);
        if (!current.moved && Math.abs(delta) < 4) return;
        if (!current.moved) setResizing(true);
        current.moved = true;
        resizeTo(current.startOffset + delta);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        if (drag.current && !drag.current.moved) toggleCompact();
        drag.current = null;
        setResizing(false);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setResizing(false);
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 64 : 16;
        if (event.key === "ArrowRight") resizeTo(offset + step);
        else if (event.key === "ArrowLeft") resizeTo(offset - step);
        else if (event.key === "Enter" || event.key === " ") toggleCompact();
        else return;
        event.preventDefault();
      }}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 touch-none cursor-col-resize outline-none group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] after:transition-colors hover:after:bg-sidebar-border focus-visible:after:bg-sidebar-ring sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "group-data-resizing/sidebar-wrapper:after:bg-sidebar-ring",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("h-8 w-full bg-input/50 shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-2 [--radius:var(--radius-xl)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2 p-2 [--radius:var(--radius-xl)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-auto scroll-fade [--radius:var(--radius-xl)] group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-8 shrink-0 items-center rounded-xl px-3 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  });
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> & React.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-xl p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  });
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-9 text-sm",
        sm: "h-8 text-xs",
        lg: "h-14 px-3 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar();
  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      },
      props,
    ),
    render: !tooltip ? render : <TooltipTrigger render={render} />,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  });

  if (!tooltip) {
    return comp;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      {comp}
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    showOnHover?: boolean;
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-xl p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-2 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  });
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-xl px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  });

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-xl px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-xl"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    size?: "sm" | "md";
    isActive?: boolean;
  }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-xl px-3 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  });
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarCollapse,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  parseSidebarCookie,
  useSidebar,
};
