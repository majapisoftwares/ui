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
      <SheetContent className="overflow-x-hidden overflow-y-auto data-[side=left]:sm:max-w-xl data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        {/* Same inset as SheetHeader (p-6). */}
        <div className="min-w-0 px-6 pb-8">{children}</div>
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
    <dl className="grid min-w-0 gap-4 text-sm">
      {items.map((item) => (
        <div key={item.label} className="grid min-w-0 gap-1">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
