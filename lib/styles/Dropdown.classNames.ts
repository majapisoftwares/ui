import clsx from "../utils/clsx";

export const dropdownSeparatorClassName = clsx(
  "ui-dropdown-separator",
  "h-px my-1 mx-[6px]",
  "bg-zinc-100",
  "dark:bg-zinc-700/30",
);

export const dropdownItemClassName = clsx(
  "ui-dropdown-item",
  "relative rounded-sm py-1 px-7 cursor-pointer outline-hidden select-none flex items-center gap-2",
  "data-highlighted:bg-black/5",
  "dark:data-highlighted:bg-white/5",
  "data-disabled:cursor-default data-disabled:opacity-50",
);

export const dropdownSubTriggerClassName = clsx(
  dropdownItemClassName,
  "data-[state=open]:bg-black/[0.025] data-[state=open]:data-highlighted:bg-black/5 dark:data-[state=open]:data-highlighted:bg-white/5",
  "dark:data-[state=open]:bg-white/[0.025]",
);

export const dropdownLabelClassName = clsx(
  "ui-dropdown-label",
  "py-1 px-7 text-xs font-medium cursor-default text-zinc-500 outline-hidden",
);

export const dropdownCheckboxItemClassName = clsx(
  "ui-dropdown-checkbox-item",
  dropdownItemClassName,
);

export const dropdownItemIndicatorClassName = clsx(
  "ui-dropdown-item-indicator",
  "absolute left-1.5 top-1.5 inline-flex items-center justify-center",
  "[&>svg]:w-4 [&>svg]:h-4",
);
