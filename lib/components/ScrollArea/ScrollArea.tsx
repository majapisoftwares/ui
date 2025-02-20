import { ReactNode, Ref } from "react";
import { ScrollArea as RScrollArea } from "radix-ui";
import clsx from "../../utils/clsx";

export default function ScrollArea({
  className,
  children,
  viewportClassName,
  ref,
  viewportRef,
  type,
}: {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  ref?: Ref<HTMLDivElement>;
  viewportRef?: Ref<HTMLDivElement>;
  type?: "auto" | "always" | "scroll" | "hover";
}) {
  return (
    <RScrollArea.Root
      className={clsx("overflow-hidden", className)}
      ref={ref}
      type={type}
    >
      <RScrollArea.Viewport
        className={clsx("h-full w-full", viewportClassName)}
        ref={viewportRef}
      >
        {children}
      </RScrollArea.Viewport>
      <RScrollArea.Scrollbar
        className="flex touch-none select-none bg-zinc-700 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-zinc-600 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
        orientation="vertical"
      >
        <RScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-zinc-500 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 hover:bg-zinc-400" />
      </RScrollArea.Scrollbar>
      <RScrollArea.Scrollbar
        className="flex touch-none select-none bg-zinc-700 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-zinc-600 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
        orientation="horizontal"
      >
        <RScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-zinc-500 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
      </RScrollArea.Scrollbar>
      <RScrollArea.Corner className="bg-zinc-600" />
    </RScrollArea.Root>
  );
}
