"use client";

import type * as React from "react";

import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { cn } from "cn";

export type FilterTabOption = {
  count?: number;
  label: React.ReactNode;
  value: string;
};

export function FilterTabs({
  className,
  onValueChange,
  options,
  value,
}: {
  className?: string;
  onValueChange: (value: string) => void;
  options: FilterTabOption[];
  value: string;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn("min-w-0 max-w-full", className)}
    >
      <TabsList className="max-w-full flex-wrap justify-start gap-y-1 group-data-horizontal/tabs:h-auto">
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="flex-none"
          >
            {option.label}
            {typeof option.count === "number" && (
              <Badge
                className="min-w-5 px-1.5 tabular-nums"
                variant="secondary"
              >
                {option.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
