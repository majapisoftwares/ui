"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowUpIcon, FileIcon, PlusIcon, SquareIcon, XIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { useUiMessages } from "../lib/i18n";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "../components/ui/input-group";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "../components/ui/attachment";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";

/** Lifecycle of the current turn, as in the AI SDK's `useChat().status`. */
export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

export interface PromptInputMessage {
  text: string;
  files: File[];
}

export interface PromptInputProps {
  /**
   * Receives the trimmed text and attached files. The field clears right
   * away; when the returned promise rejects, text and files come back.
   */
  onSubmit: (message: PromptInputMessage) => void | Promise<void>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** While submitted/streaming, Enter does not send and the button stops. */
  status?: ChatStatus;
  onStop?: () => void;
  /**
   * Lets the person send while a reply is in progress, e.g. to steer a
   * running agent. With text the button sends; with an empty field it stops.
   */
  sendWhileBusy?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Enables the attach button, paste and drop of files. */
  attachments?: boolean;
  /** File input accept list, e.g. "image/*,.pdf". */
  accept?: string;
  maxFiles?: number;
  /** Extra controls in the bottom bar, before the send button (e.g. a model menu). */
  actions?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

interface PendingFile {
  id: string;
  file: File;
  previewUrl?: string;
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

function toPendingFile(file: File): PendingFile {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clipboardFiles(data: DataTransfer) {
  if (data.files.length > 0) return Array.from(data.files);
  return Array.from(data.items).flatMap((item) => {
    const file = item.kind === "file" ? item.getAsFile() : null;
    return file ? [file] : [];
  });
}

/**
 * Chat composer on InputGroup (shadcn AI Elements Prompt Input) with Numa's
 * behaviour: Enter sends and Shift+Enter breaks the line, files can be
 * attached, pasted or dropped, focus stays in the field after sending, a
 * failed send restores the draft and, with `sendWhileBusy`, messages can be
 * sent while the agent works.
 */
export function PromptInput({
  onSubmit,
  value,
  defaultValue = "",
  onValueChange,
  status = "ready",
  onStop,
  sendWhileBusy = false,
  placeholder,
  disabled = false,
  autoFocus = false,
  attachments = false,
  accept,
  maxFiles,
  actions,
  className,
  "aria-label": ariaLabel,
}: PromptInputProps) {
  const messages = useUiMessages();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const filesRef = useRef(files);
  const text = value ?? innerValue;
  const busy = status === "submitted" || status === "streaming";
  const hasContent = text.trim().length > 0 || files.length > 0;
  const canSend = !disabled && (!busy || sendWhileBusy) && hasContent;

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Release previews that are still attached when the composer unmounts.
  useEffect(
    () => () => {
      for (const item of filesRef.current)
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    },
    [],
  );

  const setText = (next: string) => {
    if (value === undefined) setInnerValue(next);
    onValueChange?.(next);
  };

  const addFiles = (incoming: File[]) => {
    if (!attachments || disabled) return;
    const accepted = incoming.filter((file) => matchesAccept(file, accept));
    if (accepted.length === 0) return;
    setFiles((current) => {
      const room = maxFiles === undefined ? accepted.length : maxFiles - current.length;
      return [...current, ...accepted.slice(0, Math.max(0, room)).map(toPendingFile)];
    });
  };

  const removeFile = (id: string) => {
    setFiles((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
    textareaRef.current?.focus();
  };

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!canSend) return;
    const draft = text;
    const sent = files;
    setText("");
    setFiles([]);
    const release = () => {
      for (const item of sent)
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    };
    const result = onSubmit({
      text: draft.trim(),
      files: sent.map((item) => item.file),
    });
    if (!(result instanceof Promise)) {
      release();
      return;
    }
    result.then(release, () => {
      // Restore unless the person already started a new draft.
      if (value === undefined) setInnerValue((current) => current || draft);
      else if (!textareaRef.current?.value) onValueChange?.(draft);
      setFiles((current) => (current.length > 0 ? current : sent));
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing)
      return;
    event.preventDefault();
    if (canSend) event.currentTarget.form?.requestSubmit();
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!attachments) return;
    const pasted = clipboardFiles(event.clipboardData);
    if (pasted.length === 0) return;
    event.preventDefault();
    addFiles(pasted);
  };

  const hasFiles = (event: DragEvent) =>
    attachments && !disabled && event.dataTransfer.types.includes("Files");

  // With sendWhileBusy, a draft turns the stop button back into send.
  const stopping =
    busy && onStop !== undefined && !(sendWhileBusy && hasContent);
  const waiting = busy && !stopping && !canSend;
  const sendLabel = stopping ? messages.stop : messages.send;
  // Keeps focus (and the mobile keyboard) in the field while pressing buttons.
  const keepFocus = (event: { preventDefault: () => void }) =>
    event.preventDefault();

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={submit}
      onDragOver={(event) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setDragging(false);
      }}
      onDrop={(event) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        setDragging(false);
        addFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <InputGroup
        data-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        className="data-dragging:border-ring data-dragging:ring-3 data-dragging:ring-ring/30"
      >
        {files.length > 0 ? (
          <InputGroupAddon align="block-start" className="cursor-default">
            <AttachmentGroup aria-label={messages.attachments} className="w-full">
              {files.map((item) => (
                <Attachment key={item.id} size="sm">
                  <AttachmentMedia variant={item.previewUrl ? "image" : "icon"}>
                    {item.previewUrl ? (
                      <img src={item.previewUrl} alt="" />
                    ) : (
                      <FileIcon />
                    )}
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{item.file.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {formatBytes(item.file.size)}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      aria-label={messages.removeAttachment(item.file.name)}
                      onClick={() => removeFile(item.id)}
                    >
                      <XIcon />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </AttachmentGroup>
          </InputGroupAddon>
        ) : null}
        <InputGroupTextarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder ?? messages.promptPlaceholder}
          aria-label={ariaLabel ?? messages.prompt}
          disabled={disabled}
          autoFocus={autoFocus}
          rows={1}
          className="max-h-48 min-h-12 px-4 pt-3.5"
        />
        <InputGroupAddon
          align="block-end"
          className="cursor-text"
          onClick={(event) => {
            if (!(event.target as HTMLElement).closest("button"))
              textareaRef.current?.focus();
          }}
        >
          {attachments ? (
            <>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept={accept}
                disabled={disabled}
                hidden
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
              <InputGroupButton
                size="icon-sm"
                variant="outline"
                className="size-11 rounded-full md:size-8"
                aria-label={messages.attachFiles}
                disabled={disabled}
                onMouseDown={keepFocus}
                onClick={() => fileInputRef.current?.click()}
              >
                <PlusIcon />
              </InputGroupButton>
            </>
          ) : null}
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {actions}
            <InputGroupButton
              type={stopping ? "button" : "submit"}
              size="icon-sm"
              variant="default"
              className="size-11 rounded-full md:size-8"
              aria-label={sendLabel}
              disabled={stopping ? false : !canSend}
              onMouseDown={keepFocus}
              onClick={stopping ? onStop : undefined}
            >
              {stopping ? (
                <SquareIcon className="fill-current" />
              ) : waiting ? (
                <Spinner />
              ) : (
                <ArrowUpIcon />
              )}
            </InputGroupButton>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
