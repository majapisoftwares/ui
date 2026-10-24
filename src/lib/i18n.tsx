"use client";

import { createContext, useContext, type ReactNode } from "react";

export const locales = ["en", "pt-BR"] as const;
export type Locale = (typeof locales)[number];
export type Messages<T> = Record<Locale, T>;

/** Declares a message catalog; every locale must provide every key. */
export function defineMessages<T>(messages: Messages<T>) {
  return messages;
}

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useMessages<T>(messages: Messages<T>): T {
  return messages[useLocale()];
}

/** Picks the supported locale that best matches a list such as navigator.languages. */
export function matchLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const lower = tag.toLowerCase();
    if (lower.startsWith("pt")) return "pt-BR";
    if (lower.startsWith("en")) return "en";
  }
  return "en";
}

export const uiMessages = defineMessages({
  en: {
    sidebar: "Sidebar",
    toggleSidebar: "Toggle sidebar",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    resizeSidebar: "Resize sidebar",
    modeOpen: "Expanded",
    modeCompact: "Compact",
    modeClosed: "Hidden",
    sidebarHint: (shortcut: string) =>
      `Right-click for options · ${shortcut} hides`,
    search: "Search",
    noResults: "No results",
    noData: "Nothing here yet",
    clearSearch: "Clear search",
    retry: "Retry",
    loadFailed: "Couldn't load data",
    staleData: "Showing data from the last successful load",
    previous: "Previous",
    next: "Next",
    open: "Open",
    page: (page: number, total: number) => `Page ${page} of ${total}`,
    rows: (count: number) => `${count} ${count === 1 ? "row" : "rows"}`,
    close: "Close",
    language: "Language",
    toggleTheme: "Toggle theme",
    more: "More",
    loading: "Loading",
  },
  "pt-BR": {
    sidebar: "Barra lateral",
    toggleSidebar: "Alternar barra lateral",
    collapseSidebar: "Recolher barra lateral",
    expandSidebar: "Expandir barra lateral",
    resizeSidebar: "Redimensionar barra lateral",
    modeOpen: "Expandida",
    modeCompact: "Compacta",
    modeClosed: "Escondida",
    sidebarHint: (shortcut: string) =>
      `Clique direito para opções · ${shortcut} esconde`,
    search: "Buscar",
    noResults: "Nenhum resultado",
    noData: "Nada por aqui ainda",
    clearSearch: "Limpar busca",
    retry: "Tentar novamente",
    loadFailed: "Não foi possível carregar os dados",
    staleData: "Exibindo dados do último carregamento",
    previous: "Anterior",
    next: "Próxima",
    open: "Abrir",
    page: (page: number, total: number) => `Página ${page} de ${total}`,
    rows: (count: number) => `${count} ${count === 1 ? "linha" : "linhas"}`,
    close: "Fechar",
    language: "Idioma",
    toggleTheme: "Alternar tema",
    more: "Mais",
    loading: "Carregando",
  },
});

export function useUiMessages() {
  return useMessages(uiMessages);
}
