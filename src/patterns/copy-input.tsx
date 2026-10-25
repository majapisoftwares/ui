"use client";

import { useState, type ComponentProps } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "../lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../components/ui/input-group";

export interface CopyInputProps
  extends Omit<ComponentProps<typeof InputGroupInput>, "value" | "readOnly"> {
  value: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyInput({
  value,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
  ...props
}: CopyInputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <InputGroup className={cn("w-full min-w-0", className)}>
      <InputGroupInput
        readOnly
        value={value}
        className="font-mono text-xs selection:bg-primary/20"
        onFocus={(e) => e.currentTarget.select()}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => void handleCopy()}
          aria-label={copied ? copiedLabel : copyLabel}
          title={copied ? copiedLabel : copyLabel}
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-success" aria-hidden="true" />
          ) : (
            <CopyIcon className="size-3.5" aria-hidden="true" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
