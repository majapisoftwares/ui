"use client";

import type * as React from "react";
import { cn } from "cn";
import { Orb, type OrbVariant } from "./orb";
import { useUiMessages } from "../../lib/i18n";

// Majapi UI: loading uses the animated Orb instead of a rotating icon.
function Spinner({
  className,
  size = 16,
  variant = "S1",
  label,
  ...props
}: React.ComponentProps<"span"> & {
  size?: number;
  variant?: OrbVariant;
  label?: string;
}) {
  const messages = useUiMessages();
  return (
    <span
      data-slot="spinner"
      className={cn("inline-flex shrink-0", className)}
      {...props}
    >
      <Orb variant={variant} size={size} label={label ?? messages.loading} />
    </span>
  );
}

export { Spinner };
