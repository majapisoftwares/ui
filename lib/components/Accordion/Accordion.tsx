import { ChevronUpIcon } from "@heroicons/react/20/solid";
import { ReactNode, useId } from "react";
import * as RAccordion from "@radix-ui/react-accordion";
import clsx from "../../utils/clsx";

export default function Accordion({
  children,
  className,
  type = "multiple",
}: {
  children?: ReactNode;
  className?: string;
  type?: "single" | "multiple";
}) {
  return (
    <RAccordion.Root
      type={type}
      className={clsx("flex flex-col gap-2", className)}
      collapsible
    >
      {children}
    </RAccordion.Root>
  );
}

Accordion.Item = AccordionItem;

function AccordionItem({
  children,
  title,
  value,
  className,
  triggerClassName,
  contentClassName,
  contentInnerClassName,
}: {
  children?: ReactNode;
  title: ReactNode;
  value?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  contentInnerClassName?: string;
}) {
  const id = useId();
  value = value || id;
  return (
    <RAccordion.Item value={value} className={className}>
      <RAccordion.Header>
        <RAccordion.Trigger
          className={clsx(
            "group flex w-full justify-between rounded-lg bg-zinc-200 px-4 py-2 text-left text-sm font-medium transition hover:bg-zinc-300 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-purple-500 focus-visible:ring-opacity-75 dark:bg-zinc-800 dark:hover:bg-zinc-700",
            triggerClassName,
          )}
        >
          {title}
          <ChevronUpIcon className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180" />
        </RAccordion.Trigger>
      </RAccordion.Header>
      <RAccordion.Content
        className={clsx(
          "data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown overflow-hidden",
          contentClassName,
        )}
      >
        <div className={clsx("px-4 pb-2 pt-2", contentInnerClassName)}>
          {children}
        </div>
      </RAccordion.Content>
    </RAccordion.Item>
  );
}
