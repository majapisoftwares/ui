"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from "lucide-react";
import {
  Streamdown,
  type LinkSafetyModalProps,
  type StreamdownProps,
} from "streamdown";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { cn, linkHost } from "../lib/utils";
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

const linkMessages = defineMessages({
  en: {
    title: "Open external link?",
    description: "You're about to open an external site.",
    copy: "Copy link",
    copied: "Copied",
    openOnce: "Open this link",
    alwaysOpen: (host: string) => `Always open ${host}`,
  },
  "pt-BR": {
    title: "Abrir link externo?",
    description: "Você vai abrir um site externo.",
    copy: "Copiar link",
    copied: "Copiado",
    openOnce: "Abrir este link",
    alwaysOpen: (host: string) => `Sempre abrir ${host}`,
  },
});

export interface TrustedLinks {
  /** Hosts (such as "github.com") whose links open without asking. */
  hosts: readonly string[];
  /** The person chose to always open links to this host. */
  onTrust: (host: string) => void;
}

const TrustedLinksContext = createContext<TrustedLinks | null>(null);

/**
 * The sites a person always opens from ChatMarkdown links. Without it, every
 * external link asks first and the dialog has no "always open" choice.
 * Persisting the list (per person, per device) is up to the app.
 */
export function TrustedLinksProvider({
  hosts,
  onTrust,
  children,
}: TrustedLinks & { children: ReactNode }) {
  const value = useMemo(() => ({ hosts, onTrust }), [hosts, onTrust]);
  return (
    <TrustedLinksContext.Provider value={value}>
      {children}
    </TrustedLinksContext.Provider>
  );
}

function LinkDialog({
  url,
  isOpen,
  onClose,
  onConfirm,
  onTrust,
}: LinkSafetyModalProps & { onTrust?: (host: string) => void }) {
  const t = useMessages(linkMessages);
  const [copied, setCopied] = useState(false);
  const host = onTrust ? linkHost(url) : null;
  const open = () => {
    onConfirm();
    onClose();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The URL stays on screen to copy by hand.
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLinkIcon className="size-4" aria-hidden="true" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-32 overflow-y-auto rounded-2xl bg-muted p-3 font-mono text-xs break-all">
          {url}
        </div>
        <DialogFooter className="grid grid-cols-2">
          <Button variant="outline" onClick={() => void copy()}>
            {copied ? (
              <CheckIcon aria-hidden="true" />
            ) : (
              <CopyIcon aria-hidden="true" />
            )}
            {copied ? t.copied : t.copy}
          </Button>
          <Button variant={host ? "outline" : "default"} onClick={open}>
            <ExternalLinkIcon aria-hidden="true" />
            {t.openOnce}
          </Button>
          {host ? (
            <Button
              className="col-span-2 min-w-0"
              title={t.alwaysOpen(host)}
              onClick={() => {
                onTrust?.(host);
                open();
              }}
            >
              <ShieldCheckIcon aria-hidden="true" />
              <span className="truncate">{t.alwaysOpen(host)}</span>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface ChatMarkdownProps extends Omit<
  StreamdownProps,
  "children" | "isAnimating"
> {
  children: string;
  /** True while the text is still arriving: unfinished markdown is completed and new words fade in. */
  streaming?: boolean;
}

/**
 * Agent reply as markdown (Streamdown, as in shadcn AI Elements Message).
 * Sanitizes model output, renders GFM tables and code with copy controls, and
 * tolerates half-streamed syntax. External links ask before opening, unless
 * their host is in TrustedLinksProvider.
 */
export function ChatMarkdown({
  children,
  streaming = false,
  className,
  ...props
}: ChatMarkdownProps) {
  const t = useMessages(translations);
  const trusted = useContext(TrustedLinksContext);
  // Read at click time, so a growing list doesn't re-render every link.
  const trustedRef = useRef(trusted);
  useEffect(() => {
    trustedRef.current = trusted;
  }, [trusted]);
  const canTrust = trusted !== null;
  const linkSafety = useMemo<StreamdownProps["linkSafety"]>(
    () => ({
      enabled: true,
      onLinkCheck: (url) => {
        const host = linkHost(url);
        return !!host && !!trustedRef.current?.hosts.includes(host);
      },
      renderModal: (modal) => (
        <LinkDialog
          {...modal}
          onTrust={
            canTrust ? (host) => trustedRef.current?.onTrust(host) : undefined
          }
        />
      ),
    }),
    [canTrust],
  );
  return (
    <Streamdown
      isAnimating={streaming}
      animated
      translations={t}
      linkSafety={linkSafety}
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
