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
    reply: "Reply",
    cancelReply: "Cancel reply",
    goodResponse: "Good response",
    badResponse: "Bad response",
    thinking: "Thinking",
    thought: "Thought",
    thoughtFor: (seconds: number) => `Thought for ${seconds}s`,
    approve: "Approve",
    deny: "Deny",
    suggestions: "Suggestions",
    researching: "Researching",
    researched: (steps: number) =>
      `Researched in ${steps} ${steps === 1 ? "step" : "steps"}`,
    planProgress: (done: number, total: number) => `${done} of ${total} done`,
    toDo: (count: number) => `${count} to do`,
    completedCount: (count: number) => `${count} completed`,
    usedSources: (count: number) =>
      `Used ${count} ${count === 1 ? "source" : "sources"}`,
    opensInNewTab: "(opens in a new tab)",
    runningCommand: (command: string) => `Running ${command}`,
    ranCommand: (command: string) => `Ran ${command}`,
    exitedWith: (command: string, code: number) =>
      `${command} exited with code ${code}`,
    testCounts: (total: number, failed: number, skipped: number) =>
      [
        `${total} ${total === 1 ? "test" : "tests"}`,
        failed > 0 && `${failed} failed`,
        skipped > 0 && `${skipped} skipped`,
      ]
        .filter(Boolean)
        .join(", "),
    ranTests: (counts: string) => `Ran ${counts}`,
    skippedTest: (name: string) => `Skipped ${name}`,
    failedWith: (error: string) => `Failed: ${error}`,
    frameworkFrames: (count: number) =>
      `${count} framework ${count === 1 ? "frame" : "frames"}`,
    restore: "Restore",
    restoreTo: (label: string) => `Restore to ${label}`,
    contextPercent: (percent: number) => `${percent}% context`,
    context: "Context",
    contextUsed: "Context used",
    inputTokens: "Input",
    outputTokens: "Output",
    reasoningTokens: "Reasoning",
    model: "Model",
    effort: "Effort",
    modelIs: (name: string) => `Model: ${name}`,
    effortIs: (name: string) => `Effort: ${name}`,
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
    reply: "Responder",
    cancelReply: "Cancelar resposta",
    goodResponse: "Boa resposta",
    badResponse: "Resposta ruim",
    thinking: "Pensando",
    thought: "Pensou",
    thoughtFor: (seconds: number) => `Pensou por ${seconds}s`,
    approve: "Aprovar",
    deny: "Negar",
    suggestions: "Sugestões",
    researching: "Pesquisando",
    researched: (steps: number) =>
      `Pesquisou em ${steps} ${steps === 1 ? "passo" : "passos"}`,
    planProgress: (done: number, total: number) => `${done} de ${total} feitos`,
    toDo: (count: number) => `${count} a fazer`,
    completedCount: (count: number) =>
      `${count} ${count === 1 ? "concluído" : "concluídos"}`,
    usedSources: (count: number) =>
      `Usou ${count} ${count === 1 ? "fonte" : "fontes"}`,
    opensInNewTab: "(abre em uma nova aba)",
    runningCommand: (command: string) => `Rodando ${command}`,
    ranCommand: (command: string) => `Rodou ${command}`,
    exitedWith: (command: string, code: number) =>
      `${command} saiu com código ${code}`,
    testCounts: (total: number, failed: number, skipped: number) =>
      [
        `${total} ${total === 1 ? "teste" : "testes"}`,
        failed > 0 && `${failed} ${failed === 1 ? "falhou" : "falharam"}`,
        skipped > 0 && `${skipped} ${skipped === 1 ? "pulado" : "pulados"}`,
      ]
        .filter(Boolean)
        .join(", "),
    ranTests: (counts: string) => `Rodou ${counts}`,
    skippedTest: (name: string) => `Pulou ${name}`,
    failedWith: (error: string) => `Falhou: ${error}`,
    frameworkFrames: (count: number) =>
      `${count} ${count === 1 ? "quadro" : "quadros"} do framework`,
    restore: "Restaurar",
    restoreTo: (label: string) => `Restaurar até ${label}`,
    contextPercent: (percent: number) => `${percent}% do contexto`,
    context: "Contexto",
    contextUsed: "Contexto usado",
    inputTokens: "Entrada",
    outputTokens: "Saída",
    reasoningTokens: "Raciocínio",
    model: "Modelo",
    effort: "Esforço",
    modelIs: (name: string) => `Modelo: ${name}`,
    effortIs: (name: string) => `Esforço: ${name}`,
  },
});

export function useUiMessages() {
  return useMessages(uiMessages);
}
