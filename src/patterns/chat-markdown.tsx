"use client";

import { Streamdown, type StreamdownProps } from "streamdown";
import { cn } from "../lib/utils";
import { defineMessages, useMessages } from "../lib/i18n";

// Streamdown ships English labels; the rest follow the active locale.
const translations = defineMessages<StreamdownProps["translations"]>({
  en: {},
  "pt-BR": {
    close: "Fechar",
    copied: "Copiado",
    copyCode: "Copiar código",
    copyLink: "Copiar link",
    copyTable: "Copiar tabela",
    copyTableAsCsv: "Copiar como CSV",
    copyTableAsMarkdown: "Copiar como Markdown",
    copyTableAsTsv: "Copiar como TSV",
    downloadFile: "Baixar arquivo",
    downloadImage: "Baixar imagem",
    downloadTable: "Baixar tabela",
    downloadTableAsCsv: "Baixar como CSV",
    downloadTableAsMarkdown: "Baixar como Markdown",
    exitFullscreen: "Sair da tela cheia",
    externalLinkWarning: "Você vai abrir um site externo.",
    imageNotAvailable: "Imagem indisponível",
    openExternalLink: "Abrir link externo?",
    openLink: "Abrir link",
    resetView: "Redefinir visualização",
    tableFormatCsv: "CSV",
    tableFormatMarkdown: "Markdown",
    tableFormatTsv: "TSV",
    viewFullscreen: "Tela cheia",
    zoomIn: "Aumentar zoom",
    zoomOut: "Diminuir zoom",
  },
});

export interface ChatMarkdownProps
  extends Omit<StreamdownProps, "children" | "isAnimating"> {
  children: string;
  /** True while the text is still arriving: unfinished markdown is completed and new words fade in. */
  streaming?: boolean;
}

/**
 * Agent reply as markdown (Streamdown, as in shadcn AI Elements Message).
 * Sanitizes model output, renders GFM tables and code with copy controls, and
 * tolerates half-streamed syntax.
 */
export function ChatMarkdown({
  children,
  streaming = false,
  className,
  ...props
}: ChatMarkdownProps) {
  const t = useMessages(translations);
  return (
    <Streamdown
      isAnimating={streaming}
      animated
      translations={t}
      className={cn(
        "min-w-0 text-sm leading-relaxed wrap-break-word *:first:mt-0 *:last:mb-0",
        className,
      )}
      {...props}
    >
      {children}
    </Streamdown>
  );
}
