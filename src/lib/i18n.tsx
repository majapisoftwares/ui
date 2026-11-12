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
    messages: "Messages",
    scrollToEnd: "Scroll to latest",
    scrollToStart: "Scroll to start",
    promptPlaceholder: "Ask anything",
    prompt: "Message",
    send: "Send",
    stop: "Stop",
    attachFiles: "Attach files",
    removeAttachment: (name: string) => `Remove ${name}`,
    attachments: "Attachments",
    responding: "Responding",
    copy: "Copy",
    copied: "Copied",
    goodResponse: "Good response",
    badResponse: "Bad response",
    thinking: "Thinking",
    thought: "Thought",
    thoughtFor: (seconds: number) => `Thought for ${seconds}s`,
    approve: "Approve",
    deny: "Deny",
    suggestions: "Suggestions",
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
    messages: "Mensagens",
    scrollToEnd: "Ir para as mais recentes",
    scrollToStart: "Ir para o início",
    promptPlaceholder: "Pergunte qualquer coisa",
    prompt: "Mensagem",
    send: "Enviar",
    stop: "Parar",
    attachFiles: "Anexar arquivos",
    removeAttachment: (name: string) => `Remover ${name}`,
    attachments: "Anexos",
    responding: "Respondendo",
    copy: "Copiar",
    copied: "Copiado",
    goodResponse: "Boa resposta",
    badResponse: "Resposta ruim",
    thinking: "Pensando",
    thought: "Pensou",
    thoughtFor: (seconds: number) => `Pensou por ${seconds}s`,
    approve: "Aprovar",
    deny: "Negar",
    suggestions: "Sugestões",
  },
});

export function useUiMessages() {
  return useMessages(uiMessages);
}
