import clsx from "../utils/clsx";

export const modalContentClassName = clsx(
  "ui-modal-content",
  "z-20 rounded-sm p-1 shadow-md text-sm ring-1",
  "bg-white shadow-black/5 ring-black/5",
  "dark:bg-zinc-900 dark:ring-white/10",
  "will-change-[transform,opacity] data-[state=open]:animate-elastic-slide-up-and-fade data-[state=closed]:animate-fade-out",
);

export const modalArrowClassName = clsx(
  "ui-modal-arrow",
  "fill-zinc-100",
  "dark:fill-zinc-800",
);
