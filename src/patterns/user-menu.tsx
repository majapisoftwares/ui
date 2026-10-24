"use client";

import type { ReactNode } from "react";
import {
  ChevronsUpDownIcon,
  LanguagesIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../components/ui/sidebar";
import { defineMessages, locales, useMessages, type Locale } from "../lib/i18n";
import { usePreferences } from "./preferences";

const messages = defineMessages({
  en: {
    account: "Account menu",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    signOut: "Sign out",
    signingOut: "Signing out…",
  },
  "pt-BR": {
    account: "Menu da conta",
    theme: "Tema",
    light: "Claro",
    dark: "Escuro",
    language: "Idioma",
    signOut: "Sair",
    signingOut: "Saindo…",
  },
});

const localeNames: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Identity({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email?: string;
  avatarUrl?: string;
}) {
  return (
    <>
      <Avatar className="size-8">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        {email ? (
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        ) : null}
      </div>
    </>
  );
}

/**
 * Sidebar account menu (place it in `AppShell` `footer`). Theme and language
 * come from `Preferences`; account actions are passed as `items`.
 */
export function UserMenu({
  name,
  email,
  avatarUrl,
  items,
  onSignOut,
  signingOut = false,
}: {
  name: string;
  email?: string;
  avatarUrl?: string;
  /** App-specific entries, e.g. profile or settings links. */
  items?: ReactNode;
  onSignOut?: () => void;
  signingOut?: boolean;
}) {
  const t = useMessages(messages);
  const { isMobile } = useSidebar();
  const { locale, setLocale, theme, setTheme } = usePreferences();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={t.account}
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Identity name={name} email={email} avatarUrl={avatarUrl} />
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-60"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 font-normal text-foreground">
                <Identity name={name} email={email} avatarUrl={avatarUrl} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {items ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>{items}</DropdownMenuGroup>
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                  {t.theme}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) =>
                      setTheme(value as "light" | "dark")
                    }
                  >
                    <DropdownMenuRadioItem value="light">
                      <SunIcon />
                      {t.light}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <MoonIcon />
                      {t.dark}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <LanguagesIcon />
                  {t.language}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={(value) => setLocale(value as Locale)}
                  >
                    {locales.map((value) => (
                      <DropdownMenuRadioItem key={value} value={value}>
                        {localeNames[value]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            {onSignOut ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={signingOut}
                    onClick={onSignOut}
                  >
                    <LogOutIcon />
                    {signingOut ? t.signingOut : t.signOut}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
