import { ReactNode, useRef } from "react";
import clsx from "../../utils/clsx";
import Badge from "../Badge";
import { Combobox } from "@headlessui/react";

export function getValue<Id extends string | number, T extends object | string>(
  id: Id,
  item: T,
): string | number {
  return typeof item === "string"
    ? item
    : (item[id as unknown as keyof typeof item] as string | number);
}

export function MultiSelectInput<
  Id extends string | number,
  T extends object | string,
>({
  className,
  selectedItems,
  doRender,
  removeItem,
  valueProperty,
  readOnly,
  items,
  ...props
}: {
  className?: string;
  selectedItems: string[];
  doRender: (item: T) => ReactNode;
  removeItem: (item: T) => () => void;
  valueProperty: Id;
  readOnly?: boolean;
  error?: boolean;
  items?: T[];
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={clsx(
        "focus-within:border-primary-500 focus-within:ring-primary-500 dark:focus-within:border-primary-500 flex flex-wrap border focus-within:ring-1",
        className,
      )}
      onClick={() => ref.current?.focus()}
    >
      {!!selectedItems.length && (
        <div className="flex flex-wrap items-center gap-1 p-1.5 pb-0">
          {selectedItems.map((selectedItem) => {
            const item = items?.find(
              (item) => getValue(valueProperty, item) === selectedItem,
            );
            if (!item) return null;
            return (
              <Badge
                key={getValue(valueProperty, item)}
                onActionClick={!readOnly ? removeItem(item) : undefined}
              >
                {doRender(item)}
              </Badge>
            );
          })}
        </div>
      )}
      {!readOnly && (
        <Combobox.Input
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          {...(props as any)}
          ref={ref}
          className="rounded-md border-none ring-transparent! disabled:cursor-not-allowed disabled:text-zinc-500 sm:text-sm dark:bg-zinc-800 dark:disabled:bg-zinc-900/90"
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
