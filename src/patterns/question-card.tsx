"use client";

import { useState, type ReactNode } from "react";
import { CircleHelpIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toastError } from "../components/ui/toast";
import { defineMessages, useMessages } from "../lib/i18n";
import { ChatMarkdown } from "./chat-markdown";

const messages = defineMessages({
  en: { other: "Other", send: "Send" },
  "pt-BR": { other: "Outra", send: "Enviar" },
});

/**
 * A question an agent asks the person, with its answers as buttons. Long
 * option text wraps inside the card; a failed answer is a toast and the
 * buttons stay available.
 */
export function QuestionCard({
  text,
  options,
  answered = false,
  answer: given = null,
  onAnswer,
  renderText,
  onFailure = toastError,
}: {
  text: string;
  options: string[];
  answered?: boolean;
  answer?: string | null;
  onAnswer: (answer: string) => Promise<void>;
  /** Draws the question (an app's own markdown, with its link handling). */
  renderText?: (text: string) => ReactNode;
  /** Reports a failed answer; a toast by default. */
  onFailure?: (failure: unknown) => void;
}) {
  const t = useMessages(messages);
  const [free, setFree] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const answer = async (option: string) => {
    setSending(option);
    try {
      await onAnswer(option);
      setPicked(option);
    } catch (failure) {
      onFailure(failure);
    } finally {
      setSending(null);
    }
  };
  const open = !answered && picked === null;
  const list = Array.isArray(options) ? options : [];
  return (
    <div
      data-slot="question-card"
      className="flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-3 text-sm"
    >
      <div className="flex items-start gap-2 font-medium">
        <CircleHelpIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        {renderText ? (
          <div className="min-w-0 flex-1 break-words">
            {renderText(typeof text === "string" ? text : "")}
          </div>
        ) : (
          <ChatMarkdown className="min-w-0 flex-1 break-words">
            {typeof text === "string" ? text : ""}
          </ChatMarkdown>
        )}
      </div>
      {open && list.length ? (
        <div className="flex min-w-0 flex-wrap gap-2">
          {list.map((option, index) => (
            <Button
              key={`${option}:${index}`}
              size="sm"
              variant="outline"
              className="h-auto max-w-full min-w-0 justify-start py-1.5 text-left break-words whitespace-normal"
              disabled={sending !== null}
              onClick={() => void answer(option)}
            >
              {option}
            </Button>
          ))}
          {free === null ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={sending !== null}
              onClick={() => setFree("")}
            >
              {t.other}
            </Button>
          ) : null}
        </div>
      ) : null}
      {open && (free !== null || !list.length) ? (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const value = (free ?? "").trim();
            if (value) void answer(value);
          }}
        >
          <Input
            autoFocus={free !== null}
            value={free ?? ""}
            placeholder={t.other}
            disabled={sending !== null}
            onChange={(event) => setFree(event.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            disabled={sending !== null || !(free ?? "").trim()}
          >
            {t.send}
          </Button>
        </form>
      ) : null}
      {!open && (picked ?? given) ? (
        <p className="text-muted-foreground">{picked ?? given}</p>
      ) : null}
    </div>
  );
}
