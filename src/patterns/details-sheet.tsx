"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../components/ui/sheet";
export function DetailsSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="px-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
export function DetailList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid gap-4 text-sm">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
