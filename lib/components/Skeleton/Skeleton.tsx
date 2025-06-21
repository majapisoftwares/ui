import clsx from "../../utils/clsx";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export default function Skeleton({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "animate-pulse overflow-hidden rounded-sm text-transparent",
        "bg-zinc-300 text-zinc-300 dark:bg-zinc-700 dark:text-zinc-700",
        className,
      )}
      {...props}
    >
      <div
        className={clsx(
          "animate-skeleton-shiny h-full w-full",
          "bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,#e4e4e7,rgba(255,255,255,0)_100%)]",
          "dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_20%,#52525b,rgba(255,255,255,0)_80%)]",
        )}
        style={{
          backgroundSize: "400% 100%",
        }}
      />
    </div>
  );
}
